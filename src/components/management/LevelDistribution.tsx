"use client";
import { motion } from "framer-motion";

interface LevelData {
  level: string;
  count: number;
  color: string;
  icon: string;
}

interface LevelDistributionProps {
  data?: LevelData[];
}

const defaultData: LevelData[] = [
  { level: "المستوى الأول", count: 48, color: "#00e5ff", icon: "Ⅰ" },
  { level: "المستوى الثاني", count: 32, color: "#bf5af2", icon: "Ⅱ" },
  { level: "المستوى الثالث", count: 21, color: "#ffca28", icon: "Ⅲ" },
  { level: "المستوى الرابع", count: 15, color: "#39ff14", icon: "Ⅳ" },
];

export default function LevelDistribution({ data = defaultData }: LevelDistributionProps) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.7rem)", fontWeight: 700, color: "#8b949e", marginBottom: "12px" }}>
        📊 توزيع المستويات
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.map((item, i) => (
          <motion.div
            key={item.level}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `${item.color}15`,
                border: `1px solid ${item.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 800,
                color: item.color,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "clamp(0.55rem, 0.8vw, 0.65rem)", color: "#8b949e" }}>{item.level}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  style={{ fontSize: "clamp(0.65rem, 1vw, 0.75rem)", fontWeight: 800, color: item.color }}
                >
                  {item.count}
                </motion.span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / max) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: "3px", background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
