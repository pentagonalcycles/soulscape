"use client";

import { motion } from "framer-motion";

interface SoulEchoEmptyProps {
  onNewReflection: () => void;
}

export default function SoulEchoEmpty({ onNewReflection }: SoulEchoEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Floating shapes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
            x: [0, (i % 2 === 0 ? 6 : -6), 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 5 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%)",
            filter: "blur(20px)",
            top: `${35 + i * 12}%`,
            left: `${25 + i * 20}%`,
          }}
        />
      ))}

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10"
      >
        <p className="text-elovayne-dim font-accent text-base md:text-lg max-w-md leading-relaxed mb-2">
          Someone who understands may still be finding the words.
        </p>
        <p className="text-elovayne-dim/40 text-xs mb-10">
          Your reflection is held safely here.
        </p>
      </motion.div>

      {/* New reflection button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewReflection}
        className="relative z-10 px-8 py-3 rounded-2xl text-sm font-body tracking-wide transition-all duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 204, 106, 0.1) 100%)",
          border: "1px solid rgba(0, 255, 136, 0.2)",
          color: "rgba(94, 234, 212, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        Share another reflection
      </motion.button>
    </motion.div>
  );
}
