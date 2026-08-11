"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getDailyQuestion, CATEGORIES } from "@/lib/soul-map/questions";
import SoulMapVisual from "./SoulMapVisual";
import SoulMapQuestion from "./SoulMapQuestion";
import SoulMapHistory from "./SoulMapHistory";

interface Answer {
  id: string;
  question: string;
  answer: string;
  category: string;
  timestamp: number;
  history?: { answer: string; timestamp: number }[];
}

const STORAGE_KEY = "soul-map-answers";

function loadAnswers(): Answer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnswers(answers: Answer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export default function SoulMapPage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [answeredToday, setAnsweredToday] = useState(false);

  const question = getDailyQuestion();
  const totalQuestions = 50;
  const progress = Math.round((answers.length / totalQuestions) * 100);

  useEffect(() => {
    const loaded = loadAnswers();
    setAnswers(loaded);

    // Check if answered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const hasAnsweredToday = loaded.some((a: Answer) => {
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10) === todayStr && a.question === question.text;
    });
    setAnsweredToday(hasAnsweredToday);
  }, [question.text]);

  const handleSubmit = useCallback((answerText: string) => {
    const newAnswer: Answer = {
      id: Date.now().toString(),
      question: question.text,
      answer: answerText,
      category: question.category,
      timestamp: Date.now(),
      history: [],
    };

    const updated = [newAnswer, ...answers];
    setAnswers(updated);
    saveAnswers(updated);
    setAnsweredToday(true);
    setShowQuestion(false);
  }, [question, answers]);

  const handleEdit = useCallback((id: string, newAnswer: string) => {
    const updated = answers.map((a) => {
      if (a.id !== id) return a;
      return {
        ...a,
        answer: newAnswer,
        history: [...(a.history || []), { answer: a.answer, timestamp: a.timestamp }],
        timestamp: Date.now(),
      };
    });
    setAnswers(updated);
    saveAnswers(updated);
  }, [answers]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #0f0a1a 50%, #0a0a1a 100%)" }}
    >
      {/* Mandala canvas */}
      <SoulMapVisual
        answers={answers}
        onSelectAnswer={setSelectedAnswer}
      />

      {/* Header */}
      <motion.div
        className="absolute top-6 left-0 right-0 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1
          className="text-2xl sm:text-3xl font-light tracking-wide mb-1"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Soul Map
        </h1>
        <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
          {answers.length} / {totalQuestions} questions answered
        </p>

        {/* Progress bar */}
        <div className="w-48 mx-auto mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #f59e0b, #ec4899)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {showQuestion ? (
          <SoulMapQuestion
            question={question}
            onSubmit={handleSubmit}
            onSkip={() => setShowQuestion(false)}
            answeredToday={answeredToday}
          />
        ) : (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowQuestion(true)}
              className="px-6 py-2.5 rounded-full text-sm cursor-pointer"
              style={{
                background: answeredToday
                  ? "rgba(255, 255, 255, 0.05)"
                  : `linear-gradient(135deg, ${(CATEGORIES[question.category] || CATEGORIES.emotions).color}, ${(CATEGORIES[question.category] || CATEGORIES.emotions).color}88)`,
                color: answeredToday ? "rgba(255, 255, 255, 0.4)" : "white",
                border: "none",
                boxShadow: answeredToday ? "none" : `0 0 20px ${(CATEGORIES[question.category] || CATEGORIES.emotions).glow}`,
              }}
            >
              {answeredToday ? "✓ Answered Today" : "Today's Question"}
            </button>
          </div>
        )}
      </motion.div>

      {/* History/Edit modal */}
      <SoulMapHistory
        answers={answers}
        selectedAnswer={selectedAnswer}
        onClose={() => setSelectedAnswer(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
