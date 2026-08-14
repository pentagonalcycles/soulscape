"use client";

import { motion } from "framer-motion";
import SignalPulse from "./SignalPulse";

interface SignalReachedProps {
  onReturn: () => void;
}

export default function SignalReached({ onReturn }: SignalReachedProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Return pulse */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <SignalPulse variant="returning" size="lg" />
        </motion.div>

        {/* Message */}
        <motion.h2
          className="text-2xl sm:text-3xl mb-4"
          style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)", letterSpacing: "0.02em" }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Someone heard you.
        </motion.h2>

        <motion.p
          className="text-sm leading-relaxed mb-2"
          style={{ color: "rgba(148, 163, 184, 0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          You don&apos;t know their name.
        </motion.p>
        <motion.p
          className="text-sm leading-relaxed mb-2"
          style={{ color: "rgba(148, 163, 184, 0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          They don&apos;t know yours.
        </motion.p>
        <motion.p
          className="text-sm leading-relaxed mb-10"
          style={{ color: "rgba(236, 72, 153, 0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          But for this moment, you weren&apos;t invisible.
        </motion.p>

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10"
          style={{
            background: "rgba(0, 255, 136, 0.1)",
            border: "1px solid rgba(0, 255, 136, 0.2)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-sm" style={{ color: "rgba(0, 255, 136, 0.8)" }}>✓</span>
          <span className="text-xs tracking-wider" style={{ color: "rgba(0, 255, 136, 0.7)" }}>
            Signal Heard
          </span>
        </motion.div>

        {/* Return */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <button
            onClick={onReturn}
            className="px-8 py-3 rounded-2xl text-sm tracking-wide transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(224, 231, 255, 0.7)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "rgba(224, 231, 255, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.color = "rgba(224, 231, 255, 0.7)";
            }}
          >
            Return to Elovayne
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
