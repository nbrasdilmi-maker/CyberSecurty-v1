self.addEventListener("push", (event) => {
  let data;
  try {
    data = event.data?.json() || {};
  } catch (e) {
    console.error("[SW Push] Invalid JSON payload:", e);
    try {
      const text = event.data?.text() || "";
      data = { title: "", body: text.substring(0, 200) };
    } catch (e2) {
      console.error("[SW Push] Cannot read payload text:", e2);
      return;
    }
  }

  const title = data.title || "سحابة الأمن السيبراني";
  const notificationUrl = data.url || data.data?.url || "/";
  const notificationTag = data.tag || (() => {
    if (data.type === "NEW_MESSAGE") return "message";
    if (data.type === "ASSIGNMENT_EVALUATED" || data.type === "NEW_ASSIGNMENT") return "assignment";
    if (data.type === "GRADES_DISTRIBUTED" || data.type === "ANALYSIS_COMPLETED") return "grade";
    return "general";
  })();

  const visibilityCheck = self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      let anyVisible = false;
      for (const client of clientList) {
        if (client.visibilityState === "visible" || client.focused) {
          anyVisible = true;
          if (client.url && notificationUrl && client.url.includes(notificationUrl)) {
            return { shouldSkip: true, reason: "same page already visible" };
          }
        }
      }
      if (anyVisible) {
        return { shouldSkip: false, reason: "visible but different page" };
      }
      return { shouldSkip: false, reason: "no visible windows" };
    })
    .catch((err) => {
      console.error("[SW Push] clients.matchAll error:", err);
      return { shouldSkip: false, reason: "matchAll error fallback" };
    });

  event.waitUntil(
    visibilityCheck.then(({ shouldSkip, reason }) => {
      if (shouldSkip) return;
      console.log("[SW Push] showing notification, reason:", reason);

      const options = {
        body: data.body || "",
        icon: data.icon || "/icons/android-chrome-192x192.png",
        badge: data.badge || "/icons/favicon-32x32.png",
        data: { url: notificationUrl },
        vibrate: [200, 100, 200],
        silent: false,
        requireInteraction: data.requireInteraction || false,
        tag: notificationTag,
        renotify: true,
      };

      return self.registration.showNotification(title, options)
        .catch((err) => {
          console.error("[SW Push] showNotification failed:", err);
        });
    }),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW Push] pushsubscriptionchange fired, re-subscribing");
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: event.oldSubscription?.options?.applicationServerKey })
      .then((newSubscription) => {
        console.log("[SW Push] re-subscribed with new endpoint");
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: newSubscription.toJSON() }),
        });
      })
      .then((res) => {
        if (!res.ok) console.error("[SW Push] re-subscribe POST failed:", res.status, res.statusText);
      })
      .catch((err) => {
        console.error("[SW Push] re-subscribe failed:", err);
      })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url && client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
      .catch((err) => {
        console.error("[SW Push] notificationclick error:", err);
      }),
  );
});
