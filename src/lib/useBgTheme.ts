"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "elovayne-dark-bg";

export function useBgTheme() {
  const [darkBg, setDarkBg] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setDarkBg(true);
    setLoaded(true);
  }, []);

  const toggleBg = () => {
    const next = !darkBg;
    setDarkBg(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    // Dispatch custom event so other pages listening update too
    window.dispatchEvent(new CustomEvent("bg-theme-change", { detail: next }));
  };

  // Listen for changes from other pages
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "boolean") setDarkBg(detail);
    };
    window.addEventListener("bg-theme-change", handler);
    return () => window.removeEventListener("bg-theme-change", handler);
  }, []);

  return { darkBg, toggleBg, loaded };
}
