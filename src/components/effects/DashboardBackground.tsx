"use client";

import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

const DASHBOARD_PATHS = [
  "/student", "/teacher", "/admin", "/management",
  "/chat", "/library", "/notifications", "/settings",
  "/code-editor",
];

function isDashboard(pathname: string) {
  return DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default function DashboardBackground() {
  const pathname = usePathname();
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el || !isDashboard(pathname)) return;

    const onMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 10;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 10;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [pathname]);

  if (!isDashboard(pathname)) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0 bg-cover bg-center transition-[transform] duration-200 ease-out will-change-transform"
        style={{
          backgroundImage: `url(/images/backgrounds/dashboard-bg.webp)`,
          backgroundPosition: "center",
          filter: "brightness(0.45) saturate(0.85)",
        }}
        ref={parallaxRef}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B131A]/90 via-[#0B131A]/30 to-[#0B131A]/50" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(0,240,255,0.08) 0%, transparent 60%)",
          animation: "dashPulse 4s ease-in-out infinite alternate",
        }}
      />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse 40% 40% at 70% 60%, rgba(255,153,51,0.06) 0%, transparent 50%)",
          animation: "dashPulse 6s ease-in-out infinite alternate-reverse",
        }}
      />

      <style>{`
        @keyframes dashPulse {
          0% { opacity: 0.15; transform: scale(1); }
          100% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
