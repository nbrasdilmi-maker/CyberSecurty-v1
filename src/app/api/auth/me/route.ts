import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";
import { addPrivateCacheHeaders } from "@/lib/cacheHeaders";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const GET = withErrorHandler(async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  const userId = payload.sub as string;

  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true, email: true, name: true, role: true, level: true,
      webAuthnEnabled: true, managementLevel: true, status: true,
    },
  });

  if (!user) throw new UnauthorizedError("المستخدم غير موجود");

  return addPrivateCacheHeaders(NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
      webAuthnEnabled: user.webAuthnEnabled,
      managementLevel: user.managementLevel || null,
    },
  }), 15);
});
