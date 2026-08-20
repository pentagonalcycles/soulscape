"use client";

import { motion } from "framer-motion";

interface PoetryTitleProps {
  prompt: string;
  onWrite: () => void;
  onRead: () => void;
  poemCount: number;
}

export default function PoetryTitle({ prompt, onWrite, onRead, poemCount }: PoetryTitleProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{
        background: "transparent",
      }}
    >
      {/* Ornamental top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-center mb-2"
        style={{ color: "rgba(245, 158, 11, 0.3)", fontSize: "24px", letterSpacing: "0.5em" }}
      >
        ✦ ✦ ✦
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-4xl sm:text-5xl font-light tracking-wide mb-3 text-center"
        style={{
          fontFamily: "var(--font-heading)",
          background: "linear-gradient(135deg, #fef3c7, #f59e0b, #d97706)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Poetry Prompts
      </motion.h1>

      {/* Date */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="text-xs mb-10 tracking-widest uppercase"
        style={{ color: "rgba(245, 158, 11, 0.3)", fontFamily: "var(--font-body)" }}
      >
        {dateStr}
      </motion.p>

      {/* Ornamental divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="w-48 mb-10"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)",
        }}
      />

      {/* Today's prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="max-w-md text-center mb-10 px-6"
      >
        <p className="text-xs mb-3 tracking-widest uppercase" style={{ color: "rgba(245, 158, 11, 0.4)" }}>
          Today&apos;s Prompt
        </p>
        <p
          className="text-xl sm:text-2xl leading-relaxed"
          style={{
            fontFamily: "var(--font-heading)",
            color: "rgba(254, 243, 199, 0.85)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{prompt}&rdquo;
        </p>
      </motion.div>

      {/* Ornamental divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="w-32 mb-10"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), transparent)",
        }}
      />

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={onWrite}
          className="px-8 py-3 rounded-xl text-sm cursor-pointer transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#1a1510",
            border: "none",
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.05em",
            boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
          }}
        >
          ✒ Write a Poem
        </button>
        <button
          onClick={onRead}
          className="px-8 py-3 rounded-xl text-sm cursor-pointer transition-all hover:scale-105"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            color: "rgba(254, 243, 199, 0.7)",
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.05em",
          }}
        >
          📖 Read Poems ({poemCount})
        </button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-16 text-[10px] text-center"
        style={{ color: "rgba(245, 158, 11, 0.15)" }}
      >
        365 prompts · One each day · Write from the heart
      </motion.p>
    </div>
  );
}
