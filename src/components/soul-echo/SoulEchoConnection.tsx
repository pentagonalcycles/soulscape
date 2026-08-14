"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Match, Message } from "./types";

interface SoulEchoConnectionProps {
  match: Match;
  userId: string;
  onLeave: () => void;
}

const typeIcons: Record<string, string> = {
  text: "",
  letter: "✉",
  encouragement: "✦",
  quote: "❝",
  song: "♪",
  kindness: "◈",
};

export default function SoulEchoConnection({ match, userId, onLeave }: SoulEchoConnectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const client = supabase();
      const { data } = await client
        .from("soul_echo_messages")
        .select("*")
        .eq("match_id", match.id)
        .order("created_at", { ascending: true });

      setMessages((data as Message[]) || []);
      setLoading(false);
    };

    fetchMessages();
  }, [match.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Real-time subscription
  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel(`soul-echo-${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "soul_echo_messages",
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        client.removeChannel(channelRef.current);
      }
    };
  }, [match.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const client = supabase();

    await client.from("soul_echo_messages").insert({
      match_id: match.id,
      user_id: userId,
      content: newMessage.trim(),
      message_type: "text",
    });

    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-[85vh] max-w-2xl mx-auto px-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between py-4 mb-2"
        style={{ borderBottom: "1px solid rgba(0, 255, 136, 0.1)" }}
      >
        <div>
          <p className="text-elovayne-light text-sm font-body">Connection Room</p>
          <p className="text-elovayne-dim/50 text-xs">Anonymous and private</p>
        </div>
        <button
          onClick={onLeave}
          className="px-3 py-1.5 rounded-lg text-xs text-elovayne-dim/60 transition-all duration-300 hover:text-elovayne-dim"
          style={{
            border: "1px solid rgba(0, 255, 136, 0.1)",
          }}
        >
          Leave quietly
        </button>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-elovayne-dim/50 text-sm"
            >
              Loading conversation...
            </motion.p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-elovayne-dim/60 text-sm font-accent mb-2">
              A quiet space has opened between you.
            </p>
            <p className="text-elovayne-dim/40 text-xs">
              Share when you feel ready.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isOwn = msg.user_id === userId;
              const icon = typeIcons[msg.message_type];

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] rounded-2xl p-5"
                    style={{
                      background: isOwn
                        ? "rgba(0, 255, 136, 0.08)"
                        : "rgba(96, 165, 250, 0.06)",
                      border: `1px solid ${isOwn
                        ? "rgba(0, 255, 136, 0.15)"
                        : "rgba(96, 165, 250, 0.1)"}`,
                      backdropFilter: "blur(16px)",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    {icon && (
                      <span className="text-xs opacity-40 mb-1 block">{icon}</span>
                    )}
                    <p className="text-elovayne-light text-sm font-body leading-relaxed">
                      {msg.content}
                    </p>
                    <p className="text-elovayne-dim/30 text-[10px] mt-2">
                      {new Date(msg.created_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="py-4"
        style={{ borderTop: "1px solid rgba(0, 255, 136, 0.1)" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl p-4"
          style={{
            background: "rgba(0, 255, 136, 0.04)",
            border: "1px solid rgba(0, 255, 136, 0.12)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
            backdropFilter: "blur(12px)",
          }}
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write something gentle..."
            rows={1}
            className="flex-1 bg-transparent text-elovayne-light font-body text-sm resize-none outline-none placeholder:text-elovayne-dim/30"
            style={{
              caretColor: "#5eead4",
              minHeight: "24px",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 rounded-xl text-xs font-body transition-all duration-300 disabled:opacity-30"
            style={{
              background: newMessage.trim()
                ? "rgba(0, 255, 136, 0.2)"
                : "rgba(0, 255, 136, 0.05)",
              border: `1px solid ${newMessage.trim()
                ? "rgba(0, 255, 136, 0.3)"
                : "rgba(0, 255, 136, 0.1)"}`,
              color: newMessage.trim() ? "#5eead4" : "rgba(0, 255, 136, 0.3)",
            }}
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
