"use client";
import { useState, useEffect } from "react";
export type ScreenSize = "mobile" | "tablet" | "desktop";
export function useResponsive() {
  const [size, setSize] = useState<ScreenSize>("desktop");
  useEffect(() => {
    const check = () => { const w = window.innerWidth; if (w < 640) setSize("mobile"); else if (w < 1024) setSize("tablet"); else setSize("desktop"); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return { isMobile: size === "mobile", isTablet: size === "tablet", isDesktop: size === "desktop", size };
}