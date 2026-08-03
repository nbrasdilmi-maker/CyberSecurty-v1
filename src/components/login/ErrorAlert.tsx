"use client";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      style={{
        background: "rgba(248, 81, 73, 0.1)",
        border: "1px solid #f85149",
        color: "#f85149",
        padding: "12px",
        borderRadius: "12px",
        marginBottom: "15px",
        fontSize: "0.9rem",
      }}
    >
      {message}
    </div>
  );
}