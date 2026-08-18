"use client";

import { usePathname } from "next/navigation";
import { usePagePresence } from "@/hooks/usePagePresence";

export default function PagePresence() {
  const pathname = usePathname();
  const count = usePagePresence(pathname);

  const label = count === 1 ? "1 person here" : `${count} people here`;

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
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: count > 0 ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
          boxShadow: count > 0 ? "0 0 6px rgba(0, 255, 136, 0.5)" : "none",
          animation: count > 1 ? "pulse 2s ease-in-out infinite" : "none",
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
        {label}
      </span>
    </div>
  );
}
