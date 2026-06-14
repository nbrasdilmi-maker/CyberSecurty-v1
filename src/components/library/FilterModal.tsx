"use client";
import { motion } from "framer-motion";
import { CloseIcon, SearchIcon } from "@/components/library/icons";

interface FilterModalProps {
  filterSearch: string;
  setFilterSearch: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterSubject: string;
  setFilterSubject: (value: string) => void;
  subjects: Array<{ id: string; name: string; code: string }>;
  setShowFilterModal: (value: boolean) => void;
  loadContent: () => void;
  glassStyle: React.CSSProperties;
  inputStyle: React.CSSProperties;
}

const FilterModal = ({
  filterSearch,
  setFilterSearch,
  filterType,
  setFilterType,
  filterSubject,
  setFilterSubject,
  subjects,
  setShowFilterModal,
  loadContent,
  glassStyle,
  inputStyle,
}: FilterModalProps) => {
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
        if (e.target === e.currentTarget) setShowFilterModal(false);
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
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
              color: "#00e5ff",
              fontSize: "1.3rem",
              fontWeight: 800,
              margin: 0,
            }}
          >
            🔍 فلترة المكتبة
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilterModal(false)}
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

        {/* بحث */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            بحث بالعنوان
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="ابحث عن منشور..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ ...inputStyle, paddingRight: "40px" }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8b949e",
              }}
            >
              <SearchIcon />
            </span>
          </div>
        </div>

        {/* نوع المحتوى */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            نوع المحتوى
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { value: "", label: "الكل" },
              { value: "PDF", label: "📄 PDF" },
              { value: "DOCX", label: "📝 Word" },
              { value: "XLSX", label: "📊 Excel" },
              { value: "PNG", label: "🖼️ PNG" },
              { value: "JPG", label: "🖼️ JPG" },
              { value: "YOUTUBE_LINK", label: "▶️ يوتيوب" },
              { value: "MP3", label: "🎵 صوت" },
            ].map((f) => (
              <motion.button
                key={f.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(f.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  background:
                    filterType === f.value
                      ? "rgba(0,229,255,0.12)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    filterType === f.value
                      ? "1px solid #00e5ff"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: filterType === f.value ? "#00e5ff" : "#8b949e",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* المادة (للطلاب والمعلمين) */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#8b949e",
              fontSize: "0.85rem",
              marginBottom: "8px",
              display: "block",
            }}
          >
            المادة الدراسية
          </label>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="">جميع المواد</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* أزرار */}
        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFilterType("");
              setFilterSubject("");
              setFilterSearch("");
              setShowFilterModal(false);
            }}
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
            مسح الكل
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowFilterModal(false);
              loadContent();
            }}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00e5ff, #0077b6)",
              border: "none",
              color: "#010204",
              cursor: "pointer",
              fontWeight: 800,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            تطبيق الفلترة
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterModal;
