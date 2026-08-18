"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAllPresence, usePagePresence } from "@/hooks/usePagePresence";

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/live": "Live",
  "/campfire": "Campfire",
  "/mural": "Mural",
  "/human-signal": "Human Signal",
  "/poetry": "Poetry",
  "/dream-canvas": "Dream Canvas",
  "/nebula-orb": "Nebula Orb",
  "/camera": "Camera",
  "/soul-map": "Soul Map",
  "/tarot": "Tarot",
  "/threads": "Threads",
  "/reflection-room": "Reflection Room",
  "/ideas": "Ideas",
  "/share": "Share",
  "/elyra": "Luna AI",
  "/shop": "Shop",
  "/about": "About",
  "/faq": "FAQ",
  "/support": "Support",
  "/stats": "Stats",
};

const PAGE_ICONS: Record<string, string> = {
  "/": "◈",
  "/live": "●",
  "/campfire": "◆",
  "/mural": "◇",
  "/human-signal": "◎",
  "/poetry": "❋",
  "/dream-canvas": "△",
  "/nebula-orb": "●",
  "/camera": "⊡",
  "/soul-map": "◎",
  "/tarot": "☽",
  "/threads": "◈",
  "/reflection-room": "◈",
  "/ideas": "◇",
  "/share": "◈",
  "/elyra": "☽",
  "/shop": "◇",
};

export default function PresenceMap() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  
  // Track current page presence
  const currentCount = usePagePresence(pathname);
  
  // Get all presence data
  const counts = useAllPresence();

  const totalPages = Object.keys(counts).length;
  const totalVisitors = Object.values(counts).reduce((a, b) => a + b, 0);

  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a);

  const navigateTo = (path: string) => {
    console.log("[PresenceMap] Navigating to:", JSON.stringify(path), "Current:", window.location.pathname);
    setOpen(false);
    window.location.href = path;
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 60,
          left: 16,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 8,
          background: open ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.06)",
          border: `1px solid ${open ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.12)"}`,
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          transition: "all 0.2s",
          color: "rgba(0, 255, 136, 0.8)",
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: "0.5px",
        }}
      >
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#00ff88",
          boxShadow: "0 0 8px rgba(0, 255, 136, 0.6)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
        {totalVisitors} online
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▼" : "▲"}</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            left: 16,
            zIndex: 60,
            width: 240,
            maxHeight: 360,
            overflowY: "auto",
            background: "rgba(10, 20, 15, 0.95)",
            border: "1px solid rgba(0, 255, 136, 0.15)",
            borderRadius: 12,
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{
            padding: "10px 14px 8px",
            borderBottom: "1px solid rgba(0, 255, 136, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{
              fontSize: 10,
              color: "#00ff88",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "monospace",
              fontWeight: 600,
            }}>
              Where is everyone?
            </span>
            <span style={{
              fontSize: 9,
              color: "rgba(0, 255, 136, 0.4)",
              fontFamily: "monospace",
            }}>
              {totalPages} pages
            </span>
          </div>

          <div style={{ padding: "6px 8px" }}>
            {sorted.length === 0 ? (
              <div style={{
                padding: "20px 12px",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: 11,
                  color: "rgba(0, 255, 136, 0.3)",
                  fontFamily: "monospace",
                  margin: 0,
                }}>
                  No one else is online right now
                </p>
              </div>
            ) : (
              sorted.map(([path, count]) => (
                <button
                  key={path}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("[PresenceMap] Button clicked for:", path);
                    navigateTo(path);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    width: "100%",
                    textAlign: "left",
                    transition: "all 0.15s",
                    pointerEvents: "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 13, width: 20, textAlign: "center", color: "rgba(0, 255, 136, 0.5)" }}>
                    {PAGE_ICONS[path] || "•"}
                  </span>
                  <span style={{
                    flex: 1,
                    fontSize: 12,
                    color: "rgba(240, 255, 245, 0.75)",
                    fontFamily: "monospace",
                  }}>
                    {PAGE_LABELS[path] || path}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: count > 1 ? "#00ff88" : "rgba(0, 255, 136, 0.5)",
                    fontFamily: "monospace",
                    minWidth: 20,
                    textAlign: "right",
                  }}>
                    {count}
                  </span>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: count > 1 ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                    boxShadow: count > 1 ? "0 0 6px rgba(0, 255, 136, 0.5)" : "none",
                  }} />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
