"use client";

import { motion } from "framer-motion";

interface Props {
  userName: string;
  userLevel: string;
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

const LaptopIllustration = () => (
  <svg width="140" height="100" viewBox="0 0 140 100" fill="none">
    <rect x="10" y="5" width="120" height="72" rx="8" fill="rgba(18,199,255,0.08)" stroke="#12C7FF" strokeWidth="1.5" />
    <rect x="18" y="12" width="104" height="45" rx="4" fill="rgba(0,0,0,0.3)" />
    <rect x="22" y="16" width="30" height="4" rx="2" fill="#12C7FF" opacity="0.6" />
    <rect x="22" y="24" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    <rect x="22" y="30" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    <rect x="22" y="36" width="45" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    <rect x="60" y="16" width="40" height="4" rx="2" fill="#A855F7" opacity="0.5" />
    <circle cx="90" cy="32" r="12" fill="rgba(18,199,255,0.1)" stroke="#12C7FF" strokeWidth="1" />
    <path d="M86 32l3 3 5-5" stroke="#12C7FF" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="40" y="77" width="60" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
    <rect x="30" y="83" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.05)" />
    <rect x="25" y="60" width="90" height="1" fill="rgba(18,199,255,0.2)" />
  </svg>
);

export default function WelcomeHero({ userName, userLevel }: Props) {
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
        background: "linear-gradient(135deg, rgba(14,17,74,0.5), rgba(26,11,99,0.4))",
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
            background: "linear-gradient(135deg, rgba(18,199,255,0.25), rgba(168,85,247,0.25))",
            border: "2px solid #12C7FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#12C7FF",
            boxShadow: "0 0 25px rgba(18,199,255,0.2)",
          }}
        >
          {userName.charAt(0)}
        </div>
        <div>
          <h2
            style={{
              color: "#12C7FF",
              fontSize: "1.3rem",
              fontWeight: 800,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>👋</span>
            <span>مرحباً بك مجدداً، {userName}</span>
          </h2>
          <p style={{ color: "#9FB3C8", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {getLevelLabel(userLevel)} — استمر في التميز والتفوق
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
            <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "0.72rem", background: "rgba(18,199,255,0.08)", border: "1px solid rgba(18,199,255,0.15)", color: "#12C7FF", fontWeight: 600 }}>
              ⏱ آخر دخول: منذ 30 دقيقة
            </span>
            <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "0.72rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 600 }}>
              🎓 عضو منذ: 6 أشهر
            </span>
          </div>
        </div>
      </div>
      <div style={{ opacity: 0.85, zIndex: 1 }}>
        <LaptopIllustration />
      </div>
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "60px",
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
