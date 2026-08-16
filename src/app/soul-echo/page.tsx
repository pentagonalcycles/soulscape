"use client";

import SoulEcho from "@/components/soul-echo/SoulEcho";

export default function SoulEchoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{
      background: "linear-gradient(180deg, #001a2e 0%, #002d4a 50%, #001a2e 100%)",
    }}>
      {/* Ambient blue orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%", width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(96, 165, 250, 0.05) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div className="global-corners" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 pt-16">
          <SoulEcho />
        </div>
      </div>
    </main>
  );
}
