"use client";

import { usePathname } from "next/navigation";
import { usePagePresence } from "@/hooks/usePagePresence";

export default function PagePresence() {
  const pathname = usePathname();
  const count = usePagePresence(pathname);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        background: "rgba(0, 255, 136, 0.06)",
        border: "1px solid rgba(0, 255, 136, 0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: count > 1 ? "var(--elovayne-nebula)" : "rgba(0, 255, 136, 0.4)",
          boxShadow: count > 1 ? "0 0 8px rgba(0, 255, 136, 0.6)" : "none",
          animation: count > 1 ? "pulse 2s ease-in-out infinite" : "none",
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: count > 1 ? "var(--elovayne-nebula)" : "rgba(0, 255, 136, 0.6)",
          fontFamily: "monospace",
          fontWeight: count > 1 ? 600 : 400,
          letterSpacing: "0.5px",
        }}
      >
        {count} {count === 1 ? "person" : "people"} here
      </span>
    </div>
  );
}
