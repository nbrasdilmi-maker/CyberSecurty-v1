import { NextRequest, NextResponse } from "next/server";
import { passwordResetRateLimiter } from "@/lib/ratelimit";
import { tigService } from "@/services/tig/TigService";
import { getBot } from "@/lib/tig/telegram";
import { z } from "zod";
import { withErrorHandler } from "@/lib/errors";
import { logger } from "@/lib/logger";

const forgotSchema = z.object({
  identifier: z.string().min(1, "يرجى إدخال اسم المستخدم"),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = forgotSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }

  const { identifier } = validation.data;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const { success: rateLimitOk } = await passwordResetRateLimiter.limit(`${identifier}:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ success: false, message: "طلبات كثيرة. حاول مرة أخرى بعد ساعة." }, { status: 429 });
  }

  const user = await tigService.findUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ success: false, message: "الحساب غير موجود" });
  }

  const binding = await tigService.getBinding(user.id);

  if (binding?.status === "ACTIVE") {
    const dailyOk = await tigService.checkDailyResetLimit(user.id);
    if (!dailyOk) {
      return NextResponse.json({ success: false, message: "تجاوزت الحد اليومي لطلبات إعادة التعيين (3 محاولات). حاول غداً." }, { status: 429 });
    }

    const { otp } = await tigService.sendPasswordResetOtp(user.id, user.email, binding.chatId);
    try {
      const bot = getBot();
      const codeMsg = await bot.api.sendMessage(
        Number(binding.chatId),
        `🔐 رمز التحقق الخاص بك: ${otp}\n\n⏳ سينتهي هذا الرمز بعد 3 دقائق`,
      );
      setTimeout(async () => {
        try { await bot.api.deleteMessage(Number(binding.chatId), codeMsg.message_id); } catch {}
      }, 180000);
      await bot.api.sendMessage(
        Number(binding.chatId),
        `📩 تم إرسال رمز التحقق إلى حسابك في التليجرام.\nالرجاء إدخال الرمز في نافذة استعادة كلمة المرور خلال 3 دقائق.`,
      );
      logger.info("Password reset OTP sent via Telegram", { userId: user.id });
    } catch (err) {
      logger.error("Failed to send OTP via Telegram", { error: String(err), userId: user.id });
      return NextResponse.json({ success: false, message: "فشل إرسال رمز التحقق. حاول مرة أخرى لاحقاً." });
    }
    return NextResponse.json({ success: true, bound: true, step: "otp" });
  }

  return NextResponse.json({ success: true, bound: false, step: "no_binding", userName: user.name });
});
