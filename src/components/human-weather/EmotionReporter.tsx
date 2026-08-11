"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTIONS, EmotionId } from "./emotions";

interface EmotionReporterProps {
  onSubmit: (emotion: EmotionId) => Promise<void>;
  recentCheckin: boolean;
}

export default function EmotionReporter({ onSubmit, recentCheckin }: EmotionReporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSelect(emotionId: EmotionId) {
    if (submitting) return;
    setSubmitting(true);
    await onSubmit(emotionId);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 2000);
  }

  return (
    <div className="my-8">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="trigger"
            onClick={() => setIsOpen(true)}
            className="w-full py-4 px-6 rounded-2xl text-sm tracking-wide transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(6, 182, 212, 0.08))",
              border: "1px solid rgba(13, 148, 136, 0.15)",
              color: "var(--text-secondary)",
              fontWeight: 400,
              letterSpacing: "0.04em",
            }}
            whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(13, 148, 136, 0.1)" }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="mr-2">🌤️</span>
            Report My Weather
          </motion.button>
        ) : (
          <motion.div
            key="selector"
            className="rounded-2xl p-6 sm:p-8 overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(13, 148, 136, 0.1)",
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06)",
            }}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    ✓
                  </motion.div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Your weather has been recorded.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className="text-lg"
                      style={{ fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.02em" }}
                    >
                      How are you feeling right now?
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: "var(--text-dim)" }}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {EMOTIONS.map((emotion, i) => (
                      <motion.button
                        key={emotion.id}
                        onClick={() => handleSelect(emotion.id)}
                        disabled={submitting}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                        style={{
                          background: "rgba(13, 148, 136, 0.03)",
                          border: "1px solid rgba(13, 148, 136, 0.06)",
                        }}
                        whileHover={{
                          scale: 1.05,
                          background: `${emotion.color}10`,
                          borderColor: `${emotion.color}30`,
                        }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <span className="text-2xl">{emotion.emoji}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {emotion.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {recentCheckin && (
                    <p className="text-[10px] mt-4 text-center" style={{ color: "var(--text-faint)" }}>
                      You recently checked in. Your next check-in will update the weather.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
