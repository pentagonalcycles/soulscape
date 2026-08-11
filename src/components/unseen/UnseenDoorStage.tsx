"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { MatchWithProfile, UnseenPrompt, UnseenPromptAnswer } from "@/lib/unseen/types";

interface UnseenDoorStageProps {
  match: MatchWithProfile;
  myUserId: string;
  onOpenMessaging: () => void;
}

export default function UnseenDoorStage({ match, myUserId, onOpenMessaging }: UnseenDoorStageProps) {
  const [prompt, setPrompt] = useState<UnseenPrompt | null>(match.prompt);
  const [myAnswer, setMyAnswer] = useState("");
  const [myPromptAnswer, setMyPromptAnswer] = useState<UnseenPromptAnswer | null>(match.my_prompt_answer);
  const [theirPromptAnswer, setTheirPromptAnswer] = useState<UnseenPromptAnswer | null>(match.their_prompt_answer);
  const [submitting, setSubmitting] = useState(false);
  const [bothAnswered, setBothAnswered] = useState(false);

  useEffect(() => {
    async function loadPromptAndAnswers() {
      const client = supabase();

      // Load prompt if not already loaded
      if (!prompt && match.conversation_prompt_id) {
        const { data } = await client
          .from("unseen_prompts")
          .select("*")
          .eq("id", match.conversation_prompt_id)
          .single();
        if (data) setPrompt(data);
      }

      // Load answers
      const { data: answers } = await client
        .from("unseen_prompt_answers")
        .select("*")
        .eq("match_id", match.id);

      if (answers) {
        const mine = answers.find(a => a.user_id === myUserId);
        const theirs = answers.find(a => a.user_id !== myUserId);
        if (mine) setMyPromptAnswer(mine);
        if (theirs) setTheirPromptAnswer(theirs);
        if (mine && theirs) setBothAnswered(true);
      }
    }

    loadPromptAndAnswers();
  }, [match.id, match.conversation_prompt_id, myUserId, prompt]);

  async function submitAnswer() {
    if (!myAnswer.trim() || submitting) return;
    setSubmitting(true);

    const client = supabase();
    const { data, error } = await client
      .from("unseen_prompt_answers")
      .insert({
        match_id: match.id,
        user_id: myUserId,
        answer_text: myAnswer.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setMyPromptAnswer(data);

      // Check if they already answered
      const { data: theirs } = await client
        .from("unseen_prompt_answers")
        .select("*")
        .eq("match_id", match.id)
        .neq("user_id", myUserId)
        .maybeSingle();

      if (theirs) {
        setTheirPromptAnswer(theirs);
        setBothAnswered(true);
      }
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="text-4xl mb-6"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🚪
        </motion.div>

        <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          The Door is Open.
        </h2>
        <p className="text-sm mb-10" style={{ color: "rgba(148,163,184,0.5)" }}>
          Before you begin talking, answer this question together.
        </p>

        {/* The Question */}
        {prompt && (
          <div className="mb-8 p-6 rounded-2xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "rgba(139,92,246,0.5)" }}>
              The Question Between You
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(224,231,255,0.9)", fontWeight: 300, fontStyle: "italic" }}>
              &ldquo;{prompt.prompt_text}&rdquo;
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!bothAnswered ? (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!myPromptAnswer ? (
                <>
                  <textarea
                    value={myAnswer}
                    onChange={e => setMyAnswer(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Your answer..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }}
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!myAnswer.trim() || submitting}
                    className="w-full py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: myAnswer.trim()
                        ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${myAnswer.trim() ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: myAnswer.trim() ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.3)",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Answer"}
                  </button>
                </>
              ) : (
                <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xs mb-2" style={{ color: "rgba(139,92,246,0.5)" }}>Your answer</p>
                  <p className="text-sm" style={{ color: "rgba(224,231,255,0.7)" }}>{myPromptAnswer.answer_text}</p>
                  <p className="text-xs mt-4 animate-pulse" style={{ color: "rgba(148,163,184,0.4)" }}>
                    Waiting for their answer...
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="revealed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-2xl text-left" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <p className="text-[10px] mb-2" style={{ color: "rgba(139,92,246,0.5)" }}>
                    {match.other_profile.display_name}&apos;s answer
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.8)" }}>
                    {theirPromptAnswer?.answer_text}
                  </p>
                </div>
                <div className="p-5 rounded-2xl text-left" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[10px] mb-2" style={{ color: "rgba(148,163,184,0.4)" }}>Your answer</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.7)" }}>
                    {myPromptAnswer?.answer_text}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenMessaging}
                className="w-full py-4 rounded-2xl text-sm tracking-wide transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(13,148,136,0.2), rgba(6,182,212,0.15))",
                  border: "1px solid rgba(13,148,136,0.3)",
                  color: "rgba(224,231,255,0.9)",
                }}
              >
                Begin Talking
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
