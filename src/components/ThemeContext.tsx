"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export type ColorScheme = "dark" | "light";

interface ThemeContextType {
  applyTheme: () => void;
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  applyTheme: () => {},
  colorScheme: "dark",
  toggleColorScheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generateVariants(hex: string) {
  const { h, s, l } = hexToHSL(hex);
  return {
    primary: hex,
    secondary: `hsl(${h}, ${Math.max(s - 15, 0)}%, ${Math.min(l + 10, 90)}%)`,
    glow: `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.min(l + 20, 90)}%)`,
    dim: `hsl(${h}, ${Math.max(s - 20, 0)}%, ${Math.max(l - 25, 15)}%)`,
    muted: `hsl(${h}, ${Math.max(s - 10, 0)}%, ${Math.max(l - 10, 25)}%)`,
  };
}

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`elovayne_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const fontSizeMap: Record<string, { base: string; heading: string; small: string; xs: string }> = {
  small: { base: "14px", heading: "0.95", small: "12px", xs: "10px" },
  medium: { base: "16px", heading: "1", small: "13px", xs: "11px" },
  large: { base: "18px", heading: "1.1", small: "15px", xs: "13px" },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userPreferences } = useAuth();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => loadLocal("color_scheme", "dark"));

  const toggleColorScheme = useCallback(() => {
    setColorScheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("elovayne_color_scheme", JSON.stringify(next));
      return next;
    });
  }, []);

  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    const variants = generateVariants(userPreferences.accent_color);

    // Accent color
    root.style.setProperty("--elovayne-nebula", variants.primary);
    root.style.setProperty("--elovayne-violet", variants.primary);
    root.style.setProperty("--elovayne-cosmic-pink", variants.glow);
    root.style.setProperty("--elovayne-dim", variants.dim);
    root.style.setProperty("--elovayne-muted", variants.muted);

    // Glow effects
    root.style.setProperty("--glow-soft", `0 0 20px ${variants.primary}26`);
    root.style.setProperty("--glow-medium", `0 0 40px ${variants.primary}33`);
    root.style.setProperty("--glow-strong", `0 0 60px ${variants.primary}40, 0 0 120px ${variants.primary}1f`);
    root.style.setProperty("--glow-portal", `0 0 80px ${variants.primary}4d, 0 0 160px ${variants.primary}2e, 0 0 240px ${variants.glow}14`);

    // Animation speed
    if (userPreferences.reduce_motion) {
      root.style.setProperty("--anim-duration-multiplier", "0.01");
      document.body.classList.add("reduce-motion");
    } else {
      root.style.setProperty("--anim-duration-multiplier", "1");
      document.body.classList.remove("reduce-motion");
    }

    // Compact mode
    const compactMode = localStorage.getItem("compact_mode") === "true";
    if (compactMode) {
      root.style.setProperty("--compact-multiplier", "0.75");
      document.body.classList.add("compact-mode");
    } else {
      root.style.setProperty("--compact-multiplier", "1");
      document.body.classList.remove("compact-mode");
    }

    // Font size
    const fs = fontSizeMap[userPreferences.text_size] || fontSizeMap.medium;
    root.style.setProperty("--font-size-base", fs.base);
    root.style.setProperty("--font-size-heading", fs.heading);
    root.style.setProperty("--font-size-small", fs.small);
    root.style.setProperty("--font-size-xs", fs.xs);

    // Color scheme — always dark (bioluminescent)
    root.style.setProperty("--elovayne-bg", "#050a06");
    root.style.setProperty("--elovayne-surface", "#070e08");
    root.style.setProperty("--elovayne-surface-alt", "#0a150c");
    root.style.setProperty("--elovayne-text-primary", "#e0f5e8");
    root.style.setProperty("--elovayne-text-secondary", "#b0d4be");
    root.style.setProperty("--elovayne-border", "rgba(0, 255, 136, 0.1)");
    root.style.setProperty("--bg-color", "#050a06");
    root.style.setProperty("--text-primary", "#e0f5e8");
    root.style.setProperty("--text-secondary", "#b0d4be");
    root.style.setProperty("--text-muted", "#6b9a7a");
    root.style.setProperty("--text-dim", "#3d6b4e");
    root.style.setProperty("--text-faint", "rgba(224, 245, 232, 0.3)");
    root.style.setProperty("--border-subtle", "rgba(0, 255, 136, 0.1)");
    root.style.setProperty("--card-bg", "rgba(0, 255, 136, 0.03)");
    root.style.setProperty("--input-bg", "rgba(0, 255, 136, 0.05)");
    root.style.setProperty("--nebula-opacity", "0.2");
    root.style.setProperty("--particle-opacity", "0.8");
    root.style.setProperty("--constellation-opacity", "0.3");
    root.style.setProperty("--glow-opacity", "0.08");
    root.style.setProperty("--orb-opacity", "0.15");
    document.body.style.background = "#050a06";
    root.setAttribute("data-theme", "dark");
  }, [userPreferences]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ applyTheme, colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
