import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const GET = withErrorHandler(async function GET() {
  const raw = await redis.lrange("tig:assistance:completed", 0, -1);
  const requests = raw.map((item) => JSON.parse(item));
  return NextResponse.json({ success: true, requests });
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();
  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new UnauthorizedError();

  const body = await request.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ success: false, message: "معرف الطلب مطلوب" }, { status: 400 });
  }

  const raw = await redis.lrange("tig:assistance:completed", 0, -1);
  const remaining = raw
    .map((item) => JSON.parse(item))
    .filter((entry: any) => entry.id !== id)
    .map((entry: any) => JSON.stringify(entry));

  if (remaining.length === raw.length) {
    return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 });
  }

  await redis.del("tig:assistance:completed");
  if (remaining.length > 0) {
    for (const item of remaining) {
      await redis.lpush("tig:assistance:completed", item);
    }
  }

  return NextResponse.json({ success: true, message: "تم حذف الطلب" });
});
