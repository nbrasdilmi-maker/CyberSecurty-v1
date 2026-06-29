import { Bot, InlineKeyboard } from "grammy";
import { getBot } from "@/lib/tig/telegram";
import { tigService } from "./TigService";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { logger } from "@/lib/logger";

export class BotService {
  private _bot: Bot;
  private _initialized = false;
  private _initPromise: Promise<void> | null = null;

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
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._doInit();
    return this._initPromise;
  }

  private async _doInit(): Promise<void> {
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
        .row()
        .text("❓ المساعدة", "help");

      await ctx.reply(
        "مرحباً بك في بوت التحقق والتوثيق 🤖\n\n" +
          "هذا البوت مخصص لربط حسابك في منصة سحابة الأمن السيبراني.\n" +
          "بعد الربط، ستتمكن من استلام أكواد التحقق اللازمة لحماية حسابك.\n\n" +
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
            `يمكنك استخدام البوت لتلقي أكواد التحقق.`,
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

    this._bot.callbackQuery("help", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        "❓ المساعدة\n\n" +
          "الأوامر المتاحة:\n" +
          "/start - عرض القائمة الرئيسية\n\n" +
          "المزايا:\n" +
          "• ربط حساب المنصة بحساب Telegram\n" +
          "• استلام أكواد التحقق وإعادة التعيين\n" +
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
            `يمكنك الآن استخدام الموقع لإعادة تعيين كلمة المرور عند الحاجة.\n` +
            `سيتم إرسال أكواد التحقق إلى هذا البوت.`,
        );
        // إرسال رسالة منفصلة تحتوي على رمز التحقق (سيتم حذفها تلقائياً)
        try {
          const codeMsg = await ctx.reply(`🔐 رمز التحقق الخاص بك: ${result.otp}\n\n⏳ سينتهي هذا الرمز بعد 3 دقائق`);
          setTimeout(async () => {
            try { await ctx.api.deleteMessage(ctx.chat!.id, codeMsg.message_id); } catch {}
          }, 180000);
        } catch {}
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
          `يمكنك الآن استخدام الموقع لإعادة تعيين كلمة المرور عند الحاجة.\n` +
          `سيتم إرسال أكواد التحقق إلى هذا البوت.`,
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
        await ctx.reply("❌ تم إلغاء عملية الربط. يمكنك إعادة المحاولة من نافذة تفعيل الحساب.");
      } else {
        await tigService.deleteBindCode(code);
        await ctx.reply("❌ تم إلغاء عملية الربط. يمكنك إنشاء كود جديد من الإعدادات.");
      }
    });

    // ---- Main message handler (accepts only TIG codes) ----
    this._bot.on("message:text", async (ctx) => {
      const text = ctx.message?.text?.trim() || "";
      const upperText = text.toUpperCase();
      if (/^TIG-[A-Z0-9]{4,}$/i.test(upperText)) {
        await this._handleTigCode(ctx, upperText);
        return;
      }
      await ctx.reply("عذراً، البوت مخصص فقط لربط حسابك بالمنصة. يرجى استخدام /start للبدء.");
    });

    this._bot.catch((err) => {
      logger.error("[BotService] Unhandled bot error:", { error: String(err.error) });
    });

    this._initialized = true;
    this._initPromise = null;

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

    const source = recoverySession ? "تفعيل الحساب" : "ربط حساب";
    await ctx.reply(
      `🔍 تم العثور على طلب ربط من نافذة ${source}.\n\n` +
        `👤 الاسم: ${user.name}\n` +
        `📧 البريد: ${user.email}\n` +
        `🎓 الدور: ${roleLabel}\n\n` +
        `هل تريد ربط هذا الحساب؟`,
      { reply_markup: keyboard },
    );
  }

  async sendTempCode(chatId: bigint, otp: string): Promise<void> {
    try {
      const codeMsg = await this._bot.api.sendMessage(
        Number(chatId),
        `🔐 رمز التحقق الخاص بك: ${otp}\n\n⏳ سينتهي هذا الرمز بعد 3 دقائق`
      );
      setTimeout(async () => {
        try { await this._bot.api.deleteMessage(Number(chatId), codeMsg.message_id); } catch {}
      }, 180000);
    } catch (err) {
      logger.error("[BotService] sendTempCode failed", { error: String(err) });
    }
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
