"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
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
  user: { name: string; email: string; level: string | null };
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
  const [unbindingId, setUnbindingId] = useState<string | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [assistanceRequests, setAssistanceRequests] = useState<any[]>([]);
  const [assistingUser, setAssistingUser] = useState<any>(null);
  const [assistPassword, setAssistPassword] = useState("");
  const [assistResolving, setAssistResolving] = useState(false);

  const [completedRequests, setCompletedRequests] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadAssistanceRequests();
    loadCompletedRequests();
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

  async function loadAssistanceRequests() {
    try {
      const res = await fetch("/api/admin/bot-control/assistance-requests");
      const json = await res.json();
      if (json.success) {
        setAssistanceRequests(json.requests);
      }
    } catch {
      console.error("Failed to load assistance requests");
    }
  }

  async function handleAssistResolve() {
    if (!assistingUser || !assistPassword.trim()) return;
    setAssistResolving(true);
    try {
      const res = await csrfFetch("/api/admin/bot-control/assistance-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: assistingUser.userId, newPassword: assistPassword }),
      });
      const json = await res.json();
      if (json.success) {
        const levelLabel = json.user.level ? { LEVEL_1: "المستوى الأول", LEVEL_2: "المستوى الثاني", LEVEL_3: "المستوى الثالث", LEVEL_4: "المستوى الرابع" }[json.user.level as string] || json.user.level : "—";
        const botUsername = "CyberSecurityCloudBot";
        const txtLines = [
          "═══════════════════════════════════════",
          "  إعادة تعيين كلمة المرور - سحابة الأمن السيبراني",
          "═══════════════════════════════════════",
          "",
          `  هوية المستخدم: ${json.user.name}`,
          `  المستوى: ${levelLabel}`,
          "",
          "  تم إعادة تعيين الباسورد الخاص بحسابك في المنصة.",
          `  الباسورد الافتراضي: ${assistPassword}`,
          "",
          "  يرجى ربط حسابك في المنصة ببوت التحقق في التليجرام:",
          `  @${botUsername}`,
          "",
          "  ⚠️ يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول.",
          "",
          "═══════════════════════════════════════",
          "  جامعة ذمار - كلية الحاسبات",
          "  Dhamar University - Faculty of Computers",
          "═══════════════════════════════════════",
        ].join("\n");
        const blob = new Blob([txtLines], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reset-password-${assistingUser.userName || assistingUser.userId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("✅ تم إعادة التعيين وتحميل الملف", "success");
        setAssistingUser(null);
        setAssistPassword("");
        loadAssistanceRequests();
        loadCompletedRequests();
      } else {
        showToast(json.message || "فشلت العملية", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setAssistResolving(false);
    }
  }

  async function loadCompletedRequests() {
    try {
      const res = await fetch("/api/admin/bot-control/assistance-completed");
      const json = await res.json();
      if (json.success) setCompletedRequests(json.requests);
    } catch {
      console.error("Failed to load completed requests");
    }
  }

  async function handleCompletedDownload(userId: string) {
    try {
      const res = await csrfFetch("/api/admin/bot-control/assistance-completed/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        const levelLabel = json.level ? { LEVEL_1: "المستوى الأول", LEVEL_2: "المستوى الثاني", LEVEL_3: "المستوى الثالث", LEVEL_4: "المستوى الرابع" }[json.level as string] || json.level : "—";
        const botUsername = "CyberSecurityCloudBot";
        const txtLines = [
          "═══════════════════════════════════════",
          "  إعادة تعيين كلمة المرور - سحابة الأمن السيبراني",
          "═══════════════════════════════════════",
          "",
          `  هوية المستخدم: ${json.userName}`,
          `  المستوى: ${levelLabel}`,
          "",
          "  تم إعادة تعيين الباسورد الخاص بحسابك في المنصة.",
          `  الباسورد الافتراضي: ${json.password}`,
          "",
          "  يرجى ربط حسابك في المنصة ببوت التحقق في التليجرام:",
          `  @${botUsername}`,
          "",
          "  ⚠️ يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول.",
          "",
          "═══════════════════════════════════════",
          "  جامعة ذمار - كلية الحاسبات",
          "  Dhamar University - Faculty of Computers",
          "═══════════════════════════════════════",
        ].join("\n");
        const blob = new Blob([txtLines], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reset-password-${json.userName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("✅ تم تحميل الملف", "success");
      } else {
        showToast(json.message || "فشل التحميل", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    }
  }

  async function handleCompletedDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await csrfFetch("/api/admin/bot-control/assistance-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✅ تم حذف الطلب", "success");
        loadCompletedRequests();
      } else {
        showToast(json.message || "فشل الحذف", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdminUnbind(userId: string) {
    setUnbindingId(userId);
    try {
      const res = await csrfFetch("/api/admin/bot-control/admin-unbind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✅ تم إلغاء الربط", "success");
        loadStats();
      } else {
        showToast(json.message || "فشل", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setUnbindingId(null);
    }
  }

  async function handleReactivate(userId: string) {
    setReactivatingId(userId);
    try {
      const res = await csrfFetch("/api/admin/bot-control/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✅ تم إعادة التفعيل", "success");
        loadStats();
      } else {
        showToast(json.message || "فشل", "error");
      }
    } catch {
      showToast("حدث خطأ", "error");
    } finally {
      setReactivatingId(null);
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
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
                  <h2 className="text-lg font-semibold text-[#00e5ff] mb-4">📋 سجل الربط</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#8b949e] border-b border-[#00e5ff]/10">
                          <th className="text-right py-2 px-3">الاسم</th>
                          <th className="text-right py-2 px-3">المستوى</th>
                          <th className="text-right py-2 px-3">Telegram</th>
                          <th className="text-right py-2 px-3">الحالة</th>
                          <th className="text-right py-2 px-3">التاريخ</th>
                          <th className="text-center py-2 px-3">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBindings.map((b) => (
                          <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-3 text-[#e6edf3]">{b.user.name}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{b.user.level ? { LEVEL_1: "الأول", LEVEL_2: "الثاني", LEVEL_3: "الثالث", LEVEL_4: "الرابع" }[b.user.level as string] || b.user.level : "—"}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{b.telegramUsername ? `@${b.telegramUsername}` : "—"}</td>
                            <td className="py-2 px-3"><span className={`${b.status === "ACTIVE" ? "text-[#2ea043]" : "text-[#f85149]"}`}>{b.status === "ACTIVE" ? "نشط" : "ملغي"}</span></td>
                            <td className="py-2 px-3 text-[#8b949e]">{new Date(b.verifiedAt).toLocaleDateString("ar-SA")}</td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleAdminUnbind(b.userId)}
                                  disabled={b.status !== "ACTIVE" || unbindingId === b.userId}
                                  className="px-2 py-1 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] rounded-lg text-xs hover:bg-[#f85149]/20 transition-all disabled:opacity-30"
                                >
                                  {unbindingId === b.userId ? "..." : "إلغاء الربط"}
                                </button>
                                <button
                                  onClick={() => handleReactivate(b.userId)}
                                  disabled={reactivatingId === b.userId}
                                  className="px-2 py-1 bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#2ea043] rounded-lg text-xs hover:bg-[#2ea043]/20 transition-all disabled:opacity-30"
                                >
                                  {reactivatingId === b.userId ? "..." : "إعادة تفعيل"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {assistanceRequests.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`${glassStyle} p-6 mb-8`}>
                  <h2 className="text-lg font-semibold text-[#ffca28] mb-4">🆘 طلبات المساعدة</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#8b949e] border-b border-[#ffca28]/10">
                          <th className="text-right py-2 px-3">الاسم</th>
                          <th className="text-right py-2 px-3">المستوى</th>
                          <th className="text-right py-2 px-3">IP</th>
                          <th className="text-right py-2 px-3">التاريخ</th>
                          <th className="text-center py-2 px-3">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assistanceRequests.map((r: any) => (
                          <tr key={r.userId} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-3 text-[#e6edf3]">{r.userName}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{r.level ? { LEVEL_1: "الأول", LEVEL_2: "الثاني", LEVEL_3: "الثالث", LEVEL_4: "الرابع" }[r.level as string] || r.level : "—"}</td>
                            <td className="py-2 px-3 text-[#8b949e] direction-ltr text-left">{r.ip || "—"}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{new Date(r.requestedAt).toLocaleDateString("ar-SA")}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => { setAssistingUser(r); setAssistPassword(""); }}
                                className="px-3 py-1.5 bg-[#ffca28]/10 border border-[#ffca28]/30 text-[#ffca28] rounded-xl text-xs hover:bg-[#ffca28]/20 transition-all"
                              >
                                🔑 إعادة تعيين
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {completedRequests.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className={`${glassStyle} p-6 mb-8`}>
                  <h2 className="text-lg font-semibold text-[#2ea043] mb-4">📋 سجل الطلبات المنجزة</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#8b949e] border-b border-[#2ea043]/10">
                          <th className="text-right py-2 px-3">الاسم</th>
                          <th className="text-right py-2 px-3">المستوى</th>
                          <th className="text-right py-2 px-3">تاريخ الإنجاز</th>
                          <th className="text-center py-2 px-3">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedRequests.map((r: any) => (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-3 text-[#e6edf3]">{r.userName}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{r.level ? { LEVEL_1: "الأول", LEVEL_2: "الثاني", LEVEL_3: "الثالث", LEVEL_4: "الرابع" }[r.level as string] || r.level : "—"}</td>
                            <td className="py-2 px-3 text-[#8b949e]">{new Date(r.resolvedAt).toLocaleDateString("ar-SA")}</td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => { setAssistingUser(r); setAssistPassword(""); }}
                                  className="px-2 py-1 bg-[#ffca28]/10 border border-[#ffca28]/30 text-[#ffca28] rounded-lg text-xs hover:bg-[#ffca28]/20 transition-all"
                                >
                                  🔑 إعادة تعيين
                                </button>
                                <button
                                  onClick={() => handleCompletedDownload(r.userId)}
                                  className="px-2 py-1 bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] rounded-lg text-xs hover:bg-[#00e5ff]/20 transition-all"
                                >
                                  📥 تحميل
                                </button>
                                <button
                                  onClick={() => handleCompletedDelete(r.id)}
                                  disabled={deletingId === r.id}
                                  className="px-2 py-1 bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] rounded-lg text-xs hover:bg-[#f85149]/20 transition-all disabled:opacity-30"
                                >
                                  {deletingId === r.id ? "..." : "🗑️ حذف"}
                                </button>
                              </div>
                            </td>
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
      {assistingUser && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${glassStyle} p-6 w-full max-w-md mx-4`}>
            <h3 className="text-lg font-semibold text-[#ffca28] mb-2">🔑 إعادة تعيين باسورد</h3>
            <p className="text-sm text-[#8b949e] mb-4">المستخدم: {assistingUser.userName}</p>
            <input
              type="text"
              value={assistPassword}
              onChange={(e) => setAssistPassword(e.target.value)}
              placeholder="أدخل الباسورد الافتراضي (8 أحرف على الأقل)"
              className="w-full bg-[#0d152e] border border-[#ffca28]/20 rounded-xl px-4 py-2.5 text-[#e6edf3] placeholder:text-[#484f6a] focus:outline-none focus:border-[#ffca28]/50 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAssistResolve}
                disabled={assistResolving || assistPassword.length < 8}
                className="flex-1 py-2.5 bg-[#ffca28]/10 border border-[#ffca28]/30 text-[#ffca28] rounded-xl text-sm hover:bg-[#ffca28]/20 transition-all disabled:opacity-40"
              >
                {assistResolving ? "جاري..." : "✅ تأكيد + تحميل الملف"}
              </button>
              <button
                onClick={() => { setAssistingUser(null); setAssistPassword(""); }}
                disabled={assistResolving}
                className="py-2.5 px-4 bg-white/5 border border-white/10 text-[#8b949e] rounded-xl text-sm hover:bg-white/10 transition-all disabled:opacity-40"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
