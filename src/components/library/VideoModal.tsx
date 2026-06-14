"use client";
import { motion } from "framer-motion";
import { CloseIcon } from "@/components/library/icons";

interface VideoModalProps {
  currentVideo: { url: string; title: string } | null;
  onClose: () => void;
  getYoutubeId: (url: string) => string | null;
}

const VideoModal = ({ currentVideo, onClose, getYoutubeId }: VideoModalProps) => {
  if (!currentVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(15px)",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          width: "100%",
          maxWidth: "1000px",
          aspectRatio: "16/9",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 100px rgba(0,229,255,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${getYoutubeId(currentVideo.url)}?autoplay=1`}
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={currentVideo.title}
        />
      </motion.div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        <CloseIcon />
      </motion.button>
    </motion.div>
  );
};

export default VideoModal;
