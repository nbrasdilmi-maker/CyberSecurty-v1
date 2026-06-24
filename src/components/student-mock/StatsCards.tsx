"use client";

import { motion } from "framer-motion";

interface Props {
  stats: { total: number; evaluated: number; subjects: number };
  loading?: boolean;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const FileIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const cards = [
  { label: "إجمالي التكاليف", desc: "تكليف", key: "total" as const, icon: FileIcon, color: "#12C7FF", bg: "rgba(18,199,255,0.12)" },
  { label: "تم التقييم", desc: "تكليف", key: "evaluated" as const, icon: CheckIcon, color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  { label: "قيد التقييم", desc: "تكليف", key: "pending" as const, icon: ClockIcon, color: "#EAB308", bg: "rgba(234,179,8,0.12)" },
  { label: "المواد الدراسية", desc: "مادة", key: "subjects" as const, icon: BookIcon, color: "#A855F7", bg: "rgba(168,85,247,0.12)" },
];

export default function StatsCards({ stats, loading }: Props) {
  const pending = stats.total - stats.evaluated;

  const values: Record<string, number> = {
    total: stats.total,
    evaluated: stats.evaluated,
    pending,
    subjects: stats.subjects,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "15px",
        marginBottom: "25px",
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.05,
              y: -6,
              boxShadow: `0 0 40px ${card.color}40, 0 0 80px ${card.color}20`,
              borderColor: card.color,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{
              ...glassStyle,
              padding: "22px 16px",
              textAlign: "center",
              border: `1px solid ${card.color}22`,
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow orbs */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 0.12, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 120,
                height: 120,
                marginLeft: -60,
                marginTop: -60,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${card.color}, transparent)`,
                pointerEvents: "none",
              }}
            />
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                position: "relative",
                zIndex: 1,
                border: `1px solid ${card.color}30`,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon color={card.color} />
              </motion.div>
            </motion.div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: card.color,
                lineHeight: 1.2,
                position: "relative",
                zIndex: 1,
              }}
            >
              {loading ? "..." : values[card.key]}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#e6edf3",
                fontWeight: 600,
                marginTop: "2px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#8b949e",
                marginTop: "2px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {card.desc}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
