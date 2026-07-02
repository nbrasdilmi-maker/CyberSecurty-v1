import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Telegram notification middleware — parallel execution for zero-latency delivery
prisma.$use(async (params, next) => {
  let telegramPromise: Promise<void> | undefined;

  if (params.model === "Notification") {
    if (params.action === "create") {
      const d = params.args.data as any;
      if (d?.userId) {
        telegramPromise = (async () => {
          try {
            const { sendTelegramNotification } = await import(
              "@/services/notification/TelegramNotifier"
            );
            sendTelegramNotification(d);
          } catch {}
        })();
      }
    } else if (params.action === "createMany") {
      const items = (params.args.data as any[]) || [];
      const valid = items.filter((x: any) => x?.userId);
      if (valid.length > 0) {
        telegramPromise = (async () => {
          try {
            const { sendTelegramNotification } = await import(
              "@/services/notification/TelegramNotifier"
            );
            for (const n of valid) sendTelegramNotification(n);
          } catch {}
        })();
      }
    }
  }

  const result = await next(params);

  if (telegramPromise) {
    await telegramPromise;
  }

  return result;
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
