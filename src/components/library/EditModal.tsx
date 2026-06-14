"use client";
import { motion } from "framer-motion";
import { CloseIcon } from "@/components/library/icons";

interface EditModalProps {
  editTitle: string;
  setEditTitle: (value: string) => void;
  editDesc: string;
  setEditDesc: (value: string) => void;
  editSubjectId: string;
  setEditSubjectId: (value: string) => void;
  subjects: Array<{ id: string; name: string; code: string }>;
  handleSaveEdit: () => void;
  onClose: () => void;
  glassStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

const EditModal = ({
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editSubjectId,
  setEditSubjectId,
  subjects,
  handleSaveEdit,
  onClose,
  glassStyle,
  inputStyle,
}: EditModalProps) => {
  return (
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        style={{
          ...glassStyle,
          maxWidth: "500px",
          width: "100%",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h3
            style={{
              color: "#ffca28",
              fontSize: "1.3rem",
              fontWeight: 800,
              margin: 0,
            }}
          >
            ✏️ تعديل المنشور
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

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            العنوان
          </label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            الوصف
          </label>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            المادة
          </label>
          <select
            value={editSubjectId}
            onChange={(e) => setEditSubjectId(e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="">بدون مادة</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#8b949e",
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            إلغاء
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveEdit}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ffca28, #e3b341)",
              border: "none",
              color: "#010204",
              cursor: "pointer",
              fontWeight: 800,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            💾 حفظ التعديلات
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditModal;
