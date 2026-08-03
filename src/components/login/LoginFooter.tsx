"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoginFooterProps {
  showTeam: boolean;
  onToggleTeam: () => void;
}

const teamMembers = [
  { name: "محمد إبراهيم الديلمي", color: "#00e5ff" },
  { name: "أحمد الهيدمة", color: "#7c3aed" },
  { name: "عبدالجليل الجبلي", color: "#10b981" },
  { name: "أسامة شرهان", color: "#f59e0b" },
  { name: "قناف العجيبي", color: "#ef4444" },
] as const;

export default function LoginFooter({ showTeam, onToggleTeam }: LoginFooterProps) {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "clamp(8px, 1.5vw, 14px) 16px",
        textAlign: "center",
        background: "transparent",
        borderTop: "1px solid rgba(255,255,255,0.03)",
        transition: "border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderTopColor = "rgba(0,229,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderTopColor = "rgba(255,255,255,0.03)";
      }}
    >
      <div
        style={{
          fontSize: "clamp(0.5rem, 1vw, 0.72rem)",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 400,
          transition: "color 0.5s",
        }}
      >
        <span
          onClick={onToggleTeam}
          style={{
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer",
            transition: "color 0.4s",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00e5ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
          }}
        >
          {showTeam ? "▲" : "▼"} فريق "طليعة الأمن السيبراني" | Cyber Vanguard
        </span>

        <AnimatePresence>
          {showTeam && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 8 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 500,
                      cursor: "default",
                      transition: "color 0.4s, text-shadow 0.4s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = member.color;
                      e.currentTarget.style.textShadow = `0 0 24px ${member.color}66, 0 0 48px ${member.color}22`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                      e.currentTarget.style.textShadow = "none";
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: member.color,
                        display: "inline-block",
                        opacity: 0.4,
                      }}
                    />
                    {member.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.4rem, 0.8vw, 0.55rem)",
          color: "rgba(255,255,255,0.15)",
          marginTop: 2,
          letterSpacing: "0.5px",
          transition: "color 0.5s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.15)";
        }}
      >
        OFFICIAL CYBER SECURITY PLATFORM — DHAMAR UNIVERSITY &copy; 2026
      </div>
    </footer>
  );
}