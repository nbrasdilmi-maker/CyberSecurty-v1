"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import Pagination from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/store/authStore";
import { csrfFetch } from "@/lib/csrfClient";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import WelcomeCard from "@/components/teacher/WelcomeCard";
import QuickShortcuts from "@/components/teacher/QuickShortcuts";
import StatsCards from "@/components/teacher/StatsCards";
import TabsBar from "@/components/teacher/TabsBar";
import EvaluationModal from "@/components/teacher/EvaluationModal";

// ==================== الأنواع ====================
interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AssignmentItem {
  id: string;
  status: string;
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  evaluatedAt?: string;
  student: { id: string; name: string; email: string };
  subject: { id: string; name: string; code: string };
}

// ==================== الأيقونات SVG ====================
const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DownloadAllIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
    <line x1="8" y1="3" x2="16" y2="3" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ReEvalIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);



// ==================== المكوّن الرئيسي ====================
export default function TeacherDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const userId = user?.id || "";
  const userName = user?.name || "";
  const userRole = user?.role || "";
  const userLevel = user?.level || "";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useSupabaseRealtime(`user-${userId}`, "assignment-update", () => {
    loadPending();
    loadHistory();
  });
  // التبويبات
  type Tab = "inbox" | "history" | "grades";
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  // البيانات
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pending, setPending] = useState<AssignmentItem[]>([]);
  const [history, setHistory] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // الإحصائيات
  const [stats, setStats] = useState({ pending: 0, evaluated: 0, students: 0 });

  // الترقيم
  const pendingPag = usePagination(1, 20);
  const historyPag = usePagination(1, 20);

  // نافذة التقييم
  const [evalModal, setEvalModal] = useState<AssignmentItem | null>(null);
  const [evalGrade, setEvalGrade] = useState("");
  const [evalFeedback, setEvalFeedback] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState("");

  // رفع الدرجات
  const [gradeFile, setGradeFile] = useState<File | null>(null);
  const [gradeSubject, setGradeSubject] = useState("");
  const [gradeUploading, setGradeUploading] = useState(false);
  const gradeFileRef = useRef<HTMLInputElement>(null);

  // ==================== تحميل المواد ====================
  useEffect(() => {
    fetch(`/api/subjects/active?level=${userLevel}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSubjects(res.data);
      })
      .catch(() => {});
  }, [userLevel]);

  // ==================== تحميل التكاليف المعلقة ====================
  const loadPending = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/assignments/pending?page=${pendingPag.page}&limit=${pendingPag.limit}`,
      );
      const data = await res.json();
      if (data.success) {
        setPending(data.data);
        pendingPag.setTotal(data.total || 0);
        setStats((prev) => ({ ...prev, pending: data.total || 0 }));
      }
    } catch {
      /* صامت */
    }
  }, [pendingPag.page, pendingPag.limit]);

  // ==================== تحميل التقييمات السابقة ====================
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/assignments/history?page=${historyPag.page}&limit=${historyPag.limit}`,
      );
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        historyPag.setTotal(data.total || 0);
        setStats((prev) => ({ ...prev, evaluated: data.total || 0 }));
      }
    } catch {
      /* صامت */
    }
  }, [historyPag.page, historyPag.limit]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPending(), loadHistory()]).finally(
      () => setLoading(false),
    );
  }, []);

  useEffect(() => {
    if (activeTab === "inbox") loadPending();
  }, [activeTab, pendingPag.page]);
  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, historyPag.page]);

  // ==================== تقييم تكليف ====================
  const handleEvaluate = async () => {
    if (!evalModal) return;
    const grade = evalGrade.trim() ? parseInt(evalGrade) : null;
    if (grade !== null && (isNaN(grade) || grade < 0 || grade > 100)) {
      setEvalError("الدرجة يجب أن تكون بين 0 و 100");
      return;
    }
    setEvalLoading(true);
    setEvalError("");
    try {
      const res = await csrfFetch("/api/assignments/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: evalModal.id,
          grade,
          feedback: evalFeedback || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ تم تقييم التكليف بنجاح", "success");
        setEvalModal(null);
        setEvalGrade("");
        setEvalFeedback("");
        loadPending();
        loadHistory();
      } else {
        setEvalError(data.message || "فشل التقييم");
      }
    } catch {
      setEvalError("حدث خطأ في الاتصال");
    } finally {
      setEvalLoading(false);
    }
  };

  // ==================== حذف تكليف ====================
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التكليف؟")) return;
    try {
      const res = await csrfFetch("/api/library/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🗑️ تم حذف التكليف", "warning");
        loadHistory();
      } else {
        showToast(data.message || "فشل الحذف", "error");
      }
    } catch {
      showToast("فشل الاتصال", "error");
    }
  };

  // ==================== تحميل ملف ====================
  const downloadFile = async (item: AssignmentItem) => {
    if (!item.fileUrl) return;
    try {
      const res = await fetch(item.fileUrl);
      const blob = await res.blob();
      const ext = item.fileName?.split(".").pop() || "";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.student.name}-${item.fileName || `file.${ext}`}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.fileUrl, "_blank");
    }
  };

  // ==================== تحميل جميع الملفات ====================
  const downloadAll = () => {
    const files = pending.filter((a) => a.fileUrl);
    if (files.length === 0) {
      showToast("لا توجد ملفات للتحميل", "warning");
      return;
    }
    files.forEach((a, i) => {
      setTimeout(() => downloadFile(a), i * 500);
    });
    showToast(`📥 جاري تحميل ${files.length} ملف`, "info");
  };

  // ==================== رفع ملف الدرجات ====================
  const handleGradeUpload = async () => {
    if (!gradeFile || !gradeSubject) {
      showToast("يرجى اختيار ملف والمادة", "warning");
      return;
    }
    setGradeUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", gradeFile);
      fd.append("subjectId", gradeSubject);
      const res = await csrfFetch("/api/grades/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        showToast("📊 تم رفع توزيع الدرجات بنجاح", "success");
        setGradeFile(null);
        setGradeSubject("");
      } else {
        showToast(data.message || "فشل الرفع", "error");
      }
    } catch {
      showToast("حدث خطأ في الرفع", "error");
    } finally {
      setGradeUploading(false);
    }
  };

  // ==================== تسجيل الخروج ====================
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // ==================== أدوات مساعدة ====================
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-YE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ==================== التنسيقات ====================
  const glassStyle: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.5)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(0, 229, 255, 0.15)",
    borderRadius: "20px",
  };



  // ==================== الواجهة ====================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        fontFamily: "'Cairo', sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      <main
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: isMobile ? "16px 10px 60px" : "24px 20px 60px",
          }}
        >
          <WelcomeCard userName={userName} userLevel={userLevel} onLogout={handleLogout} lastLoginAt={user?.lastLoginAt} createdAt={user?.createdAt} />

          <QuickShortcuts
            shortcuts={[
              { label: "الإشعارات", path: "/notifications", color: "#ffca28" },
              { label: "المكتبة", path: "/library", color: "#00e5ff" },
              { label: "المحادثة", path: "/chat", color: "#39ff14" },
              { label: "تعميم", path: "/announcements/create", color: "#ff3131" },
              { label: "العمليات", path: "/teacher/audit-log", color: "#bf5af2" },
              { label: "الإعدادات", path: "/settings", color: "#8b949e" },
            ]}
            onNavigate={(path) => router.push(path)}
          />

          <StatsCards
            pending={stats.pending}
            evaluated={stats.evaluated}
            students={stats.students}
            subjects={subjects.length}
            loading={loading}
          />

          <TabsBar
            tabs={[
              { key: "inbox", label: "📥 التكاليف الواردة", badge: stats.pending },
              { key: "history", label: "📋 التقييمات السابقة", badge: stats.evaluated },
              { key: "grades", label: "📊 توزيع الدرجات" },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as Tab)}
          />

          {/* ========== محتوى التبويبات ========== */}
          <AnimatePresence mode="wait">
            {/* ===== التكاليف الواردة ===== */}
            {activeTab === "inbox" && (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {pending.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadAll}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      marginBottom: "15px",
                      background: "rgba(0,229,255,0.08)",
                      border: "1px dashed rgba(0,229,255,0.3)",
                      color: "#00e5ff",
                      cursor: "pointer",
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <DownloadAllIcon /> تحميل جميع الملفات دفعة واحدة
                  </motion.button>
                )}

                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#8b949e",
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid rgba(0,229,255,0.2)",
                        borderTopColor: "#00e5ff",
                        borderRadius: "50%",
                        margin: "0 auto 15px",
                      }}
                    />
                  </div>
                ) : pending.length === 0 ? (
                  <div
                    style={{
                      ...glassStyle,
                      padding: "50px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                      📭
                    </div>
                    <p style={{ color: "#8b949e", fontSize: "1.1rem" }}>
                      لا توجد تكاليف معلقة حالياً
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {pending.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ borderColor: "rgba(0,229,255,0.3)" }}
                        style={{
                          ...glassStyle,
                          padding: "20px",
                          transition: "border-color 0.3s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flex: 1,
                              minWidth: "200px",
                            }}
                          >
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: "rgba(0,229,255,0.12)",
                                border: "2px solid rgba(0,229,255,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: "#00e5ff",
                                flexShrink: 0,
                              }}
                            >
                              {item.student.name.charAt(0)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#e6edf3",
                                  fontSize: "1rem",
                                }}
                              >
                                {item.student.name}
                              </div>
                              <div
                                style={{ color: "#00e5ff", fontSize: "0.8rem" }}
                              >
                                {item.subject.name} ({item.subject.code})
                              </div>
                              <div
                                style={{
                                  color: "#8b949e",
                                  fontSize: "0.75rem",
                                  marginTop: "2px",
                                }}
                              >
                                {formatDate(item.createdAt)}
                                {item.fileSize
                                  ? ` • ${(item.fileSize / 1024).toFixed(1)} KB`
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {item.fileUrl && (
                              <>
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    background: "rgba(0,229,255,0.08)",
                                    border: "1px solid rgba(0,229,255,0.2)",
                                    color: "#00e5ff",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <EyeIcon /> فتح
                                </motion.a>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadFile(item)}
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(46,160,67,0.2)",
                                    background: "rgba(46,160,67,0.08)",
                                    color: "#2ea043",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontFamily: "'Cairo', sans-serif",
                                  }}
                                >
                                  <DownloadIcon /> تحميل
                                </motion.button>
                              </>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEvalModal(item);
                                setEvalGrade("");
                                setEvalFeedback("");
                                setEvalError("");
                              }}
                              style={{
                                padding: "8px 18px",
                                borderRadius: "10px",
                                border: "none",
                                background:
                                  "linear-gradient(135deg, #238636, #2ea043)",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Cairo', sans-serif",
                                fontSize: "0.85rem",
                              }}
                            >
                              تقييم
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <Pagination
                      page={pendingPag.page}
                      totalPages={pendingPag.totalPages}
                      onPageChange={pendingPag.goTo}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== التقييمات السابقة ===== */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#8b949e",
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        border: "3px solid rgba(0,229,255,0.2)",
                        borderTopColor: "#00e5ff",
                        borderRadius: "50%",
                        margin: "0 auto 15px",
                      }}
                    />
                  </div>
                ) : history.length === 0 ? (
                  <div
                    style={{
                      ...glassStyle,
                      padding: "50px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                      📭
                    </div>
                    <p style={{ color: "#8b949e", fontSize: "1.1rem" }}>
                      لا توجد تقييمات سابقة
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ borderColor: "rgba(0,229,255,0.3)" }}
                        style={{
                          ...glassStyle,
                          padding: "20px",
                          transition: "border-color 0.3s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flex: 1,
                              minWidth: "180px",
                            }}
                          >
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background:
                                  (item.grade ?? 0) >= 50
                                    ? "rgba(46,160,67,0.12)"
                                    : "rgba(248,81,73,0.12)",
                                border: `2px solid ${(item.grade ?? 0) >= 50 ? "#2ea043" : "#f85149"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                fontWeight: 800,
                                color:
                                  (item.grade ?? 0) >= 50
                                    ? "#2ea043"
                                    : "#f85149",
                                flexShrink: 0,
                              }}
                            >
                              {item.student.name.charAt(0)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#e6edf3",
                                  fontSize: "1rem",
                                }}
                              >
                                {item.student.name}
                              </div>
                              <div
                                style={{ color: "#00e5ff", fontSize: "0.8rem" }}
                              >
                                {item.subject.name}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              textAlign: "center",
                              padding: "8px 16px",
                              borderRadius: "10px",
                              background:
                                (item.grade ?? 0) >= 50
                                  ? "rgba(46,160,67,0.15)"
                                  : "rgba(248,81,73,0.15)",
                              border: `1px solid ${(item.grade ?? 0) >= 50 ? "rgba(46,160,67,0.3)" : "rgba(248,81,73,0.3)"}`,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "1.3rem",
                                fontWeight: 800,
                                color:
                                  (item.grade ?? 0) >= 50
                                    ? "#2ea043"
                                    : "#f85149",
                              }}
                            >
                              {item.grade ?? "—"}
                            </div>
                            <div
                              style={{ fontSize: "0.7rem", color: "#8b949e" }}
                            >
                              درجة
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            {item.fileUrl && (
                              <>
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    background: "rgba(0,229,255,0.08)",
                                    border: "1px solid rgba(0,229,255,0.2)",
                                    color: "#00e5ff",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <EyeIcon />
                                </motion.a>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadFile(item)}
                                  style={{
                                    padding: "8px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(46,160,67,0.2)",
                                    background: "rgba(46,160,67,0.08)",
                                    color: "#2ea043",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontFamily: "'Cairo', sans-serif",
                                  }}
                                >
                                  <DownloadIcon />
                                </motion.button>
                              </>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEvalModal(item);
                                setEvalGrade(String(item.grade || ""));
                                setEvalFeedback(item.feedback || "");
                                setEvalError("");
                              }}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "10px",
                                background: "rgba(255,202,40,0.1)",
                                border: "1px solid rgba(255,202,40,0.2)",
                                color: "#ffca28",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="إعادة تقييم"
                            >
                              <ReEvalIcon />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(item.id)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "10px",
                                background: "rgba(248,81,73,0.1)",
                                border: "1px solid rgba(248,81,73,0.2)",
                                color: "#f85149",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <DeleteIcon />
                            </motion.button>
                          </div>
                        </div>
                        {item.feedback && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "10px",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: "10px",
                              color: "#8b949e",
                              fontSize: "0.85rem",
                            }}
                          >
                            💬 {item.feedback}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    <Pagination
                      page={historyPag.page}
                      totalPages={historyPag.totalPages}
                      onPageChange={historyPag.goTo}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== توزيع الدرجات ===== */}
            {/* ===== توزيع الدرجات ===== */}
            {activeTab === "grades" && (
              <motion.div
                key="grades"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  style={{
                    ...glassStyle,
                    padding: "50px 20px",
                    textAlign: "center",
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                    📊
                  </div>
                  <h3
                    style={{
                      color: "#00e5ff",
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    تصدير وتوزيع الدرجات
                  </h3>
                  <p
                    style={{
                      color: "#8b949e",
                      fontSize: "0.9rem",
                      marginBottom: "25px",
                    }}
                  >
                    رفع ملفات الدرجات وتحليلها وتوزيعها على الطلاب
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/teacher/grades")}
                    style={{
                      padding: "14px 30px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg,#00e5ff,#0077b6)",
                      border: "none",
                      color: "#010204",
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: "pointer",
                      fontFamily: "'Cairo', sans-serif",
                      boxShadow: "0 8px 25px rgba(0,229,255,0.25)",
                    }}
                  >
                    📊 الذهاب إلى صفحة تصدير الدرجات
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      <EvaluationModal
        item={evalModal}
        grade={evalGrade}
        feedback={evalFeedback}
        loading={evalLoading}
        error={evalError}
        onGradeChange={setEvalGrade}
        onFeedbackChange={setEvalFeedback}
        onSave={handleEvaluate}
        onClose={() => setEvalModal(null)}
      />
    </div>
  );
}
