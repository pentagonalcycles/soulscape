"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const moods = [
  { emoji: "🌙", label: "Lost" },
  { emoji: "🕯", label: "Heavy" },
  { emoji: "✨", label: "Hopeful" },
  { emoji: "🌿", label: "Healing" },
  { emoji: "☁️", label: "Drifting" },
  { emoji: "💫", label: "Grateful" },
];

interface SanctuaryComposerProps {
  onSubmit: (whisper: {
    content: string;
    mood: string | null;
    isAnonymous: boolean;
    hasContentWarning: boolean;
  }) => void;
}

const MAX_CHARS = 2000;

export default function SanctuaryComposer({ onSubmit }: SanctuaryComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="trigger"
            onClick={() => setIsExpanded(true)}
            className="w-full text-left rounded-2xl px-6 py-5 transition-all duration-500 cursor-pointer sanctuary-glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{
              boxShadow: "0 0 30px rgba(157, 124, 216, 0.15)",
            }}
            aria-label="Open whisper composer"
          >
            <div className="flex items-center gap-4">
              <span className="text-elovayne-violet text-lg">✦</span>
              <span className="text-elovayne-muted font-body text-sm">
                Release your stardust into the Sanctuary
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="composer"
            className="rounded-2xl sanctuary-glass-card overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-elovayne-violet">✦</span>
                  <h3 className="font-heading text-lg text-elovayne-light">
                    Whisper to the Sanctuary
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
              <div className="relative mb-4">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What is resting on your heart?"
                  rows={6}
                  className="w-full bg-elovayne-void/40 border border-elovayne-violet/15 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim/70 resize-none focus:outline-none focus:border-elovayne-violet/40 transition-colors font-body text-sm leading-relaxed"
                  aria-label="Whisper content"
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
              <div className="mb-4">
                <p className="text-xs text-elovayne-dim uppercase tracking-wider mb-2 font-body">
                  How are you feeling?
                </p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.emoji}
                      onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all duration-300 ${
                        mood === m.emoji
                          ? "bg-elovayne-violet/20 border border-elovayne-violet/30 text-elovayne-light"
                          : "bg-elovayne-void/30 border border-transparent text-elovayne-dim hover:text-elovayne-muted hover:border-elovayne-violet/10"
                      }`}
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
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                    isAnonymous ? "bg-elovayne-violet/40" : "bg-elovayne-void/50"
                  }`}
                  role="switch"
                  aria-checked={isAnonymous}
                  aria-label="Toggle anonymous posting"
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-elovayne-light"
                    animate={{ left: isAnonymous ? "2px" : "22px" }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
                <span className="text-sm text-elovayne-muted font-body">
                  {isAnonymous ? "Anonymous" : "Show my name"}
                </span>
              </div>

              {/* Content warning toggle */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setHasContentWarning(!hasContentWarning)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                    hasContentWarning ? "bg-elovayne-gold/40" : "bg-elovayne-void/50"
                  }`}
                  role="switch"
                  aria-checked={hasContentWarning}
                  aria-label="Toggle content warning"
                >
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-elovayne-light"
                    animate={{ left: hasContentWarning ? "2px" : "22px" }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
                <span className="text-sm text-elovayne-muted font-body">
                  Content warning
                </span>
              </div>

              {/* Guidelines link + Submit */}
              <div className="flex items-center justify-between">
                <a
                  href="/about"
                  className="text-xs text-elovayne-dim hover:text-elovayne-violet transition-colors font-body underline underline-offset-2 decoration-elovayne-dim/30"
                >
                  Sanctuary Guidelines
                </a>

                <div className="relative">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit || isSubmitting}
                    className="relative px-6 py-2.5 rounded-full font-body text-sm text-elovayne-light transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: content.trim() && !isOverLimit
                        ? "linear-gradient(135deg, rgba(107, 63, 160, 0.7), rgba(157, 124, 216, 0.7))"
                        : "rgba(107, 63, 160, 0.2)",
                      boxShadow: content.trim() && !isOverLimit
                        ? "0 0 25px rgba(157, 124, 216, 0.3)"
                        : "none",
                    }}
                    whileHover={content.trim() && !isOverLimit ? { scale: 1.03 } : {}}
                    whileTap={content.trim() && !isOverLimit ? { scale: 0.97 } : {}}
                    aria-label="Release whisper"
                  >
                    {isSubmitting ? "Releasing..." : "Release Whisper"}
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
      </AnimatePresence>
    </div>
  );
}
