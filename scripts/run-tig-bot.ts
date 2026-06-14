import { config } from "dotenv";
config();

async function main() {
  const { botService } = await import("../src/services/tig/BotService");

  botService.init();
  console.log("[TigBot] Starting in polling mode...");
  botService.getBot().start();
}

main();
