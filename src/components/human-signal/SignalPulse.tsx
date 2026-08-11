"use client";

import { motion } from "framer-motion";

interface SignalPulseProps {
  variant?: "idle" | "sending" | "returning" | "received";
  size?: "sm" | "md" | "lg";
}

export default function SignalPulse({ variant = "idle", size = "md" }: SignalPulseProps) {
  const sizes = {
    sm: { outer: "w-24 h-24", inner: "w-4 h-4", ring: "w-16 h-16" },
    md: { outer: "w-40 h-40", inner: "w-6 h-6", ring: "w-28 h-28" },
    lg: { outer: "w-56 h-56", inner: "w-8 h-8", ring: "w-40 h-40" },
  };

  const s = sizes[size];

  if (variant === "sending") {
    return (
      <div className="relative flex items-center justify-center" style={{ width: "200px", height: "200px" }}>
        {/* Expanding rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              border: "1px solid rgba(13, 148, 136, 0.3)",
              width: "40px",
              height: "40px",
            }}
            animate={{
              scale: [1, 6],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Core pulse */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "16px",
            height: "16px",
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.8), rgba(13, 148, 136, 0.2))",
            boxShadow: "0 0 30px rgba(13, 148, 136, 0.4)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    );
  }

  if (variant === "returning") {
    return (
      <div className="relative flex items-center justify-center" style={{ width: "200px", height: "200px" }}>
        {/* Converging rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              border: "1px solid rgba(236, 72, 153, 0.3)",
              width: "200px",
              height: "200px",
            }}
            animate={{
              scale: [3, 1],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Warm core */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "20px",
            height: "20px",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.8), rgba(13, 148, 136, 0.4))",
            boxShadow: "0 0 40px rgba(236, 72, 153, 0.3), 0 0 80px rgba(13, 148, 136, 0.2)",
          }}
          animate={{
            scale: [0.8, 1.4, 1],
            opacity: [0.6, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    );
  }

  if (variant === "received") {
    return (
      <div className="relative flex items-center justify-center" style={{ width: "200px", height: "200px" }}>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "60px",
            height: "60px",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3), transparent)",
            boxShadow: "0 0 60px rgba(236, 72, 153, 0.2), 0 0 120px rgba(13, 148, 136, 0.1)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    );
  }

  // Idle
  return (
    <div className={`relative flex items-center justify-center ${s.outer}`}>
      {/* Outer ring */}
      <motion.div
        className={`absolute rounded-full ${s.ring}`}
        style={{ border: "1px solid rgba(13, 148, 136, 0.15)" }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Inner glow */}
      <motion.div
        className={`absolute rounded-full ${s.inner}`}
        style={{
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.6), rgba(13, 148, 136, 0.1))",
          boxShadow: "0 0 20px rgba(13, 148, 136, 0.3)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}
