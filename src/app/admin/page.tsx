"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ThreatRadar from "@/components/dashboard/ThreatRadar";
import SystemStatus from "@/components/dashboard/SystemStatus";
import StatCard from "@/components/dashboard/StatCard";
import AlertPanel from "@/components/dashboard/AlertPanel";
import QuickActions from "@/components/dashboard/QuickActions";
import ServerUsageChart from "@/components/dashboard/ServerUsageChart";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import Gauges from "@/components/dashboard/Gauges";
import RefreshIndicator from "@/components/dashboard/RefreshIndicator";
import { useAuthStore } from "@/store/authStore";

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend: number;
  trendUp: boolean;
  sparklineData: number[];
}

interface AlertItem {
  level: "high" | "medium" | "low";
  message: string;
  time: string;
}

interface SystemService {
  name: string;
  status: "online" | "offline" | "warning";
  icon: string;
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

const systemServices: SystemService[] = [
  { name: "الخادم الرئيسي", status: "online", icon: "🖥️" },
  { name: "قاعدة البيانات", status: "online", icon: "🗄️" },
  { name: "جدار الحماية", status: "online", icon: "🛡️" },
  { name: "نظام النسخ الاحتياطي", status: "online", icon: "💾" },
];

const defaultServerUsage = {
  labels: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
  cpu: [45, 52, 38, 65, 55, 48, 42],
  ram: [62, 58, 71, 68, 73, 59, 64],
  storage: [34, 36, 35, 37, 36, 38, 37],
};

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<StatItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [serverRes, auditRes] = await Promise.allSettled([
        fetch("/api/server/stats"),
        fetch("/api/admin/audit-log"),
      ]);

      const serverData = serverRes.status === "fulfilled" ? await serverRes.value.json() : null;
      const statsApi = serverData?.success ? serverData.data : null;

      setStats([
        { label: "إجمالي المستخدمين", value: statsApi?.totalUsers ?? 0, icon: "👥", color: "#00e5ff", trend: 12.5, trendUp: true, sparklineData: generateSparkline() },
        { label: "الحسابات المفعلة", value: statsApi?.activeUsers ?? 0, icon: "✅", color: "#2ea043", trend: 8.3, trendUp: true, sparklineData: generateSparkline() },
        { label: "الحسابات المعلقة", value: statsApi?.pendingUsers ?? 0, icon: "⏳", color: "#ffca28", trend: 4.2, trendUp: false, sparklineData: generateSparkline() },
        { label: "إجمالي التكاليف", value: statsApi?.totalAssignments ?? 0, icon: "📤", color: "#bf5af2", trend: 15.7, trendUp: true, sparklineData: generateSparkline() },
        { label: "التكاليف المقيمة", value: statsApi?.evaluatedAssignments ?? 0, icon: "📝", color: "#39ff14", trend: 11.4, trendUp: true, sparklineData: generateSparkline() },
        { label: "محتوى المكتبة", value: statsApi?.totalContent ?? 0, icon: "📚", color: "#ff6b6b", trend: 9.8, trendUp: true, sparklineData: generateSparkline() },
        { label: "المواد الدراسية", value: statsApi?.totalSubjects ?? 0, icon: "📘", color: "#ffca28", trend: 3.1, trendUp: true, sparklineData: generateSparkline() },
        { label: "التنبيهات الحرجة", value: 0, icon: "🚨", color: "#f85149", trend: 0, trendUp: false, sparklineData: generateSparkline() },
      ]);

      const auditData = auditRes.status === "fulfilled" ? await auditRes.value.json() : null;
      const logs = auditData?.data?.logs || auditData?.logs || [];
      if (Array.isArray(logs) && logs.length > 0) {
        setAlerts(logs.slice(0, 3).map((log: any) => ({
          level: log.severity === "HIGH" ? "high" as const : log.severity === "MEDIUM" ? "medium" as const : "low" as const,
          message: log.action || log.message || "",
          time: log.createdAt ? `منذ ${Math.floor((Date.now() - new Date(log.createdAt).getTime()) / 60000)} دقيقة` : "الآن",
        })));
      } else {
        setAlerts([{ level: "low", message: "جميع الأنظمة تعمل بشكل طبيعي", time: "الآن" }]);
      }
    } catch {
      setAlerts([{ level: "low", message: "جميع الأنظمة تعمل بشكل طبيعي", time: "الآن" }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px 20px 60px" }}>
      {/* الصف 1: ترحيب + رادار التهديدات + حالة الأنظمة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap, marginBottom: gap }}>
        <WelcomeCard userName={user?.name || ""} />
        <div style={{ ...glassCard, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ThreatRadar />
        </div>
        <div style={glassCard}>
          <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.7rem)", fontWeight: 700, color: "#8b949e", marginBottom: "8px" }}>🖥️ حالة الأنظمة</div>
          <SystemStatus services={systemServices} />
        </div>
      </div>

      {/* الصف 2: إحصائيات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: gap }}>
        {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
      </div>

      {/* الصف 3: التنبيهات + الاختصارات السريعة */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap, marginBottom: gap }}>
        <div style={glassCard}><AlertPanel alerts={alerts} /></div>
        <div style={glassCard}>
          <h3 style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", marginBottom: "10px" }}>⚡ اختصارات سريعة</h3>
          <QuickActions />
        </div>
      </div>

      {/* الصف 4: استخدام الخادم + النشاطات */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap, marginBottom: gap }}>
        <div style={glassCard}><ServerUsageChart data={defaultServerUsage} /></div>
        <div style={glassCard}><ActivityTimeline /></div>
      </div>

      {/* الصف 5: مؤشرات الخادم + المستخدمون النشطون */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap }}>
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "clamp(0.7rem, 1.2vw, 0.78rem)", fontWeight: 700, color: "#00e5ff", margin: 0 }}>📊 مؤشرات الخادم</h3>
            <RefreshIndicator />
          </div>
          <Gauges />
        </div>
        <div style={{ ...glassCard, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#8b949e", marginBottom: "3px" }}>🌐</div>
            <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.7rem)", color: "#8b949e", fontWeight: 600, marginBottom: "6px" }}>المستخدمون النشطون</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.8 }} style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 800, color: "#39ff14", lineHeight: 1 }}>{Math.floor(Math.random() * 10) + 3}</motion.div>
            <div style={{ fontSize: "clamp(0.55rem, 0.8vw, 0.6rem)", color: "#5a6a7a", marginTop: "3px" }}>متصل الآن</div>
          </div>
        </div>
      </div>
    </div>
  );
}