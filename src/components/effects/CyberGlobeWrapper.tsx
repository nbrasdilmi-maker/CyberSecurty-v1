"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const CyberGlobe = dynamic(() => import("@/components/effects/CyberGlobe"), {
  ssr: false,
});

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/activate", "/forgot-password"];

export default function CyberGlobeWrapper() {
  const pathname = usePathname();

  if (!PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)))) {
    return null;
  }

  return (
    <div className="absolute inset-0 opacity-80">
      <CyberGlobe />
    </div>
  );
}
