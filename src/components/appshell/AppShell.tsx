"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import UnifiedHeader from "./UnifiedHeader";
import UnifiedSidebar from "./UnifiedSidebar";
import Footer from "@/components/layout/Footer";
import SearchModal from "@/components/dashboard/SearchModal";
import BottomNavigation from "@/components/sidebar/BottomNavigation";
import { SidebarProvider, useSidebar } from "@/components/sidebar/SidebarContext";
import { useResponsive } from "@/hooks/useResponsive";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, isTablet } = useResponsive();
  const { isExpanded } = useSidebar();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pushRegistered = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !pushRegistered.current && "serviceWorker" in navigator) {
      pushRegistered.current = true;
      import("@/lib/pushClient").then(({ registerPushNotifications }) => {
        registerPushNotifications();
      });
    }
  }, [isAuthenticated]);

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  const SIDEBAR_WIDTH = isExpanded ? 280 : 78;
  const SIDEBAR_MARGIN = 40;
  const marginRight = !isMobile ? SIDEBAR_WIDTH + SIDEBAR_MARGIN : 0;

  return (
    <div style={{ minHeight: "100vh", color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
      <UnifiedHeader />
      <UnifiedSidebar />
      <SearchModal />
      {isMobile && <BottomNavigation />}
      <main
        style={{
          marginRight: `${marginRight}px`,
          marginTop: isMobile ? "50px" : "56px",
          marginBottom: isMobile ? "66px" : "36px",
          padding: isMobile ? "12px" : isTablet ? "20px" : "24px",
          minHeight: "calc(100vh - 92px)",
          transition: "margin-right 0.3s ease",
        }}
      >
        {children}
      </main>
      {!isMobile && <Footer />}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
