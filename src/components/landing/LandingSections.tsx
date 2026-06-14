"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// ===================== CONSTANTS =====================
const COLORS = {
  cyan: "#00e5ff",
  purple: "#bf5af2",
  green: "#2ea043",
  red: "#f85149",
  text: "#e6edf3",
  muted: "#8b949e",
  dark: "#0d1117",
  darker: "#010204",
  border: "rgba(48,54,61,0.5)",
  glass: "rgba(13,17,23,0.7)",
};

const ROLES = [
  {
    id: "admin",
    title: "الأدمن",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    description: "المشرف العام على النظام — صلاحية كاملة لإدارة المستخدمين، المواد، والإعدادات",
    gradient: "linear-gradient(135deg, #c62828, #e53935)",
  },
  {
    id: "management",
    title: "الإدارة",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    description: "مسؤول عن مستوى دراسي — يدير المواد، يراقب الطلاب، وينسق العملية التعليمية",
    gradient: "linear-gradient(135deg, #e65100, #fb8c00)",
  },
  {
    id: "teacher",
    title: "المعلم",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    description: "يقيم التكاليف، ينشر المحتوى العلمي، ويتواصل مع طلاب مستواه",
    gradient: "linear-gradient(135deg, #1565c0, #42a5f5)",
  },
  {
    id: "student",
    title: "الطالب",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 7l-7-4v-5l7 4 7-4v5l-7 4z",
    description: "يرفع التكاليف، يتواصل مع المعلمين، يتصفح المكتبة ويتابع درجاته",
    gradient: "linear-gradient(135deg, #2e7d32, #66bb6a)",
  },
];

const FEATURES = [
  {
    icon: "🔐",
    title: "تفعيل الحساب",
    desc: "احصل على كود التفعيل من الإدارة وأكمل بياناتك في 3 خطوات فقط",
  },
  {
    icon: "🔑",
    title: "استعادة كلمة المرور",
    desc: "نسيت كلمة المرور؟ استعدها بسهولة عبر البريد الإلكتروني أو بوت Telegram",
  },
  {
    icon: "🤖",
    title: "ربط Telegram",
    desc: "اربط حسابك مع البوت لاستعادة كلمة المرور بضغطة زر بدون إيميل",
  },
  {
    icon: "📚",
    title: "المكتبة العلمية",
    desc: "محتوى تعليمي منظم: ملازم، محاضرات، فيديوهات يوتيوب حسب مستواك",
  },
  {
    icon: "📤",
    title: "رفع التكاليف",
    desc: "ارفع ملف تكليفك للمادة الدراسية مباشرة واستلم التقييم مع الملاحظات",
  },
  {
    icon: "📊",
    title: "تقييم الدرجات",
    desc: "المعلمون يقيمون التكاليف ويصدرون الدرجات بشكل آلي ومنظم",
  },
  {
    icon: "🛡️",
    title: "أمان متطور",
    desc: "تشفير Argon2id مع حماية CSRF و XSS و 2FA ومكافحة الاختراق",
  },
  {
    icon: "💬",
    title: "مراسلات فورية",
    desc: "تواصل مباشر بين الطلاب والمعلمين والإدارة داخل بيئة آمنة",
  },
  {
    icon: "📋",
    title: "سجل متكامل",
    desc: "سجل تدقيق كامل لكل عملية في النظام للشفافية والمتابعة",
  },
];

const ACTIVATION_STEPS = [
  { num: 1, title: "الحصول على كود التفعيل", desc: "تستلم كود التفعيل من إدارة النظام (8 أحرف)" },
  { num: 2, title: "إدخال الكود", desc: "تدخل كود التفعيل في صفحة تفعيل الحساب" },
  { num: 3, title: "تعيين كلمة المرور", desc: "تختار اسم مستخدم وكلمة مرور قوية (8 أحرف على الأقل)" },
  { num: 4, title: "ربط Telegram (اختياري)", desc: "تربط حسابك مع البوت لاستعادة كلمة المرور بسهولة" },
];

const BOT_STEPS = [
  { num: 1, title: "افتح البوت", desc: "@cyber_security_cloud_bot على Telegram" },
  { num: 2, title: "اطلب الربط", desc: "أرسل /bind في محادثة البوت" },
  { num: 3, title: "انسخ الكود", desc: "سيرسل لك البوت كود ربط — انسخه" },
  { num: 4, title: "أدخل الكود في الموقع", desc: "الصق الكود في صفحة ربط الحساب واكتمل الربط" },
];

const RESET_STEPS = [
  { num: 1, title: "ادخل معرفك", desc: "أدخل اسم المستخدم أو البريد الإلكتروني" },
  { num: 2, title: "اختر طريقة الاستعادة", desc: "OTP عبر البريد أو رابط من بوت Telegram" },
  { num: 3, title: "تحقق من هويتك", desc: "أدخل كود OTP أو استخدم رابط البوت" },
  { num: 4, title: "عيّن كلمة مرور جديدة", desc: "أدخل كلمة مرور جديدة وقم بتأكيدها" },
];

