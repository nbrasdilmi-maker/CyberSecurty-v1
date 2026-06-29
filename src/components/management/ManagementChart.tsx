"use client";
import { motion } from "framer-motion";

interface ChartItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface ManagementChartProps {
  data?: ChartItem[];
}

const defaultData: ChartItem[] = [
  { label: "التكاليف", value: 69, color: "#bf5af2", icon: "📤" },
  { label: "المحتوى", value: 45, color: "#ff6b6b", icon: "📚" },
  { label: "المواد", value: 82, color: "#ffca28", icon: "📘" },
  { label: "التقييم", value: 58, color: "#39ff14", icon: "📝" },
];

export default function ManagementChart({ data = defaultData }: ManagementChartProps) {
  return (
    <div>
      <div style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", marginBottom: "12px" }}>
        📊 إحصائية المهام
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 0" }}>
        {data.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `${item.color}12`,
                border: `1px solid ${item.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.7rem)", color: "#8b949e" }}>{item.label}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  style={{ fontSize: "clamp(0.65rem, 1vw, 0.75rem)", fontWeight: 800, color: item.color }}
                >
                  {item.value}%
                </motion.span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.04)", borderRadius: "4px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.07, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: "4px",
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}60)`,
                    boxShadow: `0 0 10px ${item.color}30`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
