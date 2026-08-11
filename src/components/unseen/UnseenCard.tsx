"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DiscoveryProfile } from "@/lib/unseen/types";
import { INTENTION_LABELS, GENDER_LABELS } from "@/lib/unseen/constants";
import UnseenCompatibility from "./UnseenCompatibility";

interface UnseenCardProps {
  profile: DiscoveryProfile;
  onInterested: () => void;
  onPass: () => void;
}

export default function UnseenCard({ profile, onInterested, onPass }: UnseenCardProps) {
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const p = profile.profile;

  return (
    <motion.div
      className="w-full max-w-md mx-auto rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(20px)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Blurred photo area */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {profile.primary_photo_url ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${profile.primary_photo_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) saturate(0.5)",
              transform: "scale(1.2)",
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))" }} />
        )}

        {/* Silhouette overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(10,8,18,0.9) 100%)" }} />

        {/* Compatibility badge */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowCompatibility(!showCompatibility)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "rgba(224, 231, 255, 0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="font-light text-lg">{profile.compatibility.overall}</span>
            <span className="text-[10px] ml-1 opacity-60">%</span>
          </button>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl sm:text-3xl font-light" style={{ color: "rgba(224,231,255,0.95)" }}>
            {p.display_name}, {p.age}
          </h3>
          {p.broad_location && (
            <p className="text-sm mt-1" style={{ color: "rgba(224,231,255,0.5)" }}>
              {p.broad_location}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        {/* Intention */}
        <div className="mb-4">
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.1)", color: "rgba(139,92,246,0.7)", border: "1px solid rgba(139,92,246,0.15)" }}>
            {INTENTION_LABELS[p.dating_intention] || p.dating_intention}
          </span>
        </div>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.4)" }}>Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 8).map(interest => (
                <span key={interest} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personality answers toggle */}
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="w-full text-left text-xs mb-4 transition-colors"
          style={{ color: "rgba(139,92,246,0.6)" }}
        >
          {showAnswers ? "Hide answers" : "Read their personality answers"} ↓
        </button>

        <AnimatePresence>
          {showAnswers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 mb-4 overflow-hidden"
            >
              {profile.answers.map(answer => (
                <div key={answer.id} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] mb-1" style={{ color: "rgba(139,92,246,0.5)" }}>{answer.question_text}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(224,231,255,0.7)" }}>{answer.answer_text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compatibility breakdown */}
        <AnimatePresence>
          {showCompatibility && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <UnseenCompatibility score={profile.compatibility} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPass}
            className="flex-1 py-3.5 rounded-xl text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(148,163,184,0.5)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(148,163,184,0.7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.color = "rgba(148,163,184,0.5)";
            }}
          >
            Pass
          </button>
          <button
            onClick={onInterested}
            className="flex-1 py-3.5 rounded-xl text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "rgba(224,231,255,0.9)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            I Want to Know More
          </button>
        </div>
      </div>
    </motion.div>
  );
}
