"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { SIGNAL_MESSAGES, getSignalType, type HumanSignal, type SignalType } from "@/components/human-signal/types";
import SignalChat from "./SignalChat";

interface SignalAlert {
  signal: HumanSignal;
  message: string;
  signalLabel: string;
}

export default function SignalNotification() {
  const { userId } = useAuth();
  const [alert, setAlert] = useState<SignalAlert | null>(null);
  const [claimedAlert, setClaimedAlert] = useState<SignalAlert | null>(null);
  const [claimedSignal, setClaimedSignal] = useState<HumanSignal | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatSignal, setChatSignal] = useState<HumanSignal | null>(null);

  useEffect(() => {
    const client = supabase();
    const uid = userId || localStorage.getItem("elovayne-visitor-id");

    // Listen for new signals (for receivers)
    const signalChannel = client
      .channel("signal-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "human_signals",
        },
        async (payload) => {
          const signal = payload.new as HumanSignal;

          // Don't notify for own signals
          if (signal.sender_id === uid) return;

          // Only notify for waiting signals
          if (signal.status !== "waiting") return;

          const signalType = getSignalType(signal.signal_type);
          const message = SIGNAL_MESSAGES[signal.signal_type];

          setAlert({
            signal,
            message,
            signalLabel: signalType.label,
          });

          // Auto-hide after 15 seconds
          setTimeout(() => {
            setAlert((prev) => (prev?.signal.id === signal.id ? null : prev));
          }, 15000);
        }
      )
      .subscribe();

    // Listen for signal status changes (for senders — when their signal is claimed)
    const claimChannel = client
      .channel("signal-claim-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "human_signals",
        },
        async (payload) => {
          const updated = payload.new as HumanSignal;

          // Only notify if this is the sender's signal and it was just claimed
          if (updated.sender_id !== uid) return;
          if (updated.status !== "claimed") return;

          const signalType = getSignalType(updated.signal_type);

          setClaimedSignal(updated);
          setClaimedAlert({
            signal: updated,
            message: "Someone heard your signal and wants to chat.",
            signalLabel: signalType.label,
          });

          // Auto-hide after 20 seconds
          setTimeout(() => {
            setClaimedAlert((prev) => (prev?.signal.id === updated.id ? null : prev));
          }, 20000);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(signalChannel);
      client.removeChannel(claimChannel);
    };
  }, [userId]);

  const handleClaim = useCallback(async () => {
    if (!alert) return;

    const client = supabase();
    const uid = userId || localStorage.getItem("elovayne-visitor-id") || "anonymous";

    // Claim the signal
    const { data: claimed, error } = await client.rpc("claim_signal", {
      signal_uuid: alert.signal.id,
      receiver_uuid: uid,
    });

    if (error) {
      console.error("[Signal] Claim error:", error);
      // Still open chat even if claim fails (non-atomic)
    }

    // Open chat
    setChatSignal(alert.signal);
    setShowChat(true);
    setAlert(null);
  }, [alert, userId]);

  const handleDismiss = useCallback(() => {
    setAlert(null);
  }, []);

  const handleOpenClaimedChat = useCallback(() => {
    if (claimedSignal) {
      setChatSignal(claimedSignal);
      setShowChat(true);
      setClaimedAlert(null);
    }
  }, [claimedSignal]);

  const handleDismissClaimed = useCallback(() => {
    setClaimedAlert(null);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setChatSignal(null);
  }, []);

  return (
    <>
      {/* Signal notification toast */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              maxWidth: 380,
              width: "calc(100% - 32px)",
            }}
          >
            <div
              style={{
                background: "rgba(15, 10, 25, 0.95)",
                border: "1px solid rgba(236, 72, 153, 0.25)",
                borderRadius: 16,
                padding: "16px 20px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.1)",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#ec4899",
                  boxShadow: "0 0 8px rgba(236, 72, 153, 0.6)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 9,
                  color: "rgba(236, 72, 153, 0.7)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}>Signal Received</span>
              </div>

              {/* Message */}
              <p style={{
                fontSize: 13,
                color: "rgba(224, 231, 255, 0.8)",
                fontWeight: 300,
                lineHeight: 1.5,
                margin: "0 0 14px",
              }}>
                {alert.message}
              </p>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleClaim}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(0, 255, 136, 0.1))",
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                    color: "rgba(224, 231, 255, 0.9)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(0, 255, 136, 0.15))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(0, 255, 136, 0.1))";
                  }}
                >
                  Respond & Chat
                </button>
                <button
                  onClick={handleDismiss}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "rgba(224, 231, 255, 0.5)",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signal chat modal */}
      <AnimatePresence>
        {showChat && chatSignal && (
          <SignalChat signal={chatSignal} onClose={handleCloseChat} />
        )}
      </AnimatePresence>

      {/* Sender notification — someone claimed your signal */}
      <AnimatePresence>
        {claimedAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              maxWidth: 380,
              width: "calc(100% - 32px)",
            }}
          >
            <div
              style={{
                background: "rgba(15, 10, 25, 0.95)",
                border: "1px solid rgba(0, 255, 136, 0.25)",
                borderRadius: 16,
                padding: "16px 20px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 136, 0.1)",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#00ff88",
                  boxShadow: "0 0 8px rgba(0, 255, 136, 0.6)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 9,
                  color: "rgba(0, 255, 136, 0.7)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}>Someone Heard You</span>
              </div>

              {/* Message */}
              <p style={{
                fontSize: 13,
                color: "rgba(224, 231, 255, 0.8)",
                fontWeight: 300,
                lineHeight: 1.5,
                margin: "0 0 14px",
              }}>
                {claimedAlert.message}
              </p>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleOpenClaimedChat}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.1))",
                    border: "1px solid rgba(0, 255, 136, 0.3)",
                    color: "rgba(224, 231, 255, 0.9)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 204, 106, 0.15))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.1))";
                  }}
                >
                  Open Chat
                </button>
                <button
                  onClick={handleDismissClaimed}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "rgba(224, 231, 255, 0.5)",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
