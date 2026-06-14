import { useState, useEffect, useRef } from "react";
import { csrfFetch } from "@/lib/csrfClient";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface UseUploadModalParams {
  setSubjects: (subjects: Subject[]) => void;
  getYoutubeId: (url: string) => string | null;
  userRole: string;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  setShowUploadModal: (show: boolean) => void;
  loadContent: () => Promise<void>;
}

export function useUploadModal({
  setSubjects,
  getYoutubeId,
  userRole,
  showToast,
  setShowUploadModal,
  loadContent,
}: UseUploadModalParams) {
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadType, setUploadType] = useState<"material" | "general">(
    "general",
  );
  const [uploadSubjectId, setUploadSubjectId] = useState("");
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTargetLevel, setUploadTargetLevel] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadYoutubeUrl && !uploadTitle) {
      const id = getYoutubeId(uploadYoutubeUrl);
      if (id) {
        setUploadTitle("فيديو تعليمي");
      }
    }
  }, [uploadYoutubeUrl]);

  useEffect(() => {
    if (userRole === "ADMIN" && uploadTargetLevel) {
      fetch(`/api/subjects/active?level=${uploadTargetLevel}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) setSubjects(res.data || []);
        })
        .catch(() => {});
    }
  }, [uploadTargetLevel, userRole]);

  const handleUpload = async () => {
    if (!uploadTitle.trim()) {
      showToast("يرجى إدخال عنوان المنشور", "warning");
      return;
    }

    if (uploadType === "general" && !uploadYoutubeUrl.trim()) {
      showToast("يرجى إدخال رابط اليوتيوب", "warning");
      return;
    }

    if (uploadType === "material" && !uploadFile && !uploadYoutubeUrl.trim()) {
      showToast("يرجى إرفاق ملف أو رابط فيديو", "warning");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", uploadTitle.trim());
      formData.append("description", uploadDesc.trim());
      formData.append("uploadType", uploadType);
      if (uploadSubjectId) formData.append("subjectId", uploadSubjectId);
      if (uploadYoutubeUrl.trim())
        formData.append("youtubeUrl", uploadYoutubeUrl.trim());
      if (uploadFile) formData.append("file", uploadFile);
      if (userRole === "ADMIN" && uploadTargetLevel)
        formData.append("targetLevel", uploadTargetLevel);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const res = await csrfFetch("/api/library/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        showToast("تم نشر المحتوى بنجاح 🚀", "success");
        resetUploadForm();
        setShowUploadModal(false);
        loadContent();
      } else {
        showToast(data.message || "فشل النشر", "error");
      }
    } catch {
      showToast("فشل الاتصال بالخادم", "error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadDesc("");
    setUploadType("general");
    setUploadSubjectId("");
    setUploadYoutubeUrl("");
    setUploadFile(null);
    setUploadProgress(0);
  };

  return {
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
    setUploading,
    uploadProgress,
    setUploadProgress,
    fileInputRef,
    handleUpload,
    resetUploadForm,
  };
}
