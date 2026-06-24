"use client";

import { motion } from "framer-motion";

interface Props {
  userName: string;
  userLevel: string;
  onLogout: () => void;
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

const ChalkboardIllustration = () => (
  <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
    <rect x="15" y="8" width="110" height="72" rx="6" fill="rgba(168,85,247,0.08)" stroke="#A855F7" strokeWidth="1.5" />
    <rect x="22" y="15" width="96" height="50" rx="3" fill="rgba(0,0,0,0.25)" />
    <rect x="28" y="20" width="40" height="4" rx="2" fill="#A855F7" opacity="0.6" />
    <rect x="28" y="28" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
    <rect x="28" y="34" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
    <rect x="28" y="40" width="55" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
    <rect x="28" y="46" width="35" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
    <circle cx="85" cy="33" r="14" fill="rgba(168,85,247,0.1)" stroke="#A855F7" strokeWidth="1" />
    <path d="M81 33l3 3 5-5" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="20" y="80" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.05)" />
    <rect x="35" y="72" width="70" height="1" fill="rgba(168,85,247,0.2)" />
  </svg>
);

export default function WelcomeCard({ userName, userLevel, onLogout }: Props) {
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
      <div style={{ display: "flex", alignItems: "center", gap: "15px", zIndex: 1 }}>
        <div style={{ opacity: 0.7 }}>
          <ChalkboardIllustration />
        </div>
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
