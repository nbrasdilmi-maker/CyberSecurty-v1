"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { allMenuItems, type MenuItem } from "./SidebarMenu";
import type { LucideIcon } from "lucide-react";

function pickBottomItems(role: string, managementLevel?: string): (MenuItem & { icon: LucideIcon })[] {
  const userRole = role || "STUDENT";

  const validLevels = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"];
  const hasValidMgmt = managementLevel && managementLevel !== "null" && managementLevel !== "undefined" && validLevels.includes(managementLevel);

  const effectiveRoles = [userRole];
  if (hasValidMgmt) effectiveRoles.push("MANAGEMENT");

  const seenLabels = new Set<string>();
  const available = allMenuItems.filter((item) => {
    if (!effectiveRoles.some((r) => item.roles.includes(r))) return false;
    if (seenLabels.has(item.label)) return false;
    seenLabels.add(item.label);
    return true;
  });

  const dashboard = available.find((i) => i.label === "الرئيسية")!;
  const settings = available.find((i) => i.label === "إعدادات الحساب")!;

  const middle = available.filter(
    (i) => i.label !== "الرئيسية" && i.label !== "إعدادات الحساب"
  );

  middle.sort((a, b) => a.roles.length - b.roles.length);

  const picked = middle.slice(0, 3);

  return [dashboard, ...picked, settings];
}

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, managementLevel, user } = useAuth();

  const items = pickBottomItems(role || "STUDENT", managementLevel);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 95,
        background: "rgba(8, 15, 30, 0.85)",
        backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
        borderTop: "1px solid rgba(0, 200, 255, 0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "6px 0",
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
        height: "56px",
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path);
        const Icon = item.icon;

        return (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "2px", background: "none", border: "none",
              cursor: "pointer", padding: "4px 8px", minWidth: "52px",
              position: "relative",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActive"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  position: "absolute", top: "-6px", left: "50%",
                  transform: "translateX(-50%)",
                  width: "20px", height: "2px", borderRadius: "1px",
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}`,
                }}
              />
            )}
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              color={isActive ? item.color : "#5a6a7a"}
            />
            <span style={{
              fontSize: "0.5rem", fontWeight: isActive ? 700 : 500,
              color: isActive ? item.color : "#5a6a7a",
              fontFamily: "'Cairo', sans-serif",
            }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
