"use client";

import { motion } from "framer-motion";
import type { CompatibilityScore } from "@/lib/unseen/types";

interface UnseenCompatibilityProps {
  score: CompatibilityScore;
}

export default function UnseenCompatibility({ score }: UnseenCompatibilityProps) {
  const metrics = [
    { label: "Emotional", value: score.emotional, color: "#8b5cf6" },
    { label: "Communication", value: score.communication, color: "#6366f1" },
    { label: "Lifestyle", value: score.lifestyle, color: "#ec4899" },
    { label: "Interests", value: score.interests, color: "#a78bfa" },
  ];

  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
      <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(139,92,246,0.5)" }}>
        Why {score.overall}%?
      </p>
      <div className="space-y-2.5">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: "rgba(224,231,255,0.6)" }}>{metric.label}</span>
              <span className="text-[11px] font-light" style={{ color: metric.color }}>{metric.value}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: metric.color }}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: i * 0.05 + 0.2, duration: 0.6 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] mt-3 leading-relaxed" style={{ color: "rgba(148,163,184,0.3)" }}>
        Compatibility is calculated from your profile answers, interests, and preferences. It suggests potential — not certainty.
      </p>
    </div>
  );
}
