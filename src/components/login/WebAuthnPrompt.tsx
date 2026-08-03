"use client";

import { motion } from "framer-motion";

interface WebAuthnPromptProps {
  webAuthnDone: boolean;
  webAuthnRegistering: boolean;
  handleEnableWebAuthn: () => void;
  handleSkipWebAuthn: () => void;
}

export default function WebAuthnPrompt({
  webAuthnDone,
  webAuthnRegistering,
  handleEnableWebAuthn,
  handleSkipWebAuthn,
}: WebAuthnPromptProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: "rgba(10, 20, 40, 0.95)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(0, 229, 255, 0.25)",
          borderRadius: "24px",
          padding: "clamp(25px, 4vw, 40px)",
          maxWidth: "430px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(0, 229, 255, 0.15)",
        }}
      >
        {webAuthnDone ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: 15 }}>✅</div>
            <h3
              style={{
                color: "#39ff14",
                marginBottom: 8,
                fontSize: "1.3rem",
              }}
            >
              تم تفعيل البصمة بنجاح!
            </h3>
            <p style={{ color: "#8b949e", fontSize: "0.9rem" }}>
              يمكنك الآن الدخول ببصمة إصبعك في المرة القادمة
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: 70,
                height: 70,
                margin: "0 auto 15px",
                borderRadius: "50%",
                background: "rgba(122, 0, 255, 0.15)",
                border: "2px solid rgba(122, 0, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 9c0-2.21 1.79-4 4-4s4 1.79 4 4" />
                <path
                  d="M7 11c0-2.76 2.24-5 5-5s5 2.24 5 5"
                  opacity="0.8"
                />
                <path
                  d="M9 12c0-1.66 1.34-3 3-3s3 1.34 3 3"
                  opacity="0.6"
                />
                <path d="M8 15c0-2.21 1.79-4 4-4s4 1.79 4 4" />
                <path d="M10 18.5c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5" />
                <circle
                  cx="12"
                  cy="18.5"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </div>
            <h3
              style={{
                color: "#fff",
                marginBottom: 8,
                fontSize: "1.3rem",
              }}
            >
              تفعيل الدخول بالبصمة
            </h3>
            <p
              style={{
                color: "#8b949e",
                fontSize: "0.9rem",
                marginBottom: 25,
              }}
            >
              هل تريد تفعيل الدخول السريع باستخدام بصمة إصبعك؟
              <br />
              <span style={{ fontSize: "0.8rem", color: "#5a6a7a" }}>
                (Passkey - متوافق مع Windows Hello و Touch ID)
              </span>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSkipWebAuthn}
                disabled={webAuthnRegistering}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "14px",
                  background: "transparent",
                  color: "#8b949e",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                ليس الآن
              </button>
              <button
                onClick={handleEnableWebAuthn}
                disabled={webAuthnRegistering}
                style={{
                  flex: 1,
                  padding: "14px",
                  border: "none",
                  borderRadius: "14px",
                  background: webAuthnRegistering
                    ? "rgba(122, 0, 255, 0.3)"
                    : "linear-gradient(135deg, #7a00ff, #a855f7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  opacity: webAuthnRegistering ? 0.7 : 1,
                }}
              >
                {webAuthnRegistering
                  ? "⏳ جاري التسجيل..."
                  : "نعم، فعّل البصمة"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}