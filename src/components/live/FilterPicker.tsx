"use client";

import { LIVE_FILTERS } from "@/lib/live-filters";

interface FilterPickerProps {
  currentId: string;
  onSelect: (id: string) => void;
}

const DOT: Record<string, string> = {
  natural: "#1e293b",
  golden: "#f59e0b",
  arctic: "#22d3ee",
  noir: "#1e293b",
  midnight: "#0f172a",
  emerald: "#10b981",
  violet: "#a78bfa",
  rose: "#ec4899",
  sunset: "#f97316",
  cool: "#3b82f6",
};

const FILTER_STYLE = {
  padding: "8px 14px",
  borderRadius: "9999px",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export default function FilterPicker({ currentId, onSelect }: FilterPickerProps) {
  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", color: "#10b988", fontWeight: 600 }}>
          Filters
        </span>
        <span style={{ fontSize: 8, color: "rgba(30, 41, 59, 0.4)" }}>
          applied to the live video
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {LIVE_FILTERS.map((f) => {
          const active = f.id === currentId;
          const isButton = active || typeof onSelect === "function";
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              style={{
                ...FILTER_STYLE,
                borderRadius: "9999px",
                border: active
                  ? "1px solid rgba(16, 155, 136, 0.5)"
                  : "1px solid rgba(30, 41, 59, 0.15)",
                background: active
                  ? "rgba(16, 155, 136, 0.08)"
                  : "rgba(30, 41, 59, 0.4)",
                color: active ? "#10b988" : "rgba(100, 115, 131, 0.8)",
                cursor: isButton ? "pointer" : "default",
              }}
              disabled={!isButton}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: DOT[f.id] || "#1e293b",
                  boxShadow: "0 0 6px rgba(16, 155, 136, 0.2)",
                  marginRight: 6,
                }}
              />
              <span style={{ flex: 1, fontSize: 9 }}>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}