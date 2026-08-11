"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SignalPulse from "./SignalPulse";

interface SignalLandingProps {
  onSend: () => void;
  onReceive: () => void;
}

export default function SignalLanding({ onSend, onReceive }: SignalLandingProps) {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mb-10"
      >
        <SignalPulse size="lg" />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl text-center mb-4"
        style={{
          fontWeight: 200,
          letterSpacing: "0.04em",
          background: "linear-gradient(135deg, #0d9488, #06b6d4, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        The Human Signal
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-center max-w-md mb-12 leading-relaxed"
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
        className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onSend}
          className="flex-1 py-4 px-6 rounded-2xl text-sm tracking-wide transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(6, 182, 212, 0.1))",
            border: "1px solid rgba(13, 148, 136, 0.2)",
            color: "rgba(224, 231, 255, 0.9)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(13, 148, 136, 0.25), rgba(6, 182, 212, 0.15))";
            e.currentTarget.style.boxShadow = "0 4px 30px rgba(13, 148, 136, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(6, 182, 212, 0.1))";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span className="text-lg mr-2">📡</span>
          Send a Signal
        </button>

        <button
          onClick={onReceive}
          className="flex-1 py-4 px-6 rounded-2xl text-sm tracking-wide transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "rgba(224, 231, 255, 0.9)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.12))";
            e.currentTarget.style.boxShadow = "0 4px 30px rgba(99, 102, 241, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span className="text-lg mr-2">🫀</span>
          Receive a Signal
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {heardToday > 0 ? (
          <p className="text-xs" style={{ color: "rgba(148, 163, 184, 0.4)" }}>
            <span style={{ color: "rgba(13, 148, 136, 0.6)" }}>{heardToday}</span> signal{heardToday !== 1 ? "s" : ""} heard today
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
    </div>
  );
}
