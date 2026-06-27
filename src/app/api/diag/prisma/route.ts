import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const userCount = await prisma.user.count();
    results.userCount = userCount;
    results.prismaOk = true;
  } catch (e: any) {
    results.prismaOk = false;
    results.error = e?.message || String(e);
    results.stack = e?.stack?.split("\n").slice(0, 5).join("\n");
  }

  results.envCheck = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20),
    nodeEnv: process.env.NODE_ENV,
    hasJwtAccessSecret: !!process.env.JWT_ACCESS_SECRET,
    hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
    hasUpstashRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  return NextResponse.json(results);
}
