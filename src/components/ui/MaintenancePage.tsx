"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface MaintenancePageProps {
  title?: string;
  message?: string;
}

export default function MaintenancePage({ title, message }: MaintenancePageProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#010204",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.1 }}
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          padding: "48px 32px",
          background: "rgba(10, 20, 40, 0.6)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(248, 81, 73, 0.2)",
          borderRadius: "24px",
          boxShadow: "0 0 60px rgba(248,81,73,0.08)",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ fontSize: "4rem", marginBottom: "16px", lineHeight: 1 }}
        >
          🚧
        </motion.div>

        <h1
          style={{
            color: "#ffca28",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 800,
            margin: "0 0 12px",
          }}
        >
          {title || "الصفحة متوقفة مؤقتاً"}
        </h1>

        <p
          style={{
            color: "#8b949e",
            fontSize: "1rem",
            lineHeight: 1.7,
            margin: "0 0 8px",
          }}
        >
          {message || "نعمل على تحسين هذه الصفحة حالياً. يرجى المحاولة لاحقاً."}
        </p>

        <p
          style={{
            color: "#484f6a",
            fontSize: "0.85rem",
            margin: "0 0 32px",
          }}
        >
          نشكرك على تفهمك
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "14px 36px",
              borderRadius: "14px",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              background: "rgba(0, 229, 255, 0.1)",
              color: "#00e5ff",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
              transition: "all 0.2s",
            }}
          >
            ← العودة للرئيسية
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            style={{
              padding: "14px 36px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#8b949e",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            🔄 تحديث
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
