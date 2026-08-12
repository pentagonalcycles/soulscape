"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const PROMPTS = [
  "What gave you hope recently?",
  "What made today difficult?",
  "What is something you are grateful for?",
  "What lesson changed your life?",
  "What would you tell your younger self?",
  "What are you quietly proud of?",
  "What small thing brought you joy today?",
  "What is a kindness you witnessed recently?",
  "What are you holding onto right now?",
  "What would you like to let go of?",
  "What song has been living in your mind?",
  "What is a place that feels like home to you?",
  "What skill are you learning or want to learn?",
  "What memory do you treasure most?",
  "What boundary have you set recently?",
  "What comfort do you return to again and again?",
  "What act of kindness did you receive lately?",
  "What is something you find beautifully ordinary?",
  "What conversation stayed with you?",
  "What are you looking forward to?",
];

const STORAGE_KEY = "reflection_room_entries";

interface Entry {
  id: string;
  prompt: string;
  text: string;
  created_at: string;
}

function getDailyPrompt(): string {
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % PROMPTS.length;
  return PROMPTS[dayIndex];
}

function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function ReflectionRoom() {
  const [view, setView] = useState<"landing" | "write" | "past">("landing");
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState(false);
  const dailyPrompt = getDailyPrompt();

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const handleSave = () => {
    if (!journalText.trim()) return;
    const newEntry: Entry = {
      id: Date.now().toString(),
      prompt: dailyPrompt,
      text: journalText.trim(),
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setJournalText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warm ambient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 25% 15%, rgba(156, 175, 136, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(196, 168, 130, 0.03) 0%, transparent 50%)",
          zIndex: 1,
        }}
      />

      {/* Floating organic shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(156, 175, 136, 0.025) 0%, transparent 60%)",
            filter: "blur(90px)",
            top: "-15%",
            left: "-10%",
            animation: "float-reflection 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(196, 168, 130, 0.02) 0%, transparent 60%)",
            filter: "blur(80px)",
            bottom: "-10%",
            right: "-5%",
            animation: "float-reflection 30s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-8"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(156, 175, 136, 0.15) 0%, rgba(196, 168, 130, 0.1) 100%)",
                    border: "1px solid rgba(156, 175, 136, 0.2)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span className="text-2xl" style={{ color: "#9caf88" }}>◈</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="text-4xl md:text-6xl font-heading mb-6"
                style={{
                  background: "linear-gradient(135deg, #9caf88 0%, #c4a882 50%, #a8b5a0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(156, 175, 136, 0.2))",
                }}
              >
                The Reflection Room
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-sm md:text-base max-w-md leading-relaxed mb-12"
                style={{ color: "rgba(61, 61, 61, 0.6)" }}
              >
                A quiet space for reflection and writing what matters.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                {[
                  { label: "Reflect & Write", action: () => setView("write") },
                  { label: "Past Reflections", action: () => setView("past") },
                ].map((btn) => (
                  <motion.button
                    key={btn.label}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(156, 175, 136, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={btn.action}
                    className="px-10 py-4 rounded-2xl text-sm font-body tracking-wide transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, rgba(156, 175, 136, 0.2) 0%, rgba(196, 168, 130, 0.15) 100%)",
                      border: "1px solid rgba(156, 175, 136, 0.3)",
                      color: "#9caf88",
                      backdropFilter: "blur(16px)",
                      boxShadow: "0 4px 24px rgba(156, 175, 136, 0.08)",
                    }}
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {view === "write" && (
            <motion.div
              key="write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-16"
            >
              <div className="w-full max-w-lg">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center text-sm mb-2 font-accent"
                  style={{ color: "#9caf88" }}
                >
                  Today&apos;s reflection
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-center text-xl md:text-2xl font-heading mb-8"
                  style={{ color: "rgba(61, 61, 61, 0.7)" }}
                >
                  {dailyPrompt}
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write freely. This stays only on your device."
                    rows={8}
                    className="w-full bg-transparent text-sm font-body resize-none outline-none rounded-2xl p-5 placeholder:opacity-30"
                    style={{
                      color: "rgba(61, 61, 61, 0.7)",
                      caretColor: "#9caf88",
                      background: "rgba(156, 175, 136, 0.04)",
                      border: "1px solid rgba(156, 175, 136, 0.12)",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex items-center justify-between mt-4"
                >
                  <button
                    onClick={() => setView("landing")}
                    className="text-xs px-4 py-2 rounded-xl transition-all duration-300"
                    style={{ color: "rgba(61, 61, 61, 0.4)", border: "1px solid rgba(156, 175, 136, 0.1)" }}
                  >
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs"
                        style={{ color: "#9caf88" }}
                      >
                        Saved
                      </motion.span>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={!journalText.trim()}
                      className="px-6 py-2 rounded-xl text-xs font-body transition-all duration-300 disabled:opacity-30"
                      style={{
                        background: journalText.trim() ? "rgba(156, 175, 136, 0.15)" : "rgba(156, 175, 136, 0.05)",
                        border: `1px solid ${journalText.trim() ? "rgba(156, 175, 136, 0.25)" : "rgba(156, 175, 136, 0.08)"}`,
                        color: journalText.trim() ? "#9caf88" : "rgba(156, 175, 136, 0.3)",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {view === "past" && (
            <motion.div
              key="past"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center min-h-[80vh] px-6 py-16"
            >
              <div className="w-full max-w-lg">
                <div className="flex items-center justify-between mb-8">
                  <h2
                    className="text-xl font-heading"
                    style={{ color: "rgba(61, 61, 61, 0.7)" }}
                  >
                    Past Reflections
                  </h2>
                  <button
                    onClick={() => setView("landing")}
                    className="text-xs px-4 py-2 rounded-xl transition-all duration-300"
                    style={{ color: "rgba(61, 61, 61, 0.4)", border: "1px solid rgba(156, 175, 136, 0.1)" }}
                  >
                    Back
                  </button>
                </div>

                {entries.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-sm" style={{ color: "rgba(61, 61, 61, 0.3)" }}>
                      No reflections yet.
                    </p>
                    <button
                      onClick={() => setView("write")}
                      className="mt-4 text-xs px-5 py-2 rounded-xl transition-all duration-300"
                      style={{ color: "#9caf88", border: "1px solid rgba(156, 175, 136, 0.2)" }}
                    >
                      Write your first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="rounded-2xl p-5 relative group"
                        style={{
                          background: "rgba(156, 175, 136, 0.04)",
                          border: "1px solid rgba(156, 175, 136, 0.1)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <p className="text-xs mb-2 font-accent" style={{ color: "#9caf88" }}>
                          {entry.prompt}
                        </p>
                        <p className="text-sm font-body leading-relaxed" style={{ color: "rgba(61, 61, 61, 0.6)" }}>
                          {entry.text}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[10px]" style={{ color: "rgba(61, 61, 61, 0.25)" }}>
                            {new Date(entry.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-[10px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
                            style={{ color: "rgba(61, 61, 61, 0.3)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes float-reflection {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -25px) scale(1.02); }
          66% { transform: translate(-15px, 15px) scale(0.98); }
        }
      `}</style>
    </div>
  );
}
