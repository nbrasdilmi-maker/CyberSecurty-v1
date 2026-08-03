"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDeviceType,
  shouldShowInstallBanner,
  markInstallDismissed,
  markInstallCompleted,
  type DeviceType,
} from "@/lib/pwaDetection";

function AndroidInstallContent({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <>
      <p style={{ color: "#00e5ff", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>
        تثبيت التطبيق على جهازك
      </p>
      <p style={{ color: "#8b949e", fontSize: "0.85rem", marginBottom: 16, lineHeight: 1.6 }}>
        للحصول على أفضل تجربة واستخدام الإشعارات الفورية
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onInstall}
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
          تثبيت التطبيق
        </button>
        <button
          onClick={onDismiss}
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
    </>
  );
}

function IphoneInstallContent({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <p style={{ color: "#00e5ff", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>
        تثبيت التطبيق على iPhone
      </p>
      <p style={{ color: "#8b949e", fontSize: "0.85rem", marginBottom: 16, lineHeight: 1.6 }}>
        للحصول على أفضل تجربة واستخدام الإشعارات
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {[
          { step: "1", text: "اضغط زر المشاركة", icon: "⬆️" },
          { step: "2", text: "اختر \"إضافة إلى الشاشة الرئيسية\"", icon: "📱" },
          { step: "3", text: "اضغط إضافة", icon: "✅" },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              background: "rgba(0,229,255,0.05)",
              borderRadius: 10,
              border: "1px solid rgba(0,229,255,0.1)",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <div>
              <span style={{ color: "#00e5ff", fontWeight: 700, fontSize: "0.8rem" }}>
                الخطوة {item.step}
              </span>
              <p style={{ color: "#e6edf3", fontSize: "0.85rem", margin: 0 }}>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onDismiss}
        style={{
          width: "100%",
          padding: "12px",
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
        فهمت
      </button>
    </>
  );
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (!shouldShowInstallBanner()) return;
    setDevice(getDeviceType());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const timer = setTimeout(() => {
      if (shouldShowInstallBanner()) setShow(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handler = () => markInstallCompleted();
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") markInstallCompleted();
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    markInstallDismissed();
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
            {device === "android" ? (
              <AndroidInstallContent onInstall={handleInstall} onDismiss={handleDismiss} />
            ) : (
              <IphoneInstallContent onDismiss={handleDismiss} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
