import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/security";
import { generateUsername } from "@/lib/username";
import { withErrorHandler } from "@/lib/errors";

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ success: false, message: "كود التفعيل مطلوب" }, { status: 400 });
  }

  const codeHash = hashToken(code);

  const user = await prisma.user.findFirst({
    where: {
      activationCodeHash: codeHash,
      isActivated: false,
      status: "PENDING",
      deletedAt: null,
    },
    select: { id: true, name: true, role: true, level: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "كود التفعيل غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }

  const username = generateUsername(user.name, user.role, user.level);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      level: user.level,
      username,
    },
  });
});
