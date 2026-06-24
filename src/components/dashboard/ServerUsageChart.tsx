"use client";
import { motion } from "framer-motion";
interface ServerUsageData { labels: string[]; cpu: number[]; ram: number[]; storage: number[]; }
interface ServerUsageChartProps { data?: ServerUsageData; }
const series = [{ key: "cpu" as const, label: "المعالج", color: "#00e5ff" }, { key: "ram" as const, label: "الذاكرة", color: "#a855f7" }, { key: "storage" as const, label: "التخزين", color: "#39ff14" }];
const defaultData: ServerUsageData = { labels: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], cpu: [45, 52, 38, 65, 55, 48, 42], ram: [62, 58, 71, 68, 73, 59, 64], storage: [34, 36, 35, 37, 36, 38, 37] };
export default function ServerUsageChart({ data = defaultData }: ServerUsageChartProps) {
  const w = 500, h = 160, padL = 32, padR = 8, padT = 10, padB = 20;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  const allVals = series.flatMap((s) => data[s.key] as number[]);
  const min = 0; const max = Math.max(...allVals, 10); const range = max - min || 1;
  const labels = data.labels;
  function linePath(data: number[]): string { return data.map((v, i) => { const x = padL + (i / (data.length - 1)) * chartW; const y = padT + chartH - ((v - min) / range) * chartH; return `${i === 0 ? "M" : "L"}${x},${y}`; }).join(" "); }
  function areaPath(data: number[], color: string): string { const firstX = padL; const lastX = padL + chartW; const bottomY = padT + chartH; const pts = data.map((v, i) => { const x = padL + (i / (data.length - 1)) * chartW; const y = padT + chartH - ((v - min) / range) * chartH; return `${x},${y}`; }).join(" L"); return `M${firstX},${bottomY} L${pts} L${lastX},${bottomY} Z`; }
  const yTicks = [0, 25, 50, 75, 100];
  return (
    <div>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#00e5ff", marginBottom: "10px" }}>📊 استخدام الخادم (آخر 7 أيام)</h3>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxHeight: "160px" }}>
        {yTicks.map((t) => { const y = padT + chartH - (t / 100) * chartH; return (<g key={t}><line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" /><text x={padL - 4} y={y + 3} textAnchor="end" fill="#8b949e" fontSize="8">{t}%</text></g>); })}
        {labels.map((l, i) => { const x = padL + (i / (labels.length - 1)) * chartW; return <text key={i} x={x} y={h - 2} textAnchor="middle" fill="#8b949e" fontSize="7">{l}</text>; })}
        {series.map((s) => { const vals = data[s.key] as number[]; return (<g key={s.key}><path d={areaPath(vals, s.color)} fill={`${s.color}08`} /><motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={linePath(vals)} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx={padL + chartW} cy={padT + chartH - ((vals[vals.length - 1] - min) / range) * chartH} r="3" fill={s.color} /></g>); })}
      </svg>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "6px" }}>
        {series.map((s) => (<div key={s.key} style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "8px", height: "3px", borderRadius: "2px", background: s.color }} /><span style={{ fontSize: "0.6rem", color: "#8b949e" }}>{s.label}</span></div>))}
      </div>
    </div>
  );
}