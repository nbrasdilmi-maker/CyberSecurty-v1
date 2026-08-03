"use client";

export type DeviceType = "android" | "iphone" | "desktop";

const INSTALL_DISMISSED_KEY = "pwa_install_dismissed";
const INSTALL_COMPLETED_KEY = "pwa_install_completed";

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  return "desktop";
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export function isInstallDismissed(): boolean {
  try {
    return localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function isInstallCompleted(): boolean {
  try {
    return localStorage.getItem(INSTALL_COMPLETED_KEY) === "true";
  } catch {
    return false;
  }
}

export function markInstallDismissed(): void {
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
  } catch {}
}

export function markInstallCompleted(): void {
  try {
    localStorage.setItem(INSTALL_COMPLETED_KEY, "true");
  } catch {}
}

export function shouldShowInstallBanner(): boolean {
  if (isStandalone()) return false;
  if (isInstallCompleted()) return false;
  if (isInstallDismissed()) return false;
  const device = getDeviceType();
  return device === "android" || device === "iphone";
}
