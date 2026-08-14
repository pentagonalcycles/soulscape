"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface MessageModalProps {
  mode: "read" | "write";
  message?: string;
  onSubmit?: (content: string) => void;
  onClose: () => void;
  onWrite?: () => void;
  sending?: boolean;
  error?: string;
}

export default function MessageModal({ mode, message, onSubmit, onClose, onWrite, sending, error }: MessageModalProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && text.trim().length <= 100) {
      onSubmit?.(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.4)" }}
        onClick={onClose}
      />

      <motion.div
        className="relative rounded-2xl p-8 w-full max-w-sm"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 255, 136, 0.15)",
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.2)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-sm"
          style={{ color: "rgba(224, 245, 232, 0.3)", background: "rgba(224, 245, 232, 0.04)", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {mode === "read" ? (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-2">
                <span className="text-2xl">✦</span>
              </div>
              <p
                className="text-center text-lg font-body leading-relaxed mb-6"
                style={{ color: "rgba(224, 245, 232, 0.8)" }}
              >
                &ldquo;{message}&rdquo;
              </p>
              <div className="flex flex-col gap-2">
                {onWrite && (
                  <button
                    onClick={onWrite}
                    className="w-full py-2.5 rounded-xl text-xs transition-all"
                    style={{
                      background: "rgba(0, 255, 136, 0.1)",
                      border: "1px solid rgba(0, 255, 136, 0.2)",
                      color: "#00ff88",
                      cursor: "pointer",
                    }}
                  >
                    Leave your own message
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-xs transition-all"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0, 255, 136, 0.1)",
                    color: "rgba(224, 245, 232, 0.4)",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-4">
                <span className="text-2xl">✦</span>
                <h3
                  className="text-sm font-body mt-2"
                  style={{ color: "rgba(224, 245, 232, 0.7)" }}
                >
                  Leave a message in the sky
                </h3>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 100))}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                rows={3}
                autoFocus
                className="w-full rounded-xl p-4 text-sm font-body resize-none outline-none"
                style={{
                  background: "rgba(0, 255, 136, 0.04)",
                  border: "1px solid rgba(0, 255, 136, 0.12)",
                  color: "rgba(224, 245, 232, 0.8)",
                  caretColor: "#00ff88",
                }}
              />

              <div className="flex items-center justify-between mt-2 mb-4">
                <span className="text-[10px]" style={{ color: "rgba(224, 245, 232, 0.3)" }}>
                  {text.length}/100
                </span>
                {error && (
                  <span className="text-[10px]" style={{ color: "#ef4444" }}>
                    {error}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs transition-all"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0, 255, 136, 0.1)",
                    color: "rgba(224, 245, 232, 0.4)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() || text.trim().length > 100 || sending}
                  className="flex-1 py-2.5 rounded-xl text-xs transition-all disabled:opacity-30"
                  style={{
                    background: text.trim() ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
                    border: `1px solid ${text.trim() ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.08)"}`,
                    color: text.trim() ? "#00ff88" : "rgba(224, 245, 232, 0.3)",
                    cursor: text.trim() ? "pointer" : "default",
                  }}
                >
                  {sending ? "Sending..." : "Send to the stars"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
