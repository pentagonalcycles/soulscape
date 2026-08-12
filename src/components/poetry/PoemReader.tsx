"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Poem {
  id: string;
  pen_name: string;
  prompt: string;
  content: string;
  created_at: string;
  reactions?: Record<string, number>;
  userReactions?: string[];
}

interface PoemReaderProps {
  poems: Poem[];
  onReact: (poemId: string, reactionType: string) => void;
  onBack: () => void;
  onWrite: () => void;
  onDelete?: (poemId: string) => void;
  isAdmin?: boolean;
}

const REACTIONS = [
  { type: "heart", emoji: "❤️", label: "Heart" },
  { type: "moved", emoji: "💫", label: "This moved me" },
  { type: "beautiful", emoji: "✨", label: "Beautiful words" },
  { type: "felt", emoji: "🤍", label: "I felt this" },
  { type: "keep", emoji: "🌱", label: "Keep writing" },
];

export default function PoemReader({ poems, onReact, onBack, onWrite, onDelete, isAdmin }: PoemReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPoem = poems[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < poems.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, poems.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goToNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goToNext, goToPrev]);

  // Touch swipe
  const touchStartRef = useRef(0);
  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientY;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartRef.current - e.changedTouches[0].clientY;
    if (diff > 50) goToNext();
    if (diff < -50) goToPrev();
  }

  if (poems.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "linear-gradient(180deg, #1a1510 0%, #2a1f15 50%, #1a1510 100%)" }}
      >
        <p className="text-lg mb-4" style={{ color: "rgba(254, 243, 199, 0.5)", fontFamily: "var(--font-heading)" }}>
          No poems yet
        </p>
        <p className="text-xs mb-8" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
          Be the first to write one
        </p>
        <button
          onClick={onWrite}
          className="px-6 py-2.5 rounded-xl text-xs cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#1a1510",
            border: "none",
          }}
        >
          ✒ Write a Poem
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative"
      style={{ background: "linear-gradient(180deg, #1a1510 0%, #2a1f15 50%, #1a1510 100%)" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={onBack}
          className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
          style={{
            color: "rgba(245, 158, 11, 0.5)",
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.1)",
          }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {isAdmin && onDelete && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { onDelete(currentPoem.id); setConfirmDelete(false); }} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white">Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "rgba(245, 158, 11, 0.5)", background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  Delete
                </button>
              )}
            </>
          )}
          <span className="text-xs" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
            {currentIndex + 1} / {poems.length}
          </span>
          <button
            onClick={onWrite}
            className="text-xs cursor-pointer px-3 py-1.5 rounded-lg"
            style={{
              color: "rgba(245, 158, 11, 0.5)",
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.1)",
            }}
          >
            ✒ Write
          </button>
        </div>
      </div>

      {/* Poem display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPoem.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full flex flex-col items-center justify-center px-8 sm:px-16"
        >
          {/* Parchment card */}
          <div
            className="w-full max-w-lg rounded-2xl p-8 sm:p-10 relative"
            style={{
              background: "linear-gradient(135deg, rgba(254, 243, 199, 0.06), rgba(254, 243, 199, 0.03))",
              border: "1px solid rgba(245, 158, 11, 0.1)",
              boxShadow: "0 0 60px rgba(245, 158, 11, 0.05)",
            }}
          >
            {/* Prompt */}
            <p className="text-[10px] tracking-widest uppercase mb-4 text-center" style={{ color: "rgba(245, 158, 11, 0.3)" }}>
              {currentPoem.prompt}
            </p>

            {/* Ornamental divider */}
            <div
              className="w-24 mx-auto mb-6"
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), transparent)",
              }}
            />

            {/* Poem content */}
            <p
              className="text-base sm:text-lg leading-relaxed text-center mb-6 whitespace-pre-wrap"
              style={{
                fontFamily: "var(--font-accent)",
                color: "rgba(254, 243, 199, 0.85)",
                lineHeight: "2",
              }}
            >
              {currentPoem.content}
            </p>

            {/* Ornamental divider */}
            <div
              className="w-16 mx-auto mb-4"
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.15), transparent)",
              }}
            />

            {/* Pen name */}
            <p className="text-xs text-center" style={{ color: "rgba(245, 158, 11, 0.35)", fontFamily: "var(--font-accent)" }}>
              — {currentPoem.pen_name}
            </p>
          </div>

          {/* Reactions */}
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            {REACTIONS.map((r) => {
              const count = currentPoem.reactions?.[r.type] || 0;
              const active = currentPoem.userReactions?.includes(r.type);
              return (
                <button
                  key={r.type}
                  onClick={() => onReact(currentPoem.id, r.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all"
                  style={{
                    background: active ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.05)",
                    border: `1px solid ${active ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.08)"}`,
                    color: active ? "#f59e0b" : "rgba(254, 243, 199, 0.4)",
                  }}
                >
                  <span>{r.emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - hidden on very small screens (swipe works instead) */}
      <button
        onClick={goToPrev}
        disabled={currentIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center cursor-pointer disabled:opacity-20 transition-opacity z-10 hidden sm:flex"
        style={{
          background: "rgba(245, 158, 11, 0.06)",
          border: "1px solid rgba(245, 158, 11, 0.1)",
          color: "rgba(245, 158, 11, 0.5)",
        }}
      >
        ‹
      </button>
      <button
        onClick={goToNext}
        disabled={currentIndex === poems.length - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center cursor-pointer disabled:opacity-20 transition-opacity z-10 hidden sm:flex"
        style={{
          background: "rgba(245, 158, 11, 0.06)",
          border: "1px solid rgba(245, 158, 11, 0.1)",
          color: "rgba(245, 158, 11, 0.5)",
        }}
      >
        ›
      </button>

      {/* Scroll hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-4 left-0 right-0 text-center text-[10px]"
        style={{ color: "rgba(245, 158, 11, 0.15)" }}
      >
        Scroll, swipe, or use arrow keys to turn pages
      </motion.p>
    </div>
  );
}
