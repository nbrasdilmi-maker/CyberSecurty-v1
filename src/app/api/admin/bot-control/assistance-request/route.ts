import { NextRequest, NextResponse } from "next/server";
import { tigService } from "@/services/tig/TigService";
import redis from "@/lib/redis";
import { withErrorHandler } from "@/lib/errors";
import { z } from "zod";
import { logger } from "@/lib/logger";

const schema = z.object({
  identifier: z.string().min(1, "يرجى إدخال اسم المستخدم"),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }

  const { identifier } = validation.data;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const user = await tigService.findUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const binding = await tigService.getBinding(user.id);
  if (binding?.status === "ACTIVE") {
    return NextResponse.json({ success: false, message: "حسابك مرتبط بالفعل. استخدم خيار إعادة التعيين عبر البوت." }, { status: 400 });
  }

  const ASSISTANCE_DAILY_LIMIT = 3;
  const dailyKey = `tig:daily-assistance:${user.id}:${new Date().toISOString().slice(0, 10)}`;
  const dailyCount = await redis.incr(dailyKey);
  if (dailyCount === 1) {
    await redis.expire(dailyKey, 86400);
  }
  if (dailyCount > ASSISTANCE_DAILY_LIMIT) {
    return NextResponse.json({ success: false, message: "تجاوزت الحد اليومي لطلبات المساعدة (3 محاولات). حاول غداً." }, { status: 429 });
  }

  const key = `tig:assistance:${user.id}`;
  const existing = await redis.get<string>(key);
  if (existing) {
    return NextResponse.json({ success: false, message: "لديك طلب مساعدة قيد المراجعة بالفعل. يرجى الانتظار." }, { status: 429 });
  }

  const requestData = {
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    email: user.email,
    role: user.role,
    level: user.level,
    ip,
    requestedAt: Date.now(),
    status: "PENDING",
  };
  await redis.set(key, JSON.stringify(requestData), { ex: 86400 });
  await redis.sadd("tig:assistance:list", user.id);

  try {
    const { AdminNotificationService } = await import("@/services/notification/AdminNotificationService");
    await AdminNotificationService.notify({
      event: "PASSWORD_RESET_ASSISTANCE_REQUEST",
      userId: user.id,
      userName: user.name,
      userUsername: user.name,
      role: user.role,
      email: user.email,
      operationTime: new Date().toISOString(),
      metadata: { ip, source: "forgot_password" },
    } as any);
  } catch (err) {
    logger.error("[AssistanceRequest] Email notification failed", { error: String(err) });
  }

  return NextResponse.json({ success: true, message: "تم إرسال طلب المساعدة. سيتم التواصل معك قريباً." });
});
