"use client";

import { LIVE_FILTERS } from "@/lib/live-filters";

interface FilterPickerProps {
  currentId: string;
  onSelect: (id: string) => void;
}

const DOT: Record<string, string> = {
  natural: "#ffffff",
  golden: "#ffcf4d",
  arctic: "#7ec8ff",
  noir: "#444444",
  midnight: "#1a2245",
  emerald: "#34d399",
  violet: "#8b5cf6",
  rose: "#ff6aa9",
  sunset: "#ff5e62",
  cool: "#a4d8ff",
};

export default function FilterPicker({ currentId, onSelect }: FilterPickerProps) {
  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#00ff88", fontWeight: 600 }}>
          Filters
        </span>
        <span style={{ fontSize: 10, color: "rgba(224, 245, 232, 0.4)" }}>
          applied to the live video
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {LIVE_FILTERS.map((f) => {
          const active = f.id === currentId;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 999,
                border: active ? "1px solid rgba(0, 255, 136, 0.7)" : "1px solid rgba(0, 255, 136, 0.15)",
                background: active ? "rgba(0, 255, 136, 0.12)" : "rgba(21, 38, 29, 0.6)",
                color: active ? "#00ff88" : "rgba(224, 245, 232, 0.7)",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT[f.id] || "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.3)" }} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}