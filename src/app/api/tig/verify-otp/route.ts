import { NextRequest, NextResponse } from "next/server";
import { tigService } from "@/services/tig/TigService";
import { withErrorHandler } from "@/lib/errors";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().min(1, "يرجى إدخال البريد الإلكتروني أو اسم المستخدم"),
  code: z.string().min(6, "رمز التحقق غير صحيح"),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }
  const { identifier, code } = validation.data;
  const user = await tigService.findUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ success: false, message: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }
  const result = await tigService.verifyOtp(user.id, code);
  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, status: "success", resetToken: result.resetToken, message: "تم التحقق من الرمز" });
});
