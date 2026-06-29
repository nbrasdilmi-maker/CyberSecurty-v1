"use client";
import { motion } from "framer-motion";

interface ServiceItem {
  name: string;
  status: "online" | "offline" | "warning";
  icon: string;
}

const defaultServices: ServiceItem[] = [
  { name: "الحسابات", status: "online", icon: "👥" },
  { name: "التكاليف", status: "online", icon: "📤" },
  { name: "المحتوى", status: "online", icon: "📚" },
  { name: "الإشعارات", status: "online", icon: "🔔" },
];

interface ManagementStatusProps {
  services?: ServiceItem[];
}

const statusConfig = {
  online: { color: "#39ff14", label: "نشط" },
  offline: { color: "#f85149", label: "متوقف" },
  warning: { color: "#ffca28", label: "تحذير" },
};

export default function ManagementStatus({ services = defaultServices }: ManagementStatusProps) {
  return (
    <div>
      <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.7rem)", fontWeight: 700, color: "#00e5ff", marginBottom: "10px" }}>
        🖥️ خدمات الإدارة
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
        {services.map((svc, i) => {
          const cfg = statusConfig[svc.status];
          return (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{svc.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.7rem)", fontWeight: 600, color: "#e6edf3" }}>
                  {svc.name}
                </div>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}`,
                  flexShrink: 0,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
