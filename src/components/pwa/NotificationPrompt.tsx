"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerPushNotifications } from "@/lib/pushClient";

const NOTIFICATION_PROMPTED_KEY = "pwa_notification_prompted";

function hasPrompted(): boolean {
  try {
    return localStorage.getItem(NOTIFICATION_PROMPTED_KEY) === "true";
  } catch {
    return false;
  }
}

function markPrompted(): void {
  try {
    localStorage.setItem(NOTIFICATION_PROMPTED_KEY, "true");
  } catch {}
}

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasPrompted()) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") {
      markPrompted();
      return;
    }

    const timer = setTimeout(() => {
      if (!hasPrompted() && Notification.permission === "default") {
        setShow(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        registerPushNotifications();
      }
    } catch {}
    markPrompted();
    setShow(false);
  };

  const handleDeny = () => {
    markPrompted();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 9999,
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "rgba(10, 20, 40, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <p style={{ color: "#00e5ff", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>
              تفعيل الإشعارات
            </p>
            <p style={{ color: "#8b949e", fontSize: "0.85rem", marginBottom: 16, lineHeight: 1.6 }}>
              احصل على إشعارات فورية للرسائل الجديدة والتكاليف والنتائج
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAllow}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #238636, #2ea043)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                تفعيل
              </motion.button>
              <button
                onClick={handleDeny}
                style={{
                  padding: "12px 20px",
                  background: "transparent",
                  color: "#8b949e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                لاحقاً
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
