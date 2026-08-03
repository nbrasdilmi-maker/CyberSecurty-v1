"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginHeaderProps {}

export default function LoginHeader() {
  const router = useRouter();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(14px, 4vw, 36px)",
        background: "transparent",
        borderBottom: "1px solid transparent",
        transition: "border-color 0.5s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          opacity: 0.85,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "transparent",
            border: "1.5px solid rgba(0,229,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 800,
            color: "#00e5ff",
            fontFamily: "'Orbitron', sans-serif",
            transition: "box-shadow 0.4s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 24px rgba(0,229,255,0.25)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          CS
        </div>
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontWeight: 600,
            fontSize: "clamp(0.65rem, 1.1vw, 0.82rem)",
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: "1px",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00e5ff";
            e.currentTarget.style.textShadow =
              "0 0 20px rgba(0,229,255,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            e.currentTarget.style.textShadow = "none";
          }}
        >
          CYBER CLOUD
        </span>
      </div>

      <button
        onClick={() => router.push("/")}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Cairo', sans-serif",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 16px",
          borderRadius: 8,
          fontSize: "clamp(0.7rem, 1vw, 0.78rem)",
          fontWeight: 600,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,229,255,0.35)";
          e.currentTarget.style.color = "#00e5ff";
          e.currentTarget.style.boxShadow = "0 0 24px rgba(0,229,255,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Home size={14} strokeWidth={1.5} />
        الرئيسية
      </button>
    </header>
  );
}