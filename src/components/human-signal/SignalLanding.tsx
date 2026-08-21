"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SignalPulse from "./SignalPulse";

interface SignalLandingProps {
  onSend: () => void;
}

export default function SignalLanding({ onSend }: SignalLandingProps) {
  const [heardToday, setHeardToday] = useState(0);
  const [travellingNow, setTravellingNow] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const client = supabase();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: heard } = await client
        .from("human_signals")
        .select("id", { count: "exact", head: true })
        .eq("status", "heard")
        .gte("heard_at", today.toISOString());

      const { count: waiting } = await client
        .from("human_signals")
        .select("id", { count: "exact", head: true })
        .eq("status", "waiting")
        .gt("expires_at", new Date().toISOString());

      setHeardToday(heard || 0);
      setTravellingNow(waiting || 0);
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Magical floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large ambient orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            top: "-15%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            bottom: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            top: "40%",
            left: "60%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
            filter: "blur(45px)",
          }}
          animate={{
            x: [0, 25, -15, 0],
            y: [0, -20, 25, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating sparkles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${5 + (i * 4.7) % 90}%`,
              top: `${10 + (i * 7.3) % 80}%`,
              background: i % 3 === 0 ? "rgba(0, 255, 136, 0.8)" : i % 3 === 1 ? "rgba(168, 85, 247, 0.7)" : "rgba(236, 72, 153, 0.6)",
              boxShadow: i % 3 === 0 ? "0 0 6px rgba(0, 255, 136, 0.5)" : i % 3 === 1 ? "0 0 6px rgba(168, 85, 247, 0.4)" : "0 0 6px rgba(236, 72, 153, 0.3)",
            }}
            animate={{
              y: [0, -30, 10, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), (i % 2 === 0 ? -10 : 10), 0],
              opacity: [0, 0.8, 0.4, 0],
              scale: [0.5, 1.2, 0.8, 0.5],
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
          {[
            { x1: "20%", y1: "30%", x2: "40%", y2: "20%" },
            { x1: "40%", y1: "20%", x2: "60%", y2: "35%" },
            { x1: "60%", y1: "35%", x2: "75%", y2: "25%" },
            { x1: "30%", y1: "60%", x2: "50%", y2: "70%" },
            { x1: "50%", y1: "70%", x2: "70%", y2: "65%" },
            { x1: "15%", y1: "50%", x2: "35%", y2: "45%" },
            { x1: "65%", y1: "55%", x2: "85%", y2: "50%" },
          ].map((line, i) => (
            <motion.line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(0, 255, 136, 0.3)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            />
          ))}
        </svg>
      </div>

      {/* Pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mb-10 relative z-10"
      >
        <SignalPulse size="lg" />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl text-center mb-4 relative z-10"
        style={{
          fontWeight: 200,
          letterSpacing: "0.04em",
          background: "linear-gradient(135deg, #00ff88, #6366f1, #ec4899, #00ff88)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "humanSignalTitleShift 8s ease-in-out infinite",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        The Human Signal
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-center max-w-md mb-12 leading-relaxed relative z-10"
        style={{ color: "rgba(148, 163, 184, 0.7)", fontWeight: 300, fontSize: "15px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Sometimes you don&apos;t need a conversation.
        <br />
        You just need someone to know you&apos;re there.
      </motion.p>

      {/* Actions */}
      <motion.div
        className="w-full max-w-sm mb-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onSend}
          className="w-full py-4 px-6 rounded-2xl text-sm tracking-wide transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.08))",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            color: "rgba(224, 231, 255, 0.9)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 255, 136, 0.25), rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.12))";
            e.currentTarget.style.boxShadow = "0 4px 30px rgba(0, 255, 136, 0.15), 0 0 60px rgba(99, 102, 241, 0.08)";
            e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.08))";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.2)";
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
          <span className="text-lg mr-2">📡</span>
          Send a Signal
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {heardToday > 0 ? (
          <p className="text-xs" style={{ color: "rgba(148, 163, 184, 0.4)" }}>
            <span style={{ color: "rgba(0, 255, 136, 0.6)" }}>{heardToday}</span> signal{heardToday !== 1 ? "s" : ""} heard today
          </p>
        ) : (
          <p className="text-xs" style={{ color: "rgba(148, 163, 184, 0.3)" }}>
            Be the first to send a signal today
          </p>
        )}
        {travellingNow > 0 && (
          <p className="text-[10px] mt-1" style={{ color: "rgba(148, 163, 184, 0.25)" }}>
            {travellingNow} signal{travellingNow !== 1 ? "s" : ""} travelling right now
          </p>
        )}
      </motion.div>

      <style>{`
        @keyframes humanSignalTitleShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
