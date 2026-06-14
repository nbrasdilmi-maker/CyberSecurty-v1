/**
 * سكريبت تسجيل Webhook البوت مع Telegram — حل دائم.
 * يشغّل مرة واحدة بعد كل نشر:
 *   npm run setup-webhook
 *
 * متغيرات البيئة:
 *   TELEGRAM_BOT_TOKEN     — توكن البوت من BotFather (إجباري)
 *   TIG_WEBHOOK_SECRET     — مفتاح التحقق من طلبات Telegram (إجباري)
 *   TIG_WEBHOOK_URL        — رابط الويبهوك الكامل (اختياري — يُبنى من APP_URL إن لم يُعط)
 *   NEXT_PUBLIC_APP_URL    — رابط التطبيق (يُستخدم لبناء TIG_WEBHOOK_URL تلقائياً)
 */

import { config } from "dotenv";
config();

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TIG_WEBHOOK_SECRET;
  let webhookUrl = process.env.TIG_WEBHOOK_URL;

  if (!token) throw new Error("❌ TELEGRAM_BOT_TOKEN غير مضبوط في .env");
  if (!secret) throw new Error("❌ TIG_WEBHOOK_SECRET غير مضبوط في .env");

  // بناء رابط الويبهوك تلقائياً من NEXT_PUBLIC_APP_URL إن لم يُعطَ صراحةً
  if (!webhookUrl) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("❌ حدد TIG_WEBHOOK_URL أو NEXT_PUBLIC_APP_URL في .env");
    webhookUrl = `${appUrl.replace(/\/+$/, "")}/api/tig/webhook`;
  }

  const url = new URL(webhookUrl);
  if (!url.protocol.startsWith("https") && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    console.warn("⚠️  تحذير: Telegram يتطلب HTTPS للويبهوك في الإنتاج.");
    console.warn("   للاختبار المحلي، استخدم ngrok: https://ngrok.com");
    console.warn("   أو شغّل polling: npm run tig:poll\n");
  }

  console.log(`📡 تسجيل Webhook:\n   URL: ${webhookUrl}\n   Secret: ${secret.slice(0, 4)}...`);

  // حذف أي webhook قديم أولاً
  const delRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
  const delData = await delRes.json();
  if (!delData.ok) console.warn(`⚠️  فشل حذف الويبهوك القديم: ${delData.description}`);

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
      max_connections: 40,
    }),
  });

  const data = await res.json();

  if (data.ok) {
    console.log(`✅ Webhook مسجل بنجاح!\n   ${webhookUrl}`);
    console.log(`ℹ️  تحقق: https://api.telegram.org/bot${token}/getWebhookInfo`);
  } else {
    console.error(`❌ فشل التسجيل: ${data.description}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
