"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAllPresence, usePagePresence } from "@/hooks/usePagePresence";

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/campfire": "Campfire",
  "/mural": "Mural",
  "/human-signal": "Human Signal",
  "/poetry": "Poetry",
  "/dream-canvas": "Dream Canvas",
  "/nebula-orb": "Nebula Orb",
  "/camera": "Camera",
  "/tarot": "Tarot",
  "/threads": "Threads",
  "/reflection-room": "Reflection Room",
  "/ideas": "Ideas",
  "/share": "Share",
  "/elyra": "Luna AI",
  "/about": "About",
  "/faq": "FAQ",
  "/support": "Support",
  "/stats": "Stats",
};

const PAGE_ICONS: Record<string, string> = {
  "/": "◈",
  "/campfire": "◆",
  "/mural": "◇",
  "/human-signal": "◎",
  "/poetry": "❋",
  "/dream-canvas": "△",
  "/nebula-orb": "●",
  "/camera": "⊡",
  "/tarot": "☽",
  "/threads": "◈",
  "/reflection-room": "◈",
  "/ideas": "◇",
  "/share": "◈",
  "/elyra": "☽",
};

export default function PresenceMap() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 16, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dragMovedRef = useRef(false);
  
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

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
    dragMovedRef.current = false;
  }, [position]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMovedRef.current = true;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 150, dragStartRef.current.posX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 40, dragStartRef.current.posY + dy)),
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => { if (!dragMovedRef.current) setOpen(!open); }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: "fixed",
          bottom: "auto",
          left: position.x,
          top: position.y,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 8,
          background: open ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.06)",
          border: `1px solid ${open ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.12)"}`,
          backdropFilter: "blur(8px)",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging ? "none" : "all 0.2s",
          color: "rgba(0, 255, 136, 0.8)",
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: "0.5px",
          userSelect: "none",
        }}
      >
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--elovayne-nebula)",
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
            top: position.y + 40,
            left: position.x,
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
              color: "var(--elovayne-nebula)",
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
                    color: count > 1 ? "var(--elovayne-nebula)" : "rgba(0, 255, 136, 0.5)",
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
                    background: count > 1 ? "var(--elovayne-nebula)" : "rgba(0, 255, 136, 0.3)",
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
