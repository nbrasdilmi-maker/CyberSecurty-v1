import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // Step 1: Find user
    const user = await prisma.user.findFirst({
      where: { email: "nbraskiani@gmail.com", deletedAt: null },
    });
    if (!user) { results.error = "User not found"; return NextResponse.json(results); }
    results.userId = user.id;

    // Step 2: Check password
    results.passwordValid = await bcrypt.compare("123456789", user.passwordHash);

    // Step 3: Update last login
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: "127.0.0.1" },
      });
      results.step3 = "lastLogin updated ok";
    } catch (e: any) {
      results.step3 = `FAIL update lastLogin: ${e?.message}`;
    }

    // Step 4: Generate access token (test JWT)
    try {
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
      const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("15m")
        .setIssuedAt()
        .sign(secret);
      results.step4 = `accessToken generated: ${token.substring(0, 20)}...`;
    } catch (e: any) {
      results.step4 = `FAIL generateAccessToken: ${e?.message}`;
    }

    // Step 5: Create refresh token + token family (transaction)
    try {
      const { SignJWT } = await import("jose");
      const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
      const genId = "test-" + Date.now();
      const refreshToken = await new SignJWT({
        sub: user.id,
        type: "refresh",
        jti: genId,
        tokenVersion: user.tokenVersion,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(refreshSecret);
      results.step5_token = `refreshToken generated ok`;

      // Test: create token family and generation in transaction
      try {
        const tokenHash = (await import("crypto")).createHash("sha256").update(refreshToken).digest("hex");
        await prisma.$transaction(async (tx) => {
          const family = await tx.tokenFamily.create({
            data: { userId: user.id, ipAddress: "127.0.0.1", userAgent: "test" },
          });
          await tx.tokenGeneration.create({
            data: { id: genId, familyId: family.id, generation: 1, refreshTokenHash: tokenHash, ipAddress: "127.0.0.1", userAgent: "test" },
          });
          // Clean up
          await tx.tokenGeneration.delete({ where: { id: genId } });
          await tx.tokenFamily.delete({ where: { id: family.id } });
        });
        results.step5_tx = "transaction ok (created + cleaned up)";
      } catch (e: any) {
        results.step5_tx = `FAIL transaction: ${e?.message}`;
      }
    } catch (e: any) {
      results.step5 = `FAIL refreshToken: ${e?.message}`;
    }

    // Step 6: Test cookies
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.set("test-cookie", "test", { maxAge: 60, path: "/" });
      results.step6 = "cookies() ok";
    } catch (e: any) {
      results.step6 = `FAIL cookies(): ${e?.message}`;
    }

    // Step 7: Test audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          severity: "INFO",
          description: "تشخيص",
          ipAddress: "127.0.0.1",
          level: user.level,
        },
      });
      results.step7 = "auditLog ok";
    } catch (e: any) {
      results.step7 = `FAIL auditLog: ${e?.message}`;
    }

    results.success = true;
  } catch (e: any) {
    results.error = e?.message;
    results.stack = e?.stack?.split("\n").slice(0, 5).join("\n");
  }

  return NextResponse.json(results);
}
