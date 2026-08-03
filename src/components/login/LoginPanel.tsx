"use client";

import { motion } from "framer-motion";
import ErrorAlert from "./ErrorAlert";

interface LoginPanelProps {
  username: string;
  setUsername: (value: string) => void;
  passwordRef: React.RefObject<HTMLInputElement>;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loginStep: "credentials" | "twofa";
  twoFACode: string;
  setTwoFACode: (value: string) => void;
  error: string;
  loading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  onFingerprintLogin: () => void;
  switchPanel: (panel: "login" | "activate" | "forgot") => void;
  globeRight: boolean;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
  glassPanelStyle: React.CSSProperties;
}

export default function LoginPanel({
  username,
  setUsername,
  passwordRef,
  showPassword,
  setShowPassword,
  loginStep,
  twoFACode,
  setTwoFACode,
  error,
  loading,
  handleLogin,
  onFingerprintLogin,
  switchPanel,
  globeRight,
  inputStyle,
  btnStyle,
  glassPanelStyle,
}: LoginPanelProps) {
  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: globeRight ? -80 : 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: globeRight ? -80 : 80 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={glassPanelStyle}
    >
      <h2
        style={{
          fontSize: "1.4rem",
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        مرحباً بكم في سحابة الأمن السيبراني
      </h2>
      <p
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.85rem",
          color: "#00e5ff",
          letterSpacing: 1.5,
          marginBottom: 15,
        }}
      >
        Welcome to Cyber Security Cloud
      </p>

      {error && <ErrorAlert message={error} />}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="الاسم الرقمي (Username/Email)"
          style={inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="مفتاح الدخول (Password)"
            style={inputStyle}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              left: 12,
              top: 13,
              cursor: "pointer",
              color: "#8b949e",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b949e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b949e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </div>

        {/* حقل 2FA */}
        {loginStep === "twofa" && (
          <input
            type="text"
            placeholder="🔐 كود المصادقة الثنائية (Google Authenticator)"
            style={{
              ...inputStyle,
              border: "1px solid rgba(255, 202, 40, 0.4)",
            }}
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value)}
            autoFocus
            required
          />
        )}

        {/* زران متجاوران */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* زر البصمة */}
          <button
            type="button"
            onClick={onFingerprintLogin}
            disabled={loading}
            title="دخول بالبصمة"
            style={{
              width: "50px",
              height: "50px",
              padding: "0",
              color: "#fff",
              border: "1px solid rgba(122, 0, 255, 0.5)",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "1.2rem",
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              background: "rgba(122, 0, 255, 0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
              <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
              <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
              <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
              <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
              <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
              <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
            </svg>
          </button>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              background: "linear-gradient(135deg, #238636, #2ea043)",
              boxShadow: "0 6px 25px rgba(35,134,54,0.35)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "⏳ جاري التحقق..."
              : loginStep === "twofa"
                ? "تأكيد الكود"
                : "تسجيل الدخول"}
          </button>
        </div>
      </form>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <span
          onClick={() => switchPanel("activate")}
          style={{
            color: "#00e5ff",
            textDecoration: "none",
            fontSize: "0.85rem",
            padding: "6px 14px",
            borderRadius: "20px",
            background: "rgba(0,229,255,0.06)",
            border: "1px solid rgba(0,229,255,0.2)",
            cursor: "pointer",
          }}
        >
          تفعيل الحساب
        </span>
        <span
          onClick={() => switchPanel("forgot")}
          style={{
            color: "#00e5ff",
            textDecoration: "none",
            fontSize: "0.85rem",
            padding: "6px 14px",
            borderRadius: "20px",
            background: "rgba(0,229,255,0.06)",
            border: "1px solid rgba(0,229,255,0.2)",
            cursor: "pointer",
          }}
        >
          نسيت كلمة المرور
        </span>
      </div>
    </motion.div>
  );
}