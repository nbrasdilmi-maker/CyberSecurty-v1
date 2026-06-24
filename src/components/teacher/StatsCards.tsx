"use client";

import { motion } from "framer-motion";

interface Props {
  pending: number;
  evaluated: number;
  students: number;
  subjects: number;
  loading?: boolean;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const InboxIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 6v7" />
    <path d="M9 9h6" />
  </svg>
);

const cards = [
  { label: "تكاليف واردة", key: "pending" as const, icon: InboxIcon, color: "#EAB308", bg: "rgba(234,179,8,0.12)" },
  { label: "تم تقييمها", key: "evaluated" as const, icon: CheckIcon, color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  { label: "طلاب المستوى", key: "students" as const, icon: UsersIcon, color: "#12C7FF", bg: "rgba(18,199,255,0.12)" },
  { label: "المواد الدراسية", key: "subjects" as const, icon: BookIcon, color: "#A855F7", bg: "rgba(168,85,247,0.12)" },
];

export default function StatsCards({ pending, evaluated, students, subjects, loading }: Props) {
  const values: Record<string, number> = { pending, evaluated, students, subjects };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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
          </motion.div>
        );
      })}
    </div>
  );
}
