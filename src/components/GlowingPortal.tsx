"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlowingPortal() {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("/sanctuary");
    }, prefersReducedMotion ? 400 : 1200);
  };

  const addRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, id]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r !== id));
    }, 1000);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Portal container */}
      <div className="relative">
        {/* Ripples on hover/tap */}
        <AnimatePresence>
          {ripples.map((id) => (
            <motion.div
              key={id}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "1px solid rgba(157, 124, 216, 0.3)",
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Rotating shimmer ring */}
        <motion.div
          className="absolute inset-[-3px] rounded-full pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, transparent 0%, rgba(190, 180, 220, 0.15) 25%, transparent 50%, rgba(157, 124, 216, 0.1) 75%, transparent 100%)",
            animation: prefersReducedMotion ? "none" : "portal-shimmer 8s linear infinite",
          }}
        />

        {/* Glowing rim */}
        <div
          className="absolute inset-[-2px] rounded-full pointer-events-none"
          style={{
            border: "1.5px solid rgba(157, 124, 216, 0.25)",
            boxShadow: isHovered
              ? "0 0 15px rgba(157, 124, 216, 0.4), 0 0 30px rgba(140, 130, 190, 0.2), inset 0 0 15px rgba(157, 124, 216, 0.15)"
              : "0 0 10px rgba(157, 124, 216, 0.2), 0 0 20px rgba(140, 130, 190, 0.1)",
            transition: "box-shadow 0.5s ease",
          }}
        />

        {/* Portal button */}
        <motion.button
          className="relative w-44 h-44 md:w-56 md:h-56 rounded-full cursor-pointer border-0"
          style={{
            background: "radial-gradient(circle, rgba(157, 124, 216, 0.08) 0%, rgba(107, 63, 160, 0.04) 40%, transparent 70%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onMouseEnter={() => {
            setIsHovered(true);
            addRipple();
          }}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleEnter}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          animate={
            isExiting
              ? { scale: 50, opacity: 0 }
              : {
                  boxShadow: isHovered
                    ? "0 0 80px rgba(157, 124, 216, 0.6), 0 0 160px rgba(107, 63, 160, 0.4), 0 0 240px rgba(140, 130, 190, 0.2), inset 0 0 50px rgba(157, 124, 216, 0.2)"
                    : [
                        "0 0 40px rgba(157, 124, 216, 0.3), 0 0 80px rgba(107, 63, 160, 0.2), inset 0 0 30px rgba(157, 124, 216, 0.15)",
                        "0 0 60px rgba(157, 124, 216, 0.45), 0 0 120px rgba(107, 63, 160, 0.3), inset 0 0 40px rgba(157, 124, 216, 0.2)",
                        "0 0 40px rgba(157, 124, 216, 0.3), 0 0 80px rgba(107, 63, 160, 0.2), inset 0 0 30px rgba(157, 124, 216, 0.15)",
                      ],
                }
          }
          transition={
            isExiting
              ? { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
              : {
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
        >
          {/* Glass centre */}
          <div
            className="absolute inset-6 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(157, 124, 216, 0.1) 0%, rgba(107, 63, 160, 0.05) 50%, transparent 70%)",
              border: "1px solid rgba(157, 124, 216, 0.1)",
            }}
          />

          {/* Portal text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-elovayne-light font-heading text-base md:text-lg tracking-[0.25em] uppercase glow-text"
              animate={{
                textShadow: [
                  "0 0 8px rgba(190, 180, 220, 0.3), 0 0 20px rgba(157, 124, 216, 0.15)",
                  "0 0 15px rgba(190, 180, 220, 0.5), 0 0 30px rgba(157, 124, 216, 0.3)",
                  "0 0 8px rgba(190, 180, 220, 0.3), 0 0 20px rgba(157, 124, 216, 0.15)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Step through
            </motion.span>
          </div>
        </motion.button>
      </div>

      {/* Exit overlay — only when not expanding */}
      {isExiting && !prefersReducedMotion && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(135deg, #1a0a3e 0%, #0f1d55 25%, #0a2840 50%, #0d3530 75%, #080818 100%)",
            zIndex: 100,
          }}
        />
      )}
    </motion.div>
  );
}
