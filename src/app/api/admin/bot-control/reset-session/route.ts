import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

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

  const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null }, select: { id: true, name: true, email: true, username: true } });
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const binding = await prisma.telegramBinding.findUnique({ where: { userId }, select: { chatId: true } });

  let clearedKeys: string[] = [];

  if (binding?.chatId) {
    const tgId = String(binding.chatId);
    const sessionKey = `tig:bot:session:${tgId}`;
    const otpKey = `tig:bot:otp:${tgId}`;
    await redis.del(sessionKey);
    await redis.del(otpKey);
    clearedKeys = [sessionKey, otpKey];

    try {
      const { getBot } = await import("@/lib/tig/telegram");
      const bot = getBot();
      await bot.api.sendMessage(
        Number(binding.chatId),
        `🔄 تم إعادة تعيين جلستك بواسطة الأدمن.\n` +
          `يمكنك البدء من جديد عبر /start.`,
      );
    } catch (err) {
      console.error("[BotSessionReset] Failed to notify user via Telegram:", err);
    }
  }

  return NextResponse.json({
    success: true,
    message: binding?.chatId ? "تم إعادة تعيين جلسة المستخدم في البوت بنجاح" : "المستخدم غير مرتبط بالبوت",
    cleared: clearedKeys,
    user: { name: user.name, email: user.email, username: user.username },
  });
});
