self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const title = data.title || "سحابة الأمن السيبراني";

  // T2: Skip push if any app window is visible (avoids toast+push dual delivery)
  const shouldSkip = clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.visibilityState === "visible" || client.focused) {
        return true;
      }
    }
    return false;
  });

  event.waitUntil(
    shouldSkip.then((skip) => {
      if (skip) return;

      // T7: Dynamic tags so related notifications group and different types don't overwrite
      let tag = "general";
      if (data.tag) {
        tag = data.tag;
      } else if (data.type === "NEW_MESSAGE") {
        tag = "message";
      } else if (data.type === "ASSIGNMENT_EVALUATED" || data.type === "NEW_ASSIGNMENT") {
        tag = "assignment";
      } else if (data.type === "GRADES_DISTRIBUTED" || data.type === "ANALYSIS_COMPLETED") {
        tag = "grade";
      }

      // Choose sound: caller's explicit sound > type-based default > fallback
      const soundMap = {
        NEW_MESSAGE: "/sounds/notification.mp3",
        ASSIGNMENT_EVALUATED: "/sounds/notification.mp3",
        NEW_ASSIGNMENT: "/sounds/notification.mp3",
        GRADES_DISTRIBUTED: "/sounds/notification.mp3",
        LEVEL_PROMOTED: "/sounds/notification.mp3",
        NEW_ANNOUNCEMENT: "/sounds/alert.mp3",
        NEW_CONTENT: "/sounds/alert.mp3",
        ACCOUNT_MODIFIED: "/sounds/alert.mp3",
      };
      const sound = data.sound || soundMap[data.type] || "/sounds/notification.mp3";

      const options = {
        body: data.body || "",
        icon: data.icon || "/icons/android-chrome-192x192.png",
        badge: data.badge || "/icons/favicon-32x32.png",
        data: { url: data.url || data.data?.url || "/" },
        vibrate: [200, 100, 200],
        silent: false,
        requireInteraction: data.requireInteraction || false,
        tag,
        renotify: true,
        sound,
      };

      return self.registration.showNotification(title, options);
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
