"use client";

import { motion } from "framer-motion";

export default function SoulscapeLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo symbol */}
      <motion.div
        className="relative w-16 h-16 md:w-20 md:h-20"
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(157, 124, 216, 0.5))",
            "drop-shadow(0 0 20px rgba(157, 124, 216, 0.8))",
            "drop-shadow(0 0 10px rgba(157, 124, 216, 0.5))",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Inner orbit */}
          <ellipse
            cx="50"
            cy="50"
            rx="30"
            ry="15"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="1"
            opacity="0.4"
            transform="rotate(-30 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="30"
            ry="15"
            fill="none"
            stroke="url(#logoGradient)"
            strokeWidth="1"
            opacity="0.4"
            transform="rotate(30 50 50)"
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="url(#logoGradient)" opacity="0.8" />
          {/* Orbiting dots */}
          <circle cx="50" cy="5" r="2" fill="#e879a8" opacity="0.7" />
          <circle cx="85" cy="68" r="1.5" fill="#f5d062" opacity="0.6" />
          <circle cx="15" cy="68" r="1.5" fill="#9d7cd8" opacity="0.6" />
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9d7cd8" />
              <stop offset="50%" stopColor="#e879a8" />
              <stop offset="100%" stopColor="#f5d062" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Logo text */}
      <motion.h1
        className="font-heading text-4xl md:text-6xl lg:text-7xl font-light tracking-wider text-soulscape-light glow-text-strong"
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.15em" }}
        transition={{ duration: 2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        Soulscape
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="font-accent text-xl md:text-2xl text-soulscape-muted tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      >
        beyond reality
      </motion.p>
    </motion.div>
  );
}
