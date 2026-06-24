"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VerticalWheelPicker from "./VerticalWheelPicker";
import type { Subject } from "./mockData";

interface Props {
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSubjectSelect: (s: Subject) => void;
  file: File | null;
  uploading: boolean;
  uploadProgress: number;
  onUpload: () => void;
  onFileChange: (f: File | null) => void;
  disabled?: boolean;
}

const glassCard: React.CSSProperties = {
  background: "rgba(5,15,35,0.75)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(0,180,255,0.15)",
  borderRadius: "24px",
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "\u{1F4C4}";
  if (["doc", "docx"].includes(ext || "")) return "\u{1F4DD}";
  if (["zip", "rar", "7z"].includes(ext || "")) return "\u{1F4E6}";
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext || "")) return "\u{1F5BC}\uFE0F";
  return "\u{1F4CE}";
};

export default function UploadSection({
  subjects,
  selectedSubject,
  onSubjectSelect,
  file,
  uploading,
  uploadProgress,
  onUpload,
  onFileChange,
  disabled,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dndHover, setDndHover] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...glassCard,
        padding: "28px 24px",
        border: "1px solid rgba(0,180,255,0.12)",
      }}
    >
      <h3
        style={{
          color: "#0ea5e9",
          fontSize: "1.05rem",
          fontWeight: 800,
          margin: "0 0 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        رفع تكليف جديد
      </h3>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "rgba(0,180,255,0.7)",
            marginBottom: "8px",
            textAlign: "center",
            letterSpacing: "0.3px",
          }}
        >
          ⚡ اختر المادة (استخدم عجلة الفأرة أو اللمس)
        </label>
        <VerticalWheelPicker
          items={subjects}
          onSelect={onSubjectSelect}
          selected={selectedSubject}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFileChange(f); }}
          onClick={() => !uploading && fileRef.current?.click()}
          onMouseEnter={() => setDndHover(true)}
          onMouseLeave={() => setDndHover(false)}
          animate={{
            borderColor: file
              ? "rgba(34,197,94,0.5)"
              : dragOver
                ? "#00c8ff"
                : dndHover
                  ? "rgba(0,200,255,0.6)"
                  : "rgba(0,200,255,0.25)",
            boxShadow: dndHover || dragOver
              ? "0 0 15px rgba(0,200,255,0.35)"
              : file
                ? "0 0 10px rgba(34,197,94,0.2)"
                : "none",
          }}
          transition={{ duration: 0.3 }}
          style={{
            borderRadius: "18px",
            border: "2px dashed rgba(0,200,255,0.25)",
            background: "rgba(0,180,255,0.03)",
            padding: "36px 20px",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          <motion.div
            animate={{ y: dndHover ? -4 : 0, scale: dndHover ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {file ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 22px",
                  borderRadius: "16px",
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.15)",
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                  {fileIcon(file.name)}
                </span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#e6edf3", fontWeight: 700, fontSize: "0.85rem" }}>
                    {file.name}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
                    {formatSize(file.size)}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    color: "#EF4444",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </motion.button>
              </div>
            ) : (
              <>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px", display: "block" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 600 }}>
                  اسحب الملف إلى هنا أو <span style={{ color: "#0ea5e9", textDecoration: "underline" }}>اختر ملفاً</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", marginTop: "6px" }}>
                  PDF, DOC, ZIP — حد أقصى 20MB
                </div>
              </>
            )}
          </motion.div>
          <input
            ref={fileRef}
            type="file"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {(uploading || uploadProgress > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 6,
                background: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.15 }}
                style={{
                  height: "100%",
                  borderRadius: 6,
                  background: uploadProgress >= 100
                    ? "linear-gradient(90deg, #22C55E, #16A34A)"
                    : "linear-gradient(90deg, #0ea5e9, #2563eb, #4f46e5)",
                  boxShadow: uploadProgress >= 100
                    ? "0 0 15px rgba(34,197,94,0.4)"
                    : "0 0 15px rgba(37,99,235,0.3)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: "0.72rem",
                color: uploadProgress >= 100 ? "#22C55E" : "rgba(255,255,255,0.5)",
              }}
            >
              <span>{uploadProgress >= 100 ? "✓ تم الرفع بنجاح" : uploading ? "جاري الرفع..." : ""}</span>
              <span style={{ fontWeight: 700 }}>{Math.round(uploadProgress)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={!uploading && selectedSubject && file ? { y: -2, boxShadow: "0 0 25px rgba(37,99,235,0.4)" } : {}}
        whileTap={!uploading && selectedSubject && file ? { scale: 0.98 } : {}}
        onClick={onUpload}
        disabled={uploading || !selectedSubject || !file}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "16px",
          border: "none",
          background: uploading
            ? "linear-gradient(90deg, #555, #444)"
            : uploadProgress >= 100
              ? "linear-gradient(90deg, #22C55E, #16A34A)"
              : "linear-gradient(90deg, #0ea5e9, #2563eb, #4f46e5)",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 800,
          cursor: uploading || !selectedSubject || !file ? "not-allowed" : "pointer",
          opacity: uploading || !selectedSubject || !file ? 0.5 : 1,
          letterSpacing: "0.3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {uploading ? "جاري الرفع..." : uploadProgress >= 100 ? "✓ تم الرفع" : "رفع التكليف"}
      </motion.button>
    </motion.div>
  );
}


