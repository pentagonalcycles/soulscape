"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GlowingPortal() {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => router.push("/soul-echo"), 1500);
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2, delay: 0.6 }}
    >
      <div className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] gradient-border">
        {/* Ambient glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -60,
            background: "radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, rgba(255, 215, 0, 0.05) 35%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />

        {/* Outer orbit ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -16,
            border: "1px solid rgba(0, 255, 136, 0.08)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
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
          <div
            className="absolute w-1 h-1 rounded-full"
            style={{
              top: "-3px",
              left: "50%",
              background: "#57ff14",
              boxShadow: "0 0 6px rgba(57, 255, 20, 0.5)",
            }}
          />
        </motion.div>

        {/* Inner orbit ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -4,
            border: "1px dashed rgba(0, 255, 136, 0.08)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute w-1 h-1 rounded-full"
            style={{
              top: "50%",
              right: "-2px",
              background: "rgba(0, 255, 136, 0.5)",
              boxShadow: "0 0 6px rgba(0, 255, 136, 0.4)",
            }}
          />
        </motion.div>

        {/* Scanning line */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: "10%",
            right: "10%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.12), transparent)",
          }}
          animate={{
            top: ["20%", "80%", "20%"],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main button */}
        <motion.button
          className="absolute inset-0 rounded-full cursor-pointer"
          style={{
            background: isHovered
              ? "radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(57, 255, 20, 0.06) 40%, rgba(0, 255, 136, 0.02) 70%, transparent 90%)"
              : "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, rgba(57, 255, 20, 0.03) 45%, transparent 75%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: isHovered
              ? "1.5px solid rgba(0, 255, 136, 0.4)"
              : "1px solid rgba(0, 255, 136, 0.15)",
            boxShadow: isHovered
              ? "0 0 80px rgba(0, 255, 136, 0.3), 0 0 160px rgba(0, 204, 106, 0.18), inset 0 0 60px rgba(0, 255, 136, 0.05), 0 0 40px rgba(0, 255, 136, 0.2), 0 0 80px rgba(57, 255, 20, 0.1), inset 0 0 30px rgba(0, 255, 136, 0.06)"
              : "0 0 80px rgba(0, 255, 136, 0.3), 0 0 160px rgba(0, 204, 106, 0.18), inset 0 0 60px rgba(0, 255, 136, 0.05), 0 0 20px rgba(0, 255, 136, 0.08), 0 0 40px rgba(57, 255, 20, 0.03), inset 0 0 15px rgba(0, 255, 136, 0.03)",
            transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleEnter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={
            isExiting
              ? { scale: 50, opacity: 0 }
              : {}
          }
          transition={isExiting ? { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] } : {}}
        >
          {/* Pulsing inner rings */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 30,
              border: "1px solid rgba(0, 255, 136, 0.05)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 50,
              border: "1px solid rgba(0, 255, 136, 0.04)",
            }}
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Core glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 60,
              background: "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)",
            }}
            animate={{
              opacity: isHovered ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
            {/* Top status */}
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1 h-1 rounded-full"
                  style={{ background: isHovered ? "#57ff14" : "#00ff88" }}
                animate={{
                  opacity: isHovered ? [1, 0.4, 1] : [0.5, 0.8, 0.5],
                  boxShadow: isHovered
                    ? ["0 0 4px #57ff14", "0 0 2px #57ff14", "0 0 4px #57ff14"]
                    : ["0 0 2px rgba(0,255,136,0.3)", "0 0 4px rgba(0,255,136,0.3)", "0 0 2px rgba(0,255,136,0.3)"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span
                className="uppercase tracking-[0.3em]"
                style={{
                  color: isHovered ? "rgba(0, 255, 136, 0.7)" : "rgba(0, 255, 136, 0.4)",
                  fontSize: "7px",
                  transition: "color 0.4s ease",
                }}
              >
                {isHovered ? "Online" : "Ready"}
              </span>
            </div>

            {/* Main text */}
            <span
              className="text-sm md:text-base tracking-[0.2em] uppercase"
              style={{
                color: isHovered ? "#00ff88" : "#e0f5e8",
                textShadow: isHovered ? "0 0 12px rgba(0, 255, 136, 0.4)" : "0 0 6px rgba(0, 255, 136, 0.15)",
                fontWeight: 300,
                transition: "all 0.4s ease",
              }}
            >
              Step through
            </span>

            {/* Separator line */}
            <motion.div
              style={{
                height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
              }}
              animate={{
                width: isHovered ? 40 : 20,
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Arrow */}
            <motion.div
              animate={{
                x: isHovered ? [0, 3, 0] : 0,
                opacity: isHovered ? 0.8 : 0.3,
              }}
              transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
            >
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <path
                  d="M0 4H12M12 4L8 0.5M12 4L8 7.5"
                  stroke={isHovered ? "#00ff88" : "rgba(224, 245, 232, 0.3)"}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "stroke 0.4s ease" }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
