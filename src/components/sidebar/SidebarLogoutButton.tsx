"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface Props {
  onLogout: () => void;
}

export default function SidebarLogoutButton({ onLogout }: Props) {
  const { isExpanded } = useSidebar();

  return (
    <div style={{ padding: isExpanded ? "4px 14px 12px" : "4px 0 8px" }}>
      <motion.button
        whileHover={{ scale: 1.02, background: "rgba(248,81,73,0.08)" }}
        whileTap={{ scale: 0.97 }}
        title={!isExpanded ? "تسجيل الخروج" : undefined}
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", gap: "10px", width: "100%",
          padding: isExpanded ? "9px 12px" : "9px 0",
          borderRadius: "10px",
          border: "none",
          background: isExpanded
            ? "linear-gradient(135deg, rgba(248,81,73,0.06), transparent)"
            : "transparent",
          color: "#f85149", cursor: "pointer",
          fontFamily: "'Cairo', sans-serif",
          fontSize: isExpanded ? "0.75rem" : "0.65rem",
          fontWeight: 500,
          textAlign: "right",
          transition: "all 0.2s ease",
          justifyContent: isExpanded ? "flex-start" : "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isExpanded && (
          <div style={{
            position: "absolute", left: 0, top: "10%", bottom: "10%", width: "2px",
            borderRadius: "1px",
            background: "linear-gradient(to bottom, transparent, #f85149, transparent)",
            opacity: 0.4,
          }} />
        )}
        <motion.div
          whileHover={{ rotate: [0, -10, 0] }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <LogOut size={isExpanded ? 17 : 18} strokeWidth={1.8} />
        </motion.div>
        <motion.span
          animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
          transition={{ duration: 0.2 }}
          style={{ whiteSpace: "nowrap", overflow: "hidden" }}
        >
          تسجيل الخروج
        </motion.span>
      </motion.button>
    </div>
  );
}
