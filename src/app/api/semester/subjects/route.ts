import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { SemesterService } from "@/services/academic/SemesterService";
import { withErrorHandler } from "@/lib/errors";
import { addPrivateCacheHeaders } from "@/lib/cacheHeaders";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "غير مصرح" },
      { status: 401 },
    );
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "غير مصرح" },
      { status: 401 },
    );
  }

  const data = await SemesterService.getSubjects(payload.sub);

  return addPrivateCacheHeaders(NextResponse.json({ success: true, data }), 60);
});
