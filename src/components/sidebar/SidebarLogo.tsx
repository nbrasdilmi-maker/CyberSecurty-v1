"use client";

import { motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

export default function SidebarLogo() {
  const { isExpanded } = useSidebar();

  return (
    <div
      style={{
        padding: isExpanded ? "6px 16px 0" : "4px 0 0",
        overflow: "hidden",
        position: "relative",
        height: "10px",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 0.4, 0], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i, delay: i * 1.2 }}
            style={{
              position: "absolute", width: "2px", height: "2px",
              borderRadius: "50%", background: "#00e5ff",
              left: `${30 + i * 20}%`, bottom: "2px",
              boxShadow: "0 0 4px #00e5ff",
            }}
          />
        ))}
      </div>
    </div>
  );
}
