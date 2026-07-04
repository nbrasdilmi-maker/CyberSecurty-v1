import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { broadcastEvent } from "@/lib/supabaseRealtime";
import { deriveStaticChannelName } from "@/lib/realtimeChannels";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  const userId = payload.sub as string;
  const userRole = payload.role as string;

  const { subjectId } = await request.json();
  if (!subjectId) {
    return NextResponse.json(
      { success: false, message: "معرف المادة مطلوب" },
      { status: 400 },
    );
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, teacherId: true, submissionsOpen: true, deletedAt: true, level: true, name: true, code: true },
  });
  if (!subject || subject.deletedAt) throw new NotFoundError("المادة");

  if (userRole !== "ADMIN" && subject.teacherId !== userId) {
    throw new ForbiddenError("غير مصرح — هذه المادة ليست من موادك");
  }

  const newValue = !subject.submissionsOpen;

  await prisma.subject.update({
    where: { id: subjectId },
    data: { submissionsOpen: newValue },
  });

  broadcastEvent(
    deriveStaticChannelName(`level-${subject.level}`),
    "subject-toggle",
    { subjectId, submissionsOpen: newValue },
  );

  return NextResponse.json({
    success: true,
    submissionsOpen: newValue,
    message: newValue ? "تم فتح استقبال التكاليف" : "تم إيقاف استقبال التكاليف",
  });
});
