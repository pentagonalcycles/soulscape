"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useIsPlus } from "@/lib/premium";

const moods = [
  { emoji: "🌙", label: "Lost" },
  { emoji: "🕯", label: "Heavy" },
  { emoji: "✨", label: "Hopeful" },
  { emoji: "🌿", label: "Healing" },
  { emoji: "☁️", label: "Restless" },
  { emoji: "💫", label: "Grateful" },
];

const plusMoods = [
  { emoji: "🦋", label: "Transforming" },
  { emoji: "🌊", label: "Flowing" },
  { emoji: "🔮", label: "Mystical" },
  { emoji: "🌸", label: "Blooming" },
];

interface SanctuaryComposerProps {
  onSubmit: (whisper: {
    content: string;
    mood: string | null;
    isAnonymous: boolean;
    hasContentWarning: boolean;
  }) => void;
  externalExpand?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const MAX_CHARS = 2000;

const moodGlowColors: Record<string, string> = {
  "🌙": "0 0 14px rgba(100, 140, 230, 0.4)",      // Lost — blue
  "🕯": "0 0 14px rgba(120, 60, 180, 0.45)",       // Heavy — deep purple
  "✨": "0 0 14px rgba(16, 185, 129, 0.45)",       // Hopeful — gold
  "🌿": "0 0 14px rgba(50, 200, 160, 0.4)",        // Healing — green/teal
  "☁️": "0 0 14px rgba(160, 140, 210, 0.35)",      // Drifting — soft violet
  "💫": "0 0 14px rgba(6, 182, 212, 0.4)",       // Grateful — warm pink
  "🦋": "0 0 14px rgba(147, 130, 220, 0.5)",       // Transforming — purple
  "🌊": "0 0 14px rgba(80, 180, 220, 0.45)",       // Flowing — ocean blue
  "🔮": "0 0 14px rgba(180, 100, 255, 0.5)",       // Mystical — deep violet
  "🌸": "0 0 14px rgba(255, 180, 200, 0.45)",      // Blooming — cherry blossom
};

export default function SanctuaryComposer({ onSubmit, externalExpand, onExpandChange }: SanctuaryComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPlus = useIsPlus();

  const allMoods = isPlus ? [...moods, ...plusMoods] : moods;

  // Handle external expand trigger
  useEffect(() => {
    if (externalExpand && !isExpanded) {
      setIsExpanded(true);
    }
  }, [externalExpand]);

  // Notify parent of expand state changes
  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSubmit = async () => {
    if (!content.trim() || isOverLimit || isSubmitting) return;
    setIsSubmitting(true);
    setShowRipple(true);

    await new Promise((r) => setTimeout(r, 600));

    onSubmit({
      content: content.trim(),
      mood,
      isAnonymous,
      hasContentWarning,
    });

    setContent("");
    setMood(null);
    setIsAnonymous(true);
    setHasContentWarning(false);
    setIsSubmitting(false);
    setIsExpanded(false);
    setTimeout(() => setShowRipple(false), 1200);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setContent("");
    setMood(null);
    setIsAnonymous(true);
    setHasContentWarning(false);
  };

  return (
    <div className="relative">
      {!isExpanded ? (
        <motion.button
          key="trigger"
          onClick={() => setIsExpanded(true)}
          className="w-full text-left rounded-2xl px-6 py-5 transition-all duration-500 cursor-pointer sanctuary-glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            boxShadow: "0 0 30px rgba(13, 148, 136, 0.2)",
          }}
          aria-label="Open post composer"
        >
          <div className="flex items-center gap-4">
            <span className="text-elovayne-violet text-lg">✦</span>
            <span className="text-elovayne-muted font-body text-sm">
              Share something with the Sanctuary
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="composer"
          className="rounded-2xl sanctuary-glass-card overflow-visible"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-elovayne-violet">✦</span>
                  <h3 className="font-heading text-base sm:text-lg text-elovayne-light">
                    Share with the Sanctuary
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-elovayne-dim hover:text-elovayne-muted transition-colors text-sm font-body"
                  aria-label="Close composer"
                >
                  Cancel
                </button>
              </div>

              {/* Textarea */}
              <div className="relative mb-3 sm:mb-4">
                <motion.textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={() => setIsTextareaFocused(false)}
                  placeholder="What is resting on your heart?"
                  rows={4}
                  className="w-full bg-elovayne-void/40 border border-elovayne-violet/15 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-elovayne-light placeholder-elovayne-dim/70 resize-none focus:outline-none transition-colors font-body text-xs sm:text-sm leading-relaxed"
                  style={isTextareaFocused ? {
                    borderColor: "rgba(13, 148, 136, 0.35)",
                    boxShadow: "0 0 15px rgba(13, 148, 136, 0.08), inset 0 0 15px rgba(13, 148, 136, 0.03)",
                  } : undefined}
                  animate={isTextareaFocused ? {
                    boxShadow: [
                      "0 0 15px rgba(13, 148, 136, 0.08), inset 0 0 15px rgba(13, 148, 136, 0.03)",
                      "0 0 25px rgba(13, 148, 136, 0.14), inset 0 0 25px rgba(13, 148, 136, 0.05)",
                      "0 0 15px rgba(13, 148, 136, 0.08), inset 0 0 15px rgba(13, 148, 136, 0.03)",
                    ],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  aria-label="Post content"
                  aria-describedby="char-count privacy-reminder"
                />
                <div
                  id="char-count"
                  className={`absolute bottom-3 right-3 text-xs font-body ${
                    isOverLimit
                      ? "text-elovayne-cosmic-pink"
                      : charCount > MAX_CHARS * 0.9
                        ? "text-elovayne-gold"
                        : "text-elovayne-dim/50"
                  }`}
                  aria-live="polite"
                >
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </div>
              </div>

              {/* Privacy reminder */}
              <p id="privacy-reminder" className="text-xs text-elovayne-dim/60 font-body mb-4 leading-relaxed">
                Protect your privacy. Avoid sharing your full name, address, phone number or other identifying information.
              </p>

              {/* Mood selector */}
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-xs text-elovayne-dim uppercase tracking-wider mb-1.5 sm:mb-2 font-body">
                  How are you feeling?
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {allMoods.map((m) => (
                    <button
                      key={m.emoji}
                      onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-body transition-all duration-300 ${
                        mood === m.emoji
                          ? "bg-elovayne-violet/20 border border-elovayne-violet/30 text-elovayne-light"
                          : "bg-elovayne-void/30 border border-transparent text-elovayne-dim hover:text-elovayne-muted hover:border-elovayne-violet/10"
                      }`}
                      style={mood === m.emoji ? { boxShadow: moodGlowColors[m.emoji] } : undefined}
                      aria-label={`Mood: ${m.label}`}
                      aria-pressed={mood === m.emoji}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-9 sm:w-10 h-4.5 sm:h-5 rounded-full transition-all duration-300 ${
                    isAnonymous ? "bg-elovayne-violet/40" : "bg-elovayne-void/50"
                  }`}
                  role="switch"
                  aria-checked={isAnonymous}
                  aria-label="Toggle anonymous posting"
                >
                  <motion.div
                    className="absolute top-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-elovayne-light"
                    animate={{ left: isAnonymous ? "2px" : "20px" }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
                <span className="text-xs sm:text-sm text-elovayne-muted font-body">
                  {isAnonymous ? "Anonymous" : "Show my name"}
                </span>
              </div>

              {/* Content warning toggle */}
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                <button
                  onClick={() => setHasContentWarning(!hasContentWarning)}
                  className={`relative w-9 sm:w-10 h-4.5 sm:h-5 rounded-full transition-all duration-300 ${
                    hasContentWarning ? "bg-elovayne-gold/40" : "bg-elovayne-void/50"
                  }`}
                  role="switch"
                  aria-checked={hasContentWarning}
                  aria-label="Toggle content warning"
                >
                  <motion.div
                    className="absolute top-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-elovayne-light"
                    animate={{ left: hasContentWarning ? "2px" : "20px" }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
                <span className="text-xs sm:text-sm text-elovayne-muted font-body">
                  Content warning
                </span>
              </div>

              {/* Guidelines link + Submit */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 sm:justify-between">
                <a
                  href="/about"
                  className="text-[10px] sm:text-xs text-elovayne-dim hover:text-elovayne-violet transition-colors font-body underline underline-offset-2 decoration-elovayne-dim/30 text-center sm:text-left"
                >
                  Sanctuary Guidelines
                </a>

                <div className="relative flex justify-center sm:justify-end">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit || isSubmitting}
                    className="relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-body text-xs sm:text-sm text-elovayne-light transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: content.trim() && !isOverLimit
                        ? "linear-gradient(135deg, rgba(50, 30, 90, 0.7), rgba(13, 148, 136, 0.7))"
                        : "rgba(50, 30, 90, 0.2)",
                      boxShadow: content.trim() && !isOverLimit
                        ? "0 0 25px rgba(13, 148, 136, 0.3)"
                        : "none",
                    }}
                    whileHover={content.trim() && !isOverLimit ? { scale: 1.03, boxShadow: "0 0 30px rgba(13, 148, 136, 0.4)" } : {}}
                    whileTap={content.trim() && !isOverLimit ? { scale: 0.97 } : {}}
                    aria-label="Share post"
                  >
                    {isSubmitting ? "Sharing..." : "Share Post"}
                    <AnimatePresence>
                      {showRipple && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-elovayne-violet/30"
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 3, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
}
