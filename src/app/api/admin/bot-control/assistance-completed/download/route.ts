import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const schema = z.object({
  userId: z.string().min(1),
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();
  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new UnauthorizedError();

  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
  }

  const { userId } = validation.data;
  const raw = await redis.get<string>(`tig:assistance:last-reset:${userId}`);
  if (!raw) {
    return NextResponse.json({ success: false, message: "كلمة المرور غير متوفرة، يرجى إعادة تعيين الباسورد أولاً" }, { status: 404 });
  }

  const data = JSON.parse(raw);
  return NextResponse.json({ success: true, ...data });
});
