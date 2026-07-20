"use client";

export type PerformanceLevel = "high" | "medium" | "low";

const STORAGE_KEY = "device_performance_level";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function getWebGLSupport(): "webgl2" | "webgl" | "none" {
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) return "webgl2";
    const gl1 = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl1) return "webgl";
    return "none";
  } catch {
    return "none";
  }
}

function getCPUCoreCount(): number {
  return navigator.hardwareConcurrency || 2;
}

function getDeviceMemory(): number {
  const nav = navigator as any;
  return nav.deviceMemory || 4;
}

function runMathBenchmark(): number {
  const iterations = 100000;
  const start = performance.now();
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sin(i) * Math.cos(i);
  }
  void result;
  return performance.now() - start;
}

function detectPerformance(): PerformanceLevel {
  const webgl = getWebGLSupport();
  const cores = getCPUCoreCount();
  const memory = getDeviceMemory();

  if (webgl === "none") return "low";

  const mathTime = runMathBenchmark();

  let score = 0;

  if (mathTime < 80) score += 3;
  else if (mathTime < 200) score += 2;
  else if (mathTime < 500) score += 1;

  if (webgl === "webgl2") score += 2;
  else score += 1;

  if (cores >= 8) score += 2;
  else if (cores >= 4) score += 1;

  if (memory >= 8) score += 2;
  else if (memory >= 4) score += 1;
  else score -= 1;

  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function getCachedLevel(): PerformanceLevel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.level;
  } catch {
    return null;
  }
}

function setCachedLevel(level: PerformanceLevel): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, timestamp: Date.now() }));
  } catch {}
}

export function getDevicePerformance(): PerformanceLevel {
  if (typeof window === "undefined") return "medium";

  const cached = getCachedLevel();
  if (cached) return cached;

  const level = detectPerformance();
  setCachedLevel(level);
  return level;
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}
