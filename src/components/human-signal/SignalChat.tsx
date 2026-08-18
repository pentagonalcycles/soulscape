"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { getSignalType, SIGNAL_MESSAGES, type HumanSignal } from "@/components/human-signal/types";

interface SignalChatProps {
  signal: HumanSignal;
  onClose: () => void;
}

interface SignalMessage {
  id: string;
  signal_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export default function SignalChat({ signal, onClose }: SignalChatProps) {
  const { userId, userProfile } = useAuth();
  const [messages, setMessages] = useState<SignalMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const uid = userId || localStorage.getItem("elovayne-visitor-id") || "anonymous";
  const signalType = getSignalType(signal.signal_type);
  const signalMessage = SIGNAL_MESSAGES[signal.signal_type];

  useEffect(() => {
    loadMessages();

    const client = supabase();
    const channel = client
      .channel(`signal-chat-${signal.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signal_messages",
          filter: `signal_id=eq.${signal.id}`,
        },
        (payload) => {
          const msg = payload.new as SignalMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [signal.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages() {
    const client = supabase();
    const { data } = await client
      .from("signal_messages")
      .select("*")
      .eq("signal_id", signal.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data) setMessages(data as SignalMessage[]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setInput("");

    const client = supabase();
    const { error } = await client.from("signal_messages").insert({
      signal_id: signal.id,
      sender_id: uid,
      message: text,
    });

    if (error) {
      console.error("[SignalChat] Send error:", error);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "calc(100% - 32px)",
          maxWidth: 440,
          maxHeight: "80vh",
          background: "rgba(10, 8, 18, 0.98)",
          border: "1px solid rgba(236, 72, 153, 0.15)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(236, 72, 153, 0.08)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: 11,
              color: "rgba(236, 72, 153, 0.6)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontFamily: "monospace",
              marginBottom: 4,
            }}>Signal Chat</div>
            <div style={{
              fontSize: 12,
              color: "rgba(224, 231, 255, 0.6)",
              fontWeight: 300,
            }}>{signalMessage}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              padding: "6px 12px",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)";
            }}
          >
            Close
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* System message */}
          <div style={{
            textAlign: "center",
            padding: "8px 12px",
            fontSize: 10,
            color: "rgba(236, 72, 153, 0.4)",
            fontFamily: "monospace",
            letterSpacing: "1px",
          }}>
            {signalType.emoji} Signal connected — messages are anonymous
          </div>

          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "30px 12px",
              fontSize: 12,
              color: "rgba(224, 231, 255, 0.3)",
              fontWeight: 300,
            }}>
              Start the conversation...
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === uid;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: isMine ? "2px 14px 14px 14px" : "14px 14px 14px 2px",
                  background: isMine
                    ? "rgba(236, 72, 153, 0.12)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: isMine
                    ? "1px solid rgba(236, 72, 153, 0.2)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                }}>
                  <p style={{
                    fontSize: 13,
                    color: "rgba(224, 231, 255, 0.8)",
                    fontWeight: 300,
                    lineHeight: 1.5,
                    margin: 0,
                    wordBreak: "break-word",
                  }}>{msg.message}</p>
                  <span style={{
                    fontSize: 9,
                    color: "rgba(224, 231, 255, 0.25)",
                    marginTop: 4,
                    display: "block",
                  }}>{formatTime(msg.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "rgba(224, 231, 255, 0.85)",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              minHeight: 20,
              maxHeight: 80,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: input.trim() ? "rgba(236, 72, 153, 0.12)" : "transparent",
              border: `1px solid ${input.trim() ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 255, 255, 0.04)"}`,
              color: input.trim() ? "rgba(236, 72, 153, 0.7)" : "rgba(255, 255, 255, 0.15)",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
