"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/components/ui/Toast";
import PageTransition from "@/components/layout/PageTransition";
import { useAuthStore } from "@/store/authStore";
import { csrfFetch } from "@/lib/csrfClient";

interface BindingStat {
  totalBindings: number;
  activeBindings: number;
  revokedBindings: number;
}

interface RecentBinding {
  id: string;
  userId: string;
  telegramId: string;
  telegramUsername: string | null;
  status: string;
  verifiedAt: string;
  user: { name: string; email: string };
}

interface LookupUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  level: string | null;
  isActivated: boolean;
  resetCount: number;
  telegramBinding: { status: string; telegramUsername: string | null } | null;
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const glassStyle = "bg-[#0a1128]/80 backdrop-blur-xl border border-[#00e5ff]/20 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.05)]";

export default function BotControlPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const [stats, setStats] = useState<BindingStat | null>(null);
  const [recentBindings, setRecentBindings] = useState<RecentBinding[]>([]);
  const [loading, setLoading] = useState(true);

  const [lookupIdentifier, setLookupIdentifier] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupUser | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);

  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/bot-control/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setRecentBindings(json.recentBindings);
      }
    } catch (err) {
      console.error("Failed to load bot stats", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup() {
    if (!lookupIdentifier.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await csrfFetch("/api/admin/bot-control/lookup-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: lookupIdentifier.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setLookupResult(json.user);
      } else {
        showToast(json.message || "المستخدم غير موجود", "error");
      }
    } catch {
      showToast("فشل البحث عن المستخدم", "error");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!lookupResult) return;
    setResetting(true);
    try {
      const res = await csrfFetch("/api/admin/bot-control/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: lookupResult.id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "تم إرسال رابط إعادة تعيين كلمة المرور", "success");
        setLookupResult(null);
        setLookupIdentifier("");
      } else {
        showToast(json.message || "فشلت العملية", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setResetting(false);
    }
  }

  async   function handleExportTxt() {
    if (!recoveryCode) return;
    const lines = [
      "═══════════════════════════════════════",
      "  كود استعادة لمرة واحدة - سحابة الأمن السيبراني",
      "  One-Time Recovery Code",
      "═══════════════════════════════════════",
      "",
      `  الكود / Code : ${recoveryCode}`,
      "",
      `  المستخدم / User : ${recoveryIdentifier.trim()}`,
      `  تاريخ الإنشاء / Created : ${new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}`,
      `  الصلاحية / Expiry : 30 دقيقة`,
      "",
      "  ⚠️ يمكن استخدام هذا الكود مرة واحدة فقط",
      "  ⚠️ This code can be used only once",
      "",
      "═══════════════════════════════════════",
      "  جامعة ذمار - كلية الحاسبات",
      "  Dhamar University - Faculty of Computers",
      "═══════════════════════════════════════",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recovery-code-${recoveryCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleResetSession() {
    if (!lookupResult) return;
    setResettingSession(true);
    try {
      const res = await csrfFetch("/api/admin/bot-control/reset-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: lookupResult.id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "تم إعادة تعيين جلسة البوت", "success");
      } else {
        showToast(json.message || "فشلت العملية", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setResettingSession(false);
    }
  }

  async function handleGenerateRecovery() {
    if (!recoveryIdentifier.trim()) return;
    setRecoveryLoading(true);
    setRecoveryCode("");
    try {
      const res = await csrfFetch("/api/admin/bot-control/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: recoveryIdentifier.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setRecoveryCode(json.code);
        showToast("تم إنشاء كود الاستعادة", "success");
      } else {
        showToast(json.message || "فشل إنشاء الكود", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setRecoveryLoading(false);
    }
  }

  const statCards = [
    { label: "إجمالي الربط", value: stats?.totalBindings ?? "—", color: "#00e5ff" },
    { label: "ربط نشط", value: stats?.activeBindings ?? "—", color: "#2ea043" },
    { label: "ربط ملغي", value: stats?.revokedBindings ?? "—", color: "#f85149" },
  ];

  return (
    <div className="min-h-screen bg-[#010204]">
      <Header />
      <Sidebar />
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16" style={{ paddingTop: "100px" }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.push("/admin")} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#8b949e] hover:text-[#00e5ff]">
                <BackIcon />
              </button>
              <h1 className="text-2xl font-bold text-[#00e5ff]">🤖 مركز التحكم بالبوت</h1>
            </div>
            <p className="text-[#8b949e] mr-11">إدارة ربط Telegram واستعادة كلمة المرور</p>
          </motion.div>

          {loading ? (
            <div className="text-center text-[#8b949e] py-20">جاري التحميل...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map((card) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${glassStyle} p-6 text-center`}>
                    <div className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-sm text-[#8b949e]">{card.label}</div>
                  </motion.div>
                ))}
              </div>

              {recentBindings.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${glassStyle} p-6 mb-8`}>
                  <h2 className="text-lg font-semibold text-[#00e5ff] mb-4">آخر عمليات الربط</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#8b949e] border-b border-[#00e5ff]/10">
                          <th className="text-right py-2 px-3">الاسم</th>
                          <th className="text-right py-2 px-3">البريد</th>
                          <th className="text-right py-2 px-3">Telegram</th>
                          <th className="text-right py-2 px-3">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBindings.map((b) => (
                          <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-3 text-[#e6edf3]">{b.user.name}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{b.user.email}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{b.telegramUsername ? `@${b.telegramUsername}` : "—"}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{new Date(b.verifiedAt).toLocaleDateString("ar-SA")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${glassStyle} p-6`}>
                  <h2 className="text-lg font-semibold text-[#00e5ff] mb-4">🔐 مساعدة في استعادة كلمة المرور</h2>
                  <p className="text-sm text-[#8b949e] mb-4">ابحث عن مستخدم وساعده في إعادة تعيين كلمة المرور</p>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={lookupIdentifier}
                      onChange={(e) => setLookupIdentifier(e.target.value)}
                      placeholder="البريد الإلكتروني أو اسم المستخدم"
                      className="flex-1 bg-[#0d152e] border border-[#00e5ff]/20 rounded-xl px-4 py-2.5 text-[#e6edf3] placeholder:text-[#484f6a] focus:outline-none focus:border-[#00e5ff]/50 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    />
                    <button
                      onClick={handleLookup}
                      disabled={lookupLoading || !lookupIdentifier.trim()}
                      className="px-5 py-2.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] rounded-xl text-sm hover:bg-[#00e5ff]/20 transition-all disabled:opacity-40"
                    >
                      {lookupLoading ? "...بحث" : "🔍 بحث"}
                    </button>
                  </div>

                  {lookupResult && (
                    <div className="bg-[#0d152e] rounded-xl p-4 border border-[#00e5ff]/10">
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between"><span className="text-[#8b949e]">الاسم</span><span className="text-[#e6edf3]">{lookupResult.name}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">اسم المستخدم</span><span className="text-[#e6edf3] direction-ltr text-left">{lookupResult.username || "—"}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">البريد</span><span className="text-[#e6edf3]">{lookupResult.email}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">الدور</span><span className="text-[#e6edf3]">{lookupResult.role}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">الحالة</span><span className={`${lookupResult.isActivated ? "text-[#2ea043]" : "text-[#ffca28]"}`}>{lookupResult.isActivated ? "مفعل" : "غير مفعل"}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">Telegram</span><span className={lookupResult.telegramBinding?.status === "ACTIVE" ? "text-[#2ea043]" : "text-[#8b949e]"}>{lookupResult.telegramBinding?.status === "ACTIVE" ? `مرتبط ✅ (${lookupResult.telegramBinding.telegramUsername || ""})` : "غير مرتبط"}</span></div>
                        <div className="flex justify-between"><span className="text-[#8b949e]">عدد مرات تغيير الباسورد</span><span className="text-[#e6edf3]">{lookupResult.resetCount}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleResetPassword}
                          disabled={resetting}
                          className="flex-1 py-2.5 bg-[#ffca28]/10 border border-[#ffca28]/30 text-[#ffca28] rounded-xl text-sm hover:bg-[#ffca28]/20 transition-all disabled:opacity-40"
                        >
                          {resetting ? "جاري الإرسال..." : "🔑 إرسال رابط إعادة التعيين"}
                        </button>
                        <button
                          onClick={handleResetSession}
                          disabled={resettingSession}
                          className="py-2.5 px-3 bg-[#bf5af2]/10 border border-[#bf5af2]/30 text-[#bf5af2] rounded-xl text-sm hover:bg-[#bf5af2]/20 transition-all disabled:opacity-40"
                        >
                          {resettingSession ? "..." : "🔄 إعادة تشغيل البوت"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${glassStyle} p-6`}>
                  <h2 className="text-lg font-semibold text-[#00e5ff] mb-4">🔑 إنشاء كود استعادة لمرة واحدة</h2>
                  <p className="text-sm text-[#8b949e] mb-4">أنشئ كود استعادة للمستخدمين الذين لا يستطيعون الوصول إلى البوت</p>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="البريد الإلكتروني أو اسم المستخدم"
                      className="flex-1 bg-[#0d152e] border border-[#00e5ff]/20 rounded-xl px-4 py-2.5 text-[#e6edf3] placeholder:text-[#484f6a] focus:outline-none focus:border-[#00e5ff]/50 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleGenerateRecovery()}
                    />
                    <button
                      onClick={handleGenerateRecovery}
                      disabled={recoveryLoading || !recoveryIdentifier.trim()}
                      className="px-5 py-2.5 bg-[#bf5af2]/10 border border-[#bf5af2]/30 text-[#bf5af2] rounded-xl text-sm hover:bg-[#bf5af2]/20 transition-all disabled:opacity-40"
                    >
                      {recoveryLoading ? "...جاري" : "✨ إنشاء"}
                    </button>
                  </div>

                  {recoveryCode && (
                    <div className="bg-[#0d152e] rounded-xl p-4 border border-[#bf5af2]/20 text-center">
                      <p className="text-sm text-[#8b949e] mb-2">كود الاستعادة لمرة واحدة:</p>
                      <p className="text-2xl font-bold text-[#bf5af2] tracking-[6px] font-mono select-all">{recoveryCode}</p>
                      <p className="text-xs text-[#484f6a] mt-2">ينتهي بعد 30 دقيقة • يمكن استخدامه مرة واحدة فقط</p>
                      <button
                        onClick={handleExportTxt}
                        className="mt-3 px-4 py-2 bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#2ea043] rounded-xl text-sm hover:bg-[#2ea043]/20 transition-all"
                      >
                        📥 تحميل TXT
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
