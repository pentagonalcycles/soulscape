"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/soul-map/questions";

interface SoulMapQuestionProps {
  question: { id: number; text: string; category: string };
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  answeredToday: boolean;
}

export default function SoulMapQuestion({ question, onSubmit, onSkip, answeredToday }: SoulMapQuestionProps) {
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);

  const cat = CATEGORIES[question.category] || CATEGORIES.emotions;

  function handleSubmit() {
    if (!answer.trim() || sending || answeredToday) return;
    setSending(true);
    onSubmit(answer.trim());
    setSending(false);
  }

  if (answeredToday) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6"
      >
        <p className="text-sm mb-2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
          You&apos;ve answered today&apos;s question.
        </p>
        <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
          Come back tomorrow for a new one.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md mx-auto p-6 rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${cat.color}20`,
        boxShadow: `0 0 40px ${cat.glow}`,
      }}
    >
      {/* Category badge */}
      <div className="text-center mb-4">
        <span
          className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            background: `${cat.color}15`,
            color: cat.color,
            border: `1px solid ${cat.color}30`,
          }}
        >
          {question.category}
        </span>
      </div>

      {/* Question */}
      <p
        className="text-center text-lg mb-6 leading-relaxed"
        style={{
          fontFamily: "var(--font-heading)",
          color: "rgba(255, 255, 255, 0.85)",
        }}
      >
        {question.text}
      </p>

      {/* Answer textarea */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value.slice(0, 300))}
        placeholder="Write your answer..."
        rows={4}
        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-3"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: `1px solid ${cat.color}15`,
          color: "rgba(255, 255, 255, 0.85)",
          fontFamily: "var(--font-body)",
          caretColor: cat.color,
        }}
        autoFocus
      />

      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px]" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
          {answer.length}/300
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.35)",
          }}
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || sending}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${cat.color}, ${cat.color}88)`,
            border: "none",
            color: "white",
            boxShadow: `0 0 15px ${cat.glow}`,
          }}
        >
          {sending ? "Adding..." : "Add to Map"}
        </button>
      </div>
    </motion.div>
  );
}
