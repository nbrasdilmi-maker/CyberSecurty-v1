"use client";

import { motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";
import { Shield } from "lucide-react";

export default function SidebarStatusCard() {
  const { isExpanded } = useSidebar();

  return (
    <div style={{ padding: isExpanded ? "8px 14px 4px" : "4px 0" }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        title={!isExpanded ? "النظام آمن" : undefined}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, rgba(57,255,20,0.06), rgba(0,229,255,0.04))",
          backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)",
          borderRadius: "12px",
          border: "1px solid rgba(57,255,20,0.1)",
          padding: isExpanded ? "8px 10px" : "8px 0",
          justifyContent: isExpanded ? "flex-start" : "center",
          overflow: "hidden",
        }}
      >
        {/* مؤشر توهج */}
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#39ff14",
            boxShadow: "0 0 12px rgba(57,255,20,0.7)",
            flexShrink: 0,
          }}
        />
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1 }}
          >
            <div style={{ fontSize: "0.52rem", fontWeight: 700, color: "#39ff14", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              النظام آمن
            </div>
            <div style={{ fontSize: "0.42rem", color: "#8b949e", marginTop: "1px" }}>
              <Shield size={8} style={{ display: "inline", marginLeft: "3px", verticalAlign: "middle" }} />
              حالة النظام · 27 يوماً
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
