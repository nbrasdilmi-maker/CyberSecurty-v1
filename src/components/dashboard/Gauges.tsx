"use client";
import { motion } from "framer-motion";
interface GaugeItem { label: string; value: number; color: string; icon: string; }
interface GaugesProps { data?: GaugeItem[]; }
const defaultData: GaugeItem[] = [
  { label: "المعالج", value: 65, color: "#00e5ff", icon: "⚡" },
  { label: "الذاكرة", value: 73, color: "#a855f7", icon: "🧠" },
  { label: "التخزين", value: 37, color: "#39ff14", icon: "💾" },
];
function Gauge({ item, index }: { item: GaugeItem; index: number }) {
  const cx = 60, cy = 60, r = 46, circ = 2 * Math.PI * r, offset = circ - (item.value / 100) * circ;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.08 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={item.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 + index * 0.08 }} style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{item.icon}</span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + index * 0.08 }} style={{ fontSize: "1.1rem", fontWeight: 800, color: item.color, lineHeight: 1.2 }}>{item.value}%</motion.span>
        </div>
      </div>
      <span style={{ fontSize: "0.7rem", color: "#8b949e", fontWeight: 600 }}>{item.label}</span>
    </motion.div>
  );
}
export default function Gauges({ data = defaultData }: GaugesProps) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", justifyItems: "center", padding: "10px 0" }}>{data.map((item, i) => <Gauge key={item.label} item={item} index={i} />)}</div>;
}