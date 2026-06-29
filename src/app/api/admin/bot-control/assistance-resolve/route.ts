import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revokeAllSessions } from "@/lib/auth";
import { withErrorHandler } from "@/lib/errors";
import { z } from "zod";
import { logger } from "@/lib/logger";

const schema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }

  const { userId, newPassword } = validation.data;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const requestKey = `tig:assistance:${userId}`;
  const raw = await redis.getdel<string>(requestKey);
  if (raw) {
    await redis.srem("tig:assistance:list", userId);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, username: true, role: true, level: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, tokenVersion: { increment: 1 } },
  });
  await revokeAllSessions(user.id);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE",
      severity: "WARNING",
      description: "تم تغيير كلمة المرور بواسطة الأدمن (طلب مساعدة)",
      ipAddress: ip,
      level: user.level,
    },
  });

  const completedEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    userName: user.name,
    level: user.level,
    resolvedAt: new Date().toISOString(),
  };
  await redis.lpush("tig:assistance:completed", JSON.stringify(completedEntry));
  await redis.ltrim("tig:assistance:completed", 0, 199);

  await redis.setex(
    `tig:assistance:last-reset:${user.id}`,
    86400,
    JSON.stringify({ password: newPassword, userName: user.name, level: user.level }),
  );

  try {
    const { AdminNotificationService } = await import("@/services/notification/AdminNotificationService");
    await AdminNotificationService.notify({
      event: "PASSWORD_RESET_COMPLETED",
      userId: user.id,
      userName: user.name,
      userUsername: user.name,
      role: user.role,
      email: user.email,
      level: user.level,
      operationTime: new Date().toISOString(),
    } as any);
  } catch (err) {
    logger.error("[AssistanceResolve] Email notification failed", { error: String(err) });
  }

  return NextResponse.json({
    success: true,
    message: "تم إعادة تعيين كلمة المرور بنجاح",
    user: {
      name: user.name,
      level: user.level,
    },
  });
});
