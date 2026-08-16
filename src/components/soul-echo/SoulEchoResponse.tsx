"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { RESPONSE_OPTIONS, type ResponseOption, type Reflection } from "./types";

interface SoulEchoResponseProps {
  matchedReflection: Reflection;
  onSelect: (type: ResponseOption["type"], content: string) => void;
  isSubmitting: boolean;
}

const placeholders: Record<string, string> = {
  letter: "Write your letter here...",
  encouragement: "What would you like them to know?",
  quote: "Paste or type the quote...",
  song: "Share the song name and artist, or lyrics that moved you...",
  kindness: "A simple message of warmth...",
};

export default function SoulEchoResponse({ onSelect, isSubmitting }: SoulEchoResponseProps) {
  const [selectedType, setSelectedType] = useState<ResponseOption["type"] | null>(null);
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (selectedType && content.trim() && !isSubmitting) {
      onSelect(selectedType, content.trim());
    }
  };

  const selectedOption = RESPONSE_OPTIONS.find((o) => o.type === selectedType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center min-h-[80vh] px-6 py-12"
    >
      {/* Header */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-elovayne-dim font-accent text-sm md:text-base text-center mb-8"
      >
        How would you like to respond?
      </motion.p>

      {/* Response options */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 mb-8 max-w-lg"
      >
        {RESPONSE_OPTIONS.map((option, i) => (
          <motion.button
            key={option.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedType(option.type);
              setContent("");
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-body transition-all duration-300"
            style={{
              background: selectedType === option.type
                ? "rgba(0, 255, 136, 0.15)"
                : "rgba(0, 255, 136, 0.04)",
              border: `1px solid ${selectedType === option.type
                ? "rgba(0, 255, 136, 0.5)"
                : "rgba(0, 255, 136, 0.1)"}`,
              color: selectedType === option.type ? "#5eead4" : "rgba(148, 163, 184, 0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg"
          >
            {/* Description */}
            {selectedOption && (
              <p className="text-elovayne-dim/60 text-xs text-center mb-4">
                {selectedOption.description}
              </p>
            )}

            {/* Textarea card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(0, 255, 136, 0.04)",
                border: "1px solid rgba(0, 255, 136, 0.12)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
              }}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholders[selectedType] || "Write your response..."}
                rows={5}
                className="w-full bg-transparent text-elovayne-light font-body text-sm leading-relaxed resize-none outline-none placeholder:text-elovayne-dim/40"
                style={{ caretColor: "#5eead4" }}
                disabled={isSubmitting}
              />
            </div>

            {/* Send button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: content.trim() ? 1 : 0.4 }}
              whileHover={content.trim() ? { scale: 1.02 } : {}}
              whileTap={content.trim() ? { scale: 0.98 } : {}}
              onClick={handleSend}
              disabled={!content.trim() || isSubmitting}
              className="mt-6 w-full px-6 py-3 rounded-2xl text-sm font-body tracking-wide transition-all duration-500 disabled:cursor-not-allowed"
              style={{
                background: content.trim()
                  ? "linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 204, 106, 0.2) 100%)"
                  : "rgba(0, 255, 136, 0.05)",
                border: `1px solid ${content.trim() ? "rgba(0, 255, 136, 0.5)" : "rgba(0, 255, 136, 0.1)"}`,
                color: content.trim() ? "#5eead4" : "rgba(0, 255, 136, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              {isSubmitting ? "Sending..." : "Send with care"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
