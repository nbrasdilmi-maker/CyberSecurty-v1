import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new UnauthorizedError();

  const { identifier } = await request.json();
  if (!identifier || typeof identifier !== "string") {
    return NextResponse.json({ success: false, message: "يرجى إدخال البريد الإلكتروني أو اسم المستخدم" }, { status: 400 });
  }

  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");

  const user = isEmail
    ? await prisma.user.findFirst({ where: { email: trimmed.toLowerCase(), deletedAt: null }, select: { id: true, name: true, email: true, username: true, role: true, level: true, isActivated: true } })
    : await prisma.user.findFirst({ where: { OR: [{ name: trimmed }, { username: trimmed }], deletedAt: null }, select: { id: true, name: true, email: true, username: true, role: true, level: true, isActivated: true } });

  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const telegramBinding = await prisma.telegramBinding.findUnique({ where: { userId: user.id }, select: { status: true, telegramUsername: true } });
  const resetCount = await prisma.auditLog.count({ where: { userId: user.id, description: { contains: "تم تغيير كلمة المرور" } } });

  return NextResponse.json({ success: true, user: { ...user, telegramBinding, resetCount } });
});
