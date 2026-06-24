"use client";
import { motion } from "framer-motion";
import Sparkline from "./Sparkline";
interface StatItem { label: string; value: number; icon: string; color: string; trend: number; trendUp: boolean; sparklineData: number[]; }
interface StatCardProps { stat: StatItem; index: number; compact?: boolean; }
export default function StatCard({ stat, index, compact }: StatCardProps) {
  const p = compact ? "10px" : "16px";
  const iconSize = compact ? "30px" : "38px";
  const iconFont = compact ? "0.9rem" : "1.1rem";
  const valFont = compact ? "1.1rem" : "1.5rem";
  const trendFont = compact ? "0.55rem" : "0.65rem";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, type: "spring", stiffness: 200 }} whileHover={{ y: -3, borderColor: stat.color, boxShadow: `0 12px 40px ${stat.color}15` }} style={{ background: "rgba(10, 20, 40, 0.08)", backdropFilter: "blur(30px)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", padding: p, transition: "all 0.3s", cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: compact ? "4px" : "8px" }}>
        <div style={{ width: iconSize, height: iconSize, borderRadius: "10px", background: `${stat.color}12`, border: `1px solid ${stat.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: iconFont, flexShrink: 0 }}>{stat.icon}</div>
        {!compact && <Sparkline data={stat.sparklineData} color={stat.color} width={80} height={28} />}
      </div>
      <div style={{ fontSize: compact ? "0.6rem" : "0.7rem", color: "#8b949e", fontWeight: 500, marginBottom: "2px" }}>{stat.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: compact ? "4px" : "8px" }}>
        <span style={{ fontSize: valFont, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value.toLocaleString("ar-YE")}</span>
        <span style={{ fontSize: trendFont, fontWeight: 700, color: stat.trendUp ? "#39ff14" : "#f85149", display: "flex", alignItems: "center", gap: "2px" }}>{stat.trendUp ? "▲" : "▼"} {stat.trend}%</span>
      </div>
    </motion.div>
  );
}