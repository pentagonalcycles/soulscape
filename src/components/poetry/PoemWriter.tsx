"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PoemWriterProps {
  prompt: string;
  onSubmit: (content: string, penName: string) => void;
  onBack: () => void;
  remaining: number;
}

export default function PoemWriter({ prompt, onSubmit, onBack, remaining }: PoemWriterProps) {
  const [content, setContent] = useState("");
  const [penName, setPenName] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit() {
    if (!content.trim() || sending) return;
    setSending(true);
    onSubmit(content.trim(), penName.trim() || "Anonymous");
    setSending(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{
        background: "linear-gradient(180deg, #1a1510 0%, #2a1f15 50%, #1a1510 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 text-xs cursor-pointer"
          style={{ color: "rgba(245, 158, 11, 0.4)", background: "none", border: "none" }}
        >
          ← Back
        </button>

        {/* Prompt */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
            Today&apos;s Prompt
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{
              fontFamily: "var(--font-heading)",
              color: "rgba(254, 243, 199, 0.8)",
              fontStyle: "italic",
            }}
          >
            &ldquo;{prompt}&rdquo;
          </p>
        </div>

        {/* Pen name */}
        <div className="mb-4">
          <label className="text-[10px] tracking-wider mb-1.5 block" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
            Pen Name (optional)
          </label>
          <input
            type="text"
            value={penName}
            onChange={(e) => setPenName(e.target.value)}
            placeholder="Anonymous"
            maxLength={30}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "rgba(254, 243, 199, 0.05)",
              border: "1px solid rgba(245, 158, 11, 0.12)",
              color: "rgba(254, 243, 199, 0.85)",
              fontFamily: "var(--font-accent)",
            }}
          />
        </div>

        {/* Poem textarea */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] tracking-wider" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
              Your Poem
            </label>
            <span className="text-[10px]" style={{ color: "rgba(245, 158, 11, 0.25)" }}>
              {content.length}/1000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 1000))}
            placeholder="Write from the heart..."
            rows={10}
            className="w-full px-5 py-4 rounded-xl text-sm resize-none outline-none"
            style={{
              background: "rgba(254, 243, 199, 0.04)",
              border: "1px solid rgba(245, 158, 11, 0.1)",
              color: "rgba(254, 243, 199, 0.9)",
              fontFamily: "var(--font-accent)",
              fontSize: "15px",
              lineHeight: "1.8",
              caretColor: "#f59e0b",
            }}
            autoFocus
          />
        </div>

        {/* Remaining poems today */}
        <p className="text-[10px] mb-6" style={{ color: "rgba(245, 158, 11, 0.25)" }}>
          {remaining} poem{remaining !== 1 ? "s" : ""} remaining today
        </p>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-xl text-xs cursor-pointer"
            style={{
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.12)",
              color: "rgba(254, 243, 199, 0.4)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || sending || remaining <= 0}
            className="flex-1 px-4 py-3 rounded-xl text-xs cursor-pointer disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none",
              color: "#1a1510",
              fontFamily: "var(--font-heading)",
              letterSpacing: "0.05em",
              boxShadow: "0 0 20px rgba(245, 158, 11, 0.15)",
            }}
          >
            {sending ? "Publishing..." : "✒ Publish Poem"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
