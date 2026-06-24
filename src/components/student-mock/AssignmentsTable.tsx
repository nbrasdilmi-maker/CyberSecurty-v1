"use client";

import { motion } from "framer-motion";

export interface AssignmentItem {
  id: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  evaluatedAt?: string;
  subject: { id: string; name: string; code: string };
}

interface Props {
  items: AssignmentItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onViewFile: (url: string) => void;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const cellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.8rem",
  color: "#e6edf3",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  whiteSpace: "nowrap",
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  color: "#12C7FF",
  fontWeight: 700,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  borderBottom: "1px solid rgba(18,199,255,0.15)",
};

const statusBadge = (status: string, grade?: number) => {
  if (status === "evaluated") {
    const g = grade ?? 0;
    const color = g >= 90 ? "#22C55E" : g >= 75 ? "#EAB308" : "#EF4444";
    return (
      <span
        style={{
          padding: "3px 10px",
          borderRadius: "20px",
          fontSize: "0.7rem",
          fontWeight: 700,
          background: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        {g}%
      </span>
    );
  }
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: 600,
        background: "rgba(234,179,8,0.12)",
        color: "#EAB308",
        border: "1px solid rgba(234,179,8,0.25)",
      }}
    >
      قيد الانتظار
    </span>
  );
};

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" });
};

const btnBase: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: "8px",
  border: "none",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

export default function AssignmentsTable({
  items,
  loading,
  page,
  totalPages,
  onPageChange,
  onDelete,
  onViewFile,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...glassStyle,
        padding: "20px",
        border: "1px solid rgba(34,197,94,0.12)",
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          color: "#22C55E",
          fontSize: "1rem",
          fontWeight: 700,
          margin: "0 0 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        سجل التكاليف المرفوعة
      </h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#8b949e" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(34,197,94,0.2)",
              borderTopColor: "#22C55E",
              borderRadius: "50%",
              margin: "0 auto 12px",
            }}
          />
          جاري التحميل...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📭</div>
          <p style={{ color: "#8b949e", fontSize: "0.95rem" }}>لا توجد تكاليف بعد</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>المادة</th>
                  <th style={headerCellStyle}>اسم الملف</th>
                  <th style={headerCellStyle}>تاريخ الرفع</th>
                  <th style={headerCellStyle}>الحالة</th>
                  <th style={headerCellStyle}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a: AssignmentItem) => (
                  <tr key={a.id}>
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{a.subject.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#8b949e" }}>{a.subject.code}</div>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9FB3C8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span style={{ color: "#9FB3C8" }}>{a.fileName}</span>
                      </div>
                    </td>
                    <td style={cellStyle}>{formatDate(a.createdAt)}</td>
                    <td style={cellStyle}>{statusBadge(a.status, a.grade)}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {a.fileUrl && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onViewFile(a.fileUrl!)}
                            title="فتح الملف"
                            style={{
                              ...btnBase,
                              background: "rgba(18,199,255,0.12)",
                              color: "#12C7FF",
                              border: "1px solid rgba(18,199,255,0.2)",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            فتح
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(a.id)}
                          title="حذف التكليف"
                          style={{
                            ...btnBase,
                            background: "rgba(239,68,68,0.12)",
                            color: "#EF4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          حذف
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "14px" }}>
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: page <= 1 ? "#555" : "#e6edf3",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                }}
              >
                السابق
              </button>
              <span style={{ fontSize: "0.8rem", color: "#9FB3C8" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: page >= totalPages ? "#555" : "#e6edf3",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                }}
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
