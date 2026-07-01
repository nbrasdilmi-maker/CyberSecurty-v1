"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BarChart3,
  Shield,
  Sparkles,
  Repeat,
  Users,
  LogIn,
} from "lucide-react";
import MatrixRain from "@/components/effects/MatrixRain";
import NeonParticles from "@/components/effects/NeonParticles";
import {
  HeroSection,
  StatsSection,
  RolesSection,
  FeaturesSection,
  ProcessSection,
  TeamSection,
  CTASection,
} from "@/components/landing/LandingSections";
import { useToast } from "@/components/ui/Toast";

const navItems = [
  { label: "الرئيسية", href: "#hero", Icon: Home },
  { label: "إحصائيات", href: "#stats-section", Icon: BarChart3 },
  { label: "الأدوار", href: "#roles-section", Icon: Shield },
  { label: "المميزات", href: "#features-section", Icon: Sparkles },
  { label: "كيفية العمل", href: "#process-section", Icon: Repeat },
  { label: "المطورون", href: "#team-section", Icon: Users },
];

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState("#hero");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboardingSeen = localStorage.getItem("onboardingSeen");
      if (!onboardingSeen) {
        localStorage.setItem("onboardingSeen", "true");
        setTimeout(() => {
          showToast("👋 مرحباً بك في سحابة الأمن السيبراني", "info");
        }, 1000);
      }
    }
  }, [showToast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );
    navItems.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setActiveSection(href);
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#010204",
        fontFamily: "'Cairo', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="absolute inset-0 quantum-grid z-0" style={{ pointerEvents: "none" }} />
      <MatrixRain />
      <NeonParticles />

      <style>{`
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 640px) {
          .label-desk { display: none; }
          .logo-desk { display: none; }
        }
        @media (min-width: 641px) {
          .label-mob { display: none; }
        }

        .nav-item {
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          scroll-snap-align: center;
          position: relative;
          transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item .glow-el {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item:hover .glow-el {
          text-shadow: 0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(0,229,255,0.15);
          color: #00e5ff !important;
        }
        .nav-item:hover .glow-icon {
          filter: brightness(1.3);
          color: #00e5ff !important;
        }

        .name-glow {
          cursor: default;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255,255,255,0.35);
        }
        .name-glow:hover {
          text-shadow: 0 0 24px rgba(0,229,255,0.6), 0 0 48px rgba(0,229,255,0.2);
          color: #00e5ff !important;
        }

        .login-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.5);
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 18px;
          border-radius: 8px;
          font-size: clamp(0.7rem, 1vw, 0.8rem);
          font-weight: 600;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .login-btn:hover {
          border-color: rgba(0,229,255,0.35);
          color: #00e5ff;
          box-shadow: 0 0 24px rgba(0,229,255,0.12);
        }

        .footer-border {
          transition: border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-border:hover {
          border-color: rgba(0,229,255,0.06) !important;
        }
        .footer-text {
          transition: color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-border:hover .footer-text {
          color: rgba(255,255,255,0.5) !important;
        }
        .footer-border:hover .footer-text-2 {
          color: rgba(255,255,255,0.35) !important;
        }

        .logo-wrap {
          transition: opacity 0.3s;
        }
        .logo-wrap:hover {
          opacity: 1 !important;
        }
        .logo-box {
          transition: box-shadow 0.4s;
        }
        .logo-box:hover {
          box-shadow: 0 0 24px rgba(0,229,255,0.25);
        }

        .active-line {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          height: 2px;
          border-radius: 1px;
          background: #00e5ff;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 5 }}>
        {/* ==================== الهيدر ==================== */}
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
          {/* اللوجو */}
          <div
            className="logo-wrap"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              opacity: 0.85,
            }}
          >
            <div
              className="logo-box"
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
              }}
            >
              CS
            </div>
            <span
              className="logo-desk"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "clamp(0.65rem, 1.1vw, 0.82rem)",
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "1px",
                transition: "color 0.3s",
              }}
            >
              CYBER CLOUD
            </span>
          </div>

          {/* شريط التنقل الدوار */}
          <div
            ref={navRef}
            className="scroll-hide"
            style={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              overflowX: "auto",
              scrollBehavior: "smooth",
              scrollSnapType: "x mandatory",
              padding: "0 2px",
              flex: "1 1 auto",
              justifyContent: "center",
            }}
          >
            {navItems.map(({ label, href, Icon }) => {
              const isActive = activeSection === href;
              return (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  title={label}
                  className="nav-item"
                  style={{
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="glow-icon"
                    style={{
                      color: isActive ? "#00e5ff" : "rgba(255,255,255,0.4)",
                      transition: "all 0.4s",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="label-desk glow-el"
                    style={{
                      fontSize: "clamp(0.6rem, 0.85vw, 0.75rem)",
                      color: isActive ? "#00e5ff" : "rgba(255,255,255,0.4)",
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: "nowrap",
                      transition: "all 0.4s",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="label-mob glow-el"
                    style={{
                      fontSize: "0.65rem",
                      color: isActive ? "#00e5ff" : "rgba(255,255,255,0.4)",
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: "nowrap",
                      transition: "all 0.4s",
                    }}
                  >
                    {label.slice(0, 4)}
                  </span>
                  <div
                    className="active-line"
                    style={{
                      width: isActive ? 16 : 0,
                      boxShadow: isActive ? "0 0 8px rgba(0,229,255,0.5)" : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* زر الدخول */}
          <button
            onClick={() => router.push("/login")}
            className="login-btn"
          >
            <LogIn size={14} strokeWidth={1.5} />
            <span className="label-desk">تسجيل الدخول</span>
            <span className="label-mob">دخول</span>
          </button>
        </header>

        <div id="hero">
          <HeroSection />
        </div>
        <StatsSection />
        <RolesSection />
        <FeaturesSection />
        <ProcessSection />
        <TeamSection />
        <CTASection />

        {/* ==================== الفوتر ==================== */}
        <footer
          className="footer-border"
          style={{
            textAlign: "center",
            padding: "clamp(20px, 4vw, 36px) 24px",
            background: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <div
            className="footer-text"
            style={{
              fontSize: "clamp(0.6rem, 1.1vw, 0.78rem)",
              color: "rgba(255,255,255,0.3)",
              fontWeight: 400,
              letterSpacing: "0.3px",
            }}
          >
            سحابة الأمن السيبراني © {new Date().getFullYear()} — جامعة ذمار · كلية الحاسبات
          </div>
          <div
            className="footer-text-2"
            style={{
              fontSize: "clamp(0.55rem, 1vw, 0.68rem)",
              color: "rgba(255,255,255,0.18)",
              fontWeight: 400,
              marginTop: 6,
              letterSpacing: "0.2px",
            }}
          >
            فريق التطوير:{" "}
            <span className="name-glow">محمد إبراهيم الديلمي</span>
            <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>|</span>
            <span className="name-glow">أحمد الهيدمة</span>
            <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>|</span>
            <span className="name-glow">عبدالجليل الجبلي</span>
            <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>|</span>
            <span className="name-glow">أسامة شرهان</span>
            <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 4px" }}>|</span>
            <span className="name-glow">قناف العجيبي</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
