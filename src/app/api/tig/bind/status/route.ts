import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) throw new UnauthorizedError();
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) throw new UnauthorizedError();

  const binding = await tigService.getBinding(payload.sub);
  return NextResponse.json({
    success: true,
    bound: binding?.status === "ACTIVE",
    binding: binding
      ? {
          ...binding,
          telegramId: String(binding.telegramId),
          chatId: String(binding.chatId),
        }
      : null,
  });
});
