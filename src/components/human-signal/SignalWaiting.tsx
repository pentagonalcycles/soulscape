"use client";

import { motion } from "framer-motion";
import { getSignalType } from "./types";
import SignalPulse from "./SignalPulse";

interface SignalWaitingProps {
  signalType: string;
  onCancel: () => void;
}

export default function SignalWaiting({ signalType, onCancel }: SignalWaitingProps) {
  const signal = getSignalType(signalType);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Sending animation */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SignalPulse variant="sending" size="lg" />
        </motion.div>

        {/* Signal type */}
        <motion.div
          className="text-4xl mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {signal.emoji}
        </motion.div>

        {/* Status */}
        <motion.h2
          className="text-xl sm:text-2xl mb-3"
          style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)", letterSpacing: "0.02em" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Your signal is travelling…
        </motion.h2>

        <motion.p
          className="text-sm mb-10"
          style={{ color: "rgba(148, 163, 184, 0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Somewhere, someone might hear it.
        </motion.p>

        {/* Cancel */}
        <motion.button
          onClick={onCancel}
          className="text-xs tracking-wide transition-colors"
          style={{ color: "rgba(148, 163, 184, 0.3)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(148, 163, 184, 0.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(148, 163, 184, 0.3)"; }}
        >
          ← Return
        </motion.button>
      </motion.div>
    </div>
  );
}
