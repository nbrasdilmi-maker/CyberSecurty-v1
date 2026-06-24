"use client";
import { motion } from "framer-motion";
interface SparklineProps { data: number[]; color: string; width?: number; height?: number; }
export default function Sparkline({ data, color, width = 120, height = 40 }: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => { const x = (i / (data.length - 1)) * width; const y = height - ((v - min) / range) * (height - 4) - 2; return `${x},${y}`; });
  const polyline = pts.join(" ");
  const areaPts = `${pts[0].split(",")[0]},${height} ${polyline} ${pts[pts.length - 1].split(",")[0]},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0 }}>
      <defs><linearGradient id={`spark-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0.01" /></linearGradient></defs>
      <polygon points={areaPts} fill={`url(#spark-grad-${color.replace("#", "")})`} />
      <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}