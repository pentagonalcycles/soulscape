"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { UnseenMessage } from "@/lib/unseen/types";

interface UnseenMessagingProps {
  matchId: string;
  myUserId: string;
  otherName: string;
  onBack: () => void;
}

export default function UnseenMessaging({ matchId, myUserId, otherName, onBack }: UnseenMessagingProps) {
  const [messages, setMessages] = useState<UnseenMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const client = supabase();
      const { data } = await client
        .from("unseen_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    }
    loadMessages();
  }, [matchId]);

  // Real-time subscription
  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel(`unseen-msg-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "unseen_messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const newMsg = payload.new as UnseenMessage;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [matchId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const client = supabase();
    const content = input.trim();
    setInput("");

    await client.from("unseen_messages").insert({
      match_id: matchId,
      sender_id: myUserId,
      content,
    });
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "rgba(12,10,20,0.95)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>←</button>
        <div className="flex-1">
          <p className="text-sm" style={{ color: "rgba(224,231,255,0.9)" }}>{otherName}</p>
          <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>Connected through UNSEEN</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.3)" }}>Loading...</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === myUserId;
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="max-w-[75%] px-4 py-2.5 rounded-2xl"
                style={{
                  background: isMine ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isMine ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.85)" }}>{msg.content}</p>
                <p className="text-[9px] mt-1" style={{ color: "rgba(148,163,184,0.3)", textAlign: isMine ? "right" : "left" }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </motion.div>
          );
        })}
        {!loading && messages.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: "rgba(148,163,184,0.3)" }}>
            Say something to {otherName}...
          </p>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(224,231,255,0.9)" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-4 py-3 rounded-xl text-sm transition-all"
            style={{
              background: input.trim() ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${input.trim() ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
              color: input.trim() ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.3)",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
