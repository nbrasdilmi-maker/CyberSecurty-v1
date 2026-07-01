"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { getRoleLabel } from "./RoleIcons";
import BellNotifications from "@/components/notifications/BellNotifications";

export default function UnifiedHeader() {
  const [clock, setClock] = useState("00:00:00 AM");
  const { isMobile } = useResponsive();
  const { toggleSidebar, setSearchOpen } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setClock(`${h}:${m}:${s} ${ampm}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(8,12,20,0.5)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderBottom: "1px solid rgba(0,200,255,0.04)",
        height: isMobile ? "50px" : "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 12px" : "0 24px 0 30px",
        direction: "rtl",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "6px" : "12px",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          style={{
            background: "rgba(0,200,255,0.06)",
            border: "1px solid rgba(0,200,255,0.1)",
            borderRadius: "10px",
            width: isMobile ? "32px" : "36px",
            height: isMobile ? "32px" : "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Menu size={isMobile ? 16 : 18} color="#8b949e" strokeWidth={1.8} />
        </motion.button>

        <motion.div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: isMobile ? "0.65rem" : "0.85rem",
            fontWeight: 700,
            color: "#00e5ff",
            direction: "ltr",
            whiteSpace: "nowrap",
            textShadow: "0 0 8px rgba(0,229,255,0.3)",
            opacity: 0.9,
          }}
        >
          {clock}
        </motion.div>
      </div>

      <div
        style={{ textAlign: "center", display: isMobile ? "none" : "block" }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.5px",
          }}
        >
          سحابة الأمن السيبراني
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "6px" : "14px",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSearchOpen(true)}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            padding: isMobile ? "6px 10px" : "8px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#5a6a7a",
            fontSize: isMobile ? "0.65rem" : "0.72rem",
            fontFamily: "'Cairo', sans-serif",
            transition: "all 0.2s",
          }}
        >
          <Search size={isMobile ? 14 : 16} color="#5a6a7a" strokeWidth={1.8} />
          <span style={{ display: isMobile ? "none" : "inline" }}>
            بحث سريع...
          </span>
          {!isMobile && (
            <span
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: "1px 6px",
                borderRadius: "4px",
                fontSize: "0.5rem",
                color: "#5a6a7a",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              ⌘K
            </span>
          )}
        </motion.button>

        <BellNotifications />

        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "default",
          }}
        >
          <div
            style={{
              textAlign: "left",
              direction: "ltr",
              display: isMobile ? "none" : "block",
            }}
          >
            <div
              style={{ fontSize: "0.65rem", fontWeight: 700, color: "#e6edf3" }}
            >
              {user?.name || "مستخدم"}
            </div>
            <div style={{ fontSize: "0.5rem", color: "#8b949e" }}>
              {getRoleLabel(user?.role || "")}
            </div>
          </div>
          <div
            style={{
              width: isMobile ? "30px" : "34px",
              height: isMobile ? "30px" : "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5ff, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {(user?.name?.[0] || user?.email?.[0] || "U")?.toUpperCase()}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
