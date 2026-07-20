"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import NeonParticles from "@/components/effects/NeonParticles";
import { getDevicePerformance, type PerformanceLevel } from "@/lib/devicePerformance";

const CyberGlobe = dynamic(() => import("@/components/effects/CyberGlobe"), {
  ssr: false,
});

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/activate", "/forgot-password"];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));
}

export default function EffectsManager() {
  const pathname = usePathname();
  const show = isPublicPage(pathname);
  const [level, setLevel] = useState<PerformanceLevel>("medium");

  useEffect(() => {
    setLevel(getDevicePerformance());
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 quantum-grid opacity-20" />
      {level === "high" && (
        <div className="absolute inset-0 opacity-80">
          <CyberGlobe />
        </div>
      )}
      {level !== "low" && (
        <div className="absolute inset-0">
          <NeonParticles />
        </div>
      )}
    </div>
  );
}
