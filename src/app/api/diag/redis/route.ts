import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};

  try {
    const testKey = `tig:diag:${Date.now()}`;
    await redis.set(testKey, JSON.stringify({ test: true, time: Date.now() }), { ex: 60 });
    results.set = "ok";

    const val = await redis.get<string>(testKey);
    results.get = val ? JSON.parse(val) : null;

    await redis.del(testKey);
    results.del = "ok";

    results.success = true;
  } catch (e: any) {
    results.success = false;
    results.error = String(e);
    results.stack = e.stack;
  }

  results.envCheck = {
    hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    redisUrlPrefix: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 20),
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const bindRaw = await redis.get<string>(`tig:bind:${code}`);
    results.checkCode = { code, found: !!bindRaw, value: bindRaw ? JSON.parse(bindRaw) : null };
  }

  return NextResponse.json(results);
}
