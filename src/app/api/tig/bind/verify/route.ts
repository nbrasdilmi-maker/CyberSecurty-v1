import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";
import redis from "@/lib/redis";

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) throw new UnauthorizedError();
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) throw new UnauthorizedError();

  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ success: false, message: "رمز الربط مطلوب" }, { status: 400 });
  }

  const key = `tig:bind:${code.toUpperCase().trim()}`;
  const raw = await redis.get<string>(key);
  if (!raw) {
    return NextResponse.json({ success: false, message: "كود الربط غير صالح أو منتهي الصلاحية" }, { status: 400 });
  }
  const { userId } = JSON.parse(raw);

  const binding = await tigService.getBinding(userId);
  if (!binding || binding.status !== "ACTIVE") {
    return NextResponse.json({ success: false, message: "يرجى تأكيد الربط عبر البوت أولاً" }, { status: 400 });
  }
  return NextResponse.json({
    success: true,
    binding: {
      ...binding,
      telegramId: String(binding.telegramId),
      chatId: String(binding.chatId),
    },
  });
});
