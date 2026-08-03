"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import PageTransition from "@/components/layout/PageTransition";
import LoginFooter from "@/components/login/LoginFooter";
import LoginHeader from "@/components/login/LoginHeader";
import LoginTopBar from "@/components/login/LoginTopBar";
import ErrorAlert from "@/components/login/ErrorAlert";
import LoginPanel from "@/components/login/LoginPanel";
import ForgotPanel from "@/components/login/ForgotPanel";
import ActivatePanel from "@/components/login/ActivatePanel";
import WebAuthnPrompt from "@/components/login/WebAuthnPrompt";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { registerPushNotifications } from "@/lib/pushClient";
import { getDevicePerformance, type PerformanceLevel } from "@/lib/devicePerformance";
// @ts-ignore
const OnboardingScene = dynamic(
  () => import("@/components/effects/OnboardingScene"),
  { ssr: false },
);

type Panel = "login" | "activate" | "forgot";
type ForgotStep = "identifier" | "otp" | "newPassword";
type LoginStep = "credentials" | "twofa";
type ActivateStep = "code" | "username" | "password" | "binding";

export default function LoginPage() {
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);
  const { showToast } = useToast();
  const [perfLevel, setPerfLevel] = useState<PerformanceLevel>("medium");

  // حالة لوحة العرض
  const [panel, setPanel] = useState<Panel>("login");
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [twoFACode, setTwoFACode] = useState("");
  const [globeRight, setGlobeRight] = useState(false);

  // حقول تسجيل الدخول
  const [username, setUsername] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clock, setClock] = useState("00:00:00 AM");
  const [showTeam, setShowTeam] = useState(false);

  // تفعيل البصمة بعد تسجيل الدخول
  const [showWebAuthnPrompt, setShowWebAuthnPrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const [webAuthnRegistering, setWebAuthnRegistering] = useState(false);
  const [webAuthnDone, setWebAuthnDone] = useState(false);

  // Refs for pre-fetched WebAuthn options (preserve user gesture for WebAuthn API)
  const webAuthnLoginOptRef = useRef<any>(null);
  const webAuthnLoginUserIdRef = useRef<string | null>(null);
  const webAuthnRegOptRef = useRef<any>(null);

  // استعادة كلمة المرور
  const [forgotStep, setForgotStep] = useState<ForgotStep>("identifier");
  const [noBindingUserName, setNoBindingUserName] = useState("");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [recoveryBound, setRecoveryBound] = useState(false);

  // تفعيل الحساب
  const [activateStep, setActivateStep] = useState<ActivateStep>("code");
  const [activateCode, setActivateCode] = useState("");
  const [activateEmail, setActivateEmail] = useState("");
  const [activatePassword, setActivatePassword] = useState("");
  const [activateConfirm, setActivateConfirm] = useState("");
  const [activateUserInfo, setActivateUserInfo] = useState<{
    name: string;
    role: string;
    level: string | null;
    username: string;
  } | null>(null);
  const [bindCode, setBindCode] = useState("");
  const [bindingDone, setBindingDone] = useState(false);
  const [showActivateHelp, setShowActivateHelp] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==================== الساعة الرقمية ====================
  useEffect(() => {
    setPerfLevel(getDevicePerformance());
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setClock(`${h}:${m}:${s} ${ampm}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==================== مطر الماتريكس ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const chars = "01IO10ZxYyPpQq01αβγΔΣΦΩ01{}[]<>/\\01#$%@&01صدرفشبا01".split(
      "",
    );
    const fontSize = 16;
    const columns = Math.floor(w / fontSize);
    const drops: number[] = Array(columns).fill(0);
    const bgDrops: number[] = Array(Math.floor(w / (fontSize * 2))).fill(0);

    const draw = () => {
      ctx.fillStyle = "rgba(1, 4, 9, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize * 0.7}px "Courier New"`;
      for (let i = 0; i < bgDrops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * 2;
        const y = bgDrops[i] * fontSize * 0.7;
        ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
        ctx.fillText(text, x, y);
        if (y > h && Math.random() > 0.98) bgDrops[i] = 0;
        bgDrops[i]++;
      }
      ctx.font = `${fontSize}px "Courier New"`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#00e5ff";
      ctx.fillStyle = "#00e5ff";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);
        if (Math.random() > 0.96) {
          ctx.shadowColor = "#ffffff";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(text, x, y);
          ctx.shadowColor = "#00e5ff";
          ctx.fillStyle = "#00e5ff";
        }
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    };
    draw();
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ==================== تحضير بصمة الدخول المسبق ====================
  // نجهّز خيارات WebAuthn فوراً عند تغيير البريد (قبل الضغط على زر البصمة)
  useEffect(() => {
    if (!username || username.length < 3) {
      webAuthnLoginOptRef.current = null;
      webAuthnLoginUserIdRef.current = null;
      return;
    }
    let cancelled = false;
    fetch("/api/auth/webauthn/login/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          webAuthnLoginOptRef.current = data.options;
          webAuthnLoginUserIdRef.current = data.userId;
        } else {
          webAuthnLoginOptRef.current = null;
          webAuthnLoginUserIdRef.current = null;
        }
      })
      .catch(() => {
        if (!cancelled) {
          webAuthnLoginOptRef.current = null;
          webAuthnLoginUserIdRef.current = null;
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  // تحضير خيارات التسجيل المسبق للمستخدمين الجدد
  useEffect(() => {
    if (!showWebAuthnPrompt) {
      webAuthnRegOptRef.current = null;
      return;
    }
    fetch("/api/auth/webauthn/register/start", {
      method: "POST",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          webAuthnRegOptRef.current = data.options;
        }
      })
      .catch(() => {
        webAuthnRegOptRef.current = null;
      });
  }, [showWebAuthnPrompt]);

  // ==================== تحضير بصمة الدخول التلقائي (لمن عنده جلسة سابقة) ====================
  useEffect(() => {
    if (!window.PublicKeyCredential) return;

    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) return;

    // نجهّز الخيارات للزر فقط (لا نستدعي startAuthentication بدون نقرة)
    fetch("/api/auth/webauthn/login/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: storedEmail }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          webAuthnLoginOptRef.current = data.options;
          webAuthnLoginUserIdRef.current = data.userId;
        }
      })
      .catch(() => {});
  }, []); // تشتغل مرة واحدة عند فتح الصفحة

  // ==================== التوجيه حسب الدور ====================
  const redirectToDashboard = (role: string) => {
    if (role === "ADMIN") router.push("/admin");
    else if (role === "MANAGEMENT") router.push("/management");
    else if (role === "TEACHER") router.push("/teacher");
    else router.push("/student");
  };

  // ==================== تفعيل الإشعارات ====================
  const tryEnablePush = () => {
    if (Notification.permission === "granted") {
      registerPushNotifications();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") registerPushNotifications();
      });
    }
  };

  // ==================== تفعيل البصمة ====================
  const handleEnableWebAuthn = () => {
    if (!pendingUser) return;

    const options = webAuthnRegOptRef.current;
    if (!options) {
      setError("فشل تحضير بيانات البصمة، حاول مرة أخرى");
      return;
    }

    setWebAuthnRegistering(true);
    setError("");
    webAuthnRegOptRef.current = null; // استخدام لمرة واحدة

    // استدعاء startRegistration بشكل متزامن مع النقرة للحفاظ على user gesture
    startRegistration({ optionsJSON: options })
      .then(async (regResponse) => {
        const completeRes = await fetch(
          "/api/auth/webauthn/register/complete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regResponse),
          },
        );
        const completeData = await completeRes.json();
        if (!completeData.success) throw new Error(completeData.message);

        setWebAuthnDone(true);
        tryEnablePush();
        setTimeout(() => {
          setShowWebAuthnPrompt(false);
          redirectToDashboard(completeData.role || "");
        }, 1500);
      })
      .catch((err: any) => {
        setError(err.message || "فشل تسجيل البصمة");
        setWebAuthnRegistering(false);
      });
  };

  const handleSkipWebAuthn = () => {
    setShowWebAuthnPrompt(false);
    localStorage.setItem("webauthn_prompt_dismissed", "true");
    tryEnablePush();
    const storeRole = useAuthStore.getState().user?.role;
    redirectToDashboard(storeRole || "");
  };

  // ==================== تبديل اللوحة ====================
  const switchPanel = (p: Panel) => {
    setGlobeRight(p !== "login");
    setPanel(p);
    setError("");
  };

  // ==================== تسجيل الدخول ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: passwordRef.current?.value || "",
          twoFactorToken: loginStep === "twofa" ? twoFACode : undefined,
        }),
      });
      const data = await res.json();

      // إذا كانت 2FA مطلوبة
      if (data.requiresTwoFactor) {
        setLoginStep("twofa");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.message || "فشل الدخول");
      setUser({
        id: data.user?.id || "",
        email: data.user?.email || data.email || "",
        name: data.user?.name || "",
        role: data.role,
        level: data.level || "",
        webAuthnEnabled: data.user?.webAuthnEnabled || false,
        managementLevel: data.user?.managementLevel || null,
      });
      // إذا المستخدم ما عنده بصمة مفعلة، اسأله (مرة واحدة فقط)
      const webauthnDismissed =
        typeof window !== "undefined" &&
        localStorage.getItem("webauthn_prompt_dismissed") === "true";
      if (data.user && !data.user.webAuthnEnabled && !webauthnDismissed) {
        setPendingUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        });
        setShowWebAuthnPrompt(true);
      } else {
        void tryEnablePush();
        redirectToDashboard(data.role);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== دخول بالبصمة (منقول لـ LoginPanel) ====================
  const handleFingerprintLogin = () => {
    const options = webAuthnLoginOptRef.current;
    const userId = webAuthnLoginUserIdRef.current;
    if (!options || !userId) {
      setError("الرجاء إدخال البريد الإلكتروني أولاً");
      return;
    }

    setLoading(true);
    setError("");
    webAuthnLoginOptRef.current = null;
    webAuthnLoginUserIdRef.current = null;

    // استدعاء startAuthentication بشكل متزامن مع النقرة
    startAuthentication({ optionsJSON: options })
      .then(async (authResponse) => {
        const completeRes = await fetch(
          "/api/auth/webauthn/login/complete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, authResponse }),
          },
        );
        const completeData = await completeRes.json();
        if (!completeData.success)
          throw new Error(completeData.message);
        setUser({
          id: userId || "",
          email: completeData.email || "",
          name: completeData.name || "",
          role: completeData.role,
          level: completeData.level || "",
          webAuthnEnabled: true,
        });
        if (completeData.role === "ADMIN")
          router.push("/admin");
        else if (completeData.role === "MANAGEMENT")
          router.push("/management");
        else if (completeData.role === "TEACHER")
          router.push("/teacher");
        else router.push("/student");
      })
      .catch((err: any) => {
        setError(err.message || "فشل الدخول بالبصمة");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ==================== استعادة كلمة المرور (Telegram OTP فقط) ====================
  const handleForgotPassword = async () => {
    setError("");
    if (forgotStep === "identifier") {
      if (!forgotIdentifier)
        return setError("يرجى إدخال البريد الإلكتروني أو اسم المستخدم");
      setLoading(true);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: forgotIdentifier }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.step === "otp") {
            setForgotStep("otp");
          } else if (data.step === "no_binding") {
            setNoBindingUserName(data.userName || "");
            setForgotStep("otp");
            setError(
              "❌ حسابك غير مرتبط بـ Telegram. استخدم خيار طلب مساعدة الأدمن.",
            );
          }
        } else {
          setError(data.message || "فشل الإرسال");
        }
      } catch {
        setError("حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    } else if (forgotStep === "otp") {
      if (!forgotCode) return setError("يرجى إدخال كود التحقق");
      setLoading(true);
      try {
        const res = await fetch("/api/tig/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: forgotIdentifier,
            code: forgotCode,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setForgotResetToken(data.resetToken);
          setForgotStep("newPassword");
        } else {
          setError(data.message || "كود غير صحيح");
        }
      } catch {
        setError("حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    } else if (forgotStep === "newPassword") {
      if (!forgotNewPass || forgotNewPass !== forgotConfirmPass) {
        return setError("كلمتا المرور غير متطابقتين");
      }
      setLoading(true);
      try {
        const res = await fetch("/api/tig/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: forgotIdentifier,
            code: forgotResetToken,
            newPassword: forgotNewPass,
          }),
        });
        const data = await res.json();
        if (data.success) {
          switchPanel("login");
          setForgotStep("identifier");
          setForgotIdentifier("");
          setForgotCode("");
          setForgotNewPass("");
          setForgotConfirmPass("");
          setForgotResetToken("");
          setTimeout(() => {
            showToast(
              "✅ تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
              "success",
            );
          }, 300);
        } else {
          setError(data.message || "فشل التغيير");
        }
      } catch {
        setError("حدث خطأ في الاتصال");
      } finally {
        setLoading(false);
      }
    }
  };

  // ==================== إعادة إرسال رمز OTP (لـ ForgotPanel) ====================
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🔄 تم إعادة الإرسال", "success");
      } else {
        setError(data.message || "فشل الإرسال");
      }
    } catch {
      setError("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // ==================== طلب مساعدة الأدمن (لـ ForgotPanel) ====================
  const handleAdminAssistanceRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bot-control/assistance-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ تم إرسال طلب المساعدة", "success");
        setForgotStep("identifier");
      } else {
        setError(data.message || "فشل");
      }
    } catch {
      setError("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // ==================== العودة لتسجيل الدخول (لـ ForgotPanel) ====================
  const handleBackToLogin = () => {
    switchPanel("login");
    setForgotStep("identifier");
    setForgotIdentifier("");
    setForgotCode("");
    setForgotNewPass("");
    setForgotConfirmPass("");
    setForgotResetToken("");
    setNoBindingUserName("");
  };

  // ==================== تفعيل الحساب ====================
  const handleActivateCode = async () => {
    if (!activateCode.trim()) {
      setError("يرجى إدخال كود التفعيل");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activateCode }),
      });
      const data = await res.json();
      if (data.success) {
        setActivateUserInfo(data.user);
        setActivateStep("username");
      } else {
        setError(data.message || "كود التفعيل غير صحيح");
      }
    } catch {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePassword = async () => {
    const finalUsername = activateUserInfo?.username || "";
    if (!finalUsername) {
      setError("يرجى تحديد اسم المستخدم");
      return;
    }
    if (activatePassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (activatePassword !== activateConfirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activateCode,
          password: activatePassword,
          confirmPassword: activateConfirm,
          username: finalUsername,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActivateStep("binding");
      } else {
        setError(data.message || "فشل التفعيل");
      }
    } catch {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateBinding = async () => {
    setLoading(true);
    setError("");
    const bindUsername = activateUserInfo?.username || "";
    try {
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: bindUsername,
          password: activatePassword,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error("فشل تسجيل الدخول");
      setUser({
        id: loginData.user?.id || "",
        email: loginData.user?.email || "",
        name: loginData.user?.name || "",
        role: loginData.role,
        level: loginData.level || "",
        webAuthnEnabled: loginData.user?.webAuthnEnabled || false,
        managementLevel: loginData.user?.managementLevel || null,
      });
      const res = await fetch("/api/tig/bind/initiate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBindCode(data.code);
      } else {
        setError(data.message || "فشل إنشاء كود الربط");
      }
    } catch {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishActivation = () => {
    const savedUsername = activateUserInfo?.username || "";
    const savedPassword = activatePassword;
    setActivateCode("");
    setActivateEmail("");
    setActivatePassword("");
    setActivateConfirm("");
    setActivateUserInfo(null);
    setBindCode("");
    setBindingDone(false);
    setActivateStep("code");
    setUsername(savedUsername);
    if (passwordRef.current) passwordRef.current.value = savedPassword;
    setPanel("login");
    setGlobeRight(false);
    setTimeout(() => {
      showToast(
        "✅ تم تفعيل الحساب بنجاح. يمكنك الآن تسجيل الدخول.",
        "success",
      );
    }, 300);
  };

  const handleSkipBinding = () => {
    handleFinishActivation();
  };

  // ==================== التنسيقات العامة ====================
  const glassPanelStyle: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.5)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid rgba(0, 229, 255, 0.2)",
    borderRadius: "24px",
    padding: "clamp(25px, 4vw, 40px) clamp(20px, 4vw, 40px)",
    width: "100%",
    maxWidth: "430px",
    textAlign: "center",
    boxShadow: "0 0 60px rgba(0, 229, 255, 0.1), 0 20px 50px rgba(0,0,0,0.5)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 15px",
    marginBottom: "16px",
    background: "rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    borderRadius: "14px",
    fontSize: "0.95rem",
    textAlign: "center",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s ease",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s ease",
  };

  return (
    <PageTransition>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#010204",
          fontFamily: "'Cairo', sans-serif",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        {/* مطر الماتريكس */}
        {perfLevel !== "low" && (
          <canvas
            ref={canvasRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}

        {/* شبكة كمومية */}
        <div className="absolute inset-0 quantum-grid z-0" />

        <LoginHeader />

        {/* الكرة الأرضية - تتحرك يمين/يسار */}
        {perfLevel === "high" && (
          <motion.div
            animate={{
              left: globeRight ? "55%" : "5%",
              top: "50%",
              y: "-50%",
            }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 70,
              damping: 16,
            }}
            className="absolute z-10 hidden lg:block pointer-events-none"
            style={{ width: "750px", height: "750px" }}
          >
            <div className="w-full h-full">
              <OnboardingScene showCard={false} />
            </div>
          </motion.div>
        )}

        {/* كرة للجوال - كبيرة وواضحة */}
        {perfLevel !== "low" && (
          <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[450px] h-[450px] opacity-40">
                <OnboardingScene showCard={false} />
              </div>
            </div>
          </div>
        )}

        {/* ==================== الهيدر ==================== */}
        <LoginTopBar clock={clock} />

        {/* ==================== المحتوى الرئيسي ==================== */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 20px 80px",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ========== لوحة تسجيل الدخول ========== */}
            {panel === "login" && (
              <LoginPanel
                username={username}
                setUsername={setUsername}
                passwordRef={passwordRef}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loginStep={loginStep}
                twoFACode={twoFACode}
                setTwoFACode={setTwoFACode}
                error={error}
                loading={loading}
                handleLogin={handleLogin}
                onFingerprintLogin={handleFingerprintLogin}
                switchPanel={switchPanel}
                globeRight={globeRight}
                inputStyle={inputStyle}
                btnStyle={btnStyle}
                glassPanelStyle={glassPanelStyle}
              />
            )}

            {/* ========== لوحة تفعيل الحساب (4 مراحل) ========== */}
                        {/* ========== لوحة تفعيل الحساب (4 مراحل) ========== */}
            {panel === "activate" && (
              <ActivatePanel
                activateStep={activateStep}
                setActivateStep={setActivateStep}
                activateCode={activateCode}
                setActivateCode={setActivateCode}
                activatePassword={activatePassword}
                setActivatePassword={setActivatePassword}
                activateConfirm={activateConfirm}
                setActivateConfirm={setActivateConfirm}
                activateUserInfo={activateUserInfo}
                bindCode={bindCode}
                bindingDone={bindingDone}
                error={error}
                loading={loading}
                handleActivateCode={handleActivateCode}
                handleActivatePassword={handleActivatePassword}
                handleInitiateBinding={handleInitiateBinding}
                handleSkipBinding={handleSkipBinding}
                switchPanel={switchPanel}
                showToast={showToast}
                inputStyle={inputStyle}
                btnStyle={btnStyle}
                glassPanelStyle={glassPanelStyle}
              />
            )}

            {/* ========== لوحة استعادة كلمة المرور ========== */}{/* ========== لوحة استعادة كلمة المرور ========== */}
            {panel === "forgot" && (
              <ForgotPanel
                forgotStep={forgotStep}
                setForgotStep={setForgotStep}
                forgotIdentifier={forgotIdentifier}
                setForgotIdentifier={setForgotIdentifier}
                forgotCode={forgotCode}
                setForgotCode={setForgotCode}
                forgotNewPass={forgotNewPass}
                setForgotNewPass={setForgotNewPass}
                forgotConfirmPass={forgotConfirmPass}
                setForgotConfirmPass={setForgotConfirmPass}
                forgotResetToken={forgotResetToken}
                noBindingUserName={noBindingUserName}
                error={error}
                setError={setError}
                loading={loading}
                handleForgotPassword={handleForgotPassword}
                handleResendOtp={handleResendOtp}
                handleAdminAssistanceRequest={handleAdminAssistanceRequest}
                switchPanel={switchPanel}
                onBackToLogin={handleBackToLogin}
                inputStyle={inputStyle}
                btnStyle={btnStyle}
                glassPanelStyle={glassPanelStyle}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ==================== نافذة تفعيل البصمة ==================== */}
        {showWebAuthnPrompt && (
          <WebAuthnPrompt
            webAuthnDone={webAuthnDone}
            webAuthnRegistering={webAuthnRegistering}
            handleEnableWebAuthn={handleEnableWebAuthn}
            handleSkipWebAuthn={handleSkipWebAuthn}
          />
        )}

        <LoginFooter showTeam={showTeam} onToggleTeam={() => setShowTeam((p) => !p)} />
      </div>
    </PageTransition>
  );
}