// ===================== SECTION WRAPPER =====================
function SectionWrapper({
  id,
  children,
  className,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ===================== HERO =====================
function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  return cores !== undefined && cores <= 4;
}

const OnboardingScene = dynamic(() => import("@/components/effects/OnboardingScene"), { ssr: false });

export function HeroSection() {
  const router = useRouter();
  const [use3D, setUse3D] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (isLowEndDevice()) setUse3D(false);
    const timer = setTimeout(() => setGlobeReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: COLORS.darker,
      }}
    >
      <div className="absolute inset-0 quantum-grid z-0" />

      {use3D && globeReady && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0.4 }}>
          <OnboardingScene showCard={false} />
        </div>
      )}

      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "20px",
          maxWidth: "700px",
        }}
      >
        <div
          style={{
            fontSize: "clamp(0.7rem, 1.5vw, 0.85rem)",
            color: COLORS.cyan,
            letterSpacing: "4px",
            fontWeight: 600,
            marginBottom: 16,
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          جامعة ذمار — كلية الحاسبات
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 8px",
            lineHeight: 1.2,
            textShadow: "0 0 40px rgba(0,229,255,0.3)",
          }}
        >
          سحابة{" "}
          <span style={{ color: COLORS.cyan }}>الأمن السيبراني</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: COLORS.muted,
            margin: "0 0 32px",
            lineHeight: 1.7,
            maxWidth: "550px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          بيئة تعليمية تفاعلية متكاملة تجمع بين الطلاب والمعلمين والإدارة
          <br />
          في منصة واحدة مؤمّنة بأعلى معايير الحماية الرقمية
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "14px 36px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #00e5ff, #007bff)",
              color: "#010204",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 8px 30px rgba(0,229,255,0.3)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🚀 تسجيل الدخول
          </button>

          <button
            onClick={() => {
              document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "14px 36px",
              borderRadius: "14px",
              border: "1px solid rgba(0,229,255,0.3)",
              background: "rgba(0,229,255,0.06)",
              color: COLORS.cyan,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            اكتشف المنصة ↓
          </button>
        </div>
      </div>
    </section>
  );
}

// ===================== STATS =====================
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref} style={{ fontSize: "inherit", fontWeight: "inherit" }}>
      {display}{suffix}
    </span>
  );
}

