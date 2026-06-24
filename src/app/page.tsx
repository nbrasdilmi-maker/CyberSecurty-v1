"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MatrixRain from "@/components/effects/MatrixRain";
import NeonParticles from "@/components/effects/NeonParticles";
import ScanLine from "@/components/effects/ScanLine";
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

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

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
      <ScanLine />

      <div style={{ position: "relative", zIndex: 5 }}>
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(1,2,4,0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00e5ff, #007bff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: 900,
                color: "#010204",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              CS
            </div>
            <span style={{ color: "#00e5ff", fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Orbitron', sans-serif" }}>
              CYBER CLOUD
            </span>
          </div>

          <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[
              { label: "الرئيسية", href: "#hero" },
              { label: "إحصائيات", href: "#stats-section" },
              { label: "الأدوار", href: "#roles-section" },
              { label: "المميزات", href: "#features-section" },
              { label: "كيفية العمل", href: "#process-section" },
              { label: "المطورون", href: "#team-section" },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8b949e",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#00e5ff"; e.currentTarget.style.background = "rgba(0,229,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#8b949e"; e.currentTarget.style.background = "transparent"; }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #00e5ff, #007bff)",
                color: "#010204",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
                marginRight: 4,
              }}
            >
              تسجيل الدخول
            </button>
          </nav>
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

        <footer
          style={{
            textAlign: "center",
            padding: "24px 20px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "#8b949e",
            fontSize: "0.8rem",
          }}
        >
          سحابة الأمن السيبراني © {new Date().getFullYear()} — جامعة ذمار - كلية الحاسبات
          <br />
          تم التطوير بواسطة: محمد إبراهيم الديلمي & أحمد الهيدمة
        </footer>
      </div>
    </main>
  );
}
