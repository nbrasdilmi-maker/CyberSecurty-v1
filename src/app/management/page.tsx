"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatCard from "@/components/dashboard/StatCard";
import RefreshIndicator from "@/components/dashboard/RefreshIndicator";

import ManagementStatus from "@/components/management/ManagementStatus";
import LevelDistribution from "@/components/management/LevelDistribution";
import ManagementPanel from "@/components/management/ManagementPanel";
import ManagementChart from "@/components/management/ManagementChart";
import ManagementProgress from "@/components/management/ManagementProgress";

interface ServerStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalAssignments: number;
  evaluatedAssignments: number;
  totalContent: number;
  totalSubjects: number;
}

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
  trendUp: boolean;
  sparklineData: number[];
}

function generateSparkline(points = 20): number[] {
  const data: number[] = [];
  let val = 40 + Math.random() * 30;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.5) * 15;
    val = Math.max(5, Math.min(95, val));
    data.push(Math.round(val));
  }
  return data;
}

export default function ManagementDashboard() {
  const user = useAuthStore((s) => s.user);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const userName = user?.name || "";
  const userLevel = user?.level || "";
  const managementLevel = (user as any)?.managementLevel || "";

  const getLevelLabel = (l: string) =>
    ({ LEVEL_1: "المستوى الأول", LEVEL_2: "المستوى الثاني", LEVEL_3: "المستوى الثالث", LEVEL_4: "المستوى الرابع" })[l] || l;
  const getManagementLabel = () =>
    managementLevel ? `إدارة ${getLevelLabel(managementLevel)}` : getLevelLabel(userLevel);

  const [stats, setStats] = useState<ServerStats>({
    totalUsers: 0, activeUsers: 0, pendingUsers: 0,
    totalAssignments: 0, evaluatedAssignments: 0, totalContent: 0, totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statItems, setStatItems] = useState<StatItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/server/stats");
      const data = await res.json();
      if (data.success) {
        const s = data.data as ServerStats;
        setStats(s);
        setStatItems([
          { label: "إجمالي المستخدمين", value: s.totalUsers, icon: "👥", color: "#00e5ff", trend: 12.5, trendUp: true, sparklineData: generateSparkline() },
          { label: "الحسابات المفعلة", value: s.activeUsers, icon: "✅", color: "#2ea043", trend: 8.3, trendUp: true, sparklineData: generateSparkline() },
          { label: "الحسابات المعلقة", value: s.pendingUsers, icon: "⏳", color: "#ffca28", trend: 4.2, trendUp: false, sparklineData: generateSparkline() },
          { label: "إجمالي التكاليف", value: s.totalAssignments, icon: "📤", color: "#bf5af2", trend: 15.7, trendUp: true, sparklineData: generateSparkline() },
          { label: "التكاليف المقيمة", value: s.evaluatedAssignments, icon: "📝", color: "#39ff14", trend: 11.4, trendUp: true, sparklineData: generateSparkline() },
          { label: "محتوى المكتبة", value: s.totalContent, icon: "📚", color: "#ff6b6b", trend: 9.8, trendUp: true, sparklineData: generateSparkline() },
          { label: "المواد الدراسية", value: s.totalSubjects, icon: "📘", color: "#ffca28", trend: 3.1, trendUp: true, sparklineData: generateSparkline() },
          { label: "المستخدمون النشطون", value: s.activeUsers, icon: "🟢", color: "#39ff14", trend: 0, trendUp: true, sparklineData: generateSparkline() },
        ]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); const interval = setInterval(loadData, 30000); return () => clearInterval(interval); }, [loadData]);

  const gap = "clamp(10px, 1.5vw, 16px)";

  const glassCard: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.5)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(0, 229, 255, 0.12)",
    borderRadius: "18px",
    padding: "clamp(14px, 2vw, 22px)",
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: isMobile ? "16px 10px 60px" : "24px 20px 60px", overflowX: "hidden" }}>

      {/* Row 1: الترحيب + توزيع المستويات + خدمات الإدارة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap, marginBottom: gap }}>
        <WelcomeCard userName={userName} compact={isMobile} />
        <div style={glassCard}>
          <LevelDistribution />
        </div>
        <div style={glassCard}>
          <ManagementStatus />
        </div>
      </div>

      {/* Row 2: بطاقات إحصائية */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: gap }}>
        {loading
          ? Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ background: "rgba(10,20,40,0.08)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", padding: "16px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", marginBottom: "12px" }} />
                <div style={{ height: "11px", width: "60%", background: "rgba(255,255,255,0.04)", borderRadius: "4px", marginBottom: "6px" }} />
                <div style={{ height: "22px", width: "40%", background: "rgba(255,255,255,0.06)", borderRadius: "4px" }} />
              </div>
            ))
          : statItems.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)
        }
      </div>

      {/* Row 3: لوحة الإدارة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap, marginBottom: gap }}>
        <div style={glassCard}>
          <ManagementPanel />
        </div>
      </div>

      {/* Row 4: إحصائية المهام + النشاطات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap, marginBottom: gap }}>
        <div style={glassCard}>
          <ManagementChart />
        </div>
        <div style={glassCard}>
          <div style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", marginBottom: "10px" }}>
            🔄 النشاطات المباشرة
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", right: "11px", top: "8px", bottom: "8px", width: "2px", background: "rgba(0,229,255,0.1)" }} />
            {[
              { icon: "🔐", text: "تسجيل دخول جديد", user: "النظام", time: "منذ لحظات" },
              { icon: "✅", text: "تفعيل حساب طالب", user: "الإدارة", time: "منذ دقيقتين" },
              { icon: "⬆️", text: "ترقية 3 طلاب للمستوى الثاني", user: "النظام", time: "منذ 15 دقيقة" },
              { icon: "📝", text: "تقييم 8 تكاليف", user: "معلم", time: "منذ 32 دقيقة" },
              { icon: "📢", text: "نشر تعميم جديد", user: "الإدارة", time: "منذ ساعة" },
            ].map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", position: "relative", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
              >
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0, zIndex: 1 }}>
                  {act.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "clamp(0.7rem, 1vw, 0.75rem)", color: "#e6edf3", fontWeight: 600 }}>{act.text}</div>
                  <div style={{ display: "flex", gap: "8px", fontSize: "clamp(0.55rem, 0.8vw, 0.6rem)", color: "#8b949e", marginTop: "2px" }}>
                    <span>{act.user}</span><span>{act.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: مؤشرات التقدم + معلومات الإدارة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap }}>
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
            <div style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", margin: 0 }}>
              📊 مؤشرات الإدارة
            </div>
            <RefreshIndicator onRefresh={loadData} />
          </div>
          <ManagementProgress />
        </div>
        <div style={{ ...glassCard, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#8b949e", marginBottom: "3px" }}>🏢</div>
            <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.7rem)", color: "#8b949e", fontWeight: 600, marginBottom: "6px" }}>{getManagementLabel()}</div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.8 }}
              style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 800, color: "#ffca28", lineHeight: 1 }}
            >
              {userName}
            </motion.div>
            <div style={{ fontSize: "clamp(0.55rem, 0.8vw, 0.6rem)", color: "#5a6a7a", marginTop: "3px" }}>مدير الإدارة</div>
          </div>
        </div>
      </div>

    </div>
  );
}
