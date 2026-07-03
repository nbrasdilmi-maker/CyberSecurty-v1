import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const fileName = searchParams.get("name") || "file";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`ImageKit returned ${res.status}`);
    const blob = await res.blob();
    const ext = fileUrl.split(".").pop()?.split("?")[0] || "";
    const fullName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fullName)}`,
        "Content-Length": String(blob.size),
      },
    });
  } catch {
    return NextResponse.redirect(fileUrl);
  }
}
