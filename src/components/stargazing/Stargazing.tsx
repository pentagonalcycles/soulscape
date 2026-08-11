"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import StargazingCanvas from "./StargazingCanvas";
import MessageModal from "./MessageModal";

interface StargazerMessage {
  id: string;
  content: string;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "read"; message: string; id: string }
  | { mode: "write" };

export default function Stargazing() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<StargazerMessage[]>([]);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [lastWriteTime, setLastWriteTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const client = supabase();
    const { data } = await client
      .from("stargazer_messages")
      .select("id, content")
      .order("created_at", { ascending: false })
      .limit(80);

    if (data) {
      setMessages(data as StargazerMessage[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStarClick = useCallback((id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      setModal({ mode: "read", message: msg.content, id: msg.id });
    }
  }, [messages]);

  const handleWrite = useCallback(() => {
    setModal({ mode: "write" });
    setError("");
  }, []);

  const handleSubmit = useCallback(async (content: string) => {
    if (!userId) return;

    // Client-side cooldown
    const now = Date.now();
    if (now - lastWriteTime < 60000) {
      setError("Please wait a moment before writing again.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const client = supabase();

      // Check daily limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await client
        .from("stargazer_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", today.toISOString());

      if ((count || 0) >= 3) {
        setError("You've left 3 messages today. Come back tomorrow.");
        setSending(false);
        return;
      }

      // Insert message
      const { data, error: insertError } = await client
        .from("stargazer_messages")
        .insert({
          user_id: userId,
          content: content.trim(),
        })
        .select("id, content")
        .single();

      if (insertError) {
        setError("Could not send your message. Try again.");
        setSending(false);
        return;
      }

      // Add to local state
      if (data) {
        setMessages((prev) => [data as StargazerMessage, ...prev]);
      }

      setLastWriteTime(Date.now());
      setModal({ mode: "closed" });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }, [userId, lastWriteTime]);

  const handleClose = useCallback(() => {
    setModal({ mode: "closed" });
    setError("");
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StargazingCanvas
        messageStars={messages.map((m) => ({ id: m.id }))}
        onStarClick={handleStarClick}
      />

      {/* UI Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-between py-20 px-6">
        {/* Title */}
        <motion.div
          className="text-center pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1
            className="text-2xl sm:text-3xl font-light tracking-wide mb-1"
            style={{
              background: "linear-gradient(135deg, rgba(200, 220, 255, 0.9), rgba(180, 200, 240, 0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Stargazing
          </h1>
          <p className="text-xs" style={{ color: "rgba(200, 210, 230, 0.4)" }}>
            {loading ? "Loading stars..." : `${messages.length} messages in the sky`}
          </p>
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          className="text-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <p className="text-xs mb-4" style={{ color: "rgba(200, 210, 230, 0.35)" }}>
            Click on a glowing star to read what someone left here
          </p>
          <motion.button
            onClick={handleWrite}
            className="px-8 py-3 rounded-2xl text-xs transition-all"
            style={{
              background: "rgba(200, 220, 255, 0.08)",
              border: "1px solid rgba(200, 220, 255, 0.15)",
              color: "rgba(200, 220, 255, 0.6)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.02, borderColor: "rgba(200, 220, 255, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Leave a message
          </motion.button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.mode !== "closed" && (
          <MessageModal
            mode={modal.mode === "read" ? "read" : "write"}
            message={modal.mode === "read" ? modal.message : undefined}
            onSubmit={handleSubmit}
            onClose={handleClose}
            onWrite={modal.mode === "read" ? handleWrite : undefined}
            sending={sending}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
