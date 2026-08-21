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
      <div className="relative flex items-center justify-center w-[min(200px,60vw)] aspect-square">
        {/* Expanding rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              border: `1px solid ${i === 0 ? "rgba(0, 255, 136, 0.4)" : i === 1 ? "rgba(99, 102, 241, 0.3)" : "rgba(236, 72, 153, 0.3)"}`,
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
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.9), rgba(99, 102, 241, 0.4))",
            boxShadow: "0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(99, 102, 241, 0.2)",
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
      <div className="relative flex items-center justify-center w-[min(200px,60vw)] aspect-square">
        {/* Converging rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full w-full h-full"
            style={{
              border: `1px solid ${i === 0 ? "rgba(236, 72, 153, 0.4)" : i === 1 ? "rgba(99, 102, 241, 0.3)" : "rgba(0, 255, 136, 0.3)"}`,
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
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.9), rgba(99, 102, 241, 0.5), rgba(0, 255, 136, 0.3))",
            boxShadow: "0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(99, 102, 241, 0.2), 0 0 120px rgba(0, 255, 136, 0.1)",
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
      <div className="relative flex items-center justify-center w-[min(200px,60vw)] aspect-square">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "60px",
            height: "60px",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(99, 102, 241, 0.2), transparent)",
            boxShadow: "0 0 60px rgba(236, 72, 153, 0.3), 0 0 120px rgba(99, 102, 241, 0.15), 0 0 180px rgba(0, 255, 136, 0.08)",
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
        style={{ border: "1px solid rgba(0, 255, 136, 0.15)" }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Middle ring */}
      <motion.div
        className={`absolute rounded-full`}
        style={{
          width: "70%",
          height: "70%",
          border: "1px solid rgba(99, 102, 241, 0.1)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Inner glow */}
      <motion.div
        className={`absolute rounded-full ${s.inner}`}
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.7), rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.1))",
          boxShadow: "0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(99, 102, 241, 0.15)",
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
