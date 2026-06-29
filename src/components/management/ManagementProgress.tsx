"use client";
import { motion } from "framer-motion";

interface ProgressItem {
  label: string;
  value: number;
  color: string;
  icon: string;
}

interface ManagementProgressProps {
  data?: ProgressItem[];
}

const defaultData: ProgressItem[] = [
  { label: "حسابات مفعلة", value: 75, color: "#2ea043", icon: "✅" },
  { label: "تكاليف مقيمة", value: 60, color: "#bf5af2", icon: "📝" },
  { label: "محتوى منشور", value: 50, color: "#ffca28", icon: "📚" },
];

function Gauge({ item, index }: { item: ProgressItem; index: number }) {
  const cx = 60, cy = 60, r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (item.value / 100) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.08 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
    >
      <div style={{ position: "relative", width: "110px", height: "110px" }}>
        <svg width="110" height="110" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={item.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 + index * 0.08 }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{item.icon}</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 + index * 0.08 }}
            style={{ fontSize: "1rem", fontWeight: 800, color: item.color, lineHeight: 1.2 }}
          >
            {item.value}%
          </motion.span>
        </div>
      </div>
      <span style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.7rem)", color: "#8b949e", fontWeight: 600 }}>{item.label}</span>
    </motion.div>
  );
}

export default function ManagementProgress({ data = defaultData }: ManagementProgressProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px", justifyItems: "center", padding: "6px 0" }}>
      {data.map((item, i) => (
        <Gauge key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}
