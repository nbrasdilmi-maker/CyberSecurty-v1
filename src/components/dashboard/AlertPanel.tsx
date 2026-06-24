"use client";
import { motion } from "framer-motion";
interface AlertItem { level: "high" | "medium" | "low"; message: string; time: string; }
const levelConfig = { high: { label: "عالي", color: "#f85149", bg: "rgba(248,81,73,0.1)", icon: "🔴" }, medium: { label: "متوسط", color: "#ffca28", bg: "rgba(255,202,40,0.08)", icon: "🟡" }, low: { label: "منخفض", color: "#58a6ff", bg: "rgba(88,166,255,0.08)", icon: "🔵" } };
interface AlertPanelProps { alerts?: AlertItem[]; }
export default function AlertPanel({ alerts = [] }: AlertPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f85149", marginBottom: "4px" }}>🚨 تنبيهات النظام الحرجة</h3>
      {alerts.map((alert, i) => { const cfg = levelConfig[alert.level]; return (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} style={{ background: `${cfg.color}04`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: "10px", padding: "10px 12px", border: `1px solid ${cfg.color}20`, display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", flexShrink: 0, marginTop: "1px" }}>{cfg.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}><span style={{ fontSize: "0.6rem", fontWeight: 700, color: cfg.color, textTransform: "uppercase" }}>{cfg.label}</span></div>
            <div style={{ fontSize: "0.7rem", color: "#e6edf3", lineHeight: 1.4 }}>{alert.message}</div>
            <div style={{ fontSize: "0.6rem", color: "#8b949e", marginTop: "3px" }}>{alert.time}</div>
          </div>
        </motion.div>
      );})}
    </div>
  );
}