"use client";

interface LoginTopBarProps {
  clock: string;
}

export default function LoginTopBar({ clock }: LoginTopBarProps) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "clamp(8px, 1.5vw, 14px) clamp(12px, 5vw, 60px)",
        background: "rgba(2, 4, 8, 0.7)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.08)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        flexWrap: "wrap",
        gap: "4px",
      }}
    >
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(0.75rem, 2.5vw, 1.4rem)",
          fontWeight: 700,
          color: "#00e5ff",
          textShadow: "0 0 12px rgba(0,229,255,0.3)",
          direction: "ltr",
          whiteSpace: "nowrap",
        }}
      >
        {clock}
      </div>

      <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontSize: "clamp(0.7rem, 1.8vw, 1.1rem)",
            fontWeight: 700,
            color: "#e6edf3",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          سحابة الأمن السيبراني
        </h2>
        <p
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(0.5rem, 1.2vw, 0.7rem)",
            color: "rgba(0,229,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            margin: "1px 0 0",
          }}
        >
          Cybersecurity Cloud
        </p>
      </div>

      <div style={{ textAlign: "right", minWidth: 0 }}>
        <div
          style={{
            fontSize: "clamp(0.65rem, 2vw, 1rem)",
            color: "#e6edf3",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          جامعة ذمار - كلية الحاسبات
        </div>
        <p
          style={{
            fontSize: "clamp(0.45rem, 1.2vw, 0.65rem)",
            color: "rgba(0,229,255,0.6)",
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 500,
            margin: "1px 0 0",
          }}
        >
          Cyber Security Dept.
        </p>
      </div>
    </header>
  );
}