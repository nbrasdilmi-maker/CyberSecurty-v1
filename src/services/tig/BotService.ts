import { Bot, InlineKeyboard } from "grammy";
import { getBot } from "@/lib/tig/telegram";
import { tigService } from "./TigService";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revokeAllSessions } from "@/lib/auth";
import crypto from "crypto";
import redis from "@/lib/redis";
import { logger } from "@/lib/logger";


const OTP_TTL = 300;

export class BotService {
  private _bot: Bot;
  private _initialized = false;
  private readonly SESSION_PREFIX = "tig:bot:session:";

  constructor() {
    this._bot = getBot();
  }

  get initialized(): boolean {
    return this._initialized;
  }

  getBot(): Bot {
    return this._bot;
  }

  async init(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    if (typeof globalThis !== "undefined" && !("__bot_polling_started" in globalThis)) {
      (globalThis as any).__bot_polling_started = false;
    }

    try {
      await this._bot.init();
    } catch (e) {
      logger.error("[BotService] Bot init failed", { error: String(e) });
    }

    this._bot.command("start", async (ctx) => {
      const keyboard = new InlineKeyboard()
        .text("🔗 ربط حسابي", "bind")
        .text("🔐 استعادة كلمة المرور", "reset")
        .row()
        .text("❓ المساعدة", "help");

      await ctx.reply(
        "مرحباً بك في نظام الحماية والاستعادة 🤖\n\n" +
          "هذا البوت مخصص لحماية حسابك في منصة سحابة الأمن السيبراني.\n" +
          "يمكنك من خلاله ربط حسابك، استعادة كلمة المرور، والحصول على إشعارات أمنية.\n\n" +
          "اختر أحد الخيارات أدناه:",
        { reply_markup: keyboard },
      );
    });

    this._bot.callbackQuery("bind", async (ctx) => {
      await ctx.answerCallbackQuery();
      const binding = ctx.from?.id ? await tigService.getBindingByTgId(BigInt(ctx.from.id)) : null;
      if (binding && binding.status === "ACTIVE") {
        const user = await prisma.user.findUnique({ where: { id: binding.userId }, select: { name: true, email: true } });
        await ctx.reply(
          `✅ حسابك مرتبط بالفعل.\n\n` +
            `👤 ${user?.name || "—"}\n` +
            `📧 ${user?.email || "—"}\n\n` +
            `يمكنك استخدام البوت لاستعادة كلمة المرور.`,
        );
      } else {
        await ctx.reply(
          "لربط حسابك بالبوت:\n\n" +
            "1️⃣ افتح إعدادات الحساب في الموقع\n" +
            "2️⃣ اختر \"ربط حساب Telegram\"\n" +
            "3️⃣ اضغط على الزر لإنشاء كود الربط\n" +
            "4️⃣ انسخ الكود وأرسله هنا\n\n" +
            "مثال: `TIG-7F2K9QX`",
        );
      }
    });

    this._bot.callbackQuery("reset", async (ctx) => {
      await ctx.answerCallbackQuery();
      const tgId = ctx.from?.id;
      if (!tgId) { await ctx.reply("❌ حدث خطأ في التعرف على هوية Telegram. حاول مرة أخرى."); return; }
      const binding = await tigService.getBindingByTgId(BigInt(tgId));
      if (!binding || binding.status !== "ACTIVE") {
        await ctx.reply(
          "❌ حساب Telegram هذا غير مرتبط بأي حساب في المنصة.\n\n" +
            "للربط، اتبع الخطوات التالية:\n" +
            "1️⃣ افتح إعدادات الحساب في منصة سحابة الأمن السيبراني\n" +
            "2️⃣ اختر تبويب \"ربط Telegram\"\n" +
            "3️⃣ اضغط على \"🔗 ربط حساب Telegram\"\n" +
            "4️⃣ انسخ الكود وأرسله هنا",
        );
        return;
      }
      const limitCheck = await tigService.checkDailyResetLimit(binding.userId);
      if (!limitCheck.ok) {
        await ctx.reply("❌ لقد تجاوزت الحد اليومي لاستعادة كلمة المرور (3 مرات في اليوم).\nالرجاء المحاولة غداً.");
        return;
      }
      const sessionId = `${tgId}`;
      const otp = String(crypto.randomInt(100000, 1000000));
      const salt = crypto.randomBytes(16).toString("hex");
      const codeHash = crypto.createHash("sha256").update(otp + salt).digest("hex");
      const key = `tig:bot:otp:${sessionId}`;
      await redis.set(key, JSON.stringify({ codeHash, salt, userId: binding.userId, attempts: 0 }), { ex: OTP_TTL });
      await redis.set(`${this.SESSION_PREFIX}${sessionId}`, JSON.stringify({ step: "awaiting_otp", userId: binding.userId, otpKey: key }), { ex: OTP_TTL });
      const infoMsg = await ctx.reply("🔐 تم إرسال رمز التحقق.\n\nالرجاء إدخال الرمز المكون من 6 أرقام.\n(⏳ الرمز صالح لمدة 5 دقائق)\n\n❌ للإلغاء، اضغط على الزر أدناه.");
      try {
        const otpMsg = await ctx.reply(`🔢 رمز التحقق الخاص بك: ${otp}`, { reply_markup: new InlineKeyboard().text("❌ إلغاء", "cancel_reset") });
        await redis.set(`tig:bot:msgs:${sessionId}`, JSON.stringify({ infoMsgId: infoMsg?.message_id, otpMsgId: otpMsg?.message_id }), { ex: OTP_TTL });
      } catch { }
    });

    this._bot.callbackQuery("cancel_reset", async (ctx) => {
      await ctx.answerCallbackQuery();
      const tgId = ctx.from?.id;
      if (tgId) {
        await redis.del(`${this.SESSION_PREFIX}${tgId}`);
        const msgsRaw = await redis.getdel(`tig:bot:msgs:${tgId}`);
        if (msgsRaw) {
          const { infoMsgId, otpMsgId } = JSON.parse(msgsRaw);
          try { if (infoMsgId) await ctx.api.deleteMessage(ctx.chat!.id, infoMsgId); } catch {}
          try { if (otpMsgId) await ctx.api.deleteMessage(ctx.chat!.id, otpMsgId); } catch {}
        }
      }
      await ctx.reply("❌ تم إلغاء عملية استعادة كلمة المرور.");
    });

    this._bot.callbackQuery("help", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        "❓ المساعدة\n\n" +
          "الأوامر المتاحة:\n" +
          "/start - عرض القائمة الرئيسية\n\n" +
          "المزايا:\n" +
          "• ربط حساب المنصة بحساب Telegram\n" +
          "• استعادة كلمة المرور عبر البوت\n" +
          "• إشعارات أمنية فورية",
      );
    });

    // ---- Confirmation callbacks for TIG binding ----
    this._bot.callbackQuery(/confirm_bind_(.+)/, async (ctx) => {
      await ctx.answerCallbackQuery();
      const code = ctx.match![1];
      const from = ctx.from;
      if (!from) { await ctx.reply("❌ حدث خطأ."); return; }

      const telegramId = BigInt(from.id);

      const session = await tigService.getRecoverySession(code);
      if (session) {
        const result = await tigService.completeRecoveryBinding(
          code,
          telegramId, telegramId,
          from.username || undefined, from.first_name || undefined, from.last_name || undefined,
        );
        await tigService.unlockTelegramUser(telegramId);
        if (!result.ok) {
          await ctx.reply(`❌ ${result.error}`);
          return;
        }
        const user = await prisma.user.findUnique({ where: { id: result.userId }, select: { name: true, email: true, role: true, level: true } });
        void this._notifyAdmin("TELEGRAM_BOUND", {
          userId: result.userId,
          userName: user?.name || "",
          userUsername: user?.name || "",
          role: user?.role || "",
          email: user?.email || "",
          level: user?.level,
          telegramUsername: from.username || undefined,
          telegramId: String(telegramId),
          operationTime: new Date().toISOString(),
        });
        await ctx.reply(
          `✅ تم ربط حسابك بنجاح!\n\n` +
            `👤 ${user?.name || "—"}\n` +
            `📧 ${user?.email || "—"}\n\n` +
            `🔐 رمز التحقق الخاص بك: ${result.otp}\n\n` +
            `أدخل الرمز في الموقع لإكمال استعادة كلمة المرور.\n` +
            `(⏳ الرمز صالح لمدة 5 دقائق)`,
          { reply_markup: new InlineKeyboard().text("🔐 استعادة كلمة المرور", "reset") },
        );
        return;
      }

      const result = await tigService.completeBinding(
        code,
        telegramId, telegramId,
        from.username || undefined, from.first_name || undefined, from.last_name || undefined,
      );
      await tigService.unlockTelegramUser(telegramId);
      if (!result.ok) {
        await ctx.reply(`❌ ${result.error}`);
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: result.userId }, select: { name: true, email: true, role: true, level: true } });
      void this._notifyAdmin("TELEGRAM_BOUND", {
        userId: result.userId,
        userName: user?.name || "",
        userUsername: user?.name || "",
        role: user?.role || "",
        email: user?.email || "",
        level: user?.level,
        telegramUsername: from.username || undefined,
        telegramId: String(telegramId),
        operationTime: new Date().toISOString(),
      });
      await ctx.reply(
        `✅ تم ربط حسابك بنجاح!\n\n` +
          `👤 ${user?.name || "—"}\n` +
          `📧 ${user?.email || "—"}\n\n` +
          `يمكنك الآن استخدام البوت لاستعادة كلمة المرور أو تلقي إشعارات أمنية.`,
        { reply_markup: new InlineKeyboard().text("🔐 استعادة كلمة المرور", "reset") },
      );
    });

    this._bot.callbackQuery(/cancel_bind_(.+)/, async (ctx) => {
      await ctx.answerCallbackQuery();
      const code = ctx.match![1];
      const from = ctx.from;
      if (from) await tigService.unlockTelegramUser(BigInt(from.id));
      const isRecovery = await tigService.getRecoverySession(code);
      if (isRecovery) {
        await tigService.deleteRecoverySession(code);
        await ctx.reply("❌ تم إلغاء عملية الربط. يمكنك إعادة المحاولة من نافذة استعادة كلمة المرور.");
      } else {
        await tigService.deleteBindCode(code);
        await ctx.reply("❌ تم إلغاء عملية الربط. يمكنك إنشاء كود جديد من الإعدادات.");
      }
    });

    // ---- Main message handler ----
    const pendingResetInputs = new Set<string>();

    this._bot.on("message:text", async (ctx) => {
      const tgId = `${ctx.from?.id}`;
      const text = ctx.message?.text?.trim() || "";
      const upperText = text.toUpperCase();

      // ---- 1. TIG binding/recovery codes ----
      if (/^TIG-[A-Z0-9]{4,}$/i.test(upperText)) {
        await this._handleTigCode(ctx, upperText);
        return;
      }

      const sessionRaw = await redis.get<string>(`${this.SESSION_PREFIX}${tgId}`);
      const session = sessionRaw ? JSON.parse(sessionRaw) : null;

      // ---- 2. OTP input for inline reset (already bound users) ----
      if (session && session.step === "awaiting_otp") {
        if (text.length !== 6 || !/^\d{6}$/.test(text)) {
          await ctx.reply("❌ رمز التحقق يجب أن يكون 6 أرقام. حاول مرة أخرى.");
          return;
        }
        const raw = await redis.getdel<string>(session.otpKey);
        if (!raw) {
          await redis.del(`${this.SESSION_PREFIX}${tgId}`);
          await ctx.reply("❌ انتهت صلاحية رمز التحقق. الرجاء البدء من جديد عبر /start.");
          return;
        }
        const data = JSON.parse(raw);
        const computedHash = crypto.createHash("sha256").update(text + data.salt).digest("hex");
        if (computedHash !== data.codeHash) {
          data.attempts += 1;
          if (data.attempts >= 5) {
            await redis.del(`${this.SESSION_PREFIX}${tgId}`);
            await ctx.reply("❌ تم تجاوز الحد المسموح من المحاولات (5).\nتم إلغاء العملية لأمن حسابك.\nيمكنك البدء من جديد عبر /start.");
            return;
          }
          await redis.set(session.otpKey, JSON.stringify(data), { ex: OTP_TTL });
          await ctx.reply(`❌ رمز غير صحيح. المحاولات المتبقية: ${5 - data.attempts}`);
          return;
        }
        const msgsRaw = await redis.getdel(`tig:bot:msgs:${tgId}`);
        if (msgsRaw) {
          const { infoMsgId, otpMsgId } = JSON.parse(msgsRaw);
          try { if (infoMsgId) await ctx.api.deleteMessage(ctx.chat!.id, infoMsgId); } catch {}
          try { if (otpMsgId) await ctx.api.deleteMessage(ctx.chat!.id, otpMsgId); } catch {}
        }
        session.step = "awaiting_password";
        await redis.set(`${this.SESSION_PREFIX}${tgId}`, JSON.stringify(session), { ex: OTP_TTL * 2 });
        pendingResetInputs.add(tgId);
        await ctx.reply("✅ تم التحقق من الرمز.\n\nالرجاء إرسال كلمة المرور الجديدة:\n• يجب أن تكون 8 أحرف على الأقل\n• يُفضل احتواؤها على أرقام وحروف");
        return;
      }

      // ---- 3. New password input ----
      if (session && session.step === "awaiting_password") {
        if (!pendingResetInputs.has(tgId)) { await ctx.reply("الرجاء إرسال كلمة المرور الجديدة."); return; }
        if (text.length < 8) { await ctx.reply("❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل."); return; }
        pendingResetInputs.delete(tgId);
        await redis.del(`${this.SESSION_PREFIX}${tgId}`);
        try {
          const passwordHash = await bcrypt.hash(text, 12);
          await prisma.user.update({
            where: { id: session.userId },
            data: { passwordHash, failedLoginAttempts: 0, status: "ACTIVE", lockedUntil: null, tokenVersion: { increment: 1 } },
          });
          await revokeAllSessions(session.userId);
          await prisma.auditLog.create({ data: { userId: session.userId, action: "PASSWORD_RESET_COMPLETED", severity: "WARNING", description: "تم تغيير كلمة المرور عبر Telegram Bot" } });
          const resetUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true, role: true, level: true } });
          if (resetUser) {
            void this._notifyAdmin("PASSWORD_RESET_COMPLETED", {
              userId: session.userId,
              userName: resetUser.name,
              userUsername: resetUser.name,
              role: resetUser.role,
              email: resetUser.email,
              level: resetUser.level,
              operationTime: new Date().toISOString(),
            });
          }
          await ctx.reply("✅ تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.");
        } catch (err) {
          logger.error("Bot password reset failed", { error: String(err), userId: session.userId });
          await ctx.reply("❌ حدث خطأ. حاول مرة أخرى عبر /start.");
        }
        return;
      }

      await ctx.reply("عذراً، لم أتعرف على الأمر. يرجى استخدام /start للبدء.");
    });

    this._bot.catch((err) => {
      logger.error("[BotService] Unhandled bot error:", { error: String(err.error) });
    });

    if (process.env.TIG_BOT_POLLING === "true" && !(globalThis as any).__bot_polling_started) {
      (globalThis as any).__bot_polling_started = true;
      logger.info("[BotService] Starting in polling mode...");
      await this._bot.start({ drop_pending_updates: true });
    }
  }

  // ==================== TIG Code Handler ====================

  private async _handleTigCode(ctx: any, code: string) {
    try { await ctx.deleteMessage(); } catch { }

    const from = ctx.from;
    if (!from) {
      logger.warn("[BotService] _handleTigCode called without user identity");
      await ctx.reply("❌ تعذر التعرف على هوية المستخدم. تأكد من أن البوت لديه صلاحية الوصول إلى معرف Telegram.");
      return;
    }

    const telegramId = BigInt(from.id);

    // 1. Extract userId from either recovery session or direct bind
    const recoverySession = await tigService.getRecoverySession(code);
    let codeUserId: string | null = null;
    if (recoverySession) {
      codeUserId = recoverySession.userId;
    } else {
      const bindRaw = await redis.get<string>(`tig:bind:${code}`);
      if (bindRaw) codeUserId = JSON.parse(bindRaw).userId;
    }

    if (!codeUserId) {
      await ctx.reply("❌ كود الربط غير صالح أو منتهي الصلاحية. يرجى إنشاء كود جديد من الموقع.");
      return;
    }

    // 2. Lock this Telegram user to this userId — prevent switching accounts
    const lock = await tigService.lockTelegramUser(telegramId, codeUserId, code);
    if (!lock.ok) {
      await ctx.reply(`❌ ${lock.error}`);
      return;
    }

    // 3. Show user info + confirm/cancel
    const user = await prisma.user.findUnique({
      where: { id: codeUserId },
      select: { name: true, email: true, role: true },
    });
    if (!user) {
      await ctx.reply("❌ المستخدم غير موجود.");
      if (recoverySession) await tigService.deleteRecoverySession(code);
      else await tigService.deleteBindCode(code);
      return;
    }

    const roleLabel = this._roleLabel(user.role);
    const keyboard = new InlineKeyboard()
      .text("✅ تأكيد الربط", `confirm_bind_${code}`)
      .text("❌ إلغاء", `cancel_bind_${code}`);

    const source = recoverySession ? "استعادة كلمة المرور" : "ربط حساب";
    await ctx.reply(
      `🔍 تم العثور على طلب ربط من نافذة ${source}.\n\n` +
        `👤 الاسم: ${user.name}\n` +
        `📧 البريد: ${user.email}\n` +
        `🎓 الدور: ${roleLabel}\n\n` +
        `هل تريد ربط هذا الحساب؟`,
      { reply_markup: keyboard },
    );
  }

  private async _notifyAdmin(event: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const { AdminNotificationService } = await import("@/services/notification/AdminNotificationService");
      await AdminNotificationService.notify({ event, ...payload } as any);
    } catch (err) {
      logger.error("[BotService] Admin notification failed", { event, error: String(err) });
    }
  }

  private _roleLabel(role: string): string {
    switch (role) {
      case "ADMIN": return "أدمن";
      case "MANAGEMENT": return "إدارة";
      case "TEACHER": return "معلم";
      case "STUDENT": return "طالب";
      default: return role;
    }
  }
}

export const botService = new BotService();

// Auto-init on server load (handles both polling and webhook modes)
if (typeof process !== "undefined" && process.env.NODE_ENV) {
  botService.init().catch((e) => logger.error("[BotService] Auto-init failed", { error: String(e) }));
}
