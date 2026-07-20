"use client";

import { useState, useEffect } from "react";
import MatrixRain from "@/components/effects/MatrixRain";
import { getDevicePerformance, type PerformanceLevel } from "@/lib/devicePerformance";

export default function AdaptiveMatrixRain() {
  const [level, setLevel] = useState<PerformanceLevel>("medium");

  useEffect(() => {
    setLevel(getDevicePerformance());
  }, []);

  if (level === "low") return null;

  return <MatrixRain />;
}
