"use client";

import { motion } from "framer-motion";

interface SoulEchoLandingProps {
  onBegin: () => void;
}

export default function SoulEchoLanding({ onBegin }: SoulEchoLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.08) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Floating organic shapes */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 8, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <motion.div
        animate={{
          y: [0, 12, 0],
          x: [0, -10, 0],
          rotate: [0, -3, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[25%] right-[10%] w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10"
      >
        <h1
          className="text-5xl md:text-7xl font-heading mb-6"
          style={{
            background: "linear-gradient(135deg, #5eead4 0%, #60a5fa 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(0, 255, 136, 0.3))",
          }}
        >
          Soul Echo
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-elovayne-dim font-accent text-lg md:text-xl max-w-md leading-relaxed mb-12"
      >
        Sometimes understanding begins with a single honest thought.
      </motion.p>

      {/* Begin button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 255, 136, 0.2)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onBegin}
        className="relative z-10 px-10 py-3.5 rounded-2xl text-sm font-body tracking-wide transition-all duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.15) 100%)",
          border: "1px solid rgba(0, 255, 136, 0.3)",
          color: "#5eead4",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0, 255, 136, 0.1)",
        }}
      >
        Begin
      </motion.button>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, delay: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 mt-16 w-24 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
        }}
      />
    </motion.div>
  );
}
