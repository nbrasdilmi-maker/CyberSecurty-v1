import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) throw new UnauthorizedError();
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) throw new UnauthorizedError();

  const { code } = await tigService.initiateBinding(payload.sub);
  return NextResponse.json({ success: true, code });
});
