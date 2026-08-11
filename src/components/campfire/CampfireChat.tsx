"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CampfireMessage } from "@/lib/campfire/types";

interface CampfireChatProps {
  messages: CampfireMessage[];
  onSend: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export default function CampfireChat({ messages, onSend, onTyping, onStopTyping }: CampfireChatProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (!typingRef.current && e.target.value.length > 0) {
      typingRef.current = true;
      onTyping();
    }
    if (e.target.value.length === 0 && typingRef.current) {
      typingRef.current = false;
      onStopTyping();
    }
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    typingRef.current = false;
    onStopTyping();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Get typing users
  const typingUsers = messages
    .filter((m) => m.type === "typing" && m.text === "")
    .map((m) => m.name);
  const uniqueTypingUsers = [...new Set(typingUsers)].slice(0, 3);

  // Get regular messages (not typing indicators)
  const displayMessages = messages.filter((m) => m.type !== "typing" || m.text !== "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div
        className="mx-auto w-full max-w-2xl"
        style={{
          background: "rgba(20, 10, 5, 0.85)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(245, 158, 11, 0.15)",
          boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Messages area */}
        <div
          className="overflow-y-auto px-4 pt-3"
          style={{ maxHeight: "200px", minHeight: "80px" }}
        >
          {displayMessages.length === 0 ? (
            <p className="text-center py-6 text-xs" style={{ color: "rgba(245, 158, 11, 0.25)" }}>
              The fire crackles softly. Say something.
            </p>
          ) : (
            displayMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-2"
              >
                {msg.type === "system" ? (
                  <p className="text-center text-xs italic" style={{ color: "rgba(245, 158, 11, 0.4)" }}>
                    {msg.text}
                  </p>
                ) : (
                  <div className="flex items-start gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold mt-0.5"
                      style={{ background: msg.color }}
                    >
                      {msg.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium" style={{ color: msg.color }}>
                        {msg.name}
                      </span>
                      <p className="text-xs break-words" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        <AnimatePresence>
          {uniqueTypingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-1"
            >
              <p className="text-[10px] flex items-center gap-1" style={{ color: "rgba(245, 158, 11, 0.4)" }}>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-1 h-1 rounded-full"
                      style={{ background: "rgba(245, 158, 11, 0.5)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                    />
                  ))}
                </span>
                {uniqueTypingUsers.length === 1
                  ? `${uniqueTypingUsers[0]} is typing...`
                  : "Someone is typing..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="flex gap-2 p-3" style={{ borderTop: "1px solid rgba(245, 158, 11, 0.08)" }}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Speak by the fire..."
            maxLength={200}
            className="flex-1 px-4 py-2 rounded-xl text-xs outline-none"
            style={{
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.12)",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-xl text-xs cursor-pointer disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              border: "none",
              color: "white",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
