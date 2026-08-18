"use client";

import { useAuth } from "@/components/AuthProvider";
import ElyraChat from "@/components/ElyraChat";
import FeatureGate from "@/components/FeatureGate";
import Link from "next/link";

export default function ElyraPage() {
  const { loading, userId } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "24px",
        background: "#050807",
      }}>
        <p style={{
          color: "#00ff88", fontSize: "10px",
          letterSpacing: "6px", textTransform: "uppercase",
          fontFamily: "monospace", opacity: 0.7,
          animation: "elyra-breathe 3s ease-in-out infinite",
        }}>Waking Luna…</p>
      </div>
    );
  }

  return (
    <FeatureGate featureId="luna-ai">
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      background: "#050807",
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 35%, rgba(0, 255, 136, 0.05), transparent 60%)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: "12px 16px",
        background: "rgba(5, 8, 7, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0, 255, 136, 0.08)",
        display: "flex", alignItems: "center", gap: "12px",
        position: "relative", zIndex: 10,
      }}>
        <Link href="/" style={{
          padding: "8px", color: "#00ff88", textDecoration: "none",
          display: "flex", alignItems: "center", borderRadius: "8px",
          border: "1px solid rgba(0, 255, 136, 0.15)",
          background: "rgba(0, 255, 136, 0.02)",
          transition: "all 0.3s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "15px", fontWeight: 700, color: "#e2e8f0",
            letterSpacing: "8px", textTransform: "uppercase",
          }}>LUNA</div>
          <div style={{
            fontSize: "9px", color: "#a8e4b8",
            letterSpacing: "3px", textTransform: "uppercase",
            fontWeight: 300, opacity: 0.7,
          }}>Your dreamlike companion</div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", zIndex: 5 }}>
        <ElyraChat isPlus={true} userId={userId} />
      </div>

      <style>{`
        @keyframes elyra-breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
    </FeatureGate>
  );
}
