"use client";
import { motion } from "framer-motion";
export default function ThreatRadar() {
  const cx = 100, cy = 100, r = 70;
  const levels = 4, axes = 6;
  const angleStep = (2 * Math.PI) / axes;
  const gridCircles = Array.from({ length: levels }, (_, i) => { const radius = (r / levels) * (i + 1); return <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth="1" strokeDasharray={i === levels - 1 ? "none" : "3,3"} />; });
  const axisLines = Array.from({ length: axes }, (_, i) => { const angle = i * angleStep - Math.PI / 2; const x = cx + r * Math.cos(angle); const y = cy + r * Math.sin(angle); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,229,255,0.08)" strokeWidth="1" />; });
  const vals = [0.2, 0.4, 0.15, 0.3, 0.5, 0.28];
  const dataPolygon = Array.from({ length: axes }, (_, i) => { const angle = i * angleStep - Math.PI / 2; const dist = r * vals[i]; const x = cx + dist * Math.cos(angle); const y = cy + dist * Math.sin(angle); return `${x},${y}`; }).join(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {gridCircles}{axisLines}
        <motion.polygon initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} points={dataPolygon} fill="rgba(0,229,255,0.12)" stroke="#00e5ff" strokeWidth="2" />
        <motion.circle initial={{ r: 0 }} animate={{ r: 6 }} transition={{ delay: 1, type: "spring" }} cx={cx + r * 0.28 * Math.cos(-Math.PI / 2)} cy={cy + r * 0.28 * Math.sin(-Math.PI / 2)} fill="#39ff14" stroke="#010204" strokeWidth="2" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#39ff14" }}>منخفض</span>
        <span style={{ fontSize: "0.7rem", color: "#8b949e" }}>لا توجد تهديدات خطيرة</span>
      </div>
    </div>
  );
}