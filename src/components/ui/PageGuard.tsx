"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import MaintenancePage from "./MaintenancePage";

const statusCache = new Map<string, { isDisabled: boolean; title: string | null; message: string | null }>();

interface PageGuardProps {
  pageKey: string;
  children: ReactNode;
}

export default function PageGuard({ pageKey, children }: PageGuardProps) {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const [status, setStatus] = useState<{
    isDisabled: boolean;
    title: string | null;
    message: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRoute = useRef<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const route = window.location.pathname;

    const cached = statusCache.get(pageKey);
    if (cached) {
      setStatus(cached);
      setLoading(false);
      if (cached.isDisabled && !isAdmin) {
        showToast("هذه الصفحة متوقفة مؤقتاً", "warning");
      }
      return;
    }

    if (fetchedRoute.current === route) return;
    fetchedRoute.current = route;

    setLoading(true);
    fetch(`/api/page-control/status?route=${encodeURIComponent(route)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const record = json.data[0];
          const stat = {
            isDisabled: record.isDisabled,
            title: record.maintenanceTitle,
            message: record.maintenanceMessage,
          };
          statusCache.set(pageKey, stat);
          setStatus(stat);
          if (stat.isDisabled && !isAdmin) {
            showToast("هذه الصفحة متوقفة مؤقتاً", "warning");
          }
        } else {
          setStatus({ isDisabled: false, title: null, message: null });
        }
      })
      .catch(() => {
        setStatus({ isDisabled: false, title: null, message: null });
      })
      .finally(() => setLoading(false));
  }, [pageKey, isAdmin, showToast]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#010204",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid rgba(0,229,255,0.2)",
            borderTopColor: "#00e5ff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status?.isDisabled && !isAdmin) {
    return (
      <MaintenancePage
        title={status.title || undefined}
        message={status.message || undefined}
      />
    );
  }

  return <>{children}</>;
}
