import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { tigService } from "@/services/tig/TigService";
import { prisma } from "@/lib/prisma";
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
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const binding = await prisma.telegramBinding.findUnique({ where: { userId } });
  if (!binding) {
    return NextResponse.json({ success: false, message: "لا يوجد ربط لهذا المستخدم" }, { status: 404 });
  }

  await tigService.unbind(userId, true);

  await prisma.auditLog.create({
    data: {
      userId,
      action: "UPDATE",
      severity: "WARNING",
      description: "تم إلغاء ربط Telegram بواسطة الأدمن",
      ipAddress: ip,
      level: null,
    },
  });

  return NextResponse.json({ success: true, message: "تم إلغاء الربط بنجاح" });
});