export function StatsSection() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const items = useMemo(
    () => [
      { label: "المستخدمين", key: "totalUsers", color: COLORS.cyan },
      { label: "الطلاب", key: "totalStudents", color: COLORS.green },
      { label: "المعلمين", key: "totalTeachers", color: "#42a5f5" },
      { label: "المواد", key: "totalSubjects", color: COLORS.purple },
      { label: "التكاليف", key: "totalAssignments", color: COLORS.red },
      { label: "مقيدين بالبوت", key: "totalBindings", color: COLORS.cyan },
    ],
    []
  );

  return (
    <SectionWrapper id="stats-section">
      <div
        style={{
          padding: "60px 20px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            color: "#fff",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          المنصة بأرقام
        </h2>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 40 }}>
          إحصائيات حقيقية من قاعدة البيانات
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((item) => (
            <div
              key={item.key}
              style={{
                background: COLORS.glass,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "16px",
                padding: "24px 16px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 900, color: item.color, fontFamily: "'Orbitron', sans-serif" }}>
                {stats ? <AnimatedCounter value={stats[item.key] || 0} /> : "—"}
              </div>
              <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: 4 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ===================== ROLES =====================
export function RolesSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <SectionWrapper id="roles-section">
      <div
        style={{
          padding: "80px 20px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#fff", fontWeight: 800, marginBottom: 8 }}>
          هويات المستخدمين
        </h2>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 40 }}>
          أربعة أدوار رئيسية في المنصة لكل دوره ومهامه
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {ROLES.map((role) => (
            <div
              key={role.id}
              onMouseEnter={() => setActive(role.id)}
              onMouseLeave={() => setActive(null)}
              style={{
                background: active === role.id ? "rgba(13,17,23,0.9)" : COLORS.glass,
                border: `1px solid ${active === role.id ? COLORS.cyan : COLORS.border}`,
                borderRadius: "20px",
                padding: "28px 20px",
                cursor: "default",
                transition: "all 0.3s ease",
                transform: active === role.id ? "translateY(-6px)" : "none",
                boxShadow: active === role.id ? `0 12px 40px rgba(0,229,255,0.15)` : "none",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: role.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={role.icon} />
                </svg>
              </div>

              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px" }}>
                {role.title}
              </h3>
              <p style={{ color: COLORS.muted, fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ===================== FEATURES =====================
export function FeaturesSection() {
  return (
    <SectionWrapper id="features-section">
      <div
        style={{
          padding: "80px 20px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#fff", fontWeight: 800, marginBottom: 8 }}>
          مميزات المنصة
        </h2>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 40 }}>
          كل ما تحتاجه في بيئة تعليمية متكاملة
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: COLORS.glass,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "16px",
                padding: "20px",
                textAlign: "right",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.cyan;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px" }}>
                {f.title}
              </h3>
              <p style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ===================== PROCESS STEPS =====================
function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        background: COLORS.glass,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "16px",
        padding: "18px",
        textAlign: "right",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          minWidth: 40,
          height: 40,
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${COLORS.cyan}, #007bff)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.darker,
          fontWeight: 900,
          fontSize: "1rem",
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <div>
        <h4 style={{ color: "#fff", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px" }}>
          {title}
        </h4>
        <p style={{ color: COLORS.muted, fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function ProcessGroup({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: { num: number; title: string; desc: string }[];
}) {
  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <h3 style={{ color: COLORS.cyan, fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>
        {title}
      </h3>
      <p style={{ color: COLORS.muted, fontSize: "0.82rem", marginBottom: 16 }}>{subtitle}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s) => (
          <StepCard key={s.num} {...s} />
        ))}
      </div>
    </div>
  );
}

export function ProcessSection() {
  return (
    <SectionWrapper id="process-section">
      <div
        style={{
          padding: "80px 20px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#fff", fontWeight: 800, marginBottom: 8 }}>
          كيفية العمل
        </h2>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 40 }}>
          كل ما تحتاج معرفته للبدء في المنصة
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
            textAlign: "right",
          }}
        >
          <ProcessGroup title="🔐 تفعيل الحساب" subtitle="4 خطوات لتفعيل حسابك" steps={ACTIVATION_STEPS} />
          <ProcessGroup title="🤖 ربط Telegram" subtitle="اربط حسابك لاستعادة كلمة المرور بسهولة" steps={BOT_STEPS} />
          <ProcessGroup title="🔑 استعادة كلمة المرور" subtitle="3 خطوات لاستعادة كلمة المرور" steps={RESET_STEPS} />
        </div>
      </div>
    </SectionWrapper>
  );
}

// ===================== DEVELOPERS =====================
const TEAM = [
  {
    name: "محمد إبراهيم الديلمي",
    role: "مطور Full Stack",
    bio: "طالب في الأمن السيبراني — المستوى الثاني. مهتم بأمن التطبيقات وتطوير الواجهات.",
    color: COLORS.cyan,
  },
  {
    name: "أحمد الهيدمة",
    role: "مطور Backend",
    bio: "طالب في الأمن السيبراني — المستوى الثاني. متخصص في قواعد البيانات وأمن الشبكات.",
    color: COLORS.purple,
  },
];

export function TeamSection() {
  return (
    <SectionWrapper id="team-section">
      <div
        style={{
          padding: "80px 20px",
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "#fff", fontWeight: 800, marginBottom: 8 }}>
          فريق التطوير
        </h2>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginBottom: 40 }}>
          طلاب الأمن السيبراني — جامعة ذمار
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {TEAM.map((member) => (
            <div
              key={member.name}
              style={{
                background: COLORS.glass,
                border: `1px solid ${member.color}33`,
                borderRadius: "20px",
                padding: "32px 24px",
                maxWidth: 320,
                width: "100%",
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${member.color}, #007bff)`,
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {member.name.charAt(0)}
              </div>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>
                {member.name}
              </h3>
              <p style={{ color: member.color, fontSize: "0.85rem", fontWeight: 600, margin: "0 0 10px" }}>
                {member.role}
              </p>
              <p style={{ color: COLORS.muted, fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// ===================== CTA =====================
export function CTASection() {
  const router = useRouter();
  return (
    <SectionWrapper id="cta-section">
      <div
        style={{
          padding: "80px 20px 100px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: COLORS.glass,
            border: `1px solid ${COLORS.cyan}22`,
            borderRadius: "24px",
            padding: "48px 32px",
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", color: "#fff", fontWeight: 800, marginBottom: 12, position: "relative" }}>
            هل أنت مستعد؟
          </h2>
          <p style={{ color: COLORS.muted, fontSize: "0.95rem", marginBottom: 28, position: "relative", lineHeight: 1.7 }}>
            رحلتك التعليمية تبدأ الآن. سجّل الدخول واستفد من كل مميزات المنصة.
          </p>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "16px 48px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #00e5ff, #007bff)",
              color: COLORS.darker,
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 8px 30px rgba(0,229,255,0.3)",
              position: "relative",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🚀 ابدأ الآن
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
