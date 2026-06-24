"use client";
import { motion } from "framer-motion";
interface SystemService { name: string; status: "online" | "offline" | "warning"; icon: string; }
const statusColors: Record<string, string> = { online: "#39ff14", offline: "#f85149", warning: "#ffca28" };
interface SystemStatusProps { services?: SystemService[]; }
export default function SystemStatus({ services = [] }: SystemStatusProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
      {services.map((svc, i) => (
        <motion.div key={svc.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }} style={{ background: "rgba(10, 20, 40, 0.06)", backdropFilter: "blur(30px)", borderRadius: "14px", padding: "12px 14px", border: `1px solid ${statusColors[svc.status]}20`, display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>{svc.icon}</span>
            <span style={{ fontSize: "0.75rem", color: "#8b949e", fontWeight: 600 }}>{svc.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusColors[svc.status], boxShadow: `0 0 8px ${statusColors[svc.status]}` }} />
            <span style={{ fontSize: "0.7rem", color: statusColors[svc.status], fontWeight: 700, textTransform: "uppercase" }}>{svc.status === "online" ? "ONLINE" : svc.status === "offline" ? "OFFLINE" : "WARNING"}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}