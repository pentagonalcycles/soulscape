"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SoulEchoReflectionProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

const prompts = [
  "What's on your mind?",
  "What are you carrying today?",
  "What would you like someone to understand?",
  "What truth have you been holding quietly?",
  "What feels unfinished within you?",
];

export default function SoulEchoReflection({ onSubmit, isSubmitting }: SoulEchoReflectionProps) {
  const [content, setContent] = useState("");
  const [currentPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);

  const handleSubmit = () => {
    if (content.trim() && !isSubmitting) {
      onSubmit(content.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
    >
      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-elovayne-dim font-accent text-base md:text-lg mb-8 text-center"
      >
        {currentPrompt}
      </motion.p>

      {/* Textarea card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-lg rounded-2xl p-6 md:p-8"
        style={{
          background: "rgba(13, 148, 136, 0.04)",
          border: "1px solid rgba(13, 148, 136, 0.12)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write freely... there are no wrong words here."
          rows={6}
          className="w-full bg-transparent text-elovayne-light font-body text-sm md:text-base leading-relaxed resize-none outline-none placeholder:text-elovayne-dim/40"
          style={{ caretColor: "#5eead4" }}
          disabled={isSubmitting}
        />

        {/* Word count */}
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(13, 148, 136, 0.08)" }}>
          <span className="text-elovayne-dim/40 text-xs">
            {content.length > 0 ? `${content.length} characters` : ""}
          </span>
          <span className="text-elovayne-dim/30 text-xs">
            ⌘/Ctrl + Enter to submit
          </span>
        </div>
      </motion.div>

      {/* Submit button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: content.trim() ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
        whileHover={content.trim() ? { scale: 1.02 } : {}}
        whileTap={content.trim() ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        className="mt-8 px-8 py-3 rounded-2xl text-sm font-body tracking-wide transition-all duration-500 disabled:cursor-not-allowed"
        style={{
          background: content.trim()
            ? "linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)"
            : "rgba(13, 148, 136, 0.05)",
          border: `1px solid ${content.trim() ? "rgba(13, 148, 136, 0.3)" : "rgba(13, 148, 136, 0.1)"}`,
          color: content.trim() ? "#5eead4" : "rgba(13, 148, 136, 0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        {isSubmitting ? (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Sending your reflection...
          </motion.span>
        ) : (
          "Release into the echo"
        )}
      </motion.button>
    </motion.div>
  );
}
