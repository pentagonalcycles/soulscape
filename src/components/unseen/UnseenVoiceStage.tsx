"use client";

import { motion } from "framer-motion";
import type { MatchWithProfile } from "@/lib/unseen/types";

interface UnseenVoiceStageProps {
  match: MatchWithProfile;
  onContinue: () => void;
}

export default function UnseenVoiceStage({ match, onContinue }: UnseenVoiceStageProps) {
  const myConsent = match.stage_voice_a; // simplified

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(139,92,246,0.5)" }}>
          Stage 2 — The Voice
        </p>
        <h2 className="text-xl sm:text-2xl mb-4" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          Now hear the person behind the words.
        </h2>

        <div className="my-10 p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-4xl mb-4">🎙️</div>
          <p className="text-sm mb-2" style={{ color: "rgba(224,231,255,0.7)" }}>
            Voice introductions are coming soon.
          </p>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
            For now, you can continue to the next stage.
          </p>
        </div>

        {myConsent && (
          <p className="text-xs mb-4" style={{ color: "rgba(139,92,246,0.5)" }}>
            You chose to continue. Waiting for them...
          </p>
        )}

        {!myConsent && (
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl text-sm tracking-wide transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "rgba(224,231,255,0.9)",
            }}
          >
            Continue
          </button>
        )}
      </motion.div>
    </div>
  );
}
