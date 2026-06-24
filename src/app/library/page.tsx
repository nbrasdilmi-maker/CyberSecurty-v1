"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";
import Pagination from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { csrfFetch } from "@/lib/csrfClient";
import { useAuthStore } from "@/store/authStore";
import { APP_CONFIG } from "@/config";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useUploadPermission } from "@/hooks/useUploadPermission";
import { useUploadModal } from "@/hooks/useUploadModal";
import { deriveStaticChannelName } from "@/lib/realtimeChannels";
import { UploadIcon, FilterIcon, ShieldIcon, SearchIcon, PlayIcon, ExpandIcon, DownloadIcon, EditIcon, DeleteIcon, CloseIcon } from "@/components/library/icons";
import VideoModal from "@/components/library/VideoModal";
import EditModal from "@/components/library/EditModal";
import FilterModal from "@/components/library/FilterModal";
import ContentCard from "@/components/library/ContentCard";

// ==================== الأنواع ====================
type ContentType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "PNG"
  | "JPG"
  | "YOUTUBE_LINK"
  | "MP3"
  | "WAV";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  fileUrl?: string;
  youtubeUrl?: string;
  fileSize?: number;
  level: string;
  semester: string;
  subjectId?: string;
  publisherId: string;
  createdAt: string;
  publisher: { id: string; name: string; role: string };
  subject?: { id: string; name: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

// ==================== المكوّن الرئيسي ====================
export default function LibraryPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();

  // البيانات
  const [content, setContent] = useState<ContentItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // النوافذ المنبثقة
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // الفلترة
  const [filterType, setFilterType] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState("");

  // الترقيم
  const pag = usePagination(1, APP_CONFIG.itemsPerPage);



  // التعديل
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");

  const userRole = user?.role || "";
  const userLevel = user?.level || "";
  const userId = user?.id || "";

  useSupabaseRealtime(deriveStaticChannelName(`library-level-${userLevel}`), "new-content", () => {
    loadContent();
  });
  useSupabaseRealtime(deriveStaticChannelName(`library-level-${userLevel}`), "content-deleted", () => {
    loadContent();
  });
  // ==================== تحميل المحتوى ====================
  const loadContent = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterSubject) params.set("subjectId", filterSubject);
      if (filterSearch) params.set("search", filterSearch);
      params.set("page", String(pag.page));
      params.set("limit", String(pag.limit));

      const res = await fetch(`/api/library/content?${params}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.data);
        pag.setTotal(data.total || 0);
      }
    } catch {
      // صامت
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSubject, filterSearch, pag.page, pag.limit]);

  // ==================== تحميل المواد ====================
  const loadSubjects = useCallback(async () => {
    if (!userLevel) return;
    try {
      const res = await fetch(`/api/subjects/active?level=${userLevel}`);
      const data = await res.json();
      if (data.success && data.data?.length) {
        setSubjects(data.data);
      }
    } catch {
      // صامت
    }
  }, [userLevel]);

  useEffect(() => {
    loadContent();
    loadSubjects();
  }, [loadContent, loadSubjects]);



  // ==================== التعديل ====================
  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description || "");
    setEditSubjectId(item.subjectId || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editTitle.trim()) return;
    try {
      const res = await csrfFetch(`/api/library/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle.trim(),
          description: editDesc.trim(),
          subjectId: editSubjectId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("تم تعديل المنشور بنجاح", "success");
        setEditingItem(null);
        loadContent();
      } else {
        showToast(data.message || "فشل التعديل", "error");
      }
    } catch {
      showToast("فشل الاتصال بالخادم", "error");
    }
  };

  // ==================== الحذف ====================
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    try {
      const res = await csrfFetch(`/api/library/content`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("تم حذف المنشور", "warning");
        loadContent();
      } else {
        showToast(data.message || "فشل الحذف", "error");
      }
    } catch {
      showToast("فشل الاتصال بالخادم", "error");
    }
  };

  // ==================== استخراج ID اليوتيوب ====================
  const getYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
      /(?:youtube\.com\/shorts\/)([^?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const {
    uploadTitle,
    setUploadTitle,
    uploadDesc,
    setUploadDesc,
    uploadType,
    setUploadType,
    uploadSubjectId,
    setUploadSubjectId,
    uploadYoutubeUrl,
    setUploadYoutubeUrl,
    uploadFile,
    setUploadFile,
    uploadTargetLevel,
    setUploadTargetLevel,
    uploading,
    uploadProgress,
    fileInputRef,
    handleUpload,
    resetUploadForm,
  } = useUploadModal({
    setSubjects,
    getYoutubeId,
    userRole,
    showToast,
    setShowUploadModal,
    loadContent,
  });

  // ==================== أدوات العرض ====================
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      PDF: "📄",
      DOCX: "📝",
      XLSX: "📊",
      PNG: "🖼️",
      JPG: "🖼️",
      YOUTUBE_LINK: "▶️",
      MP3: "🎵",
      WAV: "🎵",
    };
    return icons[type] || "📁";
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      PDF: "ملف PDF",
      DOCX: "مستند Word",
      XLSX: "جدول Excel",
      PNG: "صورة",
      JPG: "صورة",
      YOUTUBE_LINK: "فيديو تعليمي",
      MP3: "ملف صوتي",
      WAV: "ملف صوتي",
    };
    return labels[type] || "ملف";
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("ar-YE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
      LEVEL_1: "المستوى الأول",
      LEVEL_2: "المستوى الثاني",
      LEVEL_3: "المستوى الثالث",
      LEVEL_4: "المستوى الرابع",
    };
    return labels[level] || level;
  };

  const { canPublish, canManagePermissions } = useUploadPermission(userId, userRole);

  // ==================== التنسيقات العامة ====================
  const glassStyle: React.CSSProperties = {
    background: "rgba(10, 20, 40, 0.6)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(0, 229, 255, 0.15)",
    borderRadius: "20px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#e6edf3",
    fontSize: "0.95rem",
    fontFamily: "'Cairo', sans-serif",
    outline: "none",
    transition: "all 0.3s",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #00e5ff, #0077b6)",
    color: "#010204",
    border: "none",
    borderRadius: "14px",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s",
    letterSpacing: "0.5px",
  };

  // ==================== الواجهة ====================
  return (
    <>
        <main
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "24px 20px 60px",
          }}
        >
          {/* ========== الهيدر ========== */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...glassStyle,
              padding: "20px 30px",
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ fontSize: "2rem" }}>📚</div>
              <div>
                <h2
                  style={{
                    color: "#00e5ff",
                    fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  المكتبة التعليمية
                </h2>
                <p
                  style={{
                    color: "#8b949e",
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                  }}
                >
                  {getLevelLabel(userLevel)}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* أيقونة الفلترة */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilterModal(true)}
                style={{
                  padding: "12px 18px",
                  background: "rgba(0, 229, 255, 0.08)",
                  border: "1px solid rgba(0, 229, 255, 0.25)",
                  borderRadius: "14px",
                  color: "#00e5ff",
                  cursor: "pointer",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <FilterIcon /> فلترة
              </motion.button>

              {/* أيقونة ترقية الحسابات */}
              {canManagePermissions && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/library/permissions")}
                  style={{
                    padding: "12px 18px",
                    background: "rgba(122, 0, 255, 0.1)",
                    border: "1px solid rgba(122, 0, 255, 0.3)",
                    borderRadius: "14px",
                    color: "#bf5af2",
                    cursor: "pointer",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.9rem",
                  }}
                >
                  <ShieldIcon /> ترقية الحسابات
                </motion.button>
              )}

              {/* أيقونة نشر منشور */}
              {canPublish && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    resetUploadForm();
                    loadSubjects();
                    setShowUploadModal(true);
                  }}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #00e5ff, #0099cc)",
                    border: "none",
                    borderRadius: "14px",
                    color: "#010204",
                    cursor: "pointer",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    boxShadow: "0 8px 30px rgba(0, 229, 255, 0.2)",
                  }}
                >
                  <UploadIcon /> نشر منشور
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* ========== البطاقات ========== */}
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: "#8b949e" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                style={{
                  width: "50px",
                  height: "50px",
                  border: "3px solid rgba(0,229,255,0.2)",
                  borderTopColor: "#00e5ff",
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                }}
              />
              <p>جاري تحميل المكتبة...</p>
            </div>
          ) : content.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                ...glassStyle,
                padding: "60px 30px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "15px" }}>📭</div>
              <h3
                style={{
                  color: "#8b949e",
                  fontSize: "1.3rem",
                  marginBottom: "8px",
                }}
              >
                المكتبة فارغة
              </h3>
              <p style={{ color: "#5a6a7a" }}>
                لا يوجد محتوى حالياً في هذا المستوى الدراسي
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <AnimatePresence mode="popLayout">
                {content.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    getYoutubeId={getYoutubeId}
                    setCurrentVideo={setCurrentVideo}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    formatSize={formatSize}
                    formatDate={formatDate}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    userId={userId}
                    userRole={userRole}
                    glassStyle={glassStyle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ========== الترقيم ========== */}
          {content.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <Pagination
                page={pag.page}
                totalPages={pag.totalPages}
                onPageChange={pag.goTo}
              />
            </div>
          )}
        </main>

      {/* ==================== نافذة النشر ==================== */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUploadModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              style={{
                ...glassStyle,
                maxWidth: "550px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "30px",
                boxShadow: "0 0 80px rgba(0, 229, 255, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <h3
                  style={{
                    color: "#00e5ff",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  📤 نشر محتوى جديد
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b949e",
                    cursor: "pointer",
                  }}
                >
                  <CloseIcon />
                </motion.button>
              </div>

              {/* نوع المنشور */}
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
              >
                {[
                  {
                    value: "general",
                    label: "📺 للاستفادة العامة",
                    desc: "كورس يوتيوب",
                  },
                  {
                    value: "material",
                    label: "📘 مرتبط بمادة",
                    desc: "ملزمة - محاضرة - ملف",
                  },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setUploadType(opt.value as "general" | "material");
                      if (opt.value === "general") setUploadSubjectId("");
                    }}
                    style={{
                      flex: 1,
                      padding: "15px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      background:
                        uploadType === opt.value
                          ? "rgba(0,229,255,0.12)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        uploadType === opt.value
                          ? "1px solid #00e5ff"
                          : "1px solid rgba(255,255,255,0.08)",
                      color: uploadType === opt.value ? "#00e5ff" : "#8b949e",
                      textAlign: "center",
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>
                      {opt.label.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      {opt.desc}
                    </div>
                  </motion.button>
                ))}
              </div>
              {/* تحديد المستوى الدراسي (للأدمن فقط) */}
              {userRole === "ADMIN" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ marginBottom: "16px" }}
                >
                  <label
                    style={{
                      color: "#ffca28",
                      fontSize: "0.85rem",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    👑 تحديد المستوى الدراسي المستهدف
                  </label>
                  <select
                    value={uploadTargetLevel || userLevel}
                    onChange={(e) => setUploadTargetLevel(e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      cursor: "pointer",
                      border: "1px solid rgba(255,202,40,0.3)",
                    }}
                  >
                    <option value="LEVEL_1">المستوى الأول</option>
                    <option value="LEVEL_2">المستوى الثاني</option>
                    <option value="LEVEL_3">المستوى الثالث</option>
                    <option value="LEVEL_4">المستوى الرابع</option>
                  </select>
                </motion.div>
              )}

              {/* اختيار المادة (للمرتبط بمادة) */}
              {uploadType === "material" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ marginBottom: "16px" }}
                >
                  <label
                    style={{
                      color: "#bf5af2",
                      fontSize: "0.85rem",
                      marginBottom: "8px",
                      display: "block",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    📘 اختر المادة الدراسية
                  </label>
                  {subjects.length === 0 ? (
                    <div
                      style={{
                        ...inputStyle,
                        textAlign: "center",
                        color: "#f85149",
                        background: "rgba(248,81,73,0.1)",
                        border: "1px solid rgba(248,81,73,0.2)",
                      }}
                    >
                      ⚠️ لا توجد مواد متاحة
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        padding: "4px",
                      }}
                    >
                      {subjects.map((s) => (
                        <motion.button
                          key={s.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setUploadSubjectId(s.id)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            background:
                              uploadSubjectId === s.id
                                ? "rgba(191,90,242,0.15)"
                                : "rgba(255,255,255,0.03)",
                            border:
                              uploadSubjectId === s.id
                                ? "1px solid #bf5af2"
                                : "1px solid rgba(255,255,255,0.08)",
                            color:
                              uploadSubjectId === s.id ? "#bf5af2" : "#e6edf3",
                            cursor: "pointer",
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            textAlign: "center",
                            transition: "all 0.2s",
                          }}
                        >
                          <span style={{ fontSize: "1rem", marginLeft: "6px" }}>
                            📘
                          </span>
                          {s.name}
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              color: "#8b949e",
                              marginTop: "2px",
                            }}
                          >
                            {s.code}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* رابط اليوتيوب */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    color: "#8b949e",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  {uploadType === "general"
                    ? "🔗 رابط كورس اليوتيوب *"
                    : "🔗 رابط فيديو يوتيوب (اختياري)"}
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={uploadYoutubeUrl}
                  onChange={(e) => setUploadYoutubeUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* عنوان المنشور */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    color: "#8b949e",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  عنوان المنشور *
                </label>
                <input
                  type="text"
                  placeholder="أدخل عنوان المنشور..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* وصف المنشور */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    color: "#8b949e",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  وصف المنشور
                </label>
                <textarea
                  placeholder="أدخل وصفاً مختصراً..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
              </div>

              {/* رفع ملف (للمرتبط بمادة فقط) */}
              {uploadType === "material" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ marginBottom: "16px" }}
                >
                  <label
                    style={{
                      color: "#8b949e",
                      fontSize: "0.85rem",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    📎 إرفاق ملف (PDF, Word, Excel, صورة, صوت)
                  </label>
                  <motion.div
                    whileHover={{ borderColor: "rgba(0,229,255,0.4)" }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      ...inputStyle,
                      border: "2px dashed rgba(255,255,255,0.15)",
                      padding: "25px",
                      textAlign: "center",
                      cursor: "pointer",
                      color: "#8b949e",
                    }}
                  >
                    {uploadFile ? (
                      <span style={{ color: "#00e5ff" }}>
                        📎 {uploadFile.name} ({formatSize(uploadFile.size)})
                      </span>
                    ) : (
                      <span>اسحب وأفلت الملف هنا أو انقر للاختيار</span>
                    )}
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.mp3,.wav"
                    style={{ display: "none" }}
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  {uploadFile && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUploadFile(null)}
                      style={{
                        marginTop: "8px",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "rgba(248,81,73,0.1)",
                        border: "1px solid rgba(248,81,73,0.2)",
                        color: "#f85149",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      إزالة الملف
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* شريط التقدم */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #00e5ff, #39ff14)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      color: "#8b949e",
                      fontSize: "0.8rem",
                      textAlign: "center",
                      marginTop: "6px",
                    }}
                  >
                    {uploadProgress}%
                  </p>
                </motion.div>
              )}

              {/* زر النشر */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  ...btnPrimary,
                  opacity: uploading ? 0.6 : 1,
                  boxShadow: "0 10px 30px rgba(0, 229, 255, 0.25)",
                }}
              >
                {uploading ? "⏳ جاري النشر..." : "🚀 نشر المنشور"}
              </motion.button>

              <p
                style={{
                  color: "#5a6a7a",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                الحد الأقصى للملف: 20MB | الأنواع المسموحة: PDF, DOCX, XLSX,
                PNG, JPG, MP3
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            filterSearch={filterSearch}
            setFilterSearch={setFilterSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            filterSubject={filterSubject}
            setFilterSubject={setFilterSubject}
            subjects={subjects}
            setShowFilterModal={setShowFilterModal}
            loadContent={loadContent}
            glassStyle={glassStyle}
            inputStyle={inputStyle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingItem && (
          <EditModal
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            editSubjectId={editSubjectId}
            setEditSubjectId={setEditSubjectId}
            subjects={subjects}
            handleSaveEdit={handleSaveEdit}
            onClose={() => setEditingItem(null)}
            glassStyle={glassStyle}
            inputStyle={inputStyle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideoModal && currentVideo && (
          <VideoModal
            currentVideo={currentVideo}
            onClose={() => { setShowVideoModal(false); setCurrentVideo(null); }}
            getYoutubeId={getYoutubeId}
          />
        )}
      </AnimatePresence>
    </>
  );
}
