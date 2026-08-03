"use client";

import { motion } from "framer-motion";
import ErrorAlert from "./ErrorAlert";

interface ForgotPanelProps {
  forgotStep: "identifier" | "otp" | "newPassword";
  setForgotStep: (step: "identifier" | "otp" | "newPassword") => void;
  forgotIdentifier: string;
  setForgotIdentifier: (value: string) => void;
  forgotCode: string;
  setForgotCode: (value: string) => void;
  forgotNewPass: string;
  setForgotNewPass: (value: string) => void;
  forgotConfirmPass: string;
  setForgotConfirmPass: (value: string) => void;
  forgotResetToken: string;
  noBindingUserName: string;
  error: string;
  setError: (value: string) => void;
  loading: boolean;
  handleForgotPassword: () => void;
  handleResendOtp: () => void;
  handleAdminAssistanceRequest: () => void;
  switchPanel: (panel: "login" | "activate" | "forgot") => void;
  onBackToLogin: () => void;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
  glassPanelStyle: React.CSSProperties;
}

export default function ForgotPanel({
  forgotStep,
  setForgotStep,
  forgotIdentifier,
  setForgotIdentifier,
  forgotCode,
  setForgotCode,
  forgotNewPass,
  setForgotNewPass,
  forgotConfirmPass,
  setForgotConfirmPass,
  forgotResetToken,
  noBindingUserName,
  error,
  setError,
  loading,
  handleForgotPassword,
  handleResendOtp,
  handleAdminAssistanceRequest,
  switchPanel,
  onBackToLogin,
  inputStyle,
  btnStyle,
  glassPanelStyle,
}: ForgotPanelProps) {
  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={glassPanelStyle}
    >
      <h3
        style={{
          color: "#00e5ff",
          marginBottom: 15,
          fontSize: "1.2rem",
        }}
      >
        {forgotStep === "identifier"
          ? "استعادة كلمة المرور"
          : forgotStep === "otp"
            ? "إدخال رمز التحقق"
            : "كلمة مرور جديدة"}
      </h3>
      <p
        style={{
          color: "#8b949e",
          fontSize: "0.78rem",
          marginBottom: 10,
        }}
      >
        المرحلة{" "}
        {forgotStep === "identifier"
          ? "1"
          : forgotStep === "otp"
            ? "2"
            : "3"}{" "}
        من 3
      </p>

      {error && <ErrorAlert message={error} />}

      {forgotStep === "identifier" && (
        <>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: 15,
            }}
          >
            أدخل بريدك الإلكتروني أو اسم المستخدم
          </p>
          <input
            type="text"
            placeholder="البريد الإلكتروني أو اسم المستخدم"
            style={inputStyle}
            value={forgotIdentifier}
            onChange={(e) => setForgotIdentifier(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && handleForgotPassword()
            }
            required
          />
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #2188ff, #0066cc)",
              boxShadow: "0 6px 25px rgba(33,136,255,0.35)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⏳ جاري البحث..." : "بحث"}
          </button>
        </>
      )}

      {forgotStep === "otp" && (
        <>
          {!noBindingUserName ? (
            <>
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.85rem",
                  marginBottom: 8,
                }}
              >
                تم إرسال رمز التحقق إلى حسابك في Telegram
              </p>
              <p
                style={{
                  color: "#00e5ff",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: 15,
                  direction: "ltr",
                  textAlign: "center",
                }}
              >
                @cyber_security_cloud_bot
              </p>
              <input
                type="text"
                placeholder="رمز التحقق (6 أرقام)"
                style={inputStyle}
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value)}
                required
                maxLength={6}
              />
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                  ...btnStyle,
                  background:
                    "linear-gradient(135deg, #2188ff, #0066cc)",
                  boxShadow: "0 6px 25px rgba(33,136,255,0.35)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "⏳ جاري التحقق..." : "تحقق من الكود"}
              </button>
              <button
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  ...btnStyle,
                  background: "transparent",
                  border: "1px solid rgba(255,202,40,0.3)",
                  color: "#ffca28",
                  marginTop: 8,
                }}
              >
                {loading ? "⏳ جاري..." : "🔄 إعادة إرسال الرمز"}
              </button>
            </>
          ) : (
            <>
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.85rem",
                  marginBottom: 8,
                }}
              >
                {noBindingUserName}، حسابك غير مرتبط بـ Telegram.
              </p>
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.8rem",
                  marginBottom: 12,
                }}
              >
                يمكنك طلب مساعدة الأدمن لإعادة تعيين كلمة المرور
                يدوياً.
              </p>
              <button
                onClick={handleAdminAssistanceRequest}
                disabled={loading}
                style={{
                  ...btnStyle,
                  background:
                    "linear-gradient(135deg, #ffca28, #f0b400)",
                  color: "#000",
                  fontWeight: 800,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "⏳ جاري..." : "🆘 طلب مساعدة الأدمن"}
              </button>
            </>
          )}
          <button
            onClick={() => {
              setForgotStep("identifier");
              setError("");
            }}
            style={{
              ...btnStyle,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#8b949e",
              marginTop: 4,
            }}
          >
            🔙 العودة
          </button>
        </>
      )}

      {forgotStep === "newPassword" && (
        <>
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            style={inputStyle}
            value={forgotNewPass}
            onChange={(e) => setForgotNewPass(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور الجديدة"
            style={inputStyle}
            value={forgotConfirmPass}
            onChange={(e) => setForgotConfirmPass(e.target.value)}
            required
          />
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #2188ff, #0066cc)",
              boxShadow: "0 6px 25px rgba(33,136,255,0.35)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⏳ جاري الحفظ..." : "حفظ كلمة المرور"}
          </button>
          <button
            onClick={() => setForgotStep("otp")}
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

      <span
        onClick={onBackToLogin}
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
    </motion.div>
  );
}