"use client";

import { motion } from "framer-motion";
import type { MatchWithProfile } from "@/lib/unseen/types";
import { INTENTION_LABELS } from "@/lib/unseen/constants";

interface UnseenMindStageProps {
  match: MatchWithProfile;
  onContinue: () => void;
}

export default function UnseenMindStage({ match, onContinue }: UnseenMindStageProps) {
  const other = match.other_profile;
  const myConsent = match.user_a_id === match.user_a_id ? match.stage_mind_a : match.stage_mind_b;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-widest mb-2 text-center" style={{ color: "rgba(139,92,246,0.5)" }}>
          Stage 1 — The Mind
        </p>
        <h2 className="text-xl sm:text-2xl mb-8 text-center" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          Discover who they are
        </h2>

        {/* Profile info */}
        <div className="mb-6 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-lg mb-1" style={{ fontWeight: 300, color: "rgba(224,231,255,0.9)" }}>
            {other.display_name}, {other.age}
          </h3>
          {other.broad_location && (
            <p className="text-xs mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>{other.broad_location}</p>
          )}
          <span className="text-[11px] px-3 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.1)", color: "rgba(139,92,246,0.7)", border: "1px solid rgba(139,92,246,0.15)" }}>
            {INTENTION_LABELS[other.dating_intention] || other.dating_intention}
          </span>
        </div>

        {/* Interests */}
        {match.other_interests.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.4)" }}>Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {match.other_interests.map(interest => (
                <span key={interest} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personality answers */}
        {match.other_answers.length > 0 && (
          <div className="space-y-3 mb-8">
            {match.other_answers.map(answer => (
              <div key={answer.id} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] mb-1.5" style={{ color: "rgba(139,92,246,0.5)" }}>{answer.question_text}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.7)" }}>{answer.answer_text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Bio */}
        {other.bio && (
          <div className="mb-8 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] mb-1.5" style={{ color: "rgba(148,163,184,0.4)" }}>About them</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.7)" }}>{other.bio}</p>
          </div>
        )}

        {/* Consent status */}
        {myConsent && (
          <p className="text-xs text-center mb-4" style={{ color: "rgba(139,92,246,0.5)" }}>
            You chose to continue. Waiting for them...
          </p>
        )}

        {/* Continue button */}
        {!myConsent && (
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl text-sm tracking-wide transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "rgba(224,231,255,0.9)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.2)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            Continue
          </button>
        )}
      </motion.div>
    </div>
  );
}
