"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Subject } from "./mockData";

const ITEM_H = 62;
const VISIBLE = 5;
const CENTER_OFFSET = Math.floor(VISIBLE / 2);

interface Props {
  items: Subject[];
  onSelect: (item: Subject) => void;
  selected?: Subject | null;
}

export default function VerticalWheelPicker({ items, onSelect, selected }: Props) {
  const [activeIdx, setActiveIdx] = useState(() => {
    if (selected) return items.findIndex((s) => s.id === selected.id);
    return Math.floor(items.length / 2);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchY = useRef(0);
  const wheelAccum = useRef(0);

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      setActiveIdx(clamped);
      onSelect(items[clamped]);
    },
    [items, onSelect]
  );

  const goUp = useCallback(() => goTo(activeIdx - 1), [activeIdx, goTo]);
  const goDown = useCallback(() => goTo(activeIdx + 1), [activeIdx, goTo]);

  // Mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) >= 40) {
        if (wheelAccum.current < 0) goUp();
        else goDown();
        wheelAccum.current = 0;
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [goUp, goDown]);

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (dy < -30) goUp();
    else if (dy > 30) goDown();
  };

  // Keyboard
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); goUp(); }
      if (e.key === "ArrowDown") { e.preventDefault(); goDown(); }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [goUp, goDown]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        height: ITEM_H * VISIBLE,
        overflow: "hidden",
        borderRadius: "24px",
        background: "rgba(5,15,35,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,180,255,0.15)",
        cursor: "grab",
        outline: "none",
        userSelect: "none",
      }}
    >
      {/* Clickable up arrow */}
      {activeIdx > 0 && (
        <motion.button
          whileHover={{ scale: 1.15, color: "rgba(0,180,255,1)" }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); goUp(); }}
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            color: "rgba(0,180,255,0.6)",
            fontSize: "1.1rem",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,180,255,0.2)",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            lineHeight: 1,
            padding: 0,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          ▲
        </motion.button>
      )}
      {/* Clickable down arrow */}
      {activeIdx < items.length - 1 && (
        <motion.button
          whileHover={{ scale: 1.15, color: "rgba(0,180,255,1)" }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); goDown(); }}
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            color: "rgba(0,180,255,0.6)",
            fontSize: "1.1rem",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,180,255,0.2)",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            lineHeight: 1,
            padding: 0,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          ▼
        </motion.button>
      )}

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "85%",
          height: ITEM_H,
          borderRadius: 16,
          background: "rgba(20,35,80,0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,180,255,0.4)",
          boxShadow: "0 0 15px rgba(0,180,255,0.3), 0 0 40px rgba(0,180,255,0.15)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          height: ITEM_H,
          zIndex: 1,
        }}
      >
        {items.map((item, i) => {
          const offset = i - activeIdx;
          const absOff = Math.abs(offset);
          if (absOff > CENTER_OFFSET) return null;

          const yOffset = offset * ITEM_H;
          const scaleVal = 1 - absOff * 0.15;
          const opacityVal = 1 - absOff * 0.28;
          const blurVal = absOff * 1.2;

          return (
            <motion.div
              key={item.id}
              animate={{
                y: yOffset,
                scale: scaleVal,
                opacity: opacityVal,
                filter: `blur(${blurVal}px)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                position: "absolute",
                left: "7.5%",
                width: "85%",
                height: ITEM_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                borderRadius: 16,
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span
                  style={{
                    color: offset === 0 ? "#fff" : "rgba(255,255,255,0.85)",
                    fontWeight: offset === 0 ? 800 : 600,
                    fontSize: offset === 0 ? "0.95rem" : "0.82rem",
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    color: offset === 0 ? "rgba(0,180,255,0.8)" : "rgba(255,255,255,0.35)",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  }}
                >
                  {item.code}
                </span>
              </div>
              {offset === 0 && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00B4FF",
                    boxShadow: "0 0 10px rgba(0,180,255,0.6)",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
