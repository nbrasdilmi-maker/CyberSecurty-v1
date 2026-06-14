"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import ScanLine from "@/components/effects/ScanLine";
import MatrixRain from "@/components/effects/MatrixRain";
import NeonParticles from "@/components/effects/NeonParticles";

const CyberGlobe = dynamic(() => import("@/components/effects/CyberGlobe"), {
  ssr: false,
});

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/activate", "/forgot-password"];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export default function EffectsManager() {
  const pathname = usePathname();
  const show = isPublicPage(pathname);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 quantum-grid opacity-20" />
      <div className="absolute inset-0 opacity-80">
        <CyberGlobe />
      </div>
      <div className="absolute inset-0">
        <NeonParticles />
      </div>
      <div className="absolute inset-0 opacity-25">
        <MatrixRain />
      </div>
      <ScanLine />
    </div>
  );
}
