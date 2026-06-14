import { NextRequest, NextResponse } from "next/server";
import { getBot, getWebhookSecret } from "@/lib/tig/telegram";
import { botService } from "@/services/tig/BotService";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== getWebhookSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await botService.init();

  try {
    const update = await request.json();
    await getBot().handleUpdate(update);
  } catch (error) {
    console.error("[TigWebhook] Error handling update:", error);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: process.env.TELEGRAM_BOT_USERNAME || "unknown",
  });
}
