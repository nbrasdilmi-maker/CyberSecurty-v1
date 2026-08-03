"use client";

import { motion } from "framer-motion";
import ErrorAlert from "./ErrorAlert";

interface ActivatePanelProps {
  activateStep: "code" | "username" | "password" | "binding";
  setActivateStep: (step: "code" | "username" | "password" | "binding") => void;
  activateCode: string;
  setActivateCode: (value: string) => void;
  activatePassword: string;
  setActivatePassword: (value: string) => void;
  activateConfirm: string;
  setActivateConfirm: (value: string) => void;
  activateUserInfo: {
    name: string;
    role: string;
    level: string | null;
    username: string;
  } | null;
  bindCode: string;
  bindingDone: boolean;
  error: string;
  loading: boolean;
  handleActivateCode: () => void;
  handleActivatePassword: () => void;
  handleInitiateBinding: () => void;
  handleSkipBinding: () => void;
  switchPanel: (panel: "login" | "activate" | "forgot") => void;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
  glassPanelStyle: React.CSSProperties;
}

export default function ActivatePanel({
  activateStep,
  setActivateStep,
  activateCode,
  setActivateCode,
  activatePassword,
  setActivatePassword,
  activateConfirm,
  setActivateConfirm,
  activateUserInfo,
  bindCode,
  bindingDone,
  error,
  loading,
  handleActivateCode,
  handleActivatePassword,
  handleInitiateBinding,
  handleSkipBinding,
  switchPanel,
  showToast,
  inputStyle,
  btnStyle,
  glassPanelStyle,
}: ActivatePanelProps) {
  return (
    <motion.div
      key={`activate-${activateStep}`}
      initial={{ opacity: 0, x: -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={glassPanelStyle}
    >
      <h2
        style={{
          color: "#00e5ff",
          fontSize: "1.3rem",
          marginBottom: 4,
        }}
      >
        تفعيل الحساب
      </h2>
      <p
        style={{
          color: "#8b949e",
          fontSize: "0.8rem",
          marginBottom: 10,
        }}
      >
        المرحلة{" "}
        {activateStep === "code"
          ? "1"
          : activateStep === "username"
            ? "2"
            : activateStep === "password"
              ? "3"
              : "4"}{" "}
        من 4
      </p>

      {error && <ErrorAlert message={error} />}

      {/* ===== المرحلة 1: كود التفعيل ===== */}
      {activateStep === "code" && (
        <>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: 12,
            }}
          >
            أدخل كود التفعيل المرسل إليك
          </p>
          <input
            type="text"
            placeholder="كود التفعيل"
            style={inputStyle}
            value={activateCode}
            onChange={(e) => setActivateCode(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleActivateCode()
            }
            required
          />
          <button
            onClick={handleActivateCode}
            disabled={loading || !activateCode.trim()}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #238636, #2ea043)",
              boxShadow: "0 6px 25px rgba(35,134,54,0.35)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⏳ جاري التحقق..." : "التحقق من الكود"}
          </button>
        </>
      )}

      {/* ===== المرحلة 2: اسم المستخدم (مولد تلقائياً) ===== */}
      {activateStep === "username" && activateUserInfo && (
        <>
          {(() => {
            const parts = activateUserInfo.name.split(" ");
            const first = parts[0];
            const last =
              parts.length > 1 ? parts[parts.length - 1] : "";
            const masked =
              parts.length > 2
                ? `${first} ${"•".repeat(Math.max(6, (activateUserInfo.name.length - first.length - last.length) * 2))} ${last}`
                : activateUserInfo.name;
            const roleLabel =
              activateUserInfo.role === "ADMIN"
                ? "الأدمن"
                : activateUserInfo.role === "MANAGEMENT"
                  ? "الإداري"
                  : activateUserInfo.role === "TEACHER"
                    ? "المعلم"
                    : "الطالب";
            const levelLabel = activateUserInfo.level || "";
            return (
              <div
                style={{
                  background: "rgba(0,229,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.2)",
                  borderRadius: "14px",
                  padding: "16px",
                  marginBottom: 15,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#00e5ff",
                    fontSize: "1rem",
                    fontWeight: 600,
                    margin: "0 0 4px",
                  }}
                >
                  مرحباً ب{roleLabel}
                  {levelLabel ? ` - ${levelLabel}` : ""}
                </p>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "1.3rem",
                    fontWeight: 500,
                    margin: "8px 0",
                    direction: "rtl",
                  }}
                >
                  {masked}
                </p>
              </div>
            );
          })()}
          <div
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.2)",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#8b949e",
                fontSize: "0.75rem",
                margin: "0 0 4px",
              }}
            >
              ✅ تم التحقق بنجاح — اسم المستخدم الخاص بك:
            </p>
            <p
              style={{
                color: "#00e5ff",
                fontSize: "1.3rem",
                fontWeight: 700,
                fontFamily: "'Orbitron', sans-serif",
                direction: "ltr",
                margin: "8px 0",
                letterSpacing: 1,
                userSelect: "all",
              }}
            >
              {activateUserInfo.username}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  activateUserInfo.username,
                );
                showToast("📋 تم نسخ اسم المستخدم", "success");
              }}
              style={{
                padding: "6px 18px",
                borderRadius: "10px",
                border: "1px solid rgba(0,229,255,0.3)",
                background: "rgba(0,229,255,0.1)",
                color: "#00e5ff",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              📋 نسخ اسم المستخدم
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActivateStep("password")}
              style={{
                flex: 1,
                ...btnStyle,
                background:
                  "linear-gradient(135deg, #238636, #2ea043)",
                boxShadow: "0 6px 25px rgba(35,134,54,0.35)",
              }}
            >
              متابعة ←
            </button>
          </div>
        </>
      )}

      {/* ===== المرحلة 3: كلمة المرور ===== */}
      {activateStep === "password" && (
        <>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: 12,
              textAlign: "right",
            }}
          >
            أدخل كلمة مرور قوية لحماية حسابك:
          </p>
          <input
            type="password"
            placeholder="كلمة المرور (8 أحرف على الأقل)"
            style={inputStyle}
            value={activatePassword}
            onChange={(e) => setActivatePassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            style={inputStyle}
            value={activateConfirm}
            onChange={(e) => setActivateConfirm(e.target.value)}
            required
          />
          <button
            onClick={handleActivatePassword}
            disabled={loading}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #238636, #2ea043)",
              boxShadow: "0 6px 25px rgba(35,134,54,0.35)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⏳ جاري التفعيل..." : "تفعيل الحساب"}
          </button>
          <button
            onClick={() => setActivateStep("username")}
            style={{
              ...btnStyle,
              background: "transparent",
              border: "1px solid rgba(0,229,255,0.2)",
              color: "#00e5ff",
              marginTop: 8,
            }}
          >
            → العودة
          </button>
        </>
      )}

      {/* ===== المرحلة 4: ربط Telegram (اختياري) ===== */}
      {activateStep === "binding" && (
        <>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: 8,
            }}
          >
            ✅ تم تفعيل حسابك بنجاح!
          </p>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.8rem",
              marginBottom: 12,
            }}
          >
            يمكنك ربط حسابك مع Telegram لاستعادة كلمة المرور بسهولة
            (اختياري)
          </p>
          {!bindCode ? (
            <button
              onClick={handleInitiateBinding}
              disabled={loading}
              style={{
                width: "100%",
                ...btnStyle,
                background:
                  "linear-gradient(135deg, #2188ff, #0066cc)",
                boxShadow: "0 6px 25px rgba(33,136,255,0.35)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "⏳ جاري..." : "🔗 ربط حساب Telegram"}
            </button>
          ) : (
            <div
              style={{
                background: "rgba(0,229,255,0.06)",
                border: "1px solid rgba(0,229,255,0.2)",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.75rem",
                  margin: "0 0 4px",
                }}
              >
                أرسل هذا الكود إلى البوت:
              </p>
              <p
                style={{
                  color: "#00e5ff",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  fontFamily: "'Orbitron', sans-serif",
                  direction: "ltr",
                  margin: "8px 0",
                  letterSpacing: 2,
                  userSelect: "all",
                }}
              >
                {bindCode}
              </p>
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.75rem",
                  margin: 0,
                }}
              >
                @cyber_security_cloud_bot
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={handleSkipBinding}
              style={{
                flex: 1,
                ...btnStyle,
                background:
                  "linear-gradient(135deg, #238636, #2ea043)",
                boxShadow: "0 6px 25px rgba(35,134,54,0.35)",
              }}
            >
              {bindCode ? "تم ✅" : "تخطي ←"}
            </button>
          </div>
        </>
      )}

      {activateStep === "code" && (
        <span
          onClick={() => switchPanel("login")}
          style={{
            display: "inline-block",
            marginTop: 15,
            color: "#00e5ff",
            cursor: "pointer",
            fontSize: "0.85rem",
            padding: "6px 14px",
            borderRadius: "20px",
            background: "rgba(0,229,255,0.06)",
            border: "1px solid rgba(0,229,255,0.2)",
          }}
        >
          ← العودة إلى تسجيل الدخول
        </span>
      )}
    </motion.div>
  );
}