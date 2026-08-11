"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { DiscoveryProfile, UnseenProfile, UnseenAnswer, UnseenPreferences } from "@/lib/unseen/types";
import { calculateCompatibility } from "@/lib/unseen/compatibility";
import UnseenCard from "./UnseenCard";

interface UnseenDiscoveryProps {
  onMatch: (matchId: string) => void;
  onBack: () => void;
}

export default function UnseenDiscovery({ onMatch, onBack }: UnseenDiscoveryProps) {
  const { userId } = useAuth();
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<UnseenProfile | null>(null);
  const [myAnswers, setMyAnswers] = useState<UnseenAnswer[]>([]);
  const [myPrefs, setMyPrefs] = useState<UnseenPreferences | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const client = supabase();

    // Load my profile, answers, preferences
    const { data: profile } = await client
      .from("unseen_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: answers } = await client
      .from("unseen_answers")
      .select("*")
      .eq("user_id", userId);

    const { data: prefs } = await client
      .from("unseen_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile || !prefs) {
      setLoading(false);
      return;
    }

    setMyProfile(profile);
    setMyAnswers(answers || []);
    setMyPrefs(prefs);

    // Get users I've already decided on
    const { data: myDecisions } = await client
      .from("unseen_decisions")
      .select("target_id")
      .eq("decider_id", userId);

    const decidedIds = new Set((myDecisions || []).map(d => d.target_id));

    // Get blocked users
    const { data: blocks } = await client
      .from("unseen_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId);

    const blockedIds = new Set((blocks || []).map(b => b.blocked_id));

    // Get users who blocked me
    const { data: blockedBy } = await client
      .from("unseen_blocks")
      .select("blocker_id")
      .eq("blocked_id", userId);

    const blockedByIds = new Set((blockedBy || []).map(b => b.blocker_id));

    // Build exclusion set
    const excludeIds = new Set([userId, ...decidedIds, ...blockedIds, ...blockedByIds]);

    // Fetch potential matches
    let query = client
      .from("unseen_profiles")
      .select("*")
      .eq("is_active", true)
      .eq("is_verified_18", true);

    // Filter by preferences
    if (prefs.show_me !== "everyone") {
      const genderFilter = prefs.show_me === "men" ? "man" : "woman";
      query = query.eq("gender", genderFilter);
    }

    query = query.gte("age", prefs.age_min).lte("age", prefs.age_max);

    const { data: potentialProfiles } = await query.limit(50);

    if (!potentialProfiles) {
      setLoading(false);
      return;
    }

    // Filter out excluded users
    const filtered = potentialProfiles.filter(p => !excludeIds.has(p.user_id));

    // Fetch their answers, interests, photos
    const discoveryProfiles: DiscoveryProfile[] = [];

    for (const p of filtered) {
      const { data: theirAnswers } = await client
        .from("unseen_answers")
        .select("*, unseen_questions!inner(question_text)")
        .eq("user_id", p.user_id);

      const { data: theirInterests } = await client
        .from("unseen_interests")
        .select("interest")
        .eq("user_id", p.user_id);

      const { data: theirPhotos } = await client
        .from("unseen_photos")
        .select("storage_path")
        .eq("user_id", p.user_id)
        .eq("is_primary", true)
        .limit(1);

      const { data: theirPrefs } = await client
        .from("unseen_preferences")
        .select("*")
        .eq("user_id", p.user_id)
        .single();

      // Check if they pass my preferences
      if (theirPrefs) {
        const ageOk = profile.age >= theirPrefs.age_min && profile.age <= theirPrefs.age_max;
        const genderOk = theirPrefs.show_me === "everyone" ||
          (theirPrefs.show_me === "men" && profile.gender === "man") ||
          (theirPrefs.show_me === "women" && profile.gender === "woman");
        if (!ageOk || !genderOk) continue;
      }

      const enrichedAnswers = (theirAnswers || []).map(a => ({
        id: a.id,
        user_id: a.user_id,
        question_id: a.question_id,
        answer_text: a.answer_text,
        created_at: a.created_at,
        question_text: a.unseen_questions?.question_text || "",
      }));

      const compatibility = calculateCompatibility(
        profile, answers || [], prefs,
        p, theirAnswers || [], theirPrefs || prefs
      );

      discoveryProfiles.push({
        profile: p,
        interests: (theirInterests || []).map(i => i.interest),
        answers: enrichedAnswers,
        primary_photo_url: theirPhotos?.[0]?.storage_path || null,
        compatibility,
      });
    }

    // Sort by compatibility
    discoveryProfiles.sort((a, b) => b.compatibility.overall - a.compatibility.overall);

    setProfiles(discoveryProfiles);
    setCurrentIndex(0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleDecision(decision: "interested" | "passed") {
    const current = profiles[currentIndex];
    if (!current || !userId) return;

    const client = supabase();

    // Record decision
    await client.from("unseen_decisions").insert({
      decider_id: userId,
      target_id: current.profile.user_id,
      decision,
    });

    if (decision === "interested") {
      // Check for mutual interest
      const { data: theirDecision } = await client
        .from("unseen_decisions")
        .select("id")
        .eq("decider_id", current.profile.user_id)
        .eq("target_id", userId)
        .eq("decision", "interested")
        .maybeSingle();

      if (theirDecision) {
        // Mutual match! Create match
        const [userA, userB] = [userId, current.profile.user_id].sort();
        const { data: match } = await client
          .from("unseen_matches")
          .insert({
            user_a_id: userA,
            user_b_id: userB,
            current_stage: "mind",
          })
          .select()
          .single();

        if (match) {
          // Assign a random conversation prompt
          const { data: prompts } = await client
            .from("unseen_prompts")
            .select("id")
            .limit(10);

          if (prompts && prompts.length > 0) {
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            await client
              .from("unseen_matches")
              .update({ conversation_prompt_id: randomPrompt.id })
              .eq("id", match.id);
          }

          onMatch(match.id);
          return;
        }
      }
    }

    // Move to next profile
    setCurrentIndex(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-4 animate-pulse">◎</div>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>Finding people...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-6">🌿</div>
          <h2 className="text-xl mb-3" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
            No new paths have crossed yours yet.
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(148,163,184,0.5)" }}>
            Check back later. New people arrive all the time.
          </p>
          <button onClick={onBack} className="px-6 py-3 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.6)" }}>
            ← Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>← Back</button>
          <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>
            {profiles.length - currentIndex} people
          </span>
        </div>

        <AnimatePresence mode="wait">
          <UnseenCard
            key={profiles[currentIndex].profile.id}
            profile={profiles[currentIndex]}
            onInterested={() => handleDecision("interested")}
            onPass={() => handleDecision("passed")}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
