"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { csrfFetch } from "@/lib/csrfClient";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { trackNotifRefresh, trackNotifDedup, trackNotifReconnect, traceAudio, traceAudioForensic, traceLifecycle, traceAsyncRequest, traceAsyncResponse, traceRealtimeEvent, getLastRealtimeMutationAt } from "@/lib/realtimeDiagnostics";
import { isAudioAuthorized, isToastAuthorized, trackAudioPlayed, trackAudioSkippedHidden, trackAudioSkippedThrottle, trackAudioSkippedUnmounted, trackAudioDuplicatePrevented } from "@/lib/supabaseRealtime";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationSound: Record<string, string> = {
  NEW_MESSAGE: "/sounds/notification.mp3",
  ASSIGNMENT_EVALUATED: "/sounds/notification.mp3",
  NEW_ASSIGNMENT: "/sounds/notification.mp3",
  GRADES_DISTRIBUTED: "/sounds/notification.mp3",
  LEVEL_PROMOTED: "/sounds/notification.mp3",
  NEW_ANNOUNCEMENT: "/sounds/alert.mp3",
  NEW_CONTENT: "/sounds/alert.mp3",
  ACCOUNT_MODIFIED: "/sounds/alert.mp3",
};

function getNotificationSound(type: string): string {
  return notificationSound[type] || "/sounds/notification.mp3";
}

const typeIcons: Record<string, string> = {
  NEW_MESSAGE: "💬",
  ASSIGNMENT_EVALUATED: "✅",
  NEW_ASSIGNMENT: "📤",
  NEW_ANNOUNCEMENT: "📢",
  NEW_CONTENT: "📚",
  GRADES_DISTRIBUTED: "📝",
  ACCOUNT_MODIFIED: "⚙️",
  LEVEL_PROMOTED: "🎉",
  security: "🛡️",
  warning: "⚠️",
  info: "ℹ️",
  success: "✅",
  error: "❌",
  promotion: "🎓",
  grade: "📊",
  update: "🔄",
  announcement: "📢",
  message: "💬",
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return new Date(date).toLocaleDateString("ar-YE");
};

