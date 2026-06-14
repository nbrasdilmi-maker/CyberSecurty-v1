"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import MaintenancePage from "./MaintenancePage";

const PUBLIC_PATHS = ["/", "/login", "/onboarding", "/activate", "/forgot-password"];
const PAGE_KEY_MAP: Record<string, string> = {
  "/dashboard": "dashboard",
  "/library": "library",
  "/code-editor": "code-editor",
  "/chat": "chat",
  "/notifications": "notifications",
  "/settings": "settings",
  "/announcements/create": "announcements",
  "/teacher": "teacher",
  "/student": "student",
  "/management": "management",
  "/admin": "admin",
};

interface PageGuardProviderProps {
  children: ReactNode;
}

export default function PageGuardProvider({ children }: PageGuardProviderProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState<{
    title: string | null;
    message: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef<string>("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (isPublic) {
      setBlocked(null);
      setLoading(false);
      return;
    }

    const matchedKey = Object.entries(PAGE_KEY_MAP).find(([route]) =>
      pathname === route || pathname.startsWith(route + "/"),
    );

    if (!matchedKey) {
      setBlocked(null);
      setLoading(false);
      return;
    }

    const [route] = matchedKey;

    if (isAdmin) {
      setBlocked(null);
      setLoading(false);
      return;
    }

    checkedRef.current = route;
    setLoading(true);

    fetch(`/api/page-control/status?route=${encodeURIComponent(route)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const record = json.data[0];
          if (record.isDisabled) {
            setBlocked({ title: record.maintenanceTitle, message: record.maintenanceMessage });
            showToast("هذه الصفحة متوقفة مؤقتاً", "warning");
          } else {
            setBlocked(null);
          }
        } else {
          setBlocked(null);
        }
      })
      .catch(() => setBlocked(null))
      .finally(() => setLoading(false));
  }, [pathname, isAdmin, showToast]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#010204",
      }}>
        <div style={{
          width: "44px", height: "44px",
          border: "3px solid rgba(0,229,255,0.2)", borderTopColor: "#00e5ff",
          borderRadius: "50%",
          animation: "pgSpin 1s linear infinite",
        }} />
        <style>{`@keyframes pgSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (blocked) {
    return <MaintenancePage title={blocked.title || undefined} message={blocked.message || undefined} />;
  }

  return <>{children}</>;
}
