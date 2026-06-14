import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new UnauthorizedError();

  const totalBindings = await prisma.telegramBinding.count();
  const activeBindings = await prisma.telegramBinding.count({ where: { status: "ACTIVE" } });
  const revokedBindings = await prisma.telegramBinding.count({ where: { status: "REVOKED" } });

  const recent = await prisma.telegramBinding.findMany({
    where: { status: "ACTIVE" },
    orderBy: { verifiedAt: "desc" },
    take: 5,
  });

  const userIds = recent.map((b) => b.userId);
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
    : [];

  const userMap = new Map(users.map((u) => [u.id, u]));
  const recentBindings = recent.map((b) => ({
    id: b.id,
    userId: b.userId,
    telegramId: String(b.telegramId),
    telegramUsername: b.telegramUsername,
    status: b.status,
    verifiedAt: b.verifiedAt?.toISOString() || "",
    user: userMap.get(b.userId) || { name: "—", email: "—" },
  }));

  return NextResponse.json({
    success: true,
    stats: { totalBindings, activeBindings, revokedBindings },
    recentBindings,
  });
});
