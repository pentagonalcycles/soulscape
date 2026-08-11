"use client";

import { useAuth } from "@/components/AuthProvider";
import ElyraChat from "@/components/ElyraChat";
import Link from "next/link";

function ElyraIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6 L30 18 L42 18 L32 26 L36 38 L24 30 L12 38 L16 26 L6 18 L18 18 Z" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="24" cy="6" r="2.5" fill="#22c55e" />
      <circle cx="42" cy="18" r="2.5" fill="#4ade80" />
      <circle cx="36" cy="38" r="2.5" fill="#4ade80" />
      <circle cx="12" cy="38" r="2.5" fill="#4ade80" />
      <circle cx="6" cy="18" r="2.5" fill="#22c55e" />
      <circle cx="24" cy="24" r="3" fill="#86efac">
        <animate attributeName="r" values="3;4;3" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <line x1="24" y1="8.5" x2="24" y2="21" stroke="#22c55e" strokeWidth="1.5" />
      <line x1="40" y1="18" x2="27" y2="24" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="34" y1="36" x2="26" y2="26" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="14" y1="36" x2="22" y2="26" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="8" y1="18" x2="21" y2="24" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export default function ElyraPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#ffffff",
      }}>
          <div style={{ textAlign: "center" }}>
          <div style={{
            margin: "0 auto 16px",
            animation: "breathe 3s ease-in-out infinite",
          }}>
            <ElyraIcon size={56} />
          </div>
          <p style={{ color: "#86efac", fontSize: "13px", letterSpacing: "0.5px" }}>Preparing your space...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      background: "#ffffff",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: "10px 16px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center", gap: "12px",
        position: "relative", zIndex: 10,
      }}>
        <Link href="/" style={{
          padding: "8px", color: "#22c55e", textDecoration: "none",
          display: "flex", alignItems: "center", borderRadius: "10px",
          transition: "background 0.2s",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div style={{ position: "relative" }}>
          <ElyraIcon size={36} />
          <div style={{
            position: "absolute", bottom: "0", right: "0",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "#22c55e", border: "2px solid #ffffff",
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", lineHeight: "1.2" }}>Elyra</div>
          <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.3px" }}>Here for you</div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <ElyraChat isPlus={true} />
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 30px rgba(34, 197, 94, 0.2); }
          50% { opacity: 1; transform: scale(1.05); box-shadow: 0 0 40px rgba(34, 197, 94, 0.35); }
        }
      `}</style>
    </div>
  );
}
