"use client";

import { motion } from "framer-motion";

interface Props {
  userName: string;
  userLevel: string;
  onLogout: () => void;
  lastLoginAt?: string | null;
  createdAt?: string;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const getLevelLabel = (l: string) =>
  ({
    LEVEL_1: "المستوى الأول",
    LEVEL_2: "المستوى الثاني",
    LEVEL_3: "المستوى الثالث",
    LEVEL_4: "المستوى الرابع",
  })[l] || l;



export default function WelcomeCard({ userName, userLevel, onLogout, lastLoginAt, createdAt }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...glassStyle,
        padding: "24px 28px",
        marginBottom: "25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        background: "linear-gradient(135deg, rgba(59,7,100,0.3), rgba(26,11,99,0.4))",
        border: "1px solid rgba(168,85,247,0.2)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 1 }}>
        <div
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(18,199,255,0.2))",
            border: "2px solid #A855F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#A855F7",
            boxShadow: "0 0 25px rgba(168,85,247,0.2)",
          }}
        >
          {userName?.charAt(0) || "م"}
        </div>
        <div>
          <h2
            style={{
              color: "#A855F7",
              fontSize: "1.3rem",
              fontWeight: 800,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>👨‍🏫</span>
            <span>مرحباً، {userName}</span>
          </h2>
          <p style={{ color: "#9FB3C8", fontSize: "0.85rem", margin: "4px 0 0" }}>
            معلم — {getLevelLabel(userLevel)}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", zIndex: 1 }}>
        {lastLoginAt && (
          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "0.72rem", background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)", color: "#00e5ff", fontWeight: 600, whiteSpace: "nowrap" }}>
            ⏱ آخر دخول: {new Date(lastLoginAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {createdAt && (
          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "0.72rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 600, whiteSpace: "nowrap" }}>
            🎓 عضو منذ: {(() => { const dt = new Date(createdAt); const m = (new Date().getFullYear() - dt.getFullYear()) * 12 + (new Date().getMonth() - dt.getMonth()); return m < 1 ? "شهر" : m < 12 ? `${m} أشهر` : `${Math.floor(m / 12)} سنوات`; })()}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          style={{
            padding: "10px 18px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#EF4444",
            cursor: "pointer",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          تسجيل الخروج
        </motion.button>
      </div>
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "80px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.08), transparent)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
