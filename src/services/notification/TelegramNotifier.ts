import { getBot } from "@/lib/tig/telegram";
import { logger } from "@/lib/logger";

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type?: string;
  linkUrl?: string;
}

export async function sendTelegramNotification(
  data: NotificationPayload,
  chatId?: number,
): Promise<void> {
  try {
    if (!chatId) return;

    const bot = getBot();
    const now = new Date();

    const dateStr = now.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const emoji = typeEmoji(data.type);
    const safeTitle = escapeHtml(data.title);
    const safeBody = escapeHtml(data.body);

    const message =
      `${emoji} <b>${safeTitle}</b>\n` +
      `━━━━━━━━━━━━━━\n` +
      `${safeBody}\n\n` +
      `📅 ${dateStr} - ${timeStr}`;

    const inlineKeyboard: any[] = [];

    if (data.linkUrl) {
      inlineKeyboard.push([{ text: "📍 الانتقال إلى المنصة", url: data.linkUrl }]);
    }

    inlineKeyboard.push([{ text: "🗑️ حذف الإشعار", callback_data: "delete_notification" }]);

    await bot.api.sendMessage(chatId, message, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlineKeyboard },
      link_preview_options: { is_disabled: true },
    });
  } catch (err: any) {
    const desc = err?.description || err?.message || String(err);
    if (desc.includes("blocked") || desc.includes("Forbidden")) return;
    logger.warn("[TelegramNotifier] Failed to send notification", {
      userId: data.userId,
      title: data.title,
      error: desc.slice(0, 200),
    });
  }
}

function typeEmoji(type?: string): string {
  switch (type) {
    case "NEW_ANNOUNCEMENT": return "📢";
    case "NEW_CONTENT": return "📚";
    case "NEW_ASSIGNMENT": return "📝";
    case "ASSIGNMENT_EVALUATED": return "✅";
    case "GRADES_DISTRIBUTED": return "📊";
    case "NEW_MESSAGE": return "💬";
    case "ACCOUNT_MODIFIED": return "🔐";
    case "LEVEL_PROMOTED": return "🎓";
    default: return "🔔";
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
