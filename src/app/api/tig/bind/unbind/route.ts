import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) throw new UnauthorizedError();
  const payload = await verifyAccessToken(token);
  if (!payload?.sub) throw new UnauthorizedError();

  const result = await tigService.unbind(payload.sub);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: "تم إلغاء الربط بنجاح" });
});
