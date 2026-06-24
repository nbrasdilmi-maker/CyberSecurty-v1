"use client";

import { motion } from "framer-motion";

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const shortcuts = [
  { label: "📄 رفع تكليف جديد", color: "#12C7FF", bg: "rgba(18,199,255,0.08)" },
  { label: "📊 عرض درجاتي", color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
  { label: "📋 جدول التكاليف", color: "#22C55E", bg: "rgba(34,197,94,0.08)" },
];

export default function QuickShortcuts() {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "25px" }}>
      {shortcuts.map((s, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            ...glassStyle,
            padding: "9px 18px",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#e6edf3",
            background: s.bg,
            border: `1px solid ${s.color}33`,
            cursor: "pointer",
            borderRadius: "12px",
          }}
        >
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}
