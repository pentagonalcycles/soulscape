"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { hasUnlocked, FEATURES, type Feature } from "@/lib/feature-gate";

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
}

export default function FeatureGate({ featureId, children }: FeatureGateProps) {
  const { userId, isAdmin } = useAuth();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const feature = FEATURES[featureId];

  useEffect(() => {
    // Admins bypass all gates
    if (isAdmin) {
      setUnlocked(true);
      return;
    }
    if (!userId || !feature) {
      setUnlocked(false);
      return;
    }
    hasUnlocked(userId, featureId).then((result) => {
      setUnlocked(result);
    });
  }, [userId, featureId, feature, isAdmin]);

  if (!feature) return <>{children}</>;
  if (unlocked === null) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050510",
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: "2px solid rgba(0, 255, 136, 0.2)",
          borderTopColor: "#00ff88",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return <UnlockScreen feature={feature} userId={userId} onUnlock={() => setUnlocked(true)} />;
}

function UnlockScreen({ feature, userId, onUnlock }: { feature: Feature; userId: string | null; onUnlock: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId: feature.id,
          userId: userId || "anonymous",
          successUrl: `${origin}${feature.path}?unlocked=true`,
          cancelUrl: `${origin}${feature.path}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a1a10, #050510, #0a0a1a)",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: 400,
        width: "100%",
        background: "rgba(15, 25, 20, 0.9)",
        border: "1px solid rgba(0, 255, 136, 0.15)",
        borderRadius: 20,
        padding: "40px 32px",
        textAlign: "center",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 300,
          color: "#e0f5e8",
          margin: "0 0 8px",
          letterSpacing: "2px",
        }}>
          {feature.name}
        </h2>
        <p style={{
          fontSize: 14,
          color: "rgba(224, 245, 232, 0.5)",
          margin: "0 0 32px",
          lineHeight: 1.6,
        }}>
          {feature.description}
        </p>

        <button
          onClick={handleUnlock}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 24px",
            borderRadius: 12,
            background: loading
              ? "rgba(0, 255, 136, 0.1)"
              : "linear-gradient(135deg, #00ff88, #00cc6a)",
            border: "none",
            color: loading ? "rgba(0, 255, 136, 0.5)" : "#050510",
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.5px",
          }}
        >
          {loading ? "Redirecting..." : `Unlock for ${feature.priceLabel}`}
        </button>

        <p style={{
          fontSize: 11,
          color: "rgba(0, 255, 136, 0.3)",
          margin: "16px 0 0",
          fontFamily: "monospace",
        }}>
          One-time payment • Instant access
        </p>
      </div>
    </div>
  );
}
