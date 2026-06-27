import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // Test the exact AuthService.login flow
    const { AuthService } = await import("@/services/auth/AuthService");
    results.importOk = true;

    try {
      const result = await AuthService.login(
        "nbraskiani@gmail.com",
        "123456789",
        "127.0.0.1",
        "test-agent",
      );
      results.loginResult = {
        success: true,
        userId: result.user?.id,
        role: result.user?.role,
        hasToken: !!result.accessToken,
      };
    } catch (e: any) {
      results.loginResult = {
        success: false,
        error: e?.message,
        code: e?.code,
        statusCode: e?.statusCode,
        stack: e?.stack?.split("\n").slice(0, 5).join("\n"),
      };
    }
  } catch (e: any) {
    results.importError = e?.message;
  }

  return NextResponse.json(results);
}