export default function BellNotifications() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const pathname = usePathname();
  const storeSetNotifications = useNotificationStore((s) => s.setNotifications);
  const storeAddNotification = useNotificationStore((s) => s.addNotification);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const isHidden = pathname === "/" || pathname === "/login" || pathname === "/onboarding";

  const userId = user?.id || "";

  const mountedRef = useRef(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const processedIdTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastSoundTimeRef = useRef(0);
  const audioUnlockedRef = useRef(false);
  const prevConnectionRef = useRef<string>("disconnected");
  const reconnectCooldownRef = useRef(0);
  const MAX_PROCESSED_IDS = 500;
  const hiddenToastQueueRef = useRef<Array<{id: string; title: string; body: string; timestamp: number}>>([]);
  const notificationStormTimersRef = useRef<number[]>([]);
  const stormActiveRef = useRef(false);
  const stormCooldownRef = useRef(0);
  const pushPermissionRef = useRef<NotificationPermission | null>(null);

  const markIdProcessed = useCallback((id: string) => {
    processedIdsRef.current.add(id);
    const expiryTimer = setTimeout(() => {
      processedIdsRef.current?.delete(id);
    }, 60000);
    processedIdTimersRef.current.push(expiryTimer);
    if (processedIdsRef.current.size > MAX_PROCESSED_IDS) {
      const toRemove = processedIdsRef.current.size - MAX_PROCESSED_IDS;
      const values = processedIdsRef.current.values();
      for (let i = 0; i < toRemove; i++) {
        const entry = values.next();
        if (entry.done) break;
        processedIdsRef.current.delete(entry.value);
      }
    }
  }, []);

  const loadNotifRef = useRef<() => void>(() => {});
  useEffect(() => { loadNotifRef.current = loadNotifications; });
  const scheduleNotificationRefresh = useCallback(() => {
    if (refreshTimerRef.current) return;
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      if (mountedRef.current) {
        trackNotifRefresh();
        loadNotifRef.current();
      }
    }, 300);
  }, []);

  const notificationsRef = useRef<NotificationItem[]>([]);
  useEffect(() => { notificationsRef.current = notifications; }, [notifications]);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    const seqId = traceAsyncRequest("/api/notifications/list", "LOAD_NOTIFICATIONS", null);
    const requestTs = Date.now();
    try {
      const res = await fetch("/api/notifications/list?page=1&limit=10");
      const data = await res.json();
      if (data.success) {
        const prevIds = notificationsRef.current.map((n) => n.id);
        const nextIds = (data.data || []).map((n: NotificationItem) => n.id);
        setNotifications(data.data || []);
        setUnreadCount(
          (data.data || []).filter((n: NotificationItem) => !n.isRead).length,
        );
        storeSetNotifications(data.data || []);
        traceAsyncResponse("/api/notifications/list", "LOAD_NOTIFICATIONS", seqId, requestTs, null, getLastRealtimeMutationAt() || null, { prevCount: prevIds.length, nextCount: nextIds.length });
      }
    } catch {
      traceAsyncResponse("/api/notifications/list", "LOAD_NOTIFICATIONS", seqId, requestTs, null, getLastRealtimeMutationAt() || null, { failed: true });
    }
  }, [userId, storeSetNotifications]);

  const flushHiddenToasts = useCallback(() => {
    const queue = hiddenToastQueueRef.current;
    if (queue.length === 0 || !mountedRef.current) return;
    if (document.visibilityState !== "visible" || !isToastAuthorized()) return;
    const toFlush = queue.splice(0);
    for (const item of toFlush) {
      if (processedIdsRef.current.has(item.id)) continue;
      showToast(`🔔 ${item.title}: ${item.body}`, "info");
    }
  }, [showToast]);

  useEffect(() => {
    mountedRef.current = true;
    const processedIds = processedIdsRef.current;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        flushHiddenToasts();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    loadNotifications();
    traceLifecycle("BellNotifications", "MOUNT", { userId });
    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      for (const t of processedIdTimersRef.current) {
        clearTimeout(t);
      }
      processedIdTimersRef.current = [];
      processedIds.clear();
      prevConnectionRef.current = "disconnected";
      reconnectCooldownRef.current = 0;
      traceLifecycle("BellNotifications", "UNMOUNT", { userId });
    };
  }, [loadNotifications, flushHiddenToasts]);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const check = () => {
      const current = Notification.permission;
      if (pushPermissionRef.current && pushPermissionRef.current !== current) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Push] Permission changed:", pushPermissionRef.current, "->", current);
        }
      }
      pushPermissionRef.current = current;
    };
    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);

  useEffect(() => {
    const tryUnlock = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === "running") {
          ctx.close();
          audioUnlockedRef.current = true;
          return true;
        }
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            ctx.close();
            audioUnlockedRef.current = true;
          }).catch(() => {});
        }
      } catch {
        // AudioContext غير متوفر
      }
      return false;
    };
    tryUnlock();
    const unlockOnInteraction = () => {
      if (!audioUnlockedRef.current) tryUnlock();
      document.removeEventListener("click", unlockOnInteraction);
      document.removeEventListener("touchstart", unlockOnInteraction);
      document.removeEventListener("keydown", unlockOnInteraction);
    };
    document.addEventListener("click", unlockOnInteraction);
    document.addEventListener("touchstart", unlockOnInteraction);
    document.addEventListener("keydown", unlockOnInteraction);
    return () => {
      document.removeEventListener("click", unlockOnInteraction);
      document.removeEventListener("touchstart", unlockOnInteraction);
      document.removeEventListener("keydown", unlockOnInteraction);
    };
  }, []);

  const { connectionState } = useSupabaseRealtime(
    `user-${userId}`,
    "notification",
    (data: any) => {
      const arrivalTs = Date.now();
      traceRealtimeEvent("notification", data.id || "unknown", arrivalTs, null, { type: data.type, title: data.title });

      if (data.id) {
        if (processedIdsRef.current.has(data.id)) {
          trackNotifDedup();
          trackAudioDuplicatePrevented();
          traceAudio("AUDIO_SKIPPED_DUPLICATE", data.type || "notification", { payloadId: data.id });
          return;
        }
        markIdProcessed(data.id);
      }

      const now = Date.now();

      const stormTimestamps = notificationStormTimersRef.current;
      stormTimestamps.push(now);
      while (stormTimestamps.length > 0 && stormTimestamps[0] < now - 10000) {
        stormTimestamps.shift();
      }
      if (stormTimestamps.length > 20 && !stormActiveRef.current) {
        stormActiveRef.current = true;
        stormCooldownRef.current = now + 10000;
        if (document.visibilityState === "visible" && isToastAuthorized()) {
          showToast("🔔 لديك إشعارات جديدة متعددة", "info");
        }
      }
      if (stormActiveRef.current && now > stormCooldownRef.current) {
        stormActiveRef.current = false;
      }

      if (data.type !== "NEW_MESSAGE" && (!data.id || !data.title || !data.body)) {
        scheduleNotificationRefresh();
      } else {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === data.id)) return prev;
          return [
            {
              id: data.id,
              type: data.type,
              title: data.title,
              body: data.body,
              linkUrl: data.linkUrl || undefined,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }

      // Store sync
      if (data.id && data.title) {
        storeAddNotification({
          id: data.id,
          type: data.type || "info",
          title: data.title,
          body: data.body || "",
          linkUrl: data.linkUrl || null,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      let shouldPlaySound = true;
      let skipReason = "";
      if (!mountedRef.current) { trackAudioSkippedUnmounted(); shouldPlaySound = false; skipReason = "UNMOUNTED"; }
      else if (document.visibilityState !== "visible") { trackAudioSkippedHidden(); shouldPlaySound = false; skipReason = "HIDDEN"; }
      else if (pathname.startsWith("/chat")) { shouldPlaySound = false; skipReason = "ROUTE_CHAT"; }
      if (shouldPlaySound && !stormActiveRef.current) {
        if (now - lastSoundTimeRef.current >= 1000) {
          lastSoundTimeRef.current = now;
          try {
            const soundPath = getNotificationSound(data.type || "");
            const audio = new Audio(soundPath);
            audio.volume = 0.5;
            const playPromise = audio.play();
            if (playPromise) {
              playPromise
                .then(() => {
                  traceAudio("AUDIO_PLAY_CONFIRMED", data.type || "notification", { payloadId: data.id, title: data.title });
                  traceAudioForensic("AUDIO_PLAY_CONFIRMED", data.type || "notification", "none", { payloadId: data.id, title: data.title, authorizationStatus: isAudioAuthorized() });
                })
                .catch((err: unknown) => {
                  traceAudio("AUDIO_PROMISE_REJECTED", data.type || "notification", { payloadId: data.id, error: String(err), title: data.title });
                  traceAudioForensic("AUDIO_PROMISE_REJECTED", data.type || "notification", "promise_rejected", { payloadId: data.id, error: String(err), title: data.title });
                });
            }
          } catch (err) {
            traceAudioForensic("AUDIO_PLAY_REJECTED", data.type || "notification", "exception", { payloadId: data.id, error: String(err) });
          }
          trackAudioPlayed();
          traceAudioForensic("AUDIO_ALLOWED", data.type || "notification", "none", { payloadId: data.id, throttleMs: now - lastSoundTimeRef.current });
        } else {
          trackAudioSkippedThrottle();
          traceAudioForensic("AUDIO_BLOCKED_THROTTLE", data.type || "notification", "throttle", { payloadId: data.id, throttleMs: now - lastSoundTimeRef.current });
        }
      } else if (!shouldPlaySound) {
        const forensicLabel = "AUDIO_BLOCKED_" + skipReason;
        traceAudio(forensicLabel, data.type || "notification", { payloadId: data.id, visibilityState: document.visibilityState, pathname });
        traceAudioForensic(forensicLabel, data.type || "notification", skipReason.toLowerCase(), { payloadId: data.id, visibilityState: document.visibilityState, pathname, isActiveTab: isAudioAuthorized() });
      }

      if (data.title && data.body && !stormActiveRef.current) {
        if (document.visibilityState === "visible" && isToastAuthorized()) {
          showToast(`🔔 ${data.title}: ${data.body}`, "info");
        } else if (document.visibilityState !== "visible") {
          const queue = hiddenToastQueueRef.current;
          if (queue.length < 20) {
            queue.push({ id: data.id, title: data.title, body: data.body, timestamp: Date.now() });
          }
        }
      }
    },
  );

  useEffect(() => {
    const prev = prevConnectionRef.current;
    prevConnectionRef.current = connectionState;
    if (prev === "reconnecting" && connectionState === "connected") {
      if (mountedRef.current && Date.now() - reconnectCooldownRef.current >= 2000) {
        reconnectCooldownRef.current = Date.now();
        trackNotifReconnect();
        scheduleNotificationRefresh();
      }
    }
  }, [connectionState, scheduleNotificationRefresh]);

  const handleClickNotification = async (notif: NotificationItem) => {
    try {
      await csrfFetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id }),
      });
      loadNotifications();
      if (notif.linkUrl) {
        setShowPopup(false);
        router.push(notif.linkUrl);
      }
    } catch {
      /* صامت */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await csrfFetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      loadNotifications();
    } catch {
      /* صامت */
    }
  };

  const handleViewAll = () => {
    setShowPopup(false);
    router.push("/notifications");
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    if (showPopup) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup]);

  if (isHidden) return null;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowPopup(!showPopup);
          if (!showPopup) scheduleNotificationRefresh();
        }}
        style={{
          position: "relative",
          background: showPopup ? "rgba(0,229,255,0.12)" : "rgba(0,229,255,0.08)",
          border: showPopup ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(0,229,255,0.12)",
          borderRadius: "10px",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1rem",
          color: "#8b949e",
          transition: "all 0.2s",
          boxShadow: showPopup ? "0 0 20px rgba(0,229,255,0.06)" : "none",
        }}
        title="الإشعارات"
      >
        <motion.span
          key={unreadCount}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          🔔
        </motion.span>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: "absolute",
                top: "-2px",
                left: "-2px",
                minWidth: "16px",
                height: "16px",
                borderRadius: "8px",
                background: "#f85149",
                color: "#fff",
                fontSize: "0.5rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "1.5px solid rgba(8,12,20,0.9)",
                boxShadow: "0 0 10px rgba(248,81,73,0.6)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            ref={null}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 8px)",
              width: "380px",
              maxWidth: "calc(100vw - 40px)",
              maxHeight: "500px",
              overflowY: "auto",
              background: "rgba(10, 20, 40, 0.96)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 229, 255, 0.08)",
              zIndex: 300,
              direction: "rtl",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ color: "#00e5ff", fontSize: "clamp(0.85rem, 1.5vw, 1rem)", fontWeight: 800, margin: 0 }}>
                🔔 الإشعارات
                {unreadCount > 0 && (
                  <span style={{ color: "#f85149", fontSize: "0.75rem", marginRight: "8px" }}>
                    ({unreadCount})
                  </span>
                )}
              </h3>
              <div style={{ display: "flex", gap: "6px" }}>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllRead}
                    style={{
                      padding: "4px 10px", borderRadius: "8px", fontSize: "0.6rem",
                      background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)",
                      color: "#00e5ff", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600,
                    }}
                  >
                    تعيين الكل مقروء
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleViewAll}
                  style={{
                    padding: "4px 10px", borderRadius: "8px", fontSize: "0.6rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#8b949e", cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontWeight: 600,
                  }}
                >
                  عرض الكل
                </motion.button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: "#8b949e" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📭</div>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>لا توجد إشعارات</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {notifications.slice(0, 8).map((notif) => (
                  <motion.div
                    key={notif.id}
                    whileHover={{ scale: 1.02, background: "rgba(0,229,255,0.06)" }}
                    onClick={() => handleClickNotification(notif)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: notif.isRead ? "transparent" : "rgba(0,229,255,0.03)",
                      border: notif.isRead ? "1px solid transparent" : "1px solid rgba(0,229,255,0.08)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                      {typeIcons[notif.type] || "🔔"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.78rem", color: notif.isRead ? "#8b949e" : "#e6edf3", margin: 0 }}>
                          {notif.title}
                        </p>
                        <span style={{ fontSize: "0.6rem", color: "#5a6a7a", whiteSpace: "nowrap" }}>
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "#8b949e", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {notif.body.length > 60 ? notif.body.slice(0, 60) + "..." : notif.body}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5ff", flexShrink: 0, marginTop: "5px", boxShadow: "0 0 6px #00e5ff" }} />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
