"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SIGNAL_TYPES } from "./types";

interface SignalSenderProps {
  onSelect: (signalType: string) => void;
  onBack: () => void;
  cooldownRemaining: number;
  dailyRemaining: number;
}

export default function SignalSender({ onSelect, onBack, cooldownRemaining, dailyRemaining }: SignalSenderProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const canSend = cooldownRemaining <= 0 && dailyRemaining > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-8 text-xs tracking-wide transition-colors"
          style={{ color: "rgba(148, 163, 184, 0.5)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(148, 163, 184, 0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(148, 163, 184, 0.5)"; }}
        >
          ← Back
        </button>

        {/* Title */}
        <h2
          className="text-2xl sm:text-3xl mb-3"
          style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)", letterSpacing: "0.02em" }}
        >
          What do you need right now?
        </h2>
        <p className="text-sm mb-8" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
          Choose one. Your signal will be anonymous.
        </p>

        {/* Rate limit warnings */}
        {!canSend && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
            {cooldownRemaining > 0 ? (
              <p className="text-xs" style={{ color: "rgba(239, 68, 68, 0.7)" }}>
                Please wait {Math.ceil(cooldownRemaining / 1000)} seconds before sending another signal.
              </p>
            ) : (
              <p className="text-xs" style={{ color: "rgba(239, 68, 68, 0.7)" }}>
                You&apos;ve reached your daily limit of 5 signals. Try again tomorrow.
              </p>
            )}
          </div>
        )}

        {/* Signal options */}
        <div className="space-y-2 mb-8">
          {SIGNAL_TYPES.map((signal, i) => (
            <motion.button
              key={signal.id}
              onClick={() => setSelected(signal.id)}
              disabled={!canSend}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
              style={{
                background: selected === signal.id
                  ? "rgba(0, 255, 136, 0.12)"
                  : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${selected === signal.id
                  ? "rgba(0, 255, 136, 0.25)"
                  : "rgba(255, 255, 255, 0.05)"}`,
                opacity: canSend ? 1 : 0.4,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: canSend ? 1 : 0.4, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={canSend ? { scale: 1.01 } : {}}
              whileTap={canSend ? { scale: 0.99 } : {}}
            >
              <span className="text-2xl">{signal.emoji}</span>
              <span
                className="text-sm"
                style={{ color: selected === signal.id ? "rgba(224, 231, 255, 0.9)" : "rgba(148, 163, 184, 0.7)" }}
              >
                {signal.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Submit */}
        <AnimatePresence>
          {selected && canSend && (
            <motion.button
              onClick={() => onSelect(selected)}
              className="w-full py-4 rounded-2xl text-sm tracking-wide"
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.15))",
                border: "1px solid rgba(0, 255, 136, 0.3)",
                color: "rgba(224, 231, 255, 0.9)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.01, boxShadow: "0 4px 30px rgba(0, 255, 136, 0.2)" }}
              whileTap={{ scale: 0.99 }}
            >
              📡 Send My Signal
            </motion.button>
          )}
        </AnimatePresence>

        {/* Daily remaining */}
        {canSend && (
          <p className="text-[10px] mt-4 text-center" style={{ color: "rgba(148, 163, 184, 0.3)" }}>
            {dailyRemaining} signal{dailyRemaining !== 1 ? "s" : ""} remaining today
          </p>
        )}
      </motion.div>
    </div>
  );
}
