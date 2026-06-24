"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockSubjects, type Subject } from "./mockData";

const SEGMENT_COLORS = [
  "#12C7FF", "#A855F7", "#22C55E", "#EAB308",
  "#EF4444", "#EC4899", "#F97316", "#06B6D4",
];

const W = 340;
const C = W / 2;
const R = 155;
const NUM = mockSubjects.length;
const SEG = 360 / NUM;

interface Props {
  onSelect: (subject: Subject) => void;
  disabled?: boolean;
}

function buildSegments() {
  const paths: { path: string; color: string; label: string; code: string; tx: number; ty: number; rot: number }[] = [];
  for (let i = 0; i < NUM; i++) {
    const a1 = (i * SEG - 90) * (Math.PI / 180);
    const a2 = ((i + 1) * SEG - 90) * (Math.PI / 180);
    const x1 = C + R * Math.cos(a1);
    const y1 = C + R * Math.sin(a1);
    const x2 = C + R * Math.cos(a2);
    const y2 = C + R * Math.sin(a2);
    const path = `M${C},${C} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`;
    const mid = ((i + 0.5) * SEG - 90) * (Math.PI / 180);
    const tr = R * 0.6;
    const tx = C + tr * Math.cos(mid);
    const ty = C + tr * Math.sin(mid);
    paths.push({ path, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length], label: mockSubjects[i].name, code: mockSubjects[i].code, tx, ty, rot: (i + 0.5) * SEG });
  }
  return paths;
}

const SEGMENTS = buildSegments();

export default function WheelPicker({ onSelect, disabled }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spin = useCallback(() => {
    if (spinning || disabled) return;
    setSpinning(true);
    setShowResult(false);
    setSelectedIdx(null);

    const extra = 6 + Math.floor(Math.random() * 4);
    const stopIdx = Math.floor(Math.random() * NUM);
    const target = rotation + extra * 360 + (360 - stopIdx * SEG);
    setRotation(target);

    setTimeout(() => {
      setSpinning(false);
      setSelectedIdx(stopIdx);
      setShowResult(true);
      onSelect(mockSubjects[stopIdx]);
    }, 4500);
  }, [spinning, rotation, disabled, onSelect]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Pointer */}
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            marginLeft: -12,
            zIndex: 10,
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "24px solid #fff",
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))",
          }}
        />
        {/* Wheel */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.17, 0.67, 0.12, 0.99] }}
          style={{
            width: W,
            height: W,
            borderRadius: "50%",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(18,199,255,0.15), inset 0 0 30px rgba(0,0,0,0.3)",
          }}
        >
          <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
            {SEGMENTS.map((seg, i) => (
              <g key={i}>
                <path d={seg.path} fill={seg.color} opacity={0.85} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                <text
                  x={seg.tx}
                  y={seg.ty - 4}
                  fill="#fff"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >
                  {seg.label}
                </text>
                <text
                  x={seg.tx}
                  y={seg.ty + 12}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="9"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {seg.code}
                </text>
              </g>
            ))}
            <circle cx={C} cy={C} r={28} fill="#0a1428" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          </svg>
        </motion.div>
        {/* Spin button */}
        <motion.button
          whileHover={!spinning && !disabled ? { scale: 1.08 } : {}}
          whileTap={!spinning && !disabled ? { scale: 0.95 } : {}}
          onClick={spin}
          disabled={spinning || disabled}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: "2px solid #12C7FF",
            background: "linear-gradient(135deg, #0a1428, #0E8EFF)",
            color: "#fff",
            fontSize: "0.7rem",
            fontWeight: 800,
            cursor: spinning || disabled ? "not-allowed" : "pointer",
            opacity: spinning || disabled ? 0.6 : 1,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.2,
          }}
        >
          {spinning ? "..." : "دوران"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showResult && selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              marginTop: 14,
              padding: "8px 16px",
              borderRadius: 12,
              background: "rgba(18,199,255,0.08)",
              border: "1px solid rgba(18,199,255,0.2)",
              display: "inline-block",
            }}
          >
            <span style={{ color: "#9FB3C8", fontSize: "0.8rem" }}>تم اختيار: </span>
            <span style={{ color: "#12C7FF", fontWeight: 700, fontSize: "0.9rem" }}>
              {mockSubjects[selectedIdx].name} ({mockSubjects[selectedIdx].code})
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
