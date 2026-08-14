"use client";

import { motion } from "framer-motion";
import type { Reflection } from "./types";

interface SoulEchoMatchRevealProps {
  matchedReflection: Reflection;
  onContinue: () => void;
}

export default function SoulEchoMatchReveal({ matchedReflection, onContinue }: SoulEchoMatchRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, rgba(96, 165, 250, 0.05) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Reveal text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 text-elovayne-dim font-accent text-base md:text-lg text-center mb-10 max-w-md"
      >
        A voice has quietly resonated with yours.
      </motion.p>

      {/* Matched reflection card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-lg rounded-2xl p-8 md:p-10"
        style={{
          background: "rgba(0, 255, 136, 0.06)",
          border: "1px solid rgba(0, 255, 136, 0.15)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        }}
      >
        {/* Decorative quote mark */}
        <div
          className="absolute top-4 left-6 text-4xl font-heading opacity-20"
          style={{ color: "#5eead4" }}
        >
          ❝
        </div>

        <p className="relative z-10 text-elovayne-light font-body text-sm md:text-base leading-relaxed italic pl-4">
          {matchedReflection.content}
        </p>

        <div
          className="mt-6 w-12 h-px"
          style={{ background: "rgba(0, 255, 136, 0.2)" }}
        />
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="relative z-10 mt-10 px-8 py-3 rounded-2xl text-sm font-body tracking-wide transition-all duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.15) 100%)",
          border: "1px solid rgba(0, 255, 136, 0.3)",
          color: "#5eead4",
          backdropFilter: "blur(12px)",
        }}
      >
        Send a gentle response
      </motion.button>
    </motion.div>
  );
}
