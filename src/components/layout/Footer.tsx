export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "8px 20px",
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
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "clamp(0.6rem, 1vw, 0.72rem)", color: "#8b949e" }}>
        تطوير وإشراف:
      </span>
      <span
        style={{
          color: "#00e5ff",
          fontWeight: 600,
          fontSize: "clamp(0.62rem, 1vw, 0.75rem)",
          textShadow: "0 0 8px rgba(0,229,255,0.2)",
        }}
      >
        محمد إبراهيم الديلمي | أحمد الهيدمة
      </span>
      <span style={{ color: "#30363d", fontSize: "0.6rem" }}>|</span>
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.5rem, 0.8vw, 0.6rem)",
          color: "#5a6a7a",
          letterSpacing: "0.5px",
        }}
      >
        CYBER SECURITY CLOUD — DHAMAR UNIVERSITY &copy; 2026
      </span>
    </footer>
  );
}
