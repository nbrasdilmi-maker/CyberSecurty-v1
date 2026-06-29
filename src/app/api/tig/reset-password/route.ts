import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tryConsumeResetToken } from "@/lib/passwordReset";
import bcrypt from "bcryptjs";
import { revokeAllSessions } from "@/lib/auth";
import { resetPasswordRateLimiter } from "@/lib/ratelimit";
import { z } from "zod";
import { withErrorHandler } from "@/lib/errors";
import { AdminNotificationService } from "@/services/notification/AdminNotificationService";

const resetSchema = z.object({
  identifier: z.string().min(1, "يرجى إدخال البريد الإلكتروني أو اسم المستخدم"),
  code: z.string().min(6, "رمز التحقق غير صحيح"),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = resetSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }
  const { identifier, code, newPassword } = validation.data;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success: rateLimitOk } = await resetPasswordRateLimiter.limit(`${identifier}:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ success: false, message: "محاولات كثيرة. حاول لاحقاً." }, { status: 429 });
  }
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier.toLowerCase().trim() }, { name: identifier.trim() }, { username: identifier.trim() }], deletedAt: null },
    select: { id: true, email: true, name: true, role: true, level: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, message: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }
  const consumed = await tryConsumeResetToken(code, user.email);
  if (!consumed) {
    return NextResponse.json({ success: false, message: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, tokenVersion: { increment: 1 } },
  });
  await revokeAllSessions(user.id);
  await prisma.auditLog.create({
    data: { userId: user.id, action: "UPDATE", severity: "WARNING", description: "تم تغيير كلمة المرور عبر TIG", ipAddress: ip, level: user.level },
  });
  void AdminNotificationService.notify({
    event: "PASSWORD_RESET_COMPLETED",
    userId: user.id,
    userName: user.name,
    userUsername: user.name,
    role: user.role,
    email: user.email,
    level: user.level,
    operationTime: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." });
});
