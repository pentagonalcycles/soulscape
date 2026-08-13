"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import {
  HumanSignal as HumanSignalType,
  DAILY_SIGNAL_LIMIT,
  RATE_LIMIT_COOLDOWN_MS,
} from "./types";
import SignalBackground from "./SignalBackground";
import SignalLanding from "./SignalLanding";
import SignalSender from "./SignalSender";
import SignalWaiting from "./SignalWaiting";
import SignalReached from "./SignalReached";
import SignalReceiver from "./SignalReceiver";

type View = "landing" | "sender" | "waiting" | "reached" | "receiver";
type BgMood = "default" | "sending" | "waiting" | "heard" | "receiving";

export default function HumanSignal() {
  const { userId } = useAuth();
  const [view, setView] = useState<View>("landing");
  const [bgMood, setBgMood] = useState<BgMood>("default");
  const [currentSignal, setCurrentSignal] = useState<HumanSignalType | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [dailyRemaining, setDailyRemaining] = useState(DAILY_SIGNAL_LIMIT);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Check rate limits on mount
  useEffect(() => {
    checkRateLimits();
  }, [userId]);

  // Subscribe to signal updates when waiting
  useEffect(() => {
    if (view !== "waiting" || !currentSignal) return;

    const client = supabase();
    const channel = client
      .channel(`signal-${currentSignal.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "human_signals",
          filter: `id=eq.${currentSignal.id}`,
        },
        (payload) => {
          const updated = payload.new as HumanSignalType;
          if (updated.status === "heard") {
            setCurrentSignal(updated);
            setView("reached");
            setBgMood("heard");
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [view, currentSignal]);

  async function checkRateLimits() {
    const client = supabase();
    const uid = userId || localStorage.getItem("elovayne-visitor-id");
    if (!uid) return;

    // Check cooldown
    const { data: rateLimit } = await client
      .from("signal_rate_limits")
      .select("last_signal_at, signals_today, today_date")
      .eq("user_id", uid)
      .maybeSingle();

    if (rateLimit) {
      const lastSignal = new Date(rateLimit.last_signal_at).getTime();
      const elapsed = Date.now() - lastSignal;
      if (elapsed < RATE_LIMIT_COOLDOWN_MS) {
        setCooldownRemaining(RATE_LIMIT_COOLDOWN_MS - elapsed);
        startCooldownTimer(RATE_LIMIT_COOLDOWN_MS - elapsed);
      }

      // Check daily limit
      const today = new Date().toISOString().split("T")[0];
      if (rateLimit.today_date === today) {
        setDailyRemaining(Math.max(0, DAILY_SIGNAL_LIMIT - rateLimit.signals_today));
      } else {
        setDailyRemaining(DAILY_SIGNAL_LIMIT);
      }
    }
  }

  function startCooldownTimer(initialMs: number) {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    let remaining = initialMs;
    cooldownRef.current = setInterval(() => {
      remaining -= 1000;
      if (remaining <= 0) {
        setCooldownRemaining(0);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
  }

  async function handleSendSignal(signalType: string) {
    const client = supabase();
    const uid = userId || localStorage.getItem("elovayne-visitor-id");
    console.log("[Signal] Sending signal:", { signalType, userId, uid });
    if (!uid) {
      console.error("[Signal] No uid available");
      return;
    }

    // Insert signal
    const { data: signal, error } = await client
      .from("human_signals")
      .insert({
        sender_id: uid,
        signal_type: signalType,
      })
      .select()
      .single();

    console.log("[Signal] Insert result:", { signal, error });
    if (error || !signal) {
      console.error("[Signal] Insert failed:", error);
      return;
    }

    // Update rate limit
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await client
      .from("signal_rate_limits")
      .select("signals_today, today_date")
      .eq("user_id", uid)
      .maybeSingle();

    if (existing) {
      const isNewDay = existing.today_date !== today;
      await client
        .from("signal_rate_limits")
        .update({
          last_signal_at: new Date().toISOString(),
          signals_today: isNewDay ? 1 : existing.signals_today + 1,
          today_date: today,
        })
        .eq("user_id", uid);
      setDailyRemaining(isNewDay ? DAILY_SIGNAL_LIMIT - 1 : Math.max(0, DAILY_SIGNAL_LIMIT - existing.signals_today - 1));
    } else {
      await client.from("signal_rate_limits").insert({
        user_id: uid,
        last_signal_at: new Date().toISOString(),
        signals_today: 1,
        today_date: today,
      });
      setDailyRemaining(DAILY_SIGNAL_LIMIT - 1);
    }

    // Start cooldown
    setCooldownRemaining(RATE_LIMIT_COOLDOWN_MS);
    startCooldownTimer(RATE_LIMIT_COOLDOWN_MS);

    // Transition to waiting
    setCurrentSignal(signal as HumanSignalType);
    setView("waiting");
    setBgMood("waiting");
  }

  function handleCancel() {
    setCurrentSignal(null);
    setView("landing");
    setBgMood("default");
  }

  function handleReturn() {
    setCurrentSignal(null);
    setView("landing");
    setBgMood("default");
  }

  return (
    <>
      <SignalBackground mood={bgMood} />

      <div className="relative z-10">
        {view === "landing" && (
          <SignalLanding
            onSend={() => { setView("sender"); setBgMood("sending"); }}
            onReceive={() => { setView("receiver"); setBgMood("receiving"); }}
          />
        )}

        {view === "sender" && (
          <SignalSender
            onSelect={handleSendSignal}
            onBack={() => { setView("landing"); setBgMood("default"); }}
            cooldownRemaining={cooldownRemaining}
            dailyRemaining={dailyRemaining}
          />
        )}

        {view === "waiting" && currentSignal && (
          <SignalWaiting
            signalType={currentSignal.signal_type}
            onCancel={handleCancel}
          />
        )}

        {view === "reached" && (
          <SignalReached onReturn={handleReturn} />
        )}

        {view === "receiver" && (
          <SignalReceiver
            onBack={() => { setView("landing"); setBgMood("default"); }}
          />
        )}
      </div>
    </>
  );
}
