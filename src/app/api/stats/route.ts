import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async function GET() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalManagement,
    totalAdmins,
    totalSubjects,
    totalAssignments,
    totalBindings,
    recentActivations,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "STUDENT", deletedAt: null } }),
    prisma.user.count({ where: { role: "TEACHER", deletedAt: null } }),
    prisma.user.count({ where: { role: "MANAGEMENT", deletedAt: null } }),
    prisma.user.count({ where: { role: "ADMIN", deletedAt: null } }),
    prisma.subject.count({ where: { deletedAt: null } }),
    prisma.assignment.count({ where: { deletedAt: null } }),
    prisma.telegramBinding.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({
      where: {
        isActivated: true,
        status: "ACTIVE",
        deletedAt: null,
        updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalManagement,
      totalAdmins,
      totalSubjects,
      totalAssignments,
      totalBindings,
      recentActivations,
    },
  });
});
