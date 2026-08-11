"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface UnseenOnboardingProps {
  onConfirm: () => void;
  onBack: () => void;
}

export default function UnseenOnboarding({ onConfirm, onBack }: UnseenOnboardingProps) {
  const [confirmed18, setConfirmed18] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const rules = [
    "Be respectful. Every profile is a real person.",
    "No harassment, hate speech, or inappropriate content.",
    "No screenshots or sharing private conversations.",
    "Report anyone who makes you feel unsafe.",
    "Consent matters. Both people must choose to continue at every stage.",
    "This is for adults aged 18 and older only.",
  ];

  const canContinue = confirmed18 && acceptedRules;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-8 text-xs tracking-wide transition-colors"
          style={{ color: "rgba(148, 163, 184, 0.5)" }}
        >
          ← Back
        </button>

        <h2
          className="text-2xl sm:text-3xl mb-8"
          style={{ fontWeight: 200, color: "rgba(224, 231, 255, 0.9)", letterSpacing: "0.02em" }}
        >
          Before you begin
        </h2>

        {/* Age confirmation */}
        <motion.div
          className="mb-6 p-5 rounded-2xl cursor-pointer transition-all"
          style={{
            background: confirmed18 ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${confirmed18 ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
          }}
          onClick={() => setConfirmed18(!confirmed18)}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: confirmed18 ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${confirmed18 ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
              }}
            >
              {confirmed18 && <span className="text-xs" style={{ color: "rgba(224, 231, 255, 0.9)" }}>✓</span>}
            </div>
            <span className="text-sm" style={{ color: "rgba(224, 231, 255, 0.8)" }}>
              I confirm I am 18 years of age or older.
            </span>
          </div>
        </motion.div>

        {/* Safety rules */}
        <motion.div
          className="mb-6 p-5 rounded-2xl cursor-pointer transition-all"
          style={{
            background: acceptedRules ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${acceptedRules ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
          }}
          onClick={() => setAcceptedRules(!acceptedRules)}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: acceptedRules ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${acceptedRules ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
              }}
            >
              {acceptedRules && <span className="text-xs" style={{ color: "rgba(224, 231, 255, 0.9)" }}>✓</span>}
            </div>
            <span className="text-sm" style={{ color: "rgba(224, 231, 255, 0.8)" }}>
              I agree to the community rules and safety guidelines.
            </span>
          </div>

          <div className="space-y-2 pl-8">
            {rules.map((rule, i) => (
              <p key={i} className="text-xs leading-relaxed" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
                {i + 1}. {rule}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Continue */}
        <motion.button
          onClick={onConfirm}
          disabled={!canContinue}
          className="w-full py-4 rounded-2xl text-sm tracking-widest uppercase transition-all"
          style={{
            background: canContinue
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.15))"
              : "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${canContinue ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
            color: canContinue ? "rgba(224, 231, 255, 0.9)" : "rgba(148, 163, 184, 0.3)",
            letterSpacing: "0.15em",
            opacity: canContinue ? 1 : 0.5,
          }}
          whileHover={canContinue ? { scale: 1.01 } : {}}
          whileTap={canContinue ? { scale: 0.99 } : {}}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
