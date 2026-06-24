"use client";
import { motion } from "framer-motion";
interface WelcomeCardProps { userName?: string; compact?: boolean; }
export default function WelcomeCard({ userName = "المستخدم", compact }: WelcomeCardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : "مساء الخير";
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: "rgba(10, 20, 40, 0.06)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderRadius: compact ? "12px" : "16px", border: "1px solid rgba(0,229,255,0.06)", padding: compact ? "10px 12px" : "20px 24px", display: "flex", alignItems: "center", gap: compact ? "8px" : "16px", flexWrap: "wrap" }}>
      <div style={{ width: compact ? "34px" : "48px", height: compact ? "34px" : "48px", borderRadius: compact ? "10px" : "14px", background: "rgba(0,229,255,0.12)", border: "1.5px solid rgba(0,229,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? "0.9rem" : "1.3rem", flexShrink: 0 }}>
        👋
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: "clamp(0.85rem, 2vw, 1.3rem)", fontWeight: 800, color: "#e6edf3", margin: 0 }}>{greeting}، {userName}</h2>
        {!compact && <p style={{ fontSize: "0.8rem", color: "#8b949e", margin: "4px 0 0" }}>مرحباً بك في لوحة تحكم سحابة الأمن السيبراني. يمكنك مراقبة النظام وإدارة المستخدمين والمحتوى من هنا.</p>}
      </div>
      {!compact && (
        <motion.div animate={{ boxShadow: ["0 0 15px rgba(0,229,255,0.2)", "0 0 30px rgba(0,229,255,0.1)", "0 0 15px rgba(0,229,255,0.2)"] }} transition={{ repeat: Infinity, duration: 3 }} style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)", fontSize: "0.7rem", color: "#00e5ff", fontWeight: 600, whiteSpace: "nowrap" }}>
          🟢 كل الأنظمة تعمل بكفاءة
        </motion.div>
      )}
    </motion.div>
  );
}