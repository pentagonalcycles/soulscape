"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/soul-map/questions";

interface Answer {
  id: string;
  question: string;
  answer: string;
  category: string;
  timestamp: number;
  history?: { answer: string; timestamp: number }[];
}

interface SoulMapHistoryProps {
  answers: Answer[];
  selectedAnswer: Answer | null;
  onClose: () => void;
  onEdit: (id: string, newAnswer: string) => void;
}

export default function SoulMapHistory({ answers, selectedAnswer, onClose, onEdit }: SoulMapHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);

  function startEdit(answer: Answer) {
    setEditingId(answer.id);
    setEditText(answer.answer);
  }

  function saveEdit() {
    if (editingId && editText.trim()) {
      onEdit(editingId, editText.trim());
      setEditingId(null);
    }
  }

  const sorted = [...answers].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <>
      {/* Detail modal */}
      <AnimatePresence>
        {selectedAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-6 rounded-2xl w-full max-w-md"
              style={{
                background: "rgba(20, 15, 25, 0.95)",
                border: `1px solid ${(CATEGORIES[selectedAnswer.category] || CATEGORIES.emotions).color}30`,
                boxShadow: `0 0 40px ${(CATEGORIES[selectedAnswer.category] || CATEGORIES.emotions).glow}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: (CATEGORIES[selectedAnswer.category] || CATEGORIES.emotions).color }}>
                {selectedAnswer.category}
              </p>
              <p className="text-sm mb-4" style={{ color: "rgba(255, 255, 255, 0.7)", fontFamily: "var(--font-heading)" }}>
                {selectedAnswer.question}
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255, 255, 255, 0.85)", fontFamily: "var(--font-body)" }}>
                {selectedAnswer.answer}
              </p>
              <p className="text-[10px] mb-4" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
                {new Date(selectedAnswer.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>

              {/* History */}
              {selectedAnswer.history && selectedAnswer.history.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowHistory(showHistory === selectedAnswer.id ? null : selectedAnswer.id)}
                    className="text-[10px] cursor-pointer mb-2"
                    style={{ color: "rgba(255, 255, 255, 0.3)", background: "none", border: "none" }}
                  >
                    {showHistory === selectedAnswer.id ? "Hide" : "Show"} history ({selectedAnswer.history.length} edits)
                  </button>
                  <AnimatePresence>
                    {showHistory === selectedAnswer.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {selectedAnswer.history.map((h, i) => (
                          <div key={i} className="py-2 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
                            <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>{h.answer}</p>
                            <p className="text-[10px] mt-1" style={{ color: "rgba(255, 255, 255, 0.15)" }}>
                              {new Date(h.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.4)" }}
                >
                  Close
                </button>
                <button
                  onClick={() => { startEdit(selectedAnswer); onClose(); }}
                  className="flex-1 px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "#f59e0b" }}
                >
                  Edit Answer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setEditingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-6 rounded-2xl w-full max-w-md"
              style={{
                background: "rgba(20, 15, 25, 0.95)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <p className="text-sm mb-4" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Edit your answer
              </p>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value.slice(0, 300))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.4)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={!editText.trim()}
                  className="flex-1 px-4 py-2 rounded-xl text-xs cursor-pointer disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", color: "white" }}
                >
                  Save Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
