"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "./SidebarContext";
import { getRoleIcon, getRoleLabel } from "@/components/appshell/RoleIcons";

const getLevelLabel = (lvl?: string) => {
  const labels: Record<string, string> = {
    LEVEL_1: "المستوى الأول",
    LEVEL_2: "المستوى الثاني",
    LEVEL_3: "المستوى الثالث",
    LEVEL_4: "المستوى الرابع",
  };
  return lvl ? labels[lvl] || lvl : "";
};

export default function SidebarUserCard() {
  const { isExpanded } = useSidebar();
  const { user, role, level } = useAuth();

  const userRole = role || "STUDENT";
  const userLevel = level || "";

  return (
    <div
      style={{
        padding: isExpanded ? "10px 14px 8px" : "8px 0",
        borderBottom: "1px solid rgba(0, 200, 255, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: isExpanded ? "flex-start" : "center",
        }}
      >
        {/* الصورة الرمزية */}
        <div
          style={{
            position: "relative",
            width: isExpanded ? "36px" : "32px",
            height: isExpanded ? "36px" : "32px",
            flexShrink: 0,
          }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              position: "absolute", inset: "-2px", borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5ff, #7c3aed)",
              opacity: 0.4, filter: "blur(1.5px)",
            }}
          />
          <div
            style={{
              position: "relative", width: "100%", height: "100%",
              borderRadius: "50%", overflow: "hidden",
              background: "rgba(0, 229, 255, 0.08)",
              border: "1.5px solid rgba(0, 229, 255, 0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {getRoleIcon(userRole, isExpanded ? 22 : 18)}
          </div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: "absolute", bottom: "0", right: "0",
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#39ff14", border: "2px solid rgba(8,15,30,0.9)",
              boxShadow: "0 0 6px rgba(57,255,20,0.5)",
            }}
          />
        </div>

        {/* الاسم والدور — الوضع الموسع فقط */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e6edf3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
              {user?.name || "المستخدم"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <span style={{ fontSize: "0.55rem", color: "#00e5ff", fontWeight: 600 }}>
                {getRoleLabel(userRole)}
              </span>
              {userLevel && (
                <span style={{ fontSize: "0.45rem", padding: "0 5px", borderRadius: "8px", background: "rgba(0,229,255,0.06)", color: "#8b949e", border: "1px solid rgba(0,229,255,0.08)" }}>
                  {getLevelLabel(userLevel)}
                </span>
              )}
            </div>
            {/* شريط XP صغير */}
            <div style={{ marginTop: "5px", height: "2px", borderRadius: "1px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ height: "100%", borderRadius: "1px", background: "linear-gradient(90deg, #00e5ff, #7c3aed)" }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
