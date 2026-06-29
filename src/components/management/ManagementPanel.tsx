"use client";
import { motion } from "framer-motion";

interface PanelItem {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

interface ManagementPanelProps {
  items?: PanelItem[];
}

const defaultItems: PanelItem[] = [
  { icon: "⏳", value: 12, label: "طلبات تفعيل حسابات معلقة", color: "#ffca28" },
  { icon: "📢", value: 3, label: "تعاميم جديدة اليوم", color: "#bf5af2" },
  { icon: "⬆️", value: 5, label: "طلبات ترقية مستوى معلقة", color: "#00e5ff" },
];

export default function ManagementPanel({ items = defaultItems }: ManagementPanelProps) {
  return (
    <div>
      <div style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", marginBottom: "12px" }}>
        📋 لوحة الإدارة
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 3, borderColor: item.color }}
            style={{
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "10px",
              padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRight: `3px solid ${item.color}`,
              cursor: "default",
              transition: "all 0.25s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 300 }}
                  style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", fontWeight: 800, color: item.color, lineHeight: 1.2 }}
                >
                  {item.value}
                </motion.div>
                <div style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.7rem)", color: "#8b949e", marginTop: "2px" }}>
                  {item.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
