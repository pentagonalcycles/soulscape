"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { MatchWithProfile, UnseenMatch } from "@/lib/unseen/types";
import UnseenMindStage from "./UnseenMindStage";
import UnseenVoiceStage from "./UnseenVoiceStage";
import UnseenRevealStage from "./UnseenRevealStage";
import UnseenDoorStage from "./UnseenDoorStage";
import UnseenMessaging from "./UnseenMessaging";

interface UnseenRevealProps {
  matchId: string;
  onBack: () => void;
}

export default function UnseenReveal({ matchId, onBack }: UnseenRevealProps) {
  const { userId } = useAuth();
  const [match, setMatch] = useState<MatchWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessaging, setShowMessaging] = useState(false);

  const loadMatch = useCallback(async () => {
    if (!userId) return;
    const client = supabase();

    const { data: matchData } = await client
      .from("unseen_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!matchData) {
      setLoading(false);
      return;
    }

    const otherUserId = matchData.user_a_id === userId ? matchData.user_b_id : matchData.user_a_id;

    const { data: otherProfile } = await client
      .from("unseen_profiles")
      .select("*")
      .eq("user_id", otherUserId)
      .single();

    const { data: otherAnswers } = await client
      .from("unseen_answers")
      .select("*, unseen_questions!inner(question_text)")
      .eq("user_id", otherUserId);

    const { data: otherInterests } = await client
      .from("unseen_interests")
      .select("interest")
      .eq("user_id", otherUserId);

    const { data: prompt } = matchData.conversation_prompt_id
      ? await client.from("unseen_prompts").select("*").eq("id", matchData.conversation_prompt_id).single()
      : { data: null };

    const { data: promptAnswers } = await client
      .from("unseen_prompt_answers")
      .select("*")
      .eq("match_id", matchId);

    const myPromptAnswer = promptAnswers?.find(a => a.user_id === userId) || null;
    const theirPromptAnswer = promptAnswers?.find(a => a.user_id !== userId) || null;

    const enrichedAnswers = (otherAnswers || []).map(a => ({
      id: a.id,
      user_id: a.user_id,
      question_id: a.question_id,
      answer_text: a.answer_text,
      created_at: a.created_at,
      question_text: a.unseen_questions?.question_text || "",
    }));

    setMatch({
      ...matchData,
      other_profile: otherProfile!,
      other_interests: (otherInterests || []).map(i => i.interest),
      other_answers: enrichedAnswers,
      prompt: prompt || null,
      my_prompt_answer: myPromptAnswer,
      their_prompt_answer: theirPromptAnswer,
    });
    setLoading(false);
  }, [matchId, userId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  // Subscribe to match updates
  useEffect(() => {
    if (!userId) return;
    const client = supabase();
    const channel = client
      .channel(`unseen-match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "unseen_matches", filter: `id=eq.${matchId}` },
        () => { loadMatch(); }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [matchId, userId, loadMatch]);

  async function handleContinue() {
    if (!userId || !match) return;
    const client = supabase();
    const isUserA = match.user_a_id === userId;

    const updates: Record<string, boolean | string> = {};

    if (match.current_stage === "mind") {
      if (isUserA) updates.stage_mind_a = true;
      else updates.stage_mind_b = true;

      // Check if both have consented
      const otherConsented = isUserA ? match.stage_mind_b : match.stage_mind_a;
      if (otherConsented) updates.current_stage = "voice";
    } else if (match.current_stage === "voice") {
      if (isUserA) updates.stage_voice_a = true;
      else updates.stage_voice_b = true;

      const otherConsented = isUserA ? match.stage_voice_b : match.stage_voice_a;
      if (otherConsented) updates.current_stage = "reveal";
    }

    await client.from("unseen_matches").update(updates).eq("id", matchId);
    loadMatch();
  }

  async function handleKeep() {
    if (!userId || !match) return;
    const client = supabase();
    const isUserA = match.user_a_id === userId;

    const updates: Record<string, boolean | string> = {};
    if (isUserA) updates.stage_reveal_a = true;
    else updates.stage_reveal_b = true;

    const otherConsented = isUserA ? match.stage_reveal_b : match.stage_reveal_a;
    if (otherConsented) updates.current_stage = "door";

    await client.from("unseen_matches").update(updates).eq("id", matchId);
    loadMatch();
  }

  async function handleEnd() {
    if (!match) return;
    const client = supabase();
    await client.from("unseen_matches").update({ current_stage: "ended" }).eq("id", matchId);
    onBack();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm animate-pulse" style={{ color: "rgba(148,163,184,0.5)" }}>Loading connection...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>Connection not found.</p>
          <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>← Return</button>
        </div>
      </div>
    );
  }

  if (match.current_stage === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: "rgba(224,231,255,0.7)", fontWeight: 200 }}>
            This connection ends here.
          </p>
          <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>← Return</button>
        </div>
      </div>
    );
  }

  if (showMessaging && match.current_stage === "door") {
    return (
      <UnseenMessaging
        matchId={matchId}
        myUserId={userId!}
        otherName={match.other_profile.display_name}
        onBack={() => setShowMessaging(false)}
      />
    );
  }

  switch (match.current_stage) {
    case "mind":
      return <UnseenMindStage match={match} onContinue={handleContinue} />;
    case "voice":
      return <UnseenVoiceStage match={match} onContinue={handleContinue} />;
    case "reveal":
      return <UnseenRevealStage match={match} myUserId={userId!} onKeep={handleKeep} onEnd={handleEnd} />;
    case "door":
      return <UnseenDoorStage match={match} myUserId={userId!} onOpenMessaging={() => setShowMessaging(true)} />;
    default:
      return null;
  }
}
