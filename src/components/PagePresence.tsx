"use client";

import { usePathname } from "next/navigation";
import { usePagePresence } from "@/hooks/usePagePresence";

export default function PagePresence() {
  const pathname = usePathname();
  const count = usePagePresence(pathname);

  if (count <= 1) return null;

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
        padding: "5px 10px",
        borderRadius: 8,
        background: "rgba(0, 255, 136, 0.06)",
        border: "1px solid rgba(0, 255, 136, 0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#00ff88",
          boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontSize: 10,
          color: "rgba(0, 255, 136, 0.7)",
          fontFamily: "monospace",
          letterSpacing: "0.5px",
        }}
      >
        {count} here
      </span>
    </div>
  );
}
