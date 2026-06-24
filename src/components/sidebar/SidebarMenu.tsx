"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useSidebar } from "./SidebarContext";
import {
  Home, Bell, BookOpen, Code, MessageSquare, Users,
  ClipboardList, ClipboardCheck, UserPlus, Server,
  UserCheck, Shield, Bot, Calendar, Sliders,
  Megaphone, BarChart3, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
  roles: string[];
  color: string;
}

export const allMenuItems: MenuItem[] = [
  { label: "الرئيسية", icon: Home, path: "/dashboard", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#00e5ff" },
  { label: "سجل الإشعارات", icon: Bell, path: "/notifications", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#ffca28" },
  { label: "المكتبة التعليمية", icon: BookOpen, path: "/library", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#00e5ff" },
  { label: "محرر الأكواد", icon: Code, path: "/code-editor", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#00e5ff" },
  { label: "المحادثة", icon: MessageSquare, path: "/chat", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#39ff14" },
  { label: "إدارة التوليد", icon: Users, path: "/admin/generation", roles: ["ADMIN", "MANAGEMENT"], color: "#bf5af2" },
  { label: "سجل العمليات", icon: ClipboardList, path: "/admin/audit-log", roles: ["ADMIN"], color: "#ffca28" },
  { label: "سجل العمليات", icon: ClipboardList, path: "/management/audit-log", roles: ["MANAGEMENT"], color: "#ffca28" },
  { label: "المهام المنجزة", icon: ClipboardCheck, path: "/teacher/audit-log", roles: ["TEACHER"], color: "#bf5af2" },
  { label: "ترقية المستخدمين", icon: UserPlus, path: "/admin/promotions", roles: ["ADMIN", "MANAGEMENT"], color: "#ff6b6b" },
  { label: "استهلاك السيرفر", icon: Server, path: "/admin/server-usage", roles: ["ADMIN"], color: "#39ff14" },
  { label: "استهلاك السيرفر", icon: Server, path: "/management/server-usage", roles: ["MANAGEMENT"], color: "#39ff14" },
  { label: "حسابات مفعلة", icon: UserCheck, path: "/admin/activated-accounts", roles: ["ADMIN", "MANAGEMENT"], color: "#2ea043" },
  { label: "رادار الأخطاء", icon: Shield, path: "/admin/security-radar", roles: ["ADMIN"], color: "#f85149" },
  { label: "التحكم بالبوت", icon: Bot, path: "/admin/bot-control", roles: ["ADMIN"], color: "#39ff14" },
  { label: "إدارة الترم", icon: Calendar, path: "/admin/semester", roles: ["ADMIN", "MANAGEMENT"], color: "#bf5af2" },
  { label: "كنترول المنصة", icon: Sliders, path: "/admin/page-control", roles: ["ADMIN"], color: "#ffca28" },
  { label: "نشر تعميم", icon: Megaphone, path: "/announcements/create", roles: ["ADMIN", "MANAGEMENT", "TEACHER"], color: "#ff3131" },
  { label: "توزيع الدرجات", icon: BarChart3, path: "/teacher/grades", roles: ["TEACHER"], color: "#bf5af2" },
  { label: "إعدادات الحساب", icon: Settings, path: "/settings", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"], color: "#8b949e" },
];

const adminPages = [
  "/admin", "/admin/generation", "/admin/activated-accounts", "/admin/audit-log",
  "/admin/security-radar", "/admin/semester", "/admin/server-usage",
  "/admin/promotions", "/admin/upgrade", "/admin/bot-control", "/admin/page-control",
];

export default function SidebarMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, managementLevel } = useAuth();
  const { isMobile } = useResponsive();
  const { isExpanded } = useSidebar();
  const setOpen = useUIStore((s) => s.setSidebarOpen);

  const userRole = role || "STUDENT";

  const validManagementLevels = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"];
  const hasValidManagement = managementLevel && managementLevel !== "null" && managementLevel !== "undefined" && validManagementLevels.includes(managementLevel);

  const effectiveRoles = [userRole];
  if (hasValidManagement) effectiveRoles.push("MANAGEMENT");

  const seenLabels = new Set<string>();
  const filteredMenu = allMenuItems.filter((item) => {
    if (!effectiveRoles.some((r) => item.roles.includes(r))) return false;
    if (seenLabels.has(item.label)) return false;
    seenLabels.add(item.label);
    return true;
  });

  return (
    <nav style={{ flex: 1, overflowY: "auto", padding: isExpanded ? "6px 8px" : "4px 0" }}>
      <AnimatePresence mode="popLayout">
        {filteredMenu.map((item, index) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
          const isAdminPath = adminPages.some((p) => pathname.startsWith(p));
          const isManagementSection = item.roles.includes("MANAGEMENT") && effectiveRoles.includes("MANAGEMENT") && userRole !== "MANAGEMENT";

          return (
            <motion.button
              key={item.label + item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{
                scale: isActive ? 1 : 1.02,
                background: isActive ? undefined : "rgba(255,255,255,0.03)",
              }}
              whileTap={{ scale: 0.97 }}
              title={isMobile || isExpanded ? undefined : item.label}
              onClick={() => { router.push(item.path); if (isMobile) setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", width: "100%",
                padding: isMobile || isExpanded ? "9px 12px" : "9px 0",
                marginBottom: "2px",
                borderRadius: "10px",
                border: isActive ? `1px solid ${item.color}30` : "1px solid transparent",
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}12, ${item.color}06)`
                  : "transparent",
                color: isActive ? item.color : "#8b949e",
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
                fontSize: isMobile || isExpanded ? "0.75rem" : "0.65rem",
                fontWeight: isActive ? 700 : 500,
                textAlign: "right",
                transition: "all 0.2s ease",
                position: "relative",
                justifyContent: isMobile || isExpanded ? "flex-start" : "center",
                overflow: "hidden",
              }}
            >
              {isManagementSection && (
                <span style={{ position: "absolute", top: "2px", left: "4px", fontSize: "0.4rem", color: "#ffca28", opacity: 0.8 }}>
                  ⭐
                </span>
              )}

              {/* أيقونة */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, width: isMobile || isExpanded ? "auto" : "100%",
                  position: "relative",
                }}>
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <item.icon size={isMobile || isExpanded ? 17 : 18} strokeWidth={isActive ? 2.2 : 1.8} />
                </motion.div>
                {/* توهج خلف الأيقونة النشطة */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveGlow"
                    style={{
                      position: "absolute", inset: "-4px", borderRadius: "50%",
                      background: `${item.color}15`, filter: "blur(4px)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>

              {/* النص — يظهر بجانب الأيقونة */}
              <motion.span
                animate={{
                  opacity: isMobile || isExpanded ? 1 : 0,
                  width: isMobile || isExpanded ? "auto" : 0,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: 1, whiteSpace: "nowrap", overflow: "hidden",
                  textAlign: "right",
                }}
              >
                {item.label}
              </motion.span>

              {/* النقطة النشطة */}
              {isActive && (
                <motion.span
                  layoutId="sidebarActiveDot"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: item.color,
                    boxShadow: `0 0 10px ${item.color}`,
                    flexShrink: 0,
                    marginRight: isMobile || isExpanded ? "0" : "auto",
                    position: isMobile || isExpanded ? "static" : "absolute",
                    right: "5px",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}
