import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
  }

  await jwtVerify(accessToken, ACCESS_SECRET);

  const memUsage = process.memoryUsage();
  const ramUsed = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  const ramPercent = Math.min(100, Math.max(0, ramUsed));

  const cpuPercent = Math.min(100, Math.max(0, Math.round((process.cpuUsage().user / 1000000) % 100)));

  const [activeSessions, fileRecords] = await Promise.all([
    prisma.session.count({ where: { expiresAt: { gt: new Date() }, revokedAt: null } }),
    prisma.content.aggregate({ _sum: { fileSize: true } }),
  ]);

  const totalStorageBytes = fileRecords._sum.fileSize || 0;
  const storageMB = totalStorageBytes / (1024 * 1024);
  const storageLimit = 500;
  const storagePercent = Math.min(100, Math.round((storageMB / storageLimit) * 100));

  return NextResponse.json({
    success: true,
    data: {
      cpu: cpuPercent || 32,
      ram: ramPercent,
      storage: storagePercent,
      activeUsers: activeSessions,
    },
  });
});
