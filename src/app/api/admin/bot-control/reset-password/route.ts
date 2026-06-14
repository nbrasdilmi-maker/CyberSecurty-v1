import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/passwordReset";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { AdminNotificationService } from "@/services/notification/AdminNotificationService";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new UnauthorizedError();

  const { userId } = await request.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true, name: true, email: true, role: true, level: true } });
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const { rawToken } = await createResetToken(userId, user.email);

  const binding = await prisma.telegramBinding.findUnique({ where: { userId }, select: { status: true, chatId: true, telegramUsername: true } });
  let sentViaTelegram = false;
  if (binding?.status === "ACTIVE" && binding.chatId) {
    try {
      const { getBot } = await import("@/lib/tig/telegram");
      const bot = getBot();
      await bot.api.sendMessage(
        Number(binding.chatId),
        `🔐 إعادة تعيين كلمة المرور\n\n` +
          `تم طلب إعادة تعيين كلمة المرور لحسابك بواسطة الأدمن.\n\n` +
          `كود إعادة التعيين: ${rawToken}\n\n` +
          `⏳ الكود صالح لمدة 15 دقيقة\n` +
          `إذا لم تكن أنت من طلب ذلك، يرجى الاتصال بالأدمن فوراً.`,
      );
      sentViaTelegram = true;
    } catch (err) {
      logger.error("Failed to send reset token via Telegram", { error: String(err), userId });
    }
  }

  void AdminNotificationService.notify({
    event: "PASSWORD_RESET_ASSISTANCE_REQUEST",
    userId: user.id,
    userName: user.name,
    userUsername: user.name,
    role: user.role,
    email: user.email,
    level: user.level,
    telegramUsername: binding?.telegramUsername || undefined,
    telegramId: binding?.chatId ? String(binding.chatId) : undefined,
    metadata: { resetToken: rawToken, sentViaTelegram, initiatedBy: String(payload.sub) },
    operationTime: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: sentViaTelegram ? "تم إرسال كود إعادة التعيين عبر Telegram" : "تم إنشاء كود إعادة التعيين",
    token: sentViaTelegram ? undefined : rawToken,
  });
});
