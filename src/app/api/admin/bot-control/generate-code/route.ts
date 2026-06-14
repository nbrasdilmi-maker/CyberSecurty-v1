import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import redis from "@/lib/redis";
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
    ? await prisma.user.findFirst({ where: { email: trimmed.toLowerCase(), deletedAt: null }, select: { id: true, name: true, email: true, username: true } })
    : await prisma.user.findFirst({ where: { OR: [{ name: trimmed }, { username: trimmed }], deletedAt: null }, select: { id: true, name: true, email: true, username: true } });

  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RCV-";
  for (let i = 0; i < 8; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }

  const key = `tig:admin-recovery:${code}`;
  await redis.set(key, JSON.stringify({ userId: user.id, email: user.email, name: user.name, createdAt: Date.now(), used: false }), { ex: 1800 });

  return NextResponse.json({ success: true, code });
});
