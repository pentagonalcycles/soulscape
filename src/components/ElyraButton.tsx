"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ElyraButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isHovered && (
          <motion.div
            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
            style={{
              background: "rgba(0, 255, 136, 0.06)",
              border: "1px solid rgba(0, 255, 136, 0.12)",
              backdropFilter: "blur(12px)",
              color: "rgba(224, 245, 232, 0.7)",
            }}
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            Speak with Luna ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <Link
        href="/elyra"
        aria-label="Speak with Luna"
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        style={{ textDecoration: "none" }}
      >
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Main button */}
          <motion.div
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "#2a4d3a",
              border: "1px solid rgba(0, 255, 136, 0.12)",
              boxShadow: "0 0 16px rgba(0, 255, 136, 0.08), 0 4px 16px rgba(0, 255, 136, 0.05)",
            }}
            whileHover={{
              scale: 1.08,
              borderColor: "rgba(0, 255, 136, 0.3)",
              boxShadow: "0 0 24px rgba(0, 255, 136, 0.15), 0 0 48px rgba(0, 255, 136, 0.06), 0 4px 20px rgba(0, 255, 136, 0.06)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <span className="text-lg" style={{ opacity: 0.8 }}>✦</span>

            {/* Pulse indicator */}
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: "rgba(0, 255, 136, 0.7)",
                boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </Link>
    </div>
  );
}
