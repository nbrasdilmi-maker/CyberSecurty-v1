import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/supabaseRealtime";
import { getUserChannelName } from "@/lib/realtimeChannels";
import { withErrorHandler } from "@/lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const POST = withErrorHandler(async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    const userId = payload.sub as string;
    const userRole = payload.role as string;

    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { assignmentId, grade, feedback } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, message: "معرف التكليف مطلوب" },
        { status: 400 },
      );
    }

    if (grade !== null && grade !== undefined) {
      if (typeof grade !== "number" || grade < 0 || grade > 100) {
        return NextResponse.json(
          { success: false, message: "الدرجة يجب أن تكون بين 0 و 100" },
          { status: 400 },
        );
      }
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: true,
        student: true,
      },
    });

    if (!assignment || assignment.deletedAt) {
      return NextResponse.json(
        { success: false, message: "التكليف غير موجود" },
        { status: 404 },
      );
    }

    if (userRole === "TEACHER" && assignment.subject.teacherId !== userId) {
      return NextResponse.json(
        { success: false, message: "لست مدرس هذه المادة" },
        { status: 403 },
      );
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        grade: grade ?? null,
        feedback: feedback || null,
        status: "evaluated",
        evaluatedAt: new Date(),
        evaluatorId: userId,
      },
    });

    const gradeText = grade !== null && grade !== undefined ? `بمقدار ${grade} درجة` : "بدون درجة";
    const notification = await prisma.notification.create({
      data: {
        userId: assignment.studentId,
        type: "ASSIGNMENT_EVALUATED",
        title: "تم تقييم التكليف",
        body: `تم تقييم تكليفك في مادة ${assignment.subject.name} ${gradeText}`,
        linkUrl: "/student",
      },
    });

    // إشعار فوري للطالب عبر Supabase Realtime
    broadcastEvent(getUserChannelName(assignment.studentId), "notification", {
      id: notification.id,
      type: "ASSIGNMENT_EVALUATED",
      title: "تم تقييم التكليف",
      body: `تم تقييم تكليفك في مادة ${assignment.subject.name} ${gradeText}`,
      linkUrl: "/student",
    });

    broadcastEvent(getUserChannelName(assignment.studentId), "assignment-update", {
      id: assignmentId,
      subjectName: assignment.subject.name,
      grade,
      status: "evaluated",
    });

    // إرسال Push Notification مع صوت
    try {
      const { sendPushToUsers } = await import("@/lib/pushNotifications");
      await sendPushToUsers([assignment.studentId], {
        title: "✅ تم تقييم التكليف",
        body: `تم تقييم تكليفك في ${assignment.subject.name} ${gradeText}`,
        data: { url: "/student" },
        sound: "/sounds/notification.mp3",
      });
    } catch (pushError) {
      console.error("[Evaluate] Push notification failed:", pushError instanceof Error ? pushError.message : String(pushError));
    }
    await prisma.auditLog.create({
      data: {
        userId,
        action: "EVALUATE",
        severity: "INFO",
        description: `تقييم تكليف للطالب ${assignment.student.name} في مادة ${assignment.subject.name} ${gradeText}`,
        level: assignment.subject.level,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تقييم التكليف بنجاح",
      data: updated,
    });
  });
