"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface ActivityItem { icon: string; text: string; user: string; time: string; }
interface ActivityTimelineProps { initialActivities?: ActivityItem[]; }
const fallbackActivities: ActivityItem[] = [
  { icon: "🔐", text: "تسجيل دخول جديد", user: "النظام", time: "منذ دقيقة" },
  { icon: "📄", text: "رفع محتوى جديد", user: "مستخدم", time: "منذ 3 دقائق" },
  { icon: "📝", text: "إنشاء تكليف جديد", user: "مستخدم", time: "منذ 7 دقائق" },
  { icon: "📊", text: "تحديث إحصاءات المنصة", user: "النظام", time: "منذ 45 دقيقة" },
  { icon: "🔒", text: "تغيير كلمة مرور", user: "مستخدم", time: "منذ ساعة" },
  { icon: "📋", text: "تفعيل حساب طالب", user: "الإدارة", time: "منذ 22 دقيقة" },
];
export default function ActivityTimeline({ initialActivities }: ActivityTimelineProps) {
  const [items, setItems] = useState<ActivityItem[]>((initialActivities ?? fallbackActivities).slice(0, 6));
  useEffect(() => {
    if (initialActivities && initialActivities.length > 0) return;
    const interval = setInterval(() => {
      const newActivity: ActivityItem = { icon: ["🔐", "📄", "📝", "⬆️", "📋", "🔔"][Math.floor(Math.random() * 6)], text: ["تسجيل دخول جديد", "رفع ملف", "إنشاء تكليف", "ترقية حساب", "تفعيل حساب", "إرسال إشعار"][Math.floor(Math.random() * 6)], user: ["النظام", "مستخدم", "الإدارة"][Math.floor(Math.random() * 3)], time: "منذ لحظات" };
      setItems((prev) => { const updated = [newActivity, ...prev].slice(0, 6).map((item, idx) => { if (idx > 0) { const oldTime = parseInt(item.time.replace(/[^0-9]/g, "")) || 1; return { ...item, time: `منذ ${oldTime + 1} ${item.time.includes("دقيق") ? "دقيقة" : item.time.includes("ساع") ? "ساعة" : "دقائق"}` }; } return item; }); return updated; });
    }, 8000);
    return () => clearInterval(interval);
  }, [initialActivities]);
  return (
    <div>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#00e5ff", marginBottom: "10px" }}>🔄 النشاطات المباشرة</h3>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: "11px", top: "8px", bottom: "8px", width: "2px", background: "rgba(0,229,255,0.1)" }} />
        <AnimatePresence mode="popLayout">
          {items.map((act, i) => (
            <motion.div key={`${act.text}-${act.user}-${i}`} initial={{ opacity: 0, x: -10, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0, x: 10, height: 0 }} transition={{ duration: 0.3 }} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", position: "relative", borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0, zIndex: 1 }}>{act.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.75rem", color: "#e6edf3", fontWeight: 600 }}>{act.text}</div>
                <div style={{ display: "flex", gap: "8px", fontSize: "0.6rem", color: "#8b949e", marginTop: "2px" }}><span>{act.user}</span><span>{act.time}</span></div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}