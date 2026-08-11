"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HumanSignal, SIGNAL_MESSAGES, isSignalExpired, getSignalType } from "./types";
import SignalPulse from "./SignalPulse";

interface SignalReceiverProps {
  onBack: () => void;
}

type ReceiverState = "loading" | "found" | "empty" | "acknowledging" | "acknowledged" | "error";

export default function SignalReceiver({ onBack }: SignalReceiverProps) {
  const [state, setState] = useState<ReceiverState>("loading");
  const [signal, setSignal] = useState<HumanSignal | null>(null);

  useEffect(() => {
    findSignal();
  }, []);

  async function findSignal() {
    setState("loading");
    const client = supabase();
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      setState("error");
      return;
    }

    // Find waiting signals not from this user, not expired
    const { data: signals } = await client
      .from("human_signals")
      .select("*")
      .eq("status", "waiting")
      .neq("sender_id", session.user.id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(10);

    if (!signals || signals.length === 0) {
      setState("empty");
      return;
    }

    // Try to claim one atomically
    for (const s of signals) {
      if (isSignalExpired(s)) continue;

      const { data: claimed } = await client.rpc("claim_signal", {
        signal_uuid: s.id,
        receiver_uuid: session.user.id,
      });

      if (claimed) {
        setSignal(s as HumanSignal);
        setState("found");
        return;
      }
    }

    setState("empty");
  }

  async function acknowledgeSignal() {
    if (!signal) return;
    setState("acknowledging");

    const client = supabase();
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      setState("error");
      return;
    }

    // Insert acknowledgement
    await client.from("signal_acknowledgements").insert({
      signal_id: signal.id,
      receiver_id: session.user.id,
    });

    // Mark signal as heard
    await client.rpc("hear_signal", { signal_uuid: signal.id });

    setState("acknowledged");
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-4xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌊
          </motion.div>
          <p className="text-sm" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
            Listening for signals…
          </p>
        </motion.div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-6">🌬️</div>
          <h2
            className="text-xl sm:text-2xl mb-3"
            style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)" }}
          >
            The air is quiet right now.
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
            There are no unanswered signals waiting for you.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={findSignal}
              className="px-8 py-3 rounded-2xl text-sm tracking-wide transition-all"
              style={{
                background: "rgba(13, 148, 136, 0.1)",
                border: "1px solid rgba(13, 148, 136, 0.2)",
                color: "rgba(224, 231, 255, 0.8)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(13, 148, 136, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(13, 148, 136, 0.1)";
              }}
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="text-xs tracking-wide transition-colors"
              style={{ color: "rgba(148, 163, 184, 0.4)" }}
            >
              ← Return
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm mb-6" style={{ color: "rgba(239, 68, 68, 0.7)" }}>
            Something went wrong. Please try again.
          </p>
          <button
            onClick={onBack}
            className="text-xs tracking-wide"
            style={{ color: "rgba(148, 163, 184, 0.5)" }}
          >
            ← Return
          </button>
        </motion.div>
      </div>
    );
  }

  if (state === "acknowledged") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-5xl mb-6"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            🫀
          </motion.div>
          <h2
            className="text-xl mb-3"
            style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)" }}
          >
            You heard them.
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
            Somewhere, someone knows they weren&apos;t invisible.
          </p>

          <button
            onClick={onBack}
            className="px-8 py-3 rounded-2xl text-sm tracking-wide transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(224, 231, 255, 0.7)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            }}
          >
            Return to Elovayne
          </button>
        </motion.div>
      </div>
    );
  }

  // Found signal
  if (!signal) return null;
  const signalType = getSignalType(signal.signal_type);
  const message = SIGNAL_MESSAGES[signal.signal_type];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-10 text-xs tracking-wide transition-colors"
          style={{ color: "rgba(148, 163, 184, 0.4)" }}
        >
          ← Return
        </button>

        {/* Reveal */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "rgba(13, 148, 136, 0.5)" }}>
            A human signal has reached you.
          </p>

          <motion.div
            className="text-5xl mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {signalType.emoji}
          </motion.div>

          <motion.p
            className="text-base leading-relaxed"
            style={{ color: "rgba(224, 231, 255, 0.8)", fontWeight: 300 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Acknowledge */}
        <AnimatePresence>
          {state === "found" && (
            <motion.button
              onClick={acknowledgeSignal}
              className="px-10 py-4 rounded-2xl text-sm tracking-wide transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(13, 148, 136, 0.1))",
                border: "1px solid rgba(236, 72, 153, 0.25)",
                color: "rgba(224, 231, 255, 0.9)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.02, boxShadow: "0 4px 30px rgba(236, 72, 153, 0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              🫀 I Hear You
            </motion.button>
          )}
        </AnimatePresence>

        {state === "acknowledging" && (
          <motion.p
            className="text-sm"
            style={{ color: "rgba(148, 163, 184, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Sending your response…
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
