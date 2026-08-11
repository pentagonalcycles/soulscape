"use client";

import { motion } from "framer-motion";

export type LocationMode = "world" | "country" | "nearby" | "mine";

interface LocationTabsProps {
  active: LocationMode;
  onChange: (mode: LocationMode) => void;
  countryName?: string;
}

const tabs: { key: LocationMode; label: string; icon: string }[] = [
  { key: "world", label: "World", icon: "🌍" },
  { key: "country", label: "Country", icon: "🌐" },
  { key: "nearby", label: "Nearby", icon: "📍" },
  { key: "mine", label: "My Weather", icon: "🫀" },
];

export default function LocationTabs({ active, onChange, countryName }: LocationTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(13, 148, 136, 0.04)" }}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const label = tab.key === "country" && countryName ? countryName : tab.label;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs transition-colors"
            style={{ color: isActive ? "var(--text-primary)" : "var(--text-dim)" }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  border: "1px solid rgba(13, 148, 136, 0.08)",
                }}
                layoutId="locationTab"
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            )}
            <span className="relative z-10 text-sm">{tab.icon}</span>
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
