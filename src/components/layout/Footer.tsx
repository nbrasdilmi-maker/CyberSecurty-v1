export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "6px 20px",
        textAlign: "center",
        background: "rgba(2, 4, 8, 0.35)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderTop: "1px solid rgba(0, 229, 255, 0.04)",
        fontFamily: "'Cairo', sans-serif",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          background: "linear-gradient(90deg, #00e5ff, #7c3aed)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
          fontSize: "clamp(0.55rem, 1vw, 0.7rem)",
          letterSpacing: "0.3px",
        }}
      >
        فريق "طليعة الأمن السيبراني" | Cyber Vanguard
      </span>
      <span style={{ color: "#30363d", fontSize: "0.55rem" }}>|</span>
      <span
        style={{
          color: "#8b949e",
          fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)",
          fontWeight: 500,
        }}
      >
        محمد إبراهيم الديلمي · أحمد الهيدمة · عبدالجليل الجبلي · أسامة شرهان ·
        قناف العجيبي
      </span>
      <span style={{ color: "#30363d", fontSize: "0.55rem" }}>|</span>
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.45rem, 0.7vw, 0.55rem)",
          color: "#5a6a7a",
          letterSpacing: "0.5px",
        }}
      >
        DHAMAR UNIVERSITY &copy; 2026
      </span>
    </footer>
  );
}
