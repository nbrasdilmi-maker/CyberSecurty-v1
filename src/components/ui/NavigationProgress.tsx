"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationProgress() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "0% 50%" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #00e5ff, #bf5af2, #00ff88, #00e5ff)",
              backgroundSize: "200% 100%",
              boxShadow: "0 0 10px #00e5ff, 0 0 20px #bf5af2",
              animation: "navProgressShimmer 1s linear infinite",
            }}
          />
          <style>{`@keyframes navProgressShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
