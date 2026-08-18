"use client";

import { useAuth } from "@/components/AuthProvider";
import ElyraChat from "@/components/ElyraChat";
import FeatureGate from "@/components/FeatureGate";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ElyraPage() {
  const { loading, userId } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#050807",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute",
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "lunaLoadPulse 3s ease-in-out infinite",
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", position: "relative", zIndex: 2 }}
        >
          <div style={{
            fontSize: 28, fontWeight: 100, color: "#e2e8f0",
            letterSpacing: "12px", textTransform: "uppercase",
            marginBottom: 16,
            background: "linear-gradient(135deg, #00ff88, #8b5cf6, #00ff88)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "lunaShimmer 4s ease-in-out infinite",
          }}>LUNA</div>
          <div style={{
            width: 40, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.6), transparent)",
            margin: "0 auto 20px",
          }} />
          <p style={{
            color: "rgba(0, 255, 136, 0.4)", fontSize: "10px",
            letterSpacing: "4px", textTransform: "uppercase",
            fontFamily: "monospace",
          }}>Initializing</p>
        </motion.div>

        <style>{`
          @keyframes lunaLoadPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes lunaShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
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
        {/* Ambient background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {/* Main glow */}
          <div style={{
            position: "absolute", top: "-20%", left: "30%", right: "30%",
            height: "60%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(0, 255, 136, 0.04) 0%, transparent 60%)",
            filter: "blur(60px)",
          }} />
          {/* Secondary glow */}
          <div style={{
            position: "absolute", bottom: "0", left: "0", right: "0",
            height: "30%",
            background: "linear-gradient(0deg, rgba(0, 255, 136, 0.02), transparent)",
          }} />
          {/* Subtle grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.015) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: 0.5,
          }} />
        </div>

        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: "14px 20px",
          background: "rgba(5, 8, 7, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 255, 136, 0.06)",
          display: "flex", alignItems: "center", gap: "14px",
          position: "relative", zIndex: 10,
        }}>
          {/* Back button */}
          <Link href="/" style={{
            padding: "8px",
            color: "rgba(0, 255, 136, 0.6)",
            textDecoration: "none",
            display: "flex", alignItems: "center",
            borderRadius: "8px",
            border: "1px solid rgba(0, 255, 136, 0.08)",
            background: "rgba(0, 255, 136, 0.02)",
            transition: "all 0.2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>

          {/* Logo + name */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(139, 92, 246, 0.08))",
              border: "1px solid rgba(0, 255, 136, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "rgba(0, 255, 136, 0.6)",
            }}>
              /
            </div>
            <div>
              <div style={{
                fontSize: "14px", fontWeight: 600, color: "#e2e8f0",
                letterSpacing: "6px", textTransform: "uppercase",
                lineHeight: 1,
              }}>LUNA</div>
              <div style={{
                fontSize: "9px", color: "rgba(0, 255, 136, 0.4)",
                letterSpacing: "2px", textTransform: "uppercase",
                fontWeight: 400, marginTop: 2,
              }}>AI Companion</div>
            </div>
          </div>

          {/* Status indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "5px 10px", borderRadius: 6,
            background: "rgba(0, 255, 136, 0.04)",
            border: "1px solid rgba(0, 255, 136, 0.06)",
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)",
            }} />
            <span style={{
              fontSize: 9, color: "rgba(0, 255, 136, 0.5)",
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
