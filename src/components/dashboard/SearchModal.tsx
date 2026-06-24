"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuth } from "@/hooks/useAuth";

interface SearchItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  color: string;
  roles: string[];
}

const allSearchItems: SearchItem[] = [
  { id: "/dashboard", label: "الرئيسية", icon: "🏠", path: "/dashboard", color: "#00e5ff", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
  { id: "/notifications", label: "سجل الإشعارات", icon: "🔔", path: "/notifications", color: "#ffca28", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
  { id: "/library", label: "المكتبة التعليمية", icon: "📚", path: "/library", color: "#00e5ff", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
  { id: "/code-editor", label: "محرر الأكواد", icon: "💻", path: "/code-editor", color: "#00e5ff", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
  { id: "/chat", label: "المحادثة", icon: "💬", path: "/chat", color: "#39ff14", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
  { id: "/admin/generation", label: "إدارة التوليد", icon: "🏗️", path: "/admin/generation", color: "#bf5af2", roles: ["ADMIN", "MANAGEMENT"] },
  { id: "/admin/audit-log", label: "سجل العمليات", icon: "📜", path: "/admin/audit-log", color: "#ffca28", roles: ["ADMIN"] },
  { id: "/management/audit-log", label: "سجل العمليات", icon: "📜", path: "/management/audit-log", color: "#ffca28", roles: ["MANAGEMENT"] },
  { id: "/teacher/audit-log", label: "المهام المنجزة", icon: "📋", path: "/teacher/audit-log", color: "#bf5af2", roles: ["TEACHER"] },
  { id: "/admin/promotions", label: "ترقية المستخدمين", icon: "⬆️", path: "/admin/promotions", color: "#ff6b6b", roles: ["ADMIN", "MANAGEMENT"] },
  { id: "/admin/server-usage", label: "استهلاك السيرفر", icon: "💻", path: "/admin/server-usage", color: "#39ff14", roles: ["ADMIN"] },
  { id: "/management/server-usage", label: "استهلاك السيرفر", icon: "💻", path: "/management/server-usage", color: "#39ff14", roles: ["MANAGEMENT"] },
  { id: "/admin/activated-accounts", label: "حسابات مفعلة", icon: "📋", path: "/admin/activated-accounts", color: "#2ea043", roles: ["ADMIN", "MANAGEMENT"] },
  { id: "/admin/security-radar", label: "رادار الأخطاء", icon: "🛡️", path: "/admin/security-radar", color: "#f85149", roles: ["ADMIN"] },
  { id: "/admin/bot-control", label: "التحكم بالبوت", icon: "🤖", path: "/admin/bot-control", color: "#a855f7", roles: ["ADMIN"] },
  { id: "/admin/semester", label: "إدارة الترم", icon: "📅", path: "/admin/semester", color: "#bf5af2", roles: ["ADMIN", "MANAGEMENT"] },
  { id: "/admin/page-control", label: "كنترول المنصة", icon: "🎛️", path: "/admin/page-control", color: "#00e5ff", roles: ["ADMIN"] },
  { id: "/announcements/create", label: "نشر تعميم", icon: "📢", path: "/announcements/create", color: "#ffca28", roles: ["ADMIN", "MANAGEMENT", "TEACHER"] },
  { id: "/teacher/grades", label: "توزيع الدرجات", icon: "📝", path: "/teacher/grades", color: "#bf5af2", roles: ["TEACHER"] },
  { id: "/settings", label: "إعدادات الحساب", icon: "⚙️", path: "/settings", color: "#8b949e", roles: ["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT"] },
];
export default function SearchModal() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { searchOpen: open, setSearchOpen: setOpen } = useUIStore();
  const { role, managementLevel } = useAuth();

  const userRole = role || "STUDENT";
  const validManagementLevels = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"];
  const hasValidManagement = managementLevel && managementLevel !== "null" && managementLevel !== "undefined" && validManagementLevels.includes(managementLevel);
  const effectiveRoles = [userRole];
  if (hasValidManagement) effectiveRoles.push("MANAGEMENT");

  const seenLabels = new Set<string>();
  const searchableItems = allSearchItems.filter((item) => {
    if (!effectiveRoles.some((r) => item.roles.includes(r))) return false;
    if (seenLabels.has(item.label)) return false;
    seenLabels.add(item.label);
    return true;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(!open); } if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);
  useEffect(() => { if (open && inputRef.current) { inputRef.current.focus(); setQuery(""); } }, [open]);
  const filtered = query ? searchableItems.filter((item) => item.label.includes(query)) : searchableItems;
  const handleSelect = useCallback((path: string) => { setOpen(false); router.push(path); }, [router, setOpen]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 0 : -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 0 : -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed", zIndex: 301, overflow: "hidden",
              display: "flex", flexDirection: "column",
              background: "rgba(10, 20, 40, 0.4)", backdropFilter: "blur(50px)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(0, 229, 255, 0.06)",
              ...(isMobile
                ? { top: "8px", left: "8px", right: "8px", bottom: "8px", borderRadius: "14px" }
                : { top: "15%", left: "50%", transform: "translateX(-50%)", width: "500px", maxWidth: "calc(100vw - 40px)", maxHeight: "60vh", borderRadius: "20px" }
              ),
            }}
          >
            <div style={{ padding: isMobile ? "10px 12px 8px" : "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,229,255,0.12)", borderRadius: isMobile ? "8px" : "10px", padding: isMobile ? "6px 8px" : "10px 14px" }}>
                <span style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#8b949e", flexShrink: 0 }}>🔍</span>
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث..." style={{ background: "none", border: "none", outline: "none", color: "#e6edf3", fontFamily: "'Cairo', sans-serif", fontSize: isMobile ? "0.82rem" : "0.9rem", width: "100%" }} />
                {!isMobile && <span style={{ fontSize: "0.5rem", color: "#5a6a7a", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>ESC</span>}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "4px 6px" : "8px 10px" }}>
              {filtered.length === 0 ? (<div style={{ textAlign: "center", padding: "30px", color: "#8b949e", fontSize: "0.85rem" }}>لا توجد نتائج لـ &quot;{query}&quot;</div>) : (
                filtered.map((item) => (<motion.button key={item.id} onClick={() => handleSelect(item.path)} whileTap={{ scale: 0.97 }} style={{ width: "100%", padding: isMobile ? "8px 8px" : "10px 12px", borderRadius: "8px", border: "none", background: "transparent", color: item.color, cursor: "pointer", fontFamily: "'Cairo', sans-serif", fontSize: isMobile ? "0.72rem" : "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", textAlign: "right", transition: "all 0.15s" }}>
                  <span style={{ fontSize: isMobile ? "0.8rem" : "1rem", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: "right" }}>{item.label}</span>
                </motion.button>))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}