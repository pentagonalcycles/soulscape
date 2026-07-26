"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthProvider";

interface ThemeContextType {
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  applyTheme: () => {},
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userPreferences } = useAuth();

  const applyTheme = () => {
    const root = document.documentElement;
    const variants = generateVariants(userPreferences.accent_color);

    root.style.setProperty("--elovayne-nebula", variants.primary);
    root.style.setProperty("--elovayne-violet", variants.primary);
    root.style.setProperty("--elovayne-cosmic-pink", variants.glow);
    root.style.setProperty("--elovayne-dim", variants.dim);
    root.style.setProperty("--elovayne-muted", variants.muted);

    root.style.setProperty("--glow-soft", `0 0 20px ${variants.primary}4d`);
    root.style.setProperty("--glow-medium", `0 0 40px ${variants.primary}66`);
    root.style.setProperty("--glow-strong", `0 0 60px ${variants.primary}80, 0 0 120px ${variants.primary}4d`);
    root.style.setProperty("--glow-portal", `0 0 80px ${variants.primary}99, 0 0 160px ${variants.primary}66, 0 0 240px ${variants.glow}33`);

    if (userPreferences.animation_speed === "minimal") {
      root.style.setProperty("--ease-dream", "cubic-bezier(0.25, 0.46, 0.45, 0.94)");
      root.style.setProperty("--anim-duration-multiplier", "0.5");
    } else {
      root.style.setProperty("--ease-dream", "cubic-bezier(0.25, 0.46, 0.45, 0.94)");
      root.style.setProperty("--anim-duration-multiplier", "1");
    }

    if (userPreferences.compact_mode) {
      root.style.setProperty("--spacing-multiplier", "0.75");
    } else {
      root.style.setProperty("--spacing-multiplier", "1");
    }
  };

  useEffect(() => {
    applyTheme();
  }, [userPreferences]);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
