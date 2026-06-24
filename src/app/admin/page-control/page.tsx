"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/components/ui/Toast";
import PageTransition from "@/components/layout/PageTransition";
import { useAuthStore } from "@/store/authStore";
import { csrfFetch } from "@/lib/csrfClient";

interface PageControlItem {
  id: string;
  pageKey: string;
  pageName: string;
  route: string;
  isDisabled: boolean;
  maintenanceTitle: string | null;
  maintenanceMessage: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const glassStyle: React.CSSProperties = {
  background: "rgba(10, 20, 40, 0.5)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(0, 229, 255, 0.12)",
  borderRadius: "18px",
};

export default function PageControlPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const [pages, setPages] = useState<PageControlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingPage, setEditingPage] = useState<PageControlItem | null>(null);
  const [editDisabled, setEditDisabled] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/page-control");
      const json = await res.json();
      if (json.success) setPages(json.data || []);
      else showToast("فشل تحميل الصفحات", "error");
    } catch {
      showToast("حدث خطأ في تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadPages(); }, [loadPages]);

  function openEditModal(page: PageControlItem) {
    setEditingPage(page);
    setEditDisabled(page.isDisabled);
    setEditTitle(page.maintenanceTitle || "");
    setEditMessage(page.maintenanceMessage || "");
  }

  function closeEditModal() {
    setEditingPage(null);
    setEditDisabled(false);
    setEditTitle("");
    setEditMessage("");
  }

  async function handleSave() {
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await csrfFetch("/api/admin/page-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPage.id,
          isDisabled: editDisabled,
          maintenanceTitle: editDisabled ? editTitle : "",
          maintenanceMessage: editDisabled ? editMessage : "",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("تم تحديث حالة الصفحة بنجاح", "success");
        closeEditModal();
        loadPages();
      } else {
        showToast(json.message || "فشل الحفظ", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSaving(false);
    }
  }

  function getStatusBadge(isDisabled: boolean) {
    if (isDisabled) {
      return { text: "متوقفة", color: "#f85149", bg: "rgba(248,81,73,0.15)" };
    }
    return { text: "مفعلة", color: "#2ea043", bg: "rgba(46,160,67,0.15)" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: "'Cairo', sans-serif", color: "#fff" }}>
      <Header />
      <Sidebar />
      <PageTransition>
        <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "100px 20px 60px" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...glassStyle, padding: "20px 30px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/admin")}
                style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
                  color: "#00e5ff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <BackIcon />
              </motion.button>
              <div>
                <h2 style={{ color: "#ffca28", fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontWeight: 800, margin: 0 }}>
                  🚧 إدارة صفحات الموقع
                </h2>
                <p style={{ color: "#8b949e", fontSize: "0.85rem", margin: "4px 0 0" }}>
                  التحكم في تفعيل وإيقاف صفحات النظام أثناء الصيانة أو التطوير
                </p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: "44px", height: "44px",
                  border: "3px solid rgba(0,229,255,0.2)", borderTopColor: "#00e5ff",
                  borderRadius: "50%", margin: "0 auto 20px",
                }}
              />
              <p style={{ color: "#8b949e" }}>جاري تحميل الصفحات...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...glassStyle, overflow: "hidden" }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
                      {["اسم الصفحة", "المسار", "الحالة", "آخر تحديث", "الإجراءات"].map((h) => (
                        <th key={h} style={{ padding: "14px 12px", textAlign: "center", color: "#ffca28", fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {pages.map((page, i) => {
                        const badge = getStatusBadge(page.isDisabled);
                        return (
                          <motion.tr
                            key={page.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <td style={{ padding: "14px 12px", textAlign: "center" }}>
                              <span style={{ color: "#e6edf3", fontWeight: 600, fontSize: "0.85rem" }}>
                                {page.pageName}
                              </span>
                            </td>
                            <td style={{ padding: "14px 12px", textAlign: "center" }}>
                              <code style={{ color: "#00e5ff", fontSize: "0.75rem", background: "rgba(0,229,255,0.06)", padding: "3px 10px", borderRadius: "6px", direction: "ltr", display: "inline-block" }}>
                                {page.route}
                              </code>
                            </td>
                            <td style={{ padding: "14px 12px", textAlign: "center" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 14px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                              }}>
                                {badge.text}
                              </span>
                            </td>
                            <td style={{ padding: "14px 12px", textAlign: "center", color: "#8b949e", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                              {new Date(page.updatedAt).toLocaleString("ar-YE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ padding: "14px 12px", textAlign: "center" }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(page)}
                                style={{
                                  padding: "8px 18px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(0,229,255,0.3)",
                                  background: "rgba(0,229,255,0.08)",
                                  color: "#00e5ff",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  fontFamily: "'Cairo', sans-serif",
                                }}
                              >
                                تعديل
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {pages.length > 0 && pages.length !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ ...glassStyle, padding: "16px 24px", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}
              >
                <span style={{ color: "#8b949e", fontSize: "0.8rem" }}>
                  إجمالي الصفحات: <strong style={{ color: "#00e5ff" }}>{pages.length}</strong>
                </span>
                <span style={{ color: "#8b949e", fontSize: "0.8rem" }}>
                  المتوقفة: <strong style={{ color: "#f85149" }}>{pages.filter((p) => p.isDisabled).length}</strong>
                  {" "}||{" "}
                  المفعلة: <strong style={{ color: "#2ea043" }}>{pages.filter((p) => !p.isDisabled).length}</strong>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </PageTransition>
      <Footer />

      <AnimatePresence>
        {editingPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditModal}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...glassStyle,
                width: "100%", maxWidth: "520px",
                padding: "30px",
                maxHeight: "90vh", overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ color: "#00e5ff", fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
                  تعديل الصفحة
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeEditModal}
                  style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    border: "1px solid rgba(248,81,73,0.3)",
                    background: "rgba(248,81,73,0.1)",
                    color: "#f85149", cursor: "pointer", fontSize: "1.1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ✕
                </motion.button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#8b949e", fontSize: "0.75rem", marginBottom: "6px", fontWeight: 600 }}>
                  اسم الصفحة
                </label>
                <div style={{
                  padding: "12px 16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#e6edf3", fontSize: "0.9rem",
                }}>
                  {editingPage.pageName}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#8b949e", fontSize: "0.75rem", marginBottom: "6px", fontWeight: 600 }}>
                  المسار
                </label>
                <div style={{
                  padding: "12px 16px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#00e5ff", fontSize: "0.85rem", fontFamily: "monospace", direction: "ltr",
                }}>
                  {editingPage.route}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "#8b949e", fontSize: "0.75rem", marginBottom: "10px", fontWeight: 600 }}>
                  حالة الصفحة
                </label>
                <div
                  onClick={() => setEditDisabled(!editDisabled)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", cursor: "pointer",
                    padding: "12px 16px", borderRadius: "12px",
                    background: editDisabled ? "rgba(248,81,73,0.06)" : "rgba(46,160,67,0.06)",
                    border: `1px solid ${editDisabled ? "rgba(248,81,73,0.2)" : "rgba(46,160,67,0.2)"}`,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "48px", height: "26px", borderRadius: "13px",
                    background: editDisabled ? "#f85149" : "#2ea043",
                    position: "relative", transition: "background 0.2s",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%",
                      background: "#fff",
                      position: "absolute", top: "3px",
                      right: editDisabled ? "25px" : "3px",
                      transition: "right 0.2s",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }} />
                  </div>
                  <span style={{ color: editDisabled ? "#f85149" : "#2ea043", fontWeight: 700, fontSize: "0.9rem" }}>
                    {editDisabled ? "🛑 متوقفة — الصيانة مفعلة" : "✅ مفعلة — الصفحة تعمل بشكل طبيعي"}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {editDisabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", color: "#8b949e", fontSize: "0.75rem", marginBottom: "6px", fontWeight: 600 }}>
                        عنوان الصيانة <span style={{ color: "#484f6a" }}>(اختياري)</span>
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="الصفحة تحت التطوير"
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: "12px",
                          background: "rgba(13,21,46,0.6)",
                          border: "1px solid rgba(0,229,255,0.15)",
                          color: "#e6edf3", fontSize: "0.85rem",
                          fontFamily: "'Cairo', sans-serif",
                          outline: "none", boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", color: "#8b949e", fontSize: "0.75rem", marginBottom: "6px", fontWeight: 600 }}>
                        رسالة الصيانة
                      </label>
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        placeholder="اكتب الرسالة التي ستظهر للمستخدمين عند محاولة فتح الصفحة أثناء الصيانة"
                        rows={4}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: "12px",
                          background: "rgba(13,21,46,0.6)",
                          border: "1px solid rgba(0,229,255,0.15)",
                          color: "#e6edf3", fontSize: "0.85rem",
                          fontFamily: "'Cairo', sans-serif",
                          resize: "vertical", outline: "none", boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={closeEditModal}
                  style={{
                    padding: "12px 28px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "#8b949e", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 700,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "12px 28px", borderRadius: "12px",
                    border: "1px solid rgba(0,229,255,0.3)",
                    background: "rgba(0,229,255,0.1)",
                    color: "#00e5ff", cursor: saving ? "not-allowed" : "pointer",
                    fontSize: "0.85rem", fontWeight: 700,
                    fontFamily: "'Cairo', sans-serif",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
