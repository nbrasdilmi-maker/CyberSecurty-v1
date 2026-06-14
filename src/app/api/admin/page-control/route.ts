import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { withErrorHandler, ValidationError, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import prisma from "@/lib/prisma";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const dynamic = "force-dynamic";

const DEFAULT_PAGES = [
  { pageKey: "dashboard", pageName: "لوحة التحكم", route: "/dashboard" },
  { pageKey: "library", pageName: "المكتبة التعليمية", route: "/library" },
  { pageKey: "code-editor", pageName: "محرر الأكواد", route: "/code-editor" },
  { pageKey: "chat", pageName: "المحادثة", route: "/chat" },
  { pageKey: "notifications", pageName: "الإشعارات", route: "/notifications" },
  { pageKey: "settings", pageName: "الإعدادات", route: "/settings" },
  { pageKey: "announcements", pageName: "نشر تعميم", route: "/announcements/create" },
  { pageKey: "teacher", pageName: "صفحة المعلم", route: "/teacher" },
  { pageKey: "student", pageName: "صفحة الطالب", route: "/student" },
  { pageKey: "management", pageName: "لوحة الإدارة", route: "/management" },
  { pageKey: "admin", pageName: "لوحة الأدمن", route: "/admin" },
];

async function verifyAdmin(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  if (payload.role !== "ADMIN") throw new ForbiddenError();
  return payload;
}

async function ensureDefaultPages() {
  const count = await prisma.pageControl.count();
  if (count === 0) {
    await prisma.pageControl.createMany({
      data: DEFAULT_PAGES.map((p) => ({
        pageKey: p.pageKey,
        pageName: p.pageName,
        route: p.route,
      })),
    });
  }
}

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  await verifyAdmin(request);
  await ensureDefaultPages();

  const pages = await prisma.pageControl.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: pages });
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const payload = await verifyAdmin(request);

  const body = await request.json();
  const { id, isDisabled, maintenanceTitle, maintenanceMessage } = body;

  if (!id) throw new ValidationError("معرف الصفحة مطلوب");

  const existing = await prisma.pageControl.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "الصفحة غير موجودة" }, { status: 404 });
  }

  const previousStatus = existing.isDisabled;

  const updated = await prisma.pageControl.update({
    where: { id },
    data: {
      isDisabled: Boolean(isDisabled),
      maintenanceTitle: maintenanceTitle || null,
      maintenanceMessage: maintenanceMessage || null,
      updatedById: payload.sub as string,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: payload.sub as string,
      action: "PAGE_CONTROL_UPDATE",
      severity: "INFO",
      description: `تحديث حالة الصفحة "${existing.pageName}": ${previousStatus ? "متوقفة" : "مفعلة"} ← ${isDisabled ? "متوقفة" : "مفعلة"}`,
      metadata: {
        pageKey: existing.pageKey,
        previousStatus,
        newStatus: isDisabled,
        maintenanceTitle: maintenanceTitle || null,
      },
    },
  });

  return NextResponse.json({ success: true, data: updated, message: "تم تحديث حالة الصفحة بنجاح" });
});
