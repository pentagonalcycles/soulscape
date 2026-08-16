"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { value: "improvement", label: "Improvement", icon: "✦", color: "#00ff88" },
  { value: "addition", label: "Addition", icon: "◎", color: "#3b82f6" },
  { value: "change", label: "Change", icon: "◇", color: "#8b5cf6" },
  { value: "bug", label: "Bug", icon: "△", color: "#ef4444" },
  { value: "other", label: "Other", icon: "◈", color: "#6b7280" },
];

interface IdeaCreatorProps {
  onSubmit: (data: { content: string; category: string; isAnonymous: boolean }) => void;
}

export default function IdeaCreator({ onSubmit }: IdeaCreatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("improvement");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit({ content: content.trim(), category, isAnonymous });
    setContent("");
    setCategory("improvement");
    setIsAnonymous(true);
    setExpanded(false);
    setSubmitting(false);
  }

  const selectedCat = categories.find((c) => c.value === category);

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setExpanded(true)}
            className="w-full p-5 rounded-2xl text-left transition-all"
            style={{
              background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.1)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-50">💡</span>
              <span className="text-sm" style={{ color: "var(--text-muted, #64748b)" }}>
                Share an idea for Elovayne...
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="rounded-2xl p-5"
            style={{
              background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.1)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Category selector */}
            <div className="mb-4">
              <div className="text-xs mb-2" style={{ color: "var(--text-dim, #94a3b8)" }}>
                Category
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
                    style={{
                      background: category === cat.value ? `${cat.color}15` : "rgba(0, 255, 136, 0.03)",
                      border: `1px solid ${category === cat.value ? `${cat.color}30` : "rgba(0, 255, 136, 0.08)"}`,
                      color: category === cat.value ? cat.color : "var(--text-dim, #94a3b8)",
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="Describe your idea... What would make Elovayne better?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                background: "var(--input-bg, rgba(0,255,136,0.06))",
                border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))",
                color: "var(--text-primary, #0f172a)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              autoFocus
            />

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                {/* Anonymous toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="relative w-9 h-5 rounded-full cursor-pointer transition-all"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    style={{
                      background: isAnonymous ? "#00ff88" : "rgba(0, 255, 136, 0.15)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        transform: isAnonymous ? "translateX(18px)" : "translateX(2px)",
                      }}
                    />
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                    Anonymous
                  </span>
                </label>

                {/* Character count */}
                <span className="text-[10px]" style={{ color: content.length > 450 ? "#ef4444" : "var(--text-faint, rgba(240,255,245,0.65))" }}>
                  {content.length}/500
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setExpanded(false);
                    setContent("");
                  }}
                  className="px-4 py-2 rounded-lg text-xs"
                  style={{ color: "var(--text-dim, #94a3b8)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="btn btn-primary btn-sm disabled:opacity-40"
                >
                  {submitting ? "Submitting..." : "Submit Idea"}
                </button>
              </div>
            </div>

            <p className="text-[10px] mt-2" style={{ color: "var(--text-faint, rgba(240,255,245,0.6))" }}>
              Ctrl+Enter to submit
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
