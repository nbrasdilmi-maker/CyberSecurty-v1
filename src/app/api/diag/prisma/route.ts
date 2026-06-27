import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    results.step1 = "bcrypt loaded ok";
  } catch (e: any) {
    results.step1 = `FAIL: ${e?.message}`;
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: "nbraskiani@gmail.com" } });
    if (user) {
      results.step2 = `User found: ${user.id}, role: ${user.role}, 2fa: ${user.twoFactorEnabled}, activated: ${user.isActivated}, status: ${user.status}, locked: ${user.lockedUntil}`;
      try {
        const valid = await bcrypt.compare("123456789", user.passwordHash);
        results.step3 = `Password valid: ${valid}`;
      } catch (e: any) {
        results.step3 = `bcrypt.compare FAIL: ${e?.message}`;
      }
    } else {
      results.step2 = "User NOT found by email";
      const byName = await prisma.user.findFirst({ where: { name: "nbraskiani" } });
      if (byName) {
        results.step2_alt = `Found by name: ${byName.email}`;
      }
      const byUsername = await prisma.user.findFirst({ where: { username: "nbraskiani" } });
      if (byUsername) {
        results.step2_alt = `Found by username: ${byUsername.email}`;
      }
    }
  } catch (e: any) {
    results.step2 = `FAIL: ${e?.message}`;
    results.step2_stack = e?.stack?.split("\n").slice(0, 3).join("\n");
  }

  return NextResponse.json(results);
}
