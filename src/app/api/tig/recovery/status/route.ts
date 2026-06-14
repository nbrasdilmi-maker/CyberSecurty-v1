import { NextRequest, NextResponse } from "next/server";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
});

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ success: false, message: "الكود مطلوب" }, { status: 400 });
  }
  const status = await tigService.getRecoveryStatus(code.toUpperCase().trim());
  if (!status.found) {
    return NextResponse.json({ success: false, message: "جلسة الاستعادة غير موجودة", found: false });
  }
  return NextResponse.json({ success: true, found: true, bound: status.bound, otpSent: status.otpSent });
});
