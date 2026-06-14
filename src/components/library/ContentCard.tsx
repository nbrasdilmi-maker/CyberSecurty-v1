"use client";
import { motion } from "framer-motion";
import { ExpandIcon, DownloadIcon, EditIcon, DeleteIcon } from "@/components/library/icons";

type ContentCardType =
  | "PDF" | "DOCX" | "XLSX"
  | "PNG" | "JPG"
  | "YOUTUBE_LINK"
  | "MP3" | "WAV";

interface ContentCardItem {
  id: string;
  title: string;
  description?: string;
  type: ContentCardType;
  fileUrl?: string;
  youtubeUrl?: string;
  fileSize?: number;
  level: string;
  semester: string;
  publisherId: string;
  createdAt: string;
  publisher: { id: string; name: string; role: string };
  subject?: { id: string; name: string };
}

interface ContentCardProps {
  item: ContentCardItem;
  getYoutubeId: (url: string) => string | null;
  setCurrentVideo: (video: { url: string; title: string }) => void;
  getTypeIcon: (type: string) => string;
  getTypeLabel: (type: string) => string;
  formatSize: (bytes?: number) => string;
  formatDate: (date: string) => string;
  handleEdit: (item: ContentCardItem) => void;
  handleDelete: (id: string) => void;
  userId: string;
  userRole: string;
  glassStyle: React.CSSProperties;
}

const ContentCard = ({
  item,
  getYoutubeId,
  setCurrentVideo,
  getTypeIcon,
  getTypeLabel,
  formatSize,
  formatDate,
  handleEdit,
  handleDelete,
  userId,
  userRole,
  glassStyle,
}: ContentCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.4, type: "spring" }}
      whileHover={{
        y: -5,
        boxShadow: "0 20px 50px rgba(0, 229, 255, 0.15)",
      }}
      style={{
        ...glassStyle,
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* محتوى البطاقة - صورة أو فيديو */}
      {item.type === "YOUTUBE_LINK" &&
        (item.youtubeUrl || item.fileUrl) && (
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%",
              background: "#000",
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(item.youtubeUrl || item.fileUrl || "")}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setCurrentVideo({
                  url: item.youtubeUrl || item.fileUrl || "",
                  title: item.title,
                })
              }
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              <ExpandIcon />
            </motion.button>
          </div>
        )}

      {(item.type === "PNG" || item.type === "JPG") &&
        item.fileUrl && (
          <div
            style={{
              width: "100%",
              height: "220px",
              overflow: "hidden",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <img
              src={item.fileUrl}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

      {(item.type === "MP3" || item.type === "WAV") &&
        item.fileUrl && (
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <audio
              controls
              style={{ width: "100%", borderRadius: "10px" }}
            >
              <source
                src={item.fileUrl}
                type={
                  item.type === "MP3" ? "audio/mpeg" : "audio/wav"
                }
              />
            </audio>
          </div>
        )}

      {/* جسم البطاقة */}
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "2.2rem", lineHeight: 1 }}>
            {getTypeIcon(item.type)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                margin: "0 0 4px",
                color: "#e6edf3",
                wordBreak: "break-word",
              }}
            >
              {item.title}
            </h3>
            {item.description && (
              <p
                style={{
                  color: "#8b949e",
                  fontSize: "0.8rem",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* الوسوم */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              background: "rgba(0,229,255,0.1)",
              color: "#00e5ff",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {getTypeLabel(item.type)}
          </span>
          {item.subject && (
            <span
              style={{
                background: "rgba(191,90,242,0.1)",
                color: "#bf5af2",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              📘 {item.subject.name}
            </span>
          )}
          {item.fileSize && (
            <span
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "#8b949e",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "0.7rem",
              }}
            >
              {formatSize(item.fileSize)}
            </span>
          )}
        </div>

        {/* معلومات الناشر + التاريخ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background:
                  item.publisher.role === "TEACHER"
                    ? "rgba(191,90,242,0.2)"
                    : item.publisher.role === "ADMIN"
                      ? "rgba(255,49,49,0.2)"
                      : "rgba(0,229,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.8rem",
                color:
                  item.publisher.role === "TEACHER"
                    ? "#bf5af2"
                    : item.publisher.role === "ADMIN"
                      ? "#ff3131"
                      : "#00e5ff",
              }}
            >
              {item.publisher.name.charAt(0)}
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#e6edf3",
                  margin: 0,
                }}
              >
                {item.publisher.name}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "#8b949e",
                  margin: 0,
                }}
              >
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {item.type !== "YOUTUBE_LINK" && item.fileUrl && (
            <a
              href={item.fileUrl}
              download
              style={{
                flex: 1,
                textAlign: "center",
                textDecoration: "none",
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.2)",
                color: "#00e5ff",
                fontWeight: 700,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <DownloadIcon /> تحميل
            </a>
          )}

          {item.type === "YOUTUBE_LINK" &&
            (item.youtubeUrl || item.fileUrl) && (
              <a
                href={item.youtubeUrl || item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  textAlign: "center",
                  textDecoration: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "rgba(255,0,0,0.1)",
                  border: "1px solid rgba(255,0,0,0.2)",
                  color: "#ff4444",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                ▶️ فتح في اليوتيوب
              </a>
            )}

          {/* أزرار التعديل والحذف لصاحب المنشور أو الأدمن */}
          {(item.publisherId === userId ||
            userRole === "ADMIN") && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(item)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  background: "rgba(255,202,40,0.1)",
                  border: "1px solid rgba(255,202,40,0.2)",
                  color: "#ffca28",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <EditIcon />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(item.id)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  background: "rgba(248,81,73,0.1)",
                  border: "1px solid rgba(248,81,73,0.2)",
                  color: "#f85149",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <DeleteIcon />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
