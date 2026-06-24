"use client";

import { motion, AnimatePresence } from "framer-motion";

interface EvalItem {
  student: { name: string };
  subject: { name: string };
}

interface Props {
  item: EvalItem | null;
  grade: string;
  feedback: string;
  loading: boolean;
  error: string;
  onGradeChange: (v: string) => void;
  onFeedbackChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.15)",
  borderRadius: "20px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(0, 0, 0, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  color: "#e6edf3",
  fontSize: "0.95rem",
  fontFamily: "'Cairo', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function EvaluationModal({
  item, grade, feedback, loading, error,
  onGradeChange, onFeedbackChange, onSave, onClose,
}: Props) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...glassStyle,
              padding: "30px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 0 60px rgba(0,229,255,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  color: "#00e5ff",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                📝 تقييم التكليف
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b949e",
                  cursor: "pointer",
                }}
              >
                <CloseIcon />
              </motion.button>
            </div>
            <p
              style={{
                color: "#8b949e",
                textAlign: "center",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              {item.student.name} - {item.subject.name}
            </p>

            {error && (
              <div
                style={{
                  textAlign: "center",
                  color: "#f85149",
                  background: "rgba(248,81,73,0.1)",
                  border: "1px solid rgba(248,81,73,0.3)",
                  padding: "10px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label
                  style={{
                    display: "block",
                    color: "#8b949e",
                    marginBottom: "6px",
                    textAlign: "center",
                  }}
                >
                  الدرجة (اختياري — 0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => onGradeChange(e.target.value)}
                  style={inputStyle}
                  placeholder="اتركه فارغاً إذا لم ترغب"
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#8b949e",
                  marginBottom: "6px",
                  textAlign: "center",
                }}
              >
                ملاحظات (اختياري)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "80px",
                  textAlign: "right",
                }}
                placeholder="أضف ملاحظاتك هنا..."
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "#8b949e",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                إلغاء
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #238636, #2ea043)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "0.9rem",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "⏳..." : "✅ حفظ التقييم"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
