"use client";

import { motion } from "framer-motion";

interface Props {
  userName: string;
  userLevel: string;
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



const formatLastLogin = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("ar-SA", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const formatMemberSince = (d: string) => {
  const dt = new Date(d);
  const now = new Date();
  const months = (now.getFullYear() - dt.getFullYear()) * 12 + (now.getMonth() - dt.getMonth());
  if (months < 1) return "شهر واحد";
  if (months < 12) return `${months} أشهر`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} سنة و ${rem} أشهر` : `${years} سنوات`;
};

export default function WelcomeHero({ userName, userLevel, lastLoginAt, createdAt }: Props) {
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
              ⏱ آخر دخول: {lastLoginAt ? formatLastLogin(lastLoginAt) : "—"}
            </span>
            <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "0.72rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", color: "#A855F7", fontWeight: 600 }}>
              🎓 عضو منذ: {createdAt ? formatMemberSince(createdAt) : "—"}
            </span>
          </div>
        </div>
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
