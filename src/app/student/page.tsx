"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/store/authStore";
import { csrfFetch } from "@/lib/csrfClient";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

import StatsCards from "@/components/student-mock/StatsCards";
import WelcomeHero from "@/components/student-mock/WelcomeHero";
import QuickShortcuts from "@/components/student-mock/QuickShortcuts";
import UploadSection from "@/components/student-mock/UploadSection";
import AssignmentsTable from "@/components/student-mock/AssignmentsTable";
import type { AssignmentItem } from "@/components/student-mock/AssignmentsTable";
import GradesSection from "@/components/student-mock/GradesSection";
import type { GradeItem } from "@/components/student-mock/GradesSection";

interface Subject {
  id: string;
  name: string;
  code: string;
}

type MobileTab = "upload" | "assignments" | "grades" | null;

const tabMeta: { key: MobileTab; label: string; icon: string; color: string }[] = [
  { key: "upload", label: "رفع", icon: "\u{1F4E4}", color: "#12C7FF" },
  { key: "assignments", label: "التكاليف", icon: "\u{1F4CB}", color: "#22C55E" },
  { key: "grades", label: "الدرجات", icon: "\u{1F4CA}", color: "#A855F7" },
];

export default function StudentDashboardV2() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  const userId = user?.id || "";
  const userName = user?.name || "";
  const userLevel = user?.level || "";

  // Realtime
  useSupabaseRealtime(`user-${userId}`, "assignment-update", (data: any) => {
    loadAssignments();
    if (data.grade !== undefined) {
      showToast(`✅ تم تقييم ${data.subjectName}: ${data.grade}`, "success");
    }
  });

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, evaluated: 0, subjects: 0 });

  // Pagination
  const assignPag = usePagination(1, 20);
  const gradesPag = usePagination(1, 20);

  // Upload state
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string }>({ show: false, id: "" });

  // Mobile toggle
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>(null);

  // === Load subjects ===
  useEffect(() => {
    fetch(`/api/subjects/active?level=${userLevel}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSubjects(res.data);
          setStats((prev) => ({ ...prev, subjects: res.data.length }));
        }
      })
      .catch(() => {});
  }, [userLevel]);

  // === Load assignments ===
  const loadAssignments = useCallback(async () => {
    try {
      const res = await fetch(`/api/assignments/list?page=${assignPag.page}&limit=${assignPag.limit}`);
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
        assignPag.setTotal(data.total || 0);
        const ev = (data.data || []).filter((a: AssignmentItem) => a.status === "evaluated").length;
        setStats({ total: data.total || 0, evaluated: ev, subjects: subjects.length });
      }
    } catch {}
  }, [assignPag.page, assignPag.limit, subjects.length]);

  // === Load grades ===
  const loadGrades = useCallback(async () => {
    try {
      const res = await fetch(`/api/grades/list?page=${gradesPag.page}&limit=${gradesPag.limit}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const normalized = (data.data || []).map((g: any) => ({
          id: g.id,
          grade: g.grade ?? 0,
          feedback: g.feedback || "",
          subject: g.subject || { id: "", name: g.subjectName || "", code: "" },
          createdAt: g.createdAt,
          evaluatedAt: g.evaluatedAt,
        }));
        setGrades(normalized);
      }
      gradesPag.setTotal(data.total || 0);
    } catch {}
  }, [gradesPag.page, gradesPag.limit]);

  useEffect(() => {
    setLoading(true);
    loadAssignments().finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAssignments(); }, [assignPag.page]);
  useEffect(() => { loadGrades(); }, [gradesPag.page]);

  // === Upload ===
  const handleUpload = async () => {
    if (!selectedFile || !selectedSubject) {
      showToast("يرجى اختيار المادة والملف", "warning");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 12, 90));
    }, 400);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("subjectId", selectedSubject.id);
      const res = await csrfFetch("/api/assignments/upload", { method: "POST", body: fd });
      clearInterval(progressInterval);
      setUploadProgress(100);
      const data = await res.json();
      if (data.success) {
        showToast("✅ تم رفع التكليف بنجاح", "success");
        setSelectedFile(null);
        setSelectedSubject(null);
        loadAssignments();
      } else {
        showToast(data.message || "فشل الرفع", "error");
      }
    } catch {
      showToast("حدث خطأ في الرفع", "error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  // === Delete ===
  const handleDeleteClick = (id: string) => setConfirmDelete({ show: true, id });

  const executeDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ show: false, id: "" });
    try {
      const res = await csrfFetch("/api/assignments/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🗑️ تم حذف التكليف بنجاح", "warning");
        loadAssignments();
      } else {
        showToast(data.message || "فشل الحذف", "error");
      }
    } catch {
      showToast("فشل الاتصال", "error");
    }
  };

  // === View file ===
  const handleViewFile = (url: string) => window.open(url, "_blank");

  // === Mobile detection ===
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleTabClick = useCallback((tab: MobileTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }, []);

  const closeActiveTab = useCallback(() => {
    setActiveTab(null);
  }, []);

  // Auto-hide upload section after 2 min on mobile
  useEffect(() => {
    if (activeTab !== "upload" || !isMobile) return;
    const t = setTimeout(() => setActiveTab(null), 120_000);
    return () => clearTimeout(t);
  }, [activeTab, isMobile]);

  // === Glass style ===
  const glassStyle: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.5)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(0, 229, 255, 0.15)",
    borderRadius: "20px",
  };

  const desktopGrid = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px", marginBottom: "25px" }}>
        <UploadSection
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectSelect={setSelectedSubject}
          file={selectedFile}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onUpload={handleUpload}
          onFileChange={setSelectedFile}
        />
        <AssignmentsTable
          items={assignments}
          loading={loading}
          page={assignPag.page}
          totalPages={assignPag.totalPages}
          onPageChange={assignPag.goTo}
          onDelete={handleDeleteClick}
          onViewFile={handleViewFile}
        />
      </div>
      <GradesSection grades={grades} />
    </>
  );

  const mobileContent = (
    <div style={{ position: "relative", minHeight: "200px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        {tabMeta.map((t) => (
          <motion.button
            key={t.key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTabClick(t.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "14px",
              border: activeTab === t.key ? `2px solid ${t.color}` : "1px solid rgba(255,255,255,0.08)",
              background: activeTab === t.key ? `${t.color}15` : "rgba(255,255,255,0.03)",
              color: activeTab === t.key ? t.color : "#9FB3C8",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
            <div style={{ position: "relative" }}>
              <CloseButton onClick={closeActiveTab} />
              <UploadSection
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectSelect={setSelectedSubject}
                file={selectedFile}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onUpload={handleUpload}
                onFileChange={setSelectedFile}
              />
            </div>
          </motion.div>
        )}
        {activeTab === "assignments" && (
          <motion.div key="assignments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
            <div style={{ position: "relative" }}>
              <CloseButton onClick={closeActiveTab} />
              <AssignmentsTable
                items={assignments}
                loading={loading}
                page={assignPag.page}
                totalPages={assignPag.totalPages}
                onPageChange={assignPag.goTo}
                onDelete={handleDeleteClick}
                onViewFile={handleViewFile}
              />
            </div>
          </motion.div>
        )}
        {activeTab === "grades" && (
          <motion.div key="grades" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
            <div style={{ position: "relative" }}>
              <CloseButton onClick={closeActiveTab} />
              <GradesSection grades={grades} />
            </div>
          </motion.div>
        )}
        {activeTab === null && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "40px 20px", color: "#555", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>👆</div>
            اختر قسماً من الأعلى لبدء العرض
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

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
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "16px 10px 60px" : "24px 20px 60px" }}>
        <WelcomeHero userName={userName} userLevel={userLevel} lastLoginAt={user?.lastLoginAt} createdAt={user?.createdAt} />
        <QuickShortcuts />
        <StatsCards stats={stats} loading={loading} />
        {isMobile ? mobileContent : desktopGrid}
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete.show && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 400, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", padding: "20px",
            }}
            onClick={() => setConfirmDelete({ show: false, id: "" })}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...glassStyle, padding: "30px", maxWidth: "420px", width: "100%",
                textAlign: "center", border: "1px solid rgba(248,81,73,0.3)",
                boxShadow: "0 0 60px rgba(248,81,73,0.15)",
              }}
            >
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "rgba(248,81,73,0.15)", margin: "0 auto 15px",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
              }}>
                ⚠️
              </div>
              <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
                تأكيد الحذف
              </h3>
              <p style={{ color: "#8b949e", fontSize: "0.9rem", marginBottom: "25px" }}>
                هل أنت متأكد من حذف هذا التكليف؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDelete({ show: false, id: "" })}
                  style={{
                    flex: 1, padding: "13px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#8b949e", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={executeDelete}
                  style={{
                    flex: 1.5, padding: "13px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #f85149, #da3633)",
                    border: "none", color: "#fff", cursor: "pointer", fontWeight: 800,
                    fontSize: "0.95rem", fontFamily: "'Cairo', sans-serif",
                    boxShadow: "0 8px 25px rgba(248,81,73,0.3)",
                  }}
                >
                  نعم، احذف
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      onClick={onClick} title="إخفاء"
      style={{
        position: "absolute", top: 10, left: 10, zIndex: 10,
        width: 32, height: 32, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.4)", color: "#e6edf3",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1rem", lineHeight: 1,
      }}
    >
      ✕
    </motion.button>
  );
}
