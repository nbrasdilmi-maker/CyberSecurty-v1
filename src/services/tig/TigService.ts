import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import crypto from "crypto";

const OTP_TTL = 180;
const BIND_CODE_TTL = 1800;
const DAILY_RESET_LIMIT = 3;

function generateTigCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TIG-";
  for (let i = 0; i < 7; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
}

export class TigService {
  // ==================== Binding ====================

  async getBinding(userId: string) {
    return prisma.telegramBinding.findUnique({ where: { userId } });
  }

  async getBindingByTgId(telegramId: bigint) {
    return prisma.telegramBinding.findUnique({ where: { telegramId } });
  }

  async initiateBinding(userId: string): Promise<{ code: string }> {
    const code = generateTigCode();
    const key = `tig:bind:${code}`;
    await redis.set(key, JSON.stringify({ userId, createdAt: Date.now() }), {
      ex: BIND_CODE_TTL,
    });
    return { code };
  }

  async deleteBindCode(code: string) {
    await redis.del(`tig:bind:${code.toUpperCase().trim()}`);
  }

  async completeBinding(
    rawCode: string,
    telegramId: bigint,
    chatId: bigint,
    telegramUsername?: string,
    firstName?: string,
    lastName?: string,
  ) {
    const code = rawCode.toUpperCase().trim();
    const key = `tig:bind:${code}`;
    const raw = await redis.getdel<string>(key);
    if (!raw)
      return {
        ok: false as const,
        error: "كود الربط غير صالح أو منتهي الصلاحية",
      };
    const { userId } = JSON.parse(raw);
    const existing = await prisma.telegramBinding.findUnique({
      where: { userId },
    });
    if (existing) {
      if (existing.status === "ACTIVE")
        return {
          ok: false as const,
          error: "هذا الحساب مرتبط بحساب Telegram بالفعل",
        };
      await prisma.telegramBinding.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          telegramId,
          chatId,
          telegramUsername,
          firstName,
          lastName,
          verifiedAt: new Date(),
        },
      });
    } else {
      const existingTg = await prisma.telegramBinding.findUnique({
        where: { telegramId },
      });
      if (existingTg)
        return {
          ok: false as const,
          error: "حساب Telegram هذا مرتبط بحساب آخر بالفعل",
        };
      await prisma.telegramBinding.create({
        data: {
          userId,
          telegramId,
          chatId,
          telegramUsername,
          firstName,
          lastName,
          status: "ACTIVE",
          verifiedAt: new Date(),
        },
      });
    }
    await this.setPermanentLock(telegramId, userId);
    return { ok: true as const, userId };
  }

  async setPermanentLock(telegramId: bigint, userId: string) {
    const key = `tig:perm-lock:${telegramId}`;
    await redis.set(key, JSON.stringify({ userId, boundAt: Date.now() }), { ex: 86400 * 365 });
  }

  async isPermanentlyLocked(telegramId: bigint): Promise<string | null> {
    const key = `tig:perm-lock:${telegramId}`;
    const raw = await redis.get<string>(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.userId || null;
  }

  async removePermanentLock(telegramId: bigint) {
    await redis.del(`tig:perm-lock:${telegramId}`);
  }

  async unbind(userId: string, force: boolean = false) {
    const binding = await prisma.telegramBinding.findUnique({
      where: { userId },
    });
    if (!binding) return { ok: false as const, error: "لا يوجد ربط" };
    if (!force) {
      const lockedUserId = await this.isPermanentlyLocked(binding.telegramId);
      if (lockedUserId) {
        return { ok: false as const, error: "لا يمكن إلغاء الربط من هنا. يرجى الاتصال بالأدمن." };
      }
    }
    await prisma.telegramBinding.update({
      where: { id: binding.id },
      data: { status: "REVOKED" },
    });
    if (force) {
      await this.removePermanentLock(binding.telegramId);
    }
    return { ok: true as const };
  }

  // ==================== Telegram Session Lock ====================

  async lockTelegramUser(telegramId: bigint, userId: string, code: string) {
    const key = `tig:lock:${telegramId}`;
    const existing = await redis.get<string>(key);
    if (existing) {
      const data = JSON.parse(existing);
      if (data.userId !== userId)
        return {
          ok: false as const,
          error:
            "أنت في جلسة ربط لحساب آخر. يرجى إلغاء الجلسة الحالية أولاً عبر زر الإلغاء في البوت.",
          currentUserId: data.userId,
        };
    }
    await redis.set(
      key,
      JSON.stringify({ userId, code, createdAt: Date.now() }),
      { ex: BIND_CODE_TTL },
    );
    return { ok: true as const };
  }

  async getLockForTelegramUser(telegramId: bigint) {
    const key = `tig:lock:${telegramId}`;
    const raw = await redis.get<string>(key);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  async unlockTelegramUser(telegramId: bigint) {
    await redis.del(`tig:lock:${telegramId}`);
  }

  // ==================== Recovery Sessions ====================

  async createRecoverySession(
    identifier: string,
    userId: string,
    ip?: string,
    userAgent?: string,
  ) {
    const code = generateTigCode();
    const key = `tig:recovery:${code}`;
    const session = {
      userId,
      identifier,
      ip,
      userAgent,
      createdAt: Date.now(),
      bound: false,
      otpSent: false,
    };
    await redis.set(key, JSON.stringify(session), { ex: BIND_CODE_TTL });
    return { code, session };
  }

  async getRecoverySession(code: string) {
    const key = `tig:recovery:${code}`;
    const raw = await redis.get<string>(key);
    if (!raw) return null;
    return { code, ...JSON.parse(raw) };
  }

  async deleteRecoverySession(code: string) {
    await redis.del(`tig:recovery:${code}`);
  }

  async markRecoveryBound(code: string, otpSent: boolean) {
    const key = `tig:recovery:${code}`;
    const raw = await redis.get<string>(key);
    if (!raw) return;
    const session = JSON.parse(raw);
    session.bound = true;
    session.otpSent = otpSent;
    await redis.set(key, JSON.stringify(session), { ex: BIND_CODE_TTL });
  }

  async findUserByIdentifier(identifier: string) {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");
    if (isEmail) {
      return prisma.user.findFirst({
        where: {
          email: trimmed.toLowerCase(),
          deletedAt: null,
          isActivated: true,
        },
        select: { id: true, email: true, name: true, username: true, role: true, level: true },
      });
    }
    return prisma.user.findFirst({
      where: { OR: [{ name: trimmed }, { username: trimmed }], deletedAt: null, isActivated: true },
      select: { id: true, email: true, name: true, username: true, role: true, level: true },
    });
  }

  // ==================== OTP ====================

  async checkDailyResetLimit(userId: string): Promise<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `tig:daily-reset:${userId}:${today}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 172800);
    }
    return count <= DAILY_RESET_LIMIT;
  }

  async sendPasswordResetOtp(userId: string, email: string, chatId: bigint) {
    const otp = String(crypto.randomInt(100000, 1000000));
    const salt = crypto.randomBytes(16).toString("hex");
    const codeHash = crypto
      .createHash("sha256")
      .update(otp + salt)
      .digest("hex");
    const key = `tig:otp:${userId}`;
    await redis.set(
      key,
      JSON.stringify({ codeHash, salt, userId, email, attempts: 0 }),
      { ex: OTP_TTL },
    );
    return { otp, codeHash, salt };
  }

  async verifyOtp(userId: string, code: string) {
    const key = `tig:otp:${userId}`;
    const raw = await redis.getdel<string>(key);
    if (!raw)
      return {
        ok: false as const,
        error: "رمز التحقق غير صحيح أو منتهي الصلاحية",
      };
    const data = JSON.parse(raw);
    if (data.attempts >= 5)
      return {
        ok: false as const,
        error: "محاولات كثيرة. حاول مرة أخرى لاحقاً.",
      };
    const computedHash = crypto
      .createHash("sha256")
      .update(code + data.salt)
      .digest("hex");
    if (computedHash !== data.codeHash) {
      data.attempts += 1;
      await redis.set(key, JSON.stringify(data), { ex: OTP_TTL });
      return {
        ok: false as const,
        error: "رمز التحقق غير صحيح",
        remaining: 5 - data.attempts,
      };
    }
    const { createResetToken } = await import("@/lib/passwordReset");
    const { rawToken } = await createResetToken(userId, data.email);
    return { ok: true as const, userId, resetToken: rawToken };
  }

  // ==================== Recovery Complete (bind + OTP in one, then delete session) ====================

  async completeRecoveryBinding(
    code: string,
    telegramId: bigint,
    chatId: bigint,
    telegramUsername?: string,
    firstName?: string,
    lastName?: string,
  ) {
    const key = `tig:recovery:${code}`;
    const raw = await redis.getdel<string>(key);
    if (!raw)
      return {
        ok: false as const,
        error: "جلسة الاستعادة غير صالحة أو منتهية",
      };

    const session = JSON.parse(raw);
    const { userId } = session;

    await redis.set(key, JSON.stringify(session), { ex: BIND_CODE_TTL });

    const existing = await prisma.telegramBinding.findUnique({
      where: { userId },
    });
    if (existing && existing.status === "ACTIVE") {
      await this.deleteRecoverySession(code);
      return { ok: false as const, error: "هذا الحساب مرتبط بالفعل", userId };
    }
    if (existing) {
      await prisma.telegramBinding.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          telegramId,
          chatId,
          telegramUsername,
          firstName,
          lastName,
          verifiedAt: new Date(),
        },
      });
    } else {
      const existingTg = await prisma.telegramBinding.findUnique({
        where: { telegramId },
      });
      if (existingTg) {
        await this.deleteRecoverySession(code);
        return {
          ok: false as const,
          error: "حساب Telegram هذا مرتبط بحساب آخر بالفعل",
        };
      }
      await prisma.telegramBinding.create({
        data: {
          userId,
          telegramId,
          chatId,
          telegramUsername,
          firstName,
          lastName,
          status: "ACTIVE",
          verifiedAt: new Date(),
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      await this.deleteRecoverySession(code);
      return { ok: false as const, error: "المستخدم غير موجود" };
    }

    await this.setPermanentLock(telegramId, userId);
    const { otp } = await this.sendPasswordResetOtp(userId, user.email, chatId);
    session.bound = true;
    session.otpSent = true;
    await redis.set(key, JSON.stringify(session), { ex: BIND_CODE_TTL });
    return { ok: true as const, userId, otp };
  }

  async getRecoveryStatus(code: string) {
    const session = await this.getRecoverySession(code);
    if (!session) return { found: false as const };
    return {
      found: true as const,
      bound: session.bound,
      otpSent: session.otpSent,
      userId: session.userId,
    };
  }
}

export const tigService = new TigService();
