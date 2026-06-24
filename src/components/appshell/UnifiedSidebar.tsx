"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useResponsive } from "@/hooks/useResponsive";
import { unsubscribePushNotifications } from "@/lib/pushClient";
import { useSidebar } from "@/components/sidebar/SidebarContext";
import SidebarUserCard from "@/components/sidebar/SidebarUserCard";
import SidebarMenu from "@/components/sidebar/SidebarMenu";
import SidebarStatusCard from "@/components/sidebar/SidebarStatusCard";
import SidebarLogoutButton from "@/components/sidebar/SidebarLogoutButton";

export default function UnifiedSidebar() {
  const router = useRouter();
  const { sidebarOpen: isOpen, setSidebarOpen: setOpen } = useUIStore();
  const { isMobile } = useResponsive();
  const { isExpanded, toggleExpanded } = useSidebar();
  const clearNotifications = useNotificationStore((s) => s.clearNotifications);

  const handleLogout = async () => {
    await Promise.allSettled([
      fetch("/api/auth/logout", { method: "POST" }),
      unsubscribePushNotifications(),
    ]);
    clearNotifications();
    router.push("/login");
  };

  const sidebarWidth = isExpanded ? "280px" : "78px";

  // Desktop / Tablet — شريط جانبي عائم
  if (!isMobile) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed",
          right: "20px",
          top: "76px",
          bottom: "20px",
          zIndex: 40,
          background: "rgba(8, 15, 30, 0.75)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(0, 200, 255, 0.12)",
          borderRadius: "28px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* زر التصغير */}
        <button
          onClick={toggleExpanded}
          style={{
            position: "absolute",
            top: "10px",
            zIndex: 10,
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            border: "1px solid rgba(0, 200, 255, 0.15)",
            background: "rgba(0, 200, 255, 0.06)",
            color: "#8b949e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.5rem",
            transition: "all 0.2s",
            padding: 0,
            left: isExpanded ? "8px" : "50%",
            transform: isExpanded ? "none" : "translateX(-50%)",
          }}
          title={isExpanded ? "تصغير" : "توسيع"}
        >
          {isExpanded ? "◄" : "►"}
        </button>

        <SidebarUserCard />
        <SidebarMenu />
        <SidebarStatusCard />
        <SidebarLogoutButton onLogout={handleLogout} />
      </motion.aside>
    );
  }

  // Mobile — الدراور الحالي
  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", paddingTop: "50px" }}>
      <SidebarUserCard />
      <SidebarMenu />
      <SidebarStatusCard />
      <SidebarLogoutButton onLogout={handleLogout} />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 96, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
          />
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 97,
              width: "280px", maxWidth: "calc(100vw - 40px)",
              background: "rgba(8,15,30,0.95)",
              backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
              borderLeft: "1px solid rgba(0,200,255,0.04)",
              overflowY: "auto",
            }}
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
