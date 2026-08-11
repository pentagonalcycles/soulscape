"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import SoulEchoLanding from "./SoulEchoLanding";
import SoulEchoReflection from "./SoulEchoReflection";
import SoulEchoMatching from "./SoulEchoMatching";
import SoulEchoMatchReveal from "./SoulEchoMatchReveal";
import SoulEchoResponse from "./SoulEchoResponse";
import SoulEchoConnection from "./SoulEchoConnection";
import SoulEchoEmpty from "./SoulEchoEmpty";
import type { SoulEchoStage, Match, Reflection, ResponseOption } from "./types";

export default function SoulEcho() {
  const { userId } = useAuth();
  const [stage, setStage] = useState<SoulEchoStage>("landing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchedReflection, setMatchedReflection] = useState<Reflection | null>(null);
  const [dailyRemaining, setDailyRemaining] = useState(5);

  // Check for existing active matches on mount
  useEffect(() => {
    if (!userId) return;

    const checkHistory = async () => {
      try {
        const res = await fetch("/api/soul-echo/history");
        const data = await res.json();

        if (data.matches?.length > 0) {
          const activeMatch = data.matches.find((m: Match) => m.status === "active");
          if (activeMatch) {
            setCurrentMatch(activeMatch);
            setStage("connection");
          }
        }

        if (data.dailyRemaining !== undefined) {
          setDailyRemaining(data.dailyRemaining);
        }
      } catch {
        // Silent fail - user can still start fresh
      }
    };

    checkHistory();
  }, [userId]);

  const handleBegin = useCallback(() => {
    setStage("reflection");
  }, []);

  const handleSubmitReflection = useCallback(async (content: string) => {
    setIsSubmitting(true);
    setStage("matching");

    try {
      const res = await fetch("/api/soul-echo/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setStage("empty");
        } else {
          setStage("reflection");
        }
        return;
      }

      setDailyRemaining(data.dailyRemaining);

      if (data.matched && data.match && data.matchedReflection) {
        setCurrentMatch(data.match);
        setMatchedReflection(data.matchedReflection);

        // Brief pause before reveal
        setTimeout(() => {
          setStage("match-reveal");
        }, 2000);
      } else {
        // No match found
        setTimeout(() => {
          setStage("empty");
        }, 2500);
      }
    } catch {
      setStage("reflection");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handleContinueToResponse = useCallback(() => {
    setStage("response");
  }, []);

  const handleSendResponse = useCallback(async (type: ResponseOption["type"], content: string) => {
    if (!currentMatch) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/soul-echo/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: currentMatch.id,
          content,
          messageType: type,
        }),
      });

      setStage("connection");
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  }, [currentMatch]);

  const handleLeaveConnection = useCallback(() => {
    setCurrentMatch(null);
    setMatchedReflection(null);
    setStage("landing");
  }, []);

  const handleNewReflection = useCallback(() => {
    setMatchedReflection(null);
    setStage("reflection");
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(13, 148, 136, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(96, 165, 250, 0.03) 0%, transparent 50%)",
          zIndex: 1,
        }}
      />

      {/* Floating organic shapes - ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.03) 0%, transparent 60%)",
            filter: "blur(80px)",
            top: "-10%",
            right: "-10%",
            animation: "float-slow 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(96, 165, 250, 0.025) 0%, transparent 60%)",
            filter: "blur(70px)",
            bottom: "-5%",
            left: "-5%",
            animation: "float-slow 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <SoulEchoLanding key="landing" onBegin={handleBegin} />
          )}
          {stage === "reflection" && (
            <SoulEchoReflection
              key="reflection"
              onSubmit={handleSubmitReflection}
              isSubmitting={isSubmitting}
            />
          )}
          {stage === "matching" && (
            <SoulEchoMatching key="matching" />
          )}
          {stage === "match-reveal" && matchedReflection && (
            <SoulEchoMatchReveal
              key="match-reveal"
              matchedReflection={matchedReflection}
              onContinue={handleContinueToResponse}
            />
          )}
          {stage === "response" && matchedReflection && (
            <SoulEchoResponse
              key="response"
              matchedReflection={matchedReflection}
              onSelect={handleSendResponse}
              isSubmitting={isSubmitting}
            />
          )}
          {stage === "connection" && currentMatch && userId && (
            <SoulEchoConnection
              key="connection"
              match={currentMatch}
              userId={userId}
              onLeave={handleLeaveConnection}
            />
          )}
          {stage === "empty" && (
            <SoulEchoEmpty key="empty" onNewReflection={handleNewReflection} />
          )}
        </AnimatePresence>
      </div>

      {/* Daily limit indicator */}
      {stage !== "landing" && stage !== "connection" && (
        <div
          className="fixed bottom-6 right-6 px-3 py-1.5 rounded-lg text-xs z-20"
          style={{
            background: "rgba(13, 148, 136, 0.06)",
            border: "1px solid rgba(13, 148, 136, 0.1)",
            color: "rgba(148, 163, 184, 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          {dailyRemaining} reflection{dailyRemaining !== 1 ? "s" : ""} remaining today
        </div>
      )}

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.02); }
          66% { transform: translate(-10px, 10px) scale(0.98); }
        }
      `}</style>
    </div>
  );
}
