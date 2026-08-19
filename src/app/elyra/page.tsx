"use client";

import { useAuth } from "@/components/AuthProvider";
import ElyraChat from "@/components/ElyraChat";
import FeatureGate from "@/components/FeatureGate";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBgTheme } from "@/lib/useBgTheme";

export default function ElyraPage() {
  const { loading, userId } = useAuth();
  const { darkBg, toggleBg } = useBgTheme();
  // Luna AI uses inverted logic: dark by default, colour on toggle
  const colorBg = !darkBg;

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: darkBg ? "#000000" : "transparent",
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", position: "relative", zIndex: 2 }}
        >
          {/* Futuristic moon symbol */}
          <div style={{ marginBottom: 24 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="17" cy="6" r="0.5" fill="rgba(255, 255, 255, 0.1)" />
              <circle cx="19" cy="10" r="0.3" fill="rgba(255, 255, 255, 0.06)" />
              <circle cx="14" cy="4" r="0.3" fill="rgba(255, 255, 255, 0.06)" />
            </svg>
          </div>
          <p style={{
            color: "rgba(255,255,255,0.25)", fontSize: "10px",
            letterSpacing: "6px", textTransform: "uppercase",
            fontFamily: "monospace",
          }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  return (
    <FeatureGate featureId="luna-ai">
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        background: darkBg ? "#000000" : "transparent",
      }}>
        {/* Subtle ambient overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "-30%", left: "20%", right: "20%",
            height: "50%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.015) 0%, transparent 60%)",
            filter: "blur(80px)",
          }} />
        </div>

        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: "14px 20px",
          background: colorBg ? "rgba(8, 8, 12, 0.85)" : "rgba(8, 8, 12, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          display: "flex", alignItems: "center", gap: "14px",
          position: "relative", zIndex: 10,
        }}>
          {/* Back button */}
          <Link href="/" style={{
            padding: "8px",
            color: "rgba(255, 255, 255, 0.3)",
            textDecoration: "none",
            display: "flex", alignItems: "center",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(255, 255, 255, 0.02)",
            transition: "all 0.2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>

          {/* Logo + name */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="17" cy="6" r="0.5" fill="rgba(255, 255, 255, 0.3)" />
                <circle cx="19" cy="10" r="0.3" fill="rgba(255, 255, 255, 0.2)" />
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: "13px", fontWeight: 500, color: "rgba(255, 255, 255, 0.85)",
                letterSpacing: "4px", textTransform: "uppercase",
                lineHeight: 1,
              }}>LUNA</div>
              <div style={{
                fontSize: "9px", color: "rgba(255, 255, 255, 0.2)",
                letterSpacing: "1.5px", textTransform: "uppercase",
                fontWeight: 400, marginTop: 2,
              }}>AI Assistant</div>
            </div>
          </div>

          {/* Background toggle */}
          <button
            onClick={toggleBg}
            title={colorBg ? "Switch to dark background" : "Switch to colour background"}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: colorBg ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${colorBg ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
              color: colorBg ? "#00ff88" : "rgba(255, 255, 255, 0.3)",
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 12 }}>{colorBg ? "◐" : "◑"}</span>
            {colorBg ? "Dark" : "Colour"}
          </button>

          {/* Status */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "5px 10px", borderRadius: 6,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.4)",
            }} />
            <span style={{
              fontSize: 9, color: "rgba(255, 255, 255, 0.25)",
              fontFamily: "monospace", letterSpacing: "1px",
              textTransform: "uppercase",
            }}>Online</span>
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", zIndex: 5 }}>
          <ElyraChat isPlus={true} userId={userId} />
        </div>
      </div>
    </FeatureGate>
  );
}
