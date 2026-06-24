"use client";
import { motion } from "framer-motion";
const shortcuts = [
  { href: "/admin/generation", icon: "🏗️", label: "إدارة التوليد", color: "#00e5ff" },
  { href: "/admin/activated-accounts", icon: "📋", label: "الحسابات المعلقة", color: "#2ea043" },
  { href: "/admin/audit-log", icon: "📜", label: "سجل العمليات", color: "#ffca28" },
  { href: "/admin/security-radar", icon: "🛡️", label: "رادار الأمان", color: "#f85149" },
  { href: "/admin/semester", icon: "📅", label: "الفصول الدراسية", color: "#bf5af2" },
  { href: "/admin/server-usage", icon: "💻", label: "استخدام الخادم", color: "#39ff14" },
  { href: "/admin/promotions", icon: "🏆", label: "الترقيات", color: "#ffca28" },
  { href: "/admin/upgrade", icon: "⬆️", label: "ترقية المستخدمين", color: "#ff6b6b" },
];
export default function QuickActions() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
      {shortcuts.map((s, i) => (
        <motion.button key={s.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileHover={{ scale: 1.04, y: -2, boxShadow: `0 8px 25px ${s.color}18` }} whileTap={{ scale: 0.96 }} style={{ background: "rgba(10, 20, 40, 0.06)", backdropFilter: "blur(30px)", borderRadius: "12px", border: `1px solid ${s.color}18`, padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", transition: "all 0.25s" }}>
          <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: s.color }}>{s.label}</span>
        </motion.button>
      ))}
    </div>
  );
}