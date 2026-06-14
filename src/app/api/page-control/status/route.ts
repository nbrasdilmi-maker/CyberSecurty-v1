import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const route = searchParams.get("route");

  if (!route) {
    return NextResponse.json({ success: true, data: [] });
  }

  const records = await prisma.pageControl.findMany({
    where: { route },
    select: {
      pageKey: true,
      pageName: true,
      isDisabled: true,
      maintenanceTitle: true,
      maintenanceMessage: true,
    },
  });

  return NextResponse.json({ success: true, data: records });
});
