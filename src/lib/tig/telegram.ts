import { Bot } from "grammy";

let bot: Bot | null = null;

export function getBot(): Bot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }
    bot = new Bot(token);
  }
  return bot;
}

export function getWebhookSecret(): string {
  return process.env.TIG_WEBHOOK_SECRET || "";
}

export function getBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME || "";
}
