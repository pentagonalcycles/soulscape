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
  colorScheme: "light",
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
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => loadLocal("color_scheme", "light"));

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
    root.style.setProperty("--glow-soft", `0 0 20px ${variants.primary}4d`);
    root.style.setProperty("--glow-medium", `0 0 40px ${variants.primary}66`);
    root.style.setProperty("--glow-strong", `0 0 60px ${variants.primary}80, 0 0 120px ${variants.primary}4d`);
    root.style.setProperty("--glow-portal", `0 0 80px ${variants.primary}99, 0 0 160px ${variants.primary}66, 0 0 240px ${variants.glow}33`);

    // Animation speed
    if (userPreferences.reduce_motion) {
      root.style.setProperty("--anim-duration-multiplier", "0.01");
      document.body.classList.add("reduce-motion");
    } else {
      root.style.setProperty("--anim-duration-multiplier", "1");
      document.body.classList.remove("reduce-motion");
    }

    // Compact mode - check localStorage since it's not in UserPreferences
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

    // Color scheme — always light
    root.style.setProperty("--elovayne-bg", "#ffffff");
    root.style.setProperty("--elovayne-surface", "#f0fdf9");
    root.style.setProperty("--elovayne-surface-alt", "#e6f7f2");
    root.style.setProperty("--elovayne-text-primary", "#0f172a");
    root.style.setProperty("--elovayne-text-secondary", "#155e75");
    root.style.setProperty("--elovayne-border", "rgba(13, 148, 136, 0.15)");
    root.setAttribute("data-theme", "light");
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
