"use client";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
const timeAgo = (date: Date) => { const diff = Date.now() - date.getTime(); const secs = Math.floor(diff / 1000); if (secs < 5) return "الآن"; if (secs < 60) return `منذ ${secs} ثانية`; const mins = Math.floor(secs / 60); if (mins < 60) return `منذ ${mins} دقيقة`; return `منذ ${Math.floor(mins / 60)} ساعة`; };
export default function RefreshIndicator({ onRefresh }: { onRefresh?: () => void }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [label, setLabel] = useState("الآن");
  useEffect(() => { const interval = setInterval(() => { setLabel(timeAgo(lastUpdated)); }, 5000); return () => clearInterval(interval); }, [lastUpdated]);
  const handleRefresh = useCallback(() => { setLastUpdated(new Date()); setLabel("الآن"); onRefresh?.(); }, [onRefresh]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.65rem", color: "#8b949e" }}>
      <span>🔄 آخر تحديث: {label}</span>
      <motion.button whileHover={{ scale: 1.1, color: "#00e5ff" }} whileTap={{ scale: 0.9 }} onClick={handleRefresh} style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", color: "#8b949e", fontSize: "0.65rem", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s" }}>
        تحديث
      </motion.button>
    </div>
  );
}