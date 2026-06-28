import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = "mailto:noreply@cybersecurity.cloud";

const MAX_PAYLOAD_BYTES = 3800;
const MAX_BODY_LENGTH = 200;

function truncateToByteLimit(obj: Record<string, unknown>): string {
  let json = JSON.stringify(obj);
  if (new TextEncoder().encode(json).length <= MAX_PAYLOAD_BYTES) return json;
  if (typeof obj.body === "string" && obj.body.length > MAX_BODY_LENGTH) {
    obj.body = obj.body.substring(0, MAX_BODY_LENGTH) + "…";
  }
  json = JSON.stringify(obj);
  if (new TextEncoder().encode(json).length <= MAX_PAYLOAD_BYTES) return json;
  if (typeof obj.title === "string" && obj.title.length > 80) {
    obj.title = obj.title.substring(0, 80) + "…";
  }
  json = JSON.stringify(obj);
  if (new TextEncoder().encode(json).length <= MAX_PAYLOAD_BYTES) return json;
  if (obj.data && typeof obj.data === "object") {
    const dataStr = JSON.stringify(obj.data);
    if (dataStr.length > 100) {
      obj.data = { truncated: true };
    }
  }
  return JSON.stringify(obj);
}

async function sendWithRetry(
  subscription: webpush.PushSubscription,
  payload: string,
  retries = 2,
): Promise<"ok" | number> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await webpush.sendNotification(subscription, payload);
      return "ok";
    } catch (err: any) {
      const code = err?.statusCode;
      if (code === 410 || code === 404) {
        return code;
      }
      if ((code === 429 || (code >= 500 && code < 600)) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[Push] Retry ${attempt + 1}/${retries} after ${delay}ms (status ${code})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.warn("[Push] sendWithRetry non-retriable error:", code, err?.message);
      return code || 0;
    }
  }
  return 0;
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

export function getVapidPublicKey(): string {
  return vapidPublicKey;
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string,
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const payload = truncateToByteLimit({ title, body, url, icon: "/icons/android-chrome-192x192.png", badge: "/icons/android-chrome-192x192.png" });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWithRetry(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.authKey, p256dh: sub.p256dhKey },
          },
          payload,
        ),
      ),
    );

    const invalidEndpoints: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("[Push] sendPushNotification unexpected rejection:", result.reason);
      } else {
        const value = result.value;
        if (value === 410 || value === 404) {
          invalidEndpoints.push(subscriptions[index].endpoint);
        } else if (value !== "ok") {
          console.warn("[Push] sendPushNotification failed with code:", value);
        }
      }
    });

    if (invalidEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: invalidEndpoints } },
      });
    }
  } catch (error) {
    console.error("[Push] sendPushNotification failed:", error);
  }
}

export async function sendPushToUsers(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    requireInteraction?: boolean;
    sound?: string;
  },
) {
  if (!userIds || userIds.length === 0) return;

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });

    if (subscriptions.length === 0) return;

    const payload = truncateToByteLimit({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || "/icons/android-chrome-192x192.png",
      badge: notification.badge || "/icons/android-chrome-192x192.png",
      data: notification.data || {},
      requireInteraction: notification.requireInteraction || false,
      sound: notification.sound || "/sounds/notification.mp3",
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWithRetry(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.authKey, p256dh: sub.p256dhKey },
          },
          payload,
        ),
      ),
    );

    const invalidEndpoints: string[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("[Push] sendPushToUsers unexpected rejection:", result.reason);
      } else {
        const value = result.value;
        if (value === 410 || value === 404) {
          invalidEndpoints.push(subscriptions[index].endpoint);
        } else if (value !== "ok") {
          console.warn("[Push] sendPushToUsers failed with code:", value);
        }
      }
    });

    if (invalidEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: invalidEndpoints } },
      });
    }
  } catch (error) {
    console.error("[Push] Bulk send failed:", error);
  }
}
