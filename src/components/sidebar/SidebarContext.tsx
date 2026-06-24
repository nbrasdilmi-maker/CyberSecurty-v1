"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

interface SidebarContextValue {
  isExpanded: boolean;
  toggleExpanded: () => void;
  setExpanded: (v: boolean) => void;
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "sidebar-expanded";

function useWindowWidth() {
  const [width, setWidth] = useState(1280);
  useEffect(() => {
    setWidth(window.innerWidth);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const width = useWindowWidth();
  const [isExpanded, setIsExpanded] = useState(true);
  const initialized = useRef(false);
  const userPref = useRef<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) userPref.current = stored;
    } catch { }
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    const stored = userPref.current;
    if (stored !== null) {
      setIsExpanded(stored === "true");
    } else {
      setIsExpanded(width >= 1280);
    }
  }, [width]);

  const save = useCallback((v: boolean) => {
    setIsExpanded(v);
    try { localStorage.setItem(STORAGE_KEY, String(v)); } catch { }
    userPref.current = String(v);
  }, []);

  const toggleExpanded = useCallback(() => save(!isExpanded), [isExpanded, save]);
  const setExpanded = useCallback((v: boolean) => save(v), [save]);

  const value: SidebarContextValue = {
    isExpanded,
    toggleExpanded,
    setExpanded,
    isCollapsed: !isExpanded,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
