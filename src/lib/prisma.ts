import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Telegram notification middleware — resolve binding before next() to avoid extra Prisma query in notifier
prisma.$use(async (params, next) => {
  let telegramPromise: Promise<void> | undefined;

  if (params.model === "Notification") {
    if (params.action === "create") {
      const d = params.args.data as any;
      if (d?.userId) {
        try {
          const binding = await prisma.telegramBinding.findUnique({
            where: { userId: d.userId },
            select: { chatId: true, status: true },
          });
          if (binding && binding.status === "ACTIVE") {
            const chatId = Number(binding.chatId);
            telegramPromise = (async () => {
              try {
                const { sendTelegramNotification } = await import(
                  "@/services/notification/TelegramNotifier"
                );
                sendTelegramNotification(d, chatId);
              } catch {}
            })();
          }
        } catch {}
      }
    } else if (params.action === "createMany") {
      const items = (params.args.data as any[]) || [];
      const valid = items.filter((x: any) => x?.userId);
      if (valid.length > 0) {
        try {
          const userIds = valid.map((x: any) => x.userId);
          const bindings = await prisma.telegramBinding.findMany({
            where: { userId: { in: userIds }, status: "ACTIVE" },
            select: { userId: true, chatId: true },
          });
          const bindingMap = new Map(bindings.map((b) => [b.userId, Number(b.chatId)]));
          telegramPromise = (async () => {
            try {
              const { sendTelegramNotification } = await import(
                "@/services/notification/TelegramNotifier"
              );
              for (const n of valid) {
                const ch = bindingMap.get(n.userId);
                if (ch) sendTelegramNotification(n, ch);
              }
            } catch {}
          })();
        } catch {}
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
