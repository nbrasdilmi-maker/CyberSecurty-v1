import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { withErrorHandler } from "@/lib/errors";

export const GET = withErrorHandler(async function GET() {
  const userIds = await redis.smembers("tig:assistance:list");
  const requests: any[] = [];
  for (const userId of userIds) {
    const raw = await redis.get<string>(`tig:assistance:${userId}`);
    if (raw) {
      requests.push(JSON.parse(raw));
    } else {
      await redis.srem("tig:assistance:list", userId);
    }
  }
  requests.sort((a, b) => b.requestedAt - a.requestedAt);
  return NextResponse.json({ success: true, requests });
});
