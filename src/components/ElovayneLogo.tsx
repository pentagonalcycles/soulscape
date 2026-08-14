"use client";

import { motion } from "framer-motion";

export default function ElovayneLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Symbol container */}
      <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60">
        {/* Outer ambient glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -60,
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, rgba(57, 255, 20, 0.03) 40%, transparent 65%)",
            filter: "blur(50px)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -8,
            border: "1px solid rgba(0, 255, 136, 0.06)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: "50%",
              left: "-3px",
              background: "#00ff88",
              boxShadow: "0 0 8px rgba(0, 255, 136, 0.6)",
            }}
          />
        </motion.div>

        {/* Second orbit ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -18,
            border: "1px dashed rgba(57, 255, 20, 0.04)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute w-1 h-1 rounded-full"
            style={{
              top: "-2px",
              left: "50%",
              background: "rgba(57, 255, 20, 0.5)",
              boxShadow: "0 0 6px rgba(57, 255, 20, 0.4)",
            }}
          />
        </motion.div>

        {/* SVG Symbol */}
        <motion.div
          className="absolute inset-0"
          animate={{
            filter: [
              "drop-shadow(0 0 8px rgba(0, 255, 136, 0.25))",
              "drop-shadow(0 0 16px rgba(0, 255, 136, 0.45))",
              "drop-shadow(0 0 8px rgba(0, 255, 136, 0.25))",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff88" />
                <stop offset="100%" stopColor="#00cc6a" />
              </linearGradient>
              <linearGradient id="logoGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#57ff14" />
                <stop offset="100%" stopColor="#00ff88" />
              </linearGradient>
              <linearGradient id="logoGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#74de9a" />
                <stop offset="100%" stopColor="#00cc6a" />
              </linearGradient>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Interlinked rings */}
            <motion.g
              filter="url(#logoGlow)"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "100px 100px" }}
            >
              <circle cx="78" cy="100" r="36" fill="none" stroke="url(#logoGrad1)" strokeWidth="1.2" opacity="0.8" />
              <circle cx="122" cy="100" r="36" fill="none" stroke="url(#logoGrad2)" strokeWidth="1.2" opacity="0.8" />
              <circle cx="100" cy="78" r="36" fill="none" stroke="url(#logoGrad3)" strokeWidth="1.2" opacity="0.6" />
            </motion.g>

            {/* Connection nodes */}
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="100" cy="100" r="6" fill="url(#logoGrad1)" filter="url(#logoGlow)" />
              <circle cx="86" cy="86" r="2.5" fill="#00ff88" opacity="0.7" />
              <circle cx="114" cy="86" r="2.5" fill="#57ff14" opacity="0.7" />
              <circle cx="86" cy="114" r="2.5" fill="#57ff14" opacity="0.7" />
              <circle cx="114" cy="114" r="2.5" fill="#00ff88" opacity="0.7" />
            </motion.g>

            {/* Connection lines */}
            <motion.g
              stroke="rgba(0, 255, 136, 0.2)"
              strokeWidth="0.5"
              animate={{ opacity: [0.1, 0.35, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="100" y1="100" x2="86" y2="86" />
              <line x1="100" y1="100" x2="114" y2="86" />
              <line x1="100" y1="100" x2="86" y2="114" />
              <line x1="100" y1="100" x2="114" y2="114" />
            </motion.g>

            {/* Outer connection points */}
            <motion.g
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="100" cy="45" r="2" fill="rgba(0, 255, 136, 0.45)" />
              <circle cx="155" cy="100" r="2" fill="rgba(57, 255, 20, 0.45)" />
              <circle cx="100" cy="155" r="2" fill="rgba(0, 255, 136, 0.45)" />
              <circle cx="45" cy="100" r="2" fill="rgba(57, 255, 20, 0.45)" />
              <circle cx="138" cy="62" r="1.5" fill="rgba(74, 222, 128, 0.35)" />
              <circle cx="138" cy="138" r="1.5" fill="rgba(74, 222, 128, 0.35)" />
              <circle cx="62" cy="138" r="1.5" fill="rgba(74, 222, 128, 0.35)" />
              <circle cx="62" cy="62" r="1.5" fill="rgba(74, 222, 128, 0.35)" />
            </motion.g>

            {/* Connecting threads */}
            <motion.g
              stroke="rgba(0, 255, 136, 0.1)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="100" y1="100" x2="100" y2="45" />
              <line x1="100" y1="100" x2="155" y2="100" />
              <line x1="100" y1="100" x2="100" y2="155" />
              <line x1="100" y1="100" x2="45" y2="100" />
              <line x1="100" y1="100" x2="138" y2="62" />
              <line x1="100" y1="100" x2="138" y2="138" />
              <line x1="100" y1="100" x2="62" y2="138" />
              <line x1="100" y1="100" x2="62" y2="62" />
            </motion.g>

            {/* Pulsing center */}
            <motion.circle
              cx="100" cy="100" r="4"
              fill="#00ff88"
              filter="url(#logoGlow)"
              animate={{
                r: [4, 6, 4],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Logo text */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
        style={{
          background: "linear-gradient(135deg, #00ff88, #00cc6a, #57ff14)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 200,
          letterSpacing: "0.1em",
        }}
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.1em" }}
        transition={{ duration: 3, delay: 0.3 }}
      >
        Elovayne
      </motion.h1>

      {/* Subtle accent line */}
      <motion.div
        style={{
          width: "60px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
        }}
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 60 }}
        transition={{ duration: 2, delay: 1 }}
      />

      {/* Tagline */}
      <motion.p
        className="text-base sm:text-lg tracking-widest"
        style={{ color: "rgba(0, 255, 136, 0.5)", fontWeight: 300, letterSpacing: "0.15em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 1.5 }}
      >
        where your soul can rest
      </motion.p>
    </motion.div>
  );
}
