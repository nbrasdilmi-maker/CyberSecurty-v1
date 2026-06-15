import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { getEffectiveRole } from "@/lib/auth";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  const requesterId = payload.sub as string;
  const requesterRole = payload.role as string;
  if (requesterRole !== "ADMIN" && requesterRole !== "MANAGEMENT") {
    throw new ForbiddenError("غير مصرح");
  }

  const body = await request.json();

  // Case 1: Grant publish permission by email (from /management/upgrade)
  if (body.email) {
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim(), deletedAt: null },
      select: { id: true, name: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ success: false, message: "الأدمن يملك صلاحية النشر مسبقاً" }, { status: 400 });
    }
    const existing = await prisma.uploadPermission.findFirst({ where: { userId: user.id, revokedAt: null } });
    if (existing) {
      return NextResponse.json({ success: false, message: "المستخدم لديه صلاحية نشر بالفعل" }, { status: 409 });
    }
    await prisma.uploadPermission.create({
      data: { userId: user.id, grantedBy: requesterId },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", severity: "INFO", description: `تم منح صلاحية النشر بواسطة ${requesterId}` },
    });
    return NextResponse.json({ success: true, message: `تم منح صلاحية النشر لـ ${user.name}` });
  }

  // Case 2: Grant publish permission by userId
  if (body.userId && !body.managementLevel) {
    const user = await prisma.user.findUnique({
      where: { id: body.userId, deletedAt: null },
      select: { id: true, name: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ success: false, message: "الأدمن يملك صلاحية النشر مسبقاً" }, { status: 400 });
    }
    const existing = await prisma.uploadPermission.findFirst({ where: { userId: user.id, revokedAt: null } });
    if (existing) {
      return NextResponse.json({ success: false, message: "المستخدم لديه صلاحية نشر بالفعل" }, { status: 409 });
    }
    await prisma.uploadPermission.create({
      data: { userId: user.id, grantedBy: requesterId },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", severity: "INFO", description: `تم منح صلاحية النشر بواسطة ${requesterId}` },
    });
    return NextResponse.json({ success: true, message: `تم منح صلاحية النشر لـ ${user.name}` });
  }

  // Case 3: Grant MANAGEMENT upgrade
  if (body.userId && body.managementLevel) {
    if (requesterRole !== "ADMIN") {
      throw new ForbiddenError("غير مصرح - الترقية للإدارة تحتاج صلاحية أدمن");
    }
    const user = await prisma.user.findUnique({
      where: { id: body.userId, deletedAt: null },
      select: { id: true, name: true, role: true, level: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ success: false, message: "لا يمكن ترقية أدمن" }, { status: 400 });
    }
    const effective = await getEffectiveRole(user.id);
    if (effective.role === "MANAGEMENT") {
      return NextResponse.json({ success: false, message: "المستخدم برتبة إدارة بالفعل" }, { status: 409 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { managementLevel: body.managementLevel },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", severity: "INFO", description: `تمت الترقية إلى رتبة إدارة - المستوى: ${body.managementLevel}` },
    });
    return NextResponse.json({ success: true, message: `تمت ترقية ${user.name} إلى رتبة إدارة` });
  }

  return NextResponse.json({ success: false, message: "بيانات غير صالحة" }, { status: 400 });
});

export const DELETE = withErrorHandler(async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) throw new UnauthorizedError();

  const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
  const requesterRole = payload.role as string;
  if (requesterRole !== "ADMIN" && requesterRole !== "MANAGEMENT") {
    throw new ForbiddenError("غير مصرح");
  }

  const body = await request.json();

  // Case 1: Revoke publish permission
  if (body.permissionId) {
    const perm = await prisma.uploadPermission.findUnique({ where: { id: body.permissionId } });
    if (!perm) {
      return NextResponse.json({ success: false, message: "الصلاحية غير موجودة" }, { status: 404 });
    }
    if (perm.revokedAt) {
      return NextResponse.json({ success: false, message: "الصلاحية ملغاة مسبقاً" }, { status: 409 });
    }
    await prisma.uploadPermission.update({
      where: { id: body.permissionId },
      data: { revokedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: { userId: perm.userId, action: "UPDATE", severity: "WARNING", description: `تم سحب صلاحية النشر` },
    });
    return NextResponse.json({ success: true, message: "تم سحب صلاحية النشر" });
  }

  // Case 2: Revoke MANAGEMENT
  if (body.userId && body.action === "revoke-management") {
    if (requesterRole !== "ADMIN") {
      throw new ForbiddenError("غير مصرح - سحب رتبة الإدارة يحتاج صلاحية أدمن");
    }
    const user = await prisma.user.findUnique({
      where: { id: body.userId, deletedAt: null },
      select: { id: true, name: true, managementLevel: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }
    if (!user.managementLevel) {
      return NextResponse.json({ success: false, message: "المستخدم ليس برتبة إدارة" }, { status: 409 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { managementLevel: null },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", severity: "WARNING", description: `تم سحب رتبة الإدارة` },
    });
    return NextResponse.json({ success: true, message: `تم سحب الإدارة من ${user.name}` });
  }

  return NextResponse.json({ success: false, message: "بيانات غير صالحة" }, { status: 400 });
});
