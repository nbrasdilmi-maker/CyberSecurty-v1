"use client";
import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export function AdminIcon({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className}>
      <defs>
        <linearGradient id="adminGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#0095a8" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="40" height="36" rx="10" fill="url(#adminGrad)" opacity="0.15" />
      <rect x="2" y="4" width="40" height="36" rx="10" stroke="#00e5ff" strokeWidth="1.5" opacity="0.3" />
      <path d="M22 8L32 14V22C32 29.5 27 35 22 37C17 35 12 29.5 12 22V14L22 8Z" fill="url(#adminGrad)" opacity="0.25" stroke="#00e5ff" strokeWidth="1.2" />
      <path d="M18 20L22 24L28 18" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ManagementIcon({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className}>
      <defs>
        <linearGradient id="mngGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffca28" />
          <stop offset="100%" stopColor="#e6a800" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="40" height="36" rx="10" fill="url(#mngGrad)" opacity="0.15" />
      <rect x="2" y="4" width="40" height="36" rx="10" stroke="#ffca28" strokeWidth="1.5" opacity="0.3" />
      <rect x="10" y="16" width="24" height="20" rx="4" fill="url(#mngGrad)" opacity="0.2" stroke="#ffca28" strokeWidth="1.2" />
      <rect x="14" y="20" width="6" height="6" rx="1.5" fill="#ffca28" opacity="0.5" />
      <rect x="24" y="20" width="6" height="6" rx="1.5" fill="#ffca28" opacity="0.5" />
      <rect x="14" y="28" width="16" height="4" rx="1.5" fill="#ffca28" opacity="0.3" />
      <path d="M22 8L28 14H16L22 8Z" fill="url(#mngGrad)" opacity="0.3" stroke="#ffca28" strokeWidth="1" />
    </svg>
  );
}

export function TeacherIcon({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className}>
      <defs>
        <linearGradient id="tchGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bf5af2" />
          <stop offset="100%" stopColor="#8b2fc9" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="40" height="36" rx="10" fill="url(#tchGrad)" opacity="0.15" />
      <rect x="2" y="4" width="40" height="36" rx="10" stroke="#bf5af2" strokeWidth="1.5" opacity="0.3" />
      <path d="M22 10L8 18L22 26L36 18L22 10Z" fill="url(#tchGrad)" opacity="0.2" stroke="#bf5af2" strokeWidth="1.2" />
      <path d="M12 20V28C12 28 16 32 22 32C28 32 32 28 32 28V20" stroke="#bf5af2" strokeWidth="1.2" opacity="0.6" />
      <path d="M18 24L20 26L26 20" stroke="#bf5af2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StudentIcon({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className}>
      <defs>
        <linearGradient id="stdGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#39ff14" />
          <stop offset="100%" stopColor="#1fa80a" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="40" height="36" rx="10" fill="url(#stdGrad)" opacity="0.15" />
      <rect x="2" y="4" width="40" height="36" rx="10" stroke="#39ff14" strokeWidth="1.5" opacity="0.3" />
      <path d="M22 10L10 18L22 26L34 18L22 10Z" fill="url(#stdGrad)" opacity="0.2" stroke="#39ff14" strokeWidth="1.2" />
      <path d="M14 20V27.5C14 27.5 17.5 32 22 32C26.5 32 30 27.5 30 27.5V20" stroke="#39ff14" strokeWidth="1.2" opacity="0.5" />
      <circle cx="22" cy="18" r="3" fill="#39ff14" opacity="0.3" stroke="#39ff14" strokeWidth="1" />
    </svg>
  );
}

export function getRoleIcon(role: string, size?: number) {
  const props = { size };
  switch (role?.toUpperCase()) {
    case "ADMIN": return <AdminIcon {...props} />;
    case "MANAGEMENT": return <ManagementIcon {...props} />;
    case "TEACHER": return <TeacherIcon {...props} />;
    case "STUDENT": return <StudentIcon {...props} />;
    default: return <AdminIcon {...props} />;
  }
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "آدمن النظام",
    MANAGEMENT: "الإدارة",
    TEACHER: "معلم",
    STUDENT: "طالب",
  };
  return labels[role?.toUpperCase()] || "مستخدم";
}
