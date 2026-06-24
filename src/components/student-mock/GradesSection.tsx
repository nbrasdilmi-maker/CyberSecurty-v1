"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export interface GradeItem {
  id: string;
  grade: number;
  feedback?: string;
  subject: { id: string; name: string; code: string };
  createdAt: string;
  evaluatedAt?: string;
}

interface Props {
  grades: GradeItem[];
  loading?: boolean;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const cellStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "0.8rem",
  color: "#e6edf3",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  color: "#A855F7",
  fontWeight: 700,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: "1px solid rgba(168,85,247,0.15)",
};

const gradeColor = (g: number) => {
  if (g >= 90) return "#22C55E";
  if (g >= 75) return "#12C7FF";
  if (g >= 65) return "#EAB308";
  return "#EF4444";
};

const DonutChart = ({ average }: { average: number }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (average / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="#A855F7" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50" y="48" textAnchor="middle" fill="#e6edf3" fontSize="22" fontWeight="bold">{average}</text>
      <text x="50" y="68" textAnchor="middle" fill="#9FB3C8" fontSize="9">معدل</text>
    </svg>
  );
};

export default function GradesSection({ grades, loading }: Props) {
  const stats = useMemo(() => {
    const gr = grades.map((g) => g.grade);
    const avg = gr.length ? Math.round(gr.reduce((a, b) => a + b, 0) / gr.length) : 0;
    const highest = gr.length ? Math.max(...gr) : 0;
    const passed = gr.filter((g) => g >= 60).length;
    const passRate = gr.length ? Math.round((passed / gr.length) * 100) : 0;
    return { avg, highest, passRate, gradeCount: gr.length };
  }, [grades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...glassStyle,
        padding: "20px",
        border: "1px solid rgba(168,85,247,0.12)",
      }}
    >
      <h3
        style={{
          color: "#A855F7",
          fontSize: "1rem",
          fontWeight: 700,
          margin: "0 0 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
        الدرجات والتقييم
      </h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#8b949e" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={{
              width: "32px", height: "32px",
              border: "3px solid rgba(168,85,247,0.2)",
              borderTopColor: "#A855F7",
              borderRadius: "50%",
              margin: "0 auto 12px",
            }}
          />
          جاري التحميل...
        </div>
      ) : grades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📭</div>
          <p style={{ color: "#8b949e", fontSize: "0.95rem" }}>لا توجد درجات بعد</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "16px",
              alignItems: "center",
              marginBottom: "16px",
              padding: "14px",
              borderRadius: "14px",
              background: "rgba(168,85,247,0.05)",
              border: "1px solid rgba(168,85,247,0.1)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <DonutChart average={stats.avg} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={{ textAlign: "center", padding: "8px", borderRadius: "10px", background: "rgba(34,197,94,0.06)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#22C55E" }}>{stats.highest}</div>
                <div style={{ fontSize: "0.65rem", color: "#8b949e" }}>أعلى درجة</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px", borderRadius: "10px", background: "rgba(18,199,255,0.06)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#12C7FF" }}>{stats.avg}</div>
                <div style={{ fontSize: "0.65rem", color: "#8b949e" }}>المعدل العام</div>
              </div>
              <div style={{ textAlign: "center", padding: "8px", borderRadius: "10px", background: "rgba(168,85,247,0.06)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#A855F7" }}>{stats.passRate}%</div>
                <div style={{ fontSize: "0.65rem", color: "#8b949e" }}>نسبة النجاح</div>
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>المادة</th>
                  <th style={headerCellStyle}>الدرجة</th>
                  <th style={headerCellStyle}>التقييم</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{g.subject.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#8b949e" }}>{g.subject.code}</div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: gradeColor(g.grade) }}>
                        {g.grade}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: "#9FB3C8", fontSize: "0.78rem" }}>{g.feedback}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
}
