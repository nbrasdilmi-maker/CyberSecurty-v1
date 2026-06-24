"use client";

import { motion } from "framer-motion";

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  borderRadius: "20px",
};

export default function TabsBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div
      style={{
        ...glassStyle,
        border: "1px solid rgba(0, 229, 255, 0.15)",
        padding: "6px",
        display: "flex",
        gap: "6px",
        marginBottom: "25px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <motion.button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              background: isActive ? "rgba(0,229,255,0.1)" : "transparent",
              color: isActive ? "#00e5ff" : "#8b949e",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s",
            }}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: "rgba(234,179,8,0.15)",
                  border: "1px solid rgba(234,179,8,0.25)",
                  color: "#EAB308",
                  lineHeight: 1.4,
                }}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "20%",
                  right: "20%",
                  height: "3px",
                  borderRadius: "3px",
                  background: "#00e5ff",
                  boxShadow: "0 0 10px rgba(0,229,255,0.5)",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
