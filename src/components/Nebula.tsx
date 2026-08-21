"use client";

import { useIsMobile } from "@/lib/useIsMobile";

export default function Nebula() {
  const { isMobile } = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.1) 40%, transparent 70%)",
            filter: "blur(50px)",
            opacity: "var(--nebula-opacity, 0.12)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(57, 255, 20, 0.18) 0%, rgba(74, 222, 128, 0.08) 40%, transparent 70%)",
            filter: "blur(45px)",
            opacity: "var(--nebula-opacity, 0.1)",
          }}
        />
      </div>
    );
  }
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main nebula blob - top right — green */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.25) 0%, rgba(0, 204, 106, 0.12) 35%, rgba(57, 255, 20, 0.06) 55%, transparent 70%)",
          filter: "blur(55px)",
          opacity: "var(--nebula-opacity, 0.15)",
        }}
      />

      {/* Secondary nebula blob - bottom left — emerald */}
      <div
        className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 204, 106, 0.22) 0%, rgba(74, 222, 128, 0.1) 35%, rgba(52, 211, 153, 0.05) 55%, transparent 70%)",
          filter: "blur(45px)",
          opacity: "var(--nebula-opacity, 0.12)",
        }}
      />

      {/* Accent nebula blob - center — lime */}
      <div
        className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(57, 255, 20, 0.18) 0%, rgba(0, 255, 136, 0.08) 35%, rgba(74, 222, 128, 0.04) 55%, transparent 70%)",
          filter: "blur(40px)",
          opacity: "var(--nebula-opacity, 0.08)",
        }}
      />
    </div>
  );
}
