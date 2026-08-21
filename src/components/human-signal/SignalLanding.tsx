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
          className="w-full py-4 px-6 rounded-2xl text-sm tracking-wide transition-all"
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
      `}</style>
    </div>
  );
}
