"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getDeviceType,
  isStandalone,
  type DeviceType,
} from "@/lib/pwaDetection";

function AndroidInstallSection({ onInstall }: { onInstall: () => void }) {
  return (
    <div
      style={{
        background: "rgba(22,27,34,0.6)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "25px",
      }}
    >
      <h3 style={{ color: "#00e5ff", marginBottom: "15px", fontSize: "1.1rem" }}>
        📱 تثبيت التطبيق على Android
      </h3>
      <p style={{ color: "#8b949e", fontSize: "0.9rem", marginBottom: 16, lineHeight: 1.6 }}>
        يمكنك تثبيت التطبيق مباشرة من هنا للحصول على أفضل تجربة
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onInstall}
        style={{
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #238636, #2ea043)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        تثبيت التطبيق
      </motion.button>
    </div>
  );
}

function IphoneInstallSection() {
  return (
    <div
      style={{
        background: "rgba(22,27,34,0.6)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "25px",
      }}
    >
      <h3 style={{ color: "#00e5ff", marginBottom: "15px", fontSize: "1.1rem" }}>
        📱 تثبيت التطبيق على iPhone
      </h3>
      <p style={{ color: "#8b949e", fontSize: "0.9rem", marginBottom: 20, lineHeight: 1.6 }}>
        اتبع الخطوات التالية لتثبيت التطبيق على جهاز iPhone
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          {
            step: "1",
            title: "اضغط زر المشاركة",
            desc: "اضغط على أيقونة المشاركة في أسفل شاشة Safari",
            icon: "⬆️",
          },
          {
            step: "2",
            title: "اختر \"إضافة إلى الشاشة الرئيسية\"",
            desc: "مرر للأسفل واختر هذا الخيار من القائمة",
            icon: "📱",
          },
          {
            step: "3",
            title: "اضغط إضافة",
            desc: "اضغط زر الإضافة في الزاوية اليمنى العليا",
            icon: "✅",
          },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "16px",
              background: "rgba(0,229,255,0.05)",
              borderRadius: 12,
              border: "1px solid rgba(0,229,255,0.1)",
            }}
          >
            <div
              style={{
                minWidth: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(0,229,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              {item.icon}
            </div>
            <div>
              <p style={{ color: "#00e5ff", fontWeight: 700, fontSize: "0.9rem", margin: "0 0 4px" }}>
                الخطوة {item.step}: {item.title}
              </p>
              <p style={{ color: "#8b949e", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopSection() {
  return (
    <div
      style={{
        background: "rgba(22,27,34,0.6)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "25px",
      }}
    >
      <h3 style={{ color: "#00e5ff", marginBottom: "15px", fontSize: "1.1rem" }}>
        💻 تثبيت التطبيق
      </h3>
      <p style={{ color: "#8b949e", fontSize: "0.9rem", lineHeight: 1.6 }}>
        لتجربة أفضل، افتح الموقع من جوالك واتبع خطوات التثبيت
      </p>
    </div>
  );
}

export default function InstallAppTab() {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [standalone, setStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setDevice(getDeviceType());
    setStandalone(isStandalone());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {standalone ? (
        <div
          style={{
            background: "rgba(22,27,34,0.6)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(0,229,255,0.2)",
            borderRadius: "16px",
            padding: "25px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#00e5ff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
            ✅ التطبيق مُثبّت
          </p>
          <p style={{ color: "#8b949e", fontSize: "0.9rem" }}>
            أنت تستخدم التطبيق حالياً
          </p>
        </div>
      ) : device === "android" ? (
        <AndroidInstallSection onInstall={handleInstall} />
      ) : device === "iphone" ? (
        <IphoneInstallSection />
      ) : (
        <DesktopSection />
      )}
    </motion.div>
  );
}
