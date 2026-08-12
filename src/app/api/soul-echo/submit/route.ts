import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

const DAILY_LIMIT = 5;

function extractEmotionTags(content: string): string[] {
  const lower = content.toLowerCase();
  const tags: string[] = [];

  const keywords: Record<string, string[]> = {
    sadness: ["sad", "crying", "tears", "grief", "loss", "miss", "missing", "empty", "hollow", "broken", "heartache", "sorrow"],
    anxiety: ["anxious", "worried", "nervous", "panic", "fear", "scared", "overthinking", "racing", "overwhelmed", "stress"],
    loneliness: ["lonely", "alone", "isolated", "disconnected", "nobody", "abandoned", "forgotten", "invisible"],
    hope: ["hope", "hopeful", "better", "future", "believe", "trust", "faith", "bright", "light", "dawn"],
    love: ["love", "care", "heart", "warm", "tender", "gentle", "cherish", "adore", "compassion"],
    anger: ["angry", "furious", "frustrated", "mad", "rage", "bitter", "resentment", "fed up"],
    confusion: ["confused", "lost", "uncertain", "unsure", "direction", "purpose", "meaning", "why"],
    gratitude: ["grateful", "thankful", "appreciate", "blessed", "lucky", "gift", "grace"],
    grief: ["grief", "mourning", "death", "funeral", "remember", "gone forever"],
    exhaustion: ["tired", "exhausted", "drained", "burnout", "weary", "no energy", "heavy"],
    healing: ["healing", "recovery", "growing", "learning", "progress", "therapy"],
    creativity: ["create", "imagine", "dream", "inspire", "art", "music", "write", "poetry"],
  };

  for (const [emotion, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      tags.push(emotion);
    }
  }

  return tags.length > 0 ? tags : ["general"];
}

function calculateEmotionalSimilarity(tagsA: string[], tagsB: string[]): number {
  if (tagsA.includes("general") || tagsB.includes("general")) return 0.1;
  const intersection = tagsA.filter((t) => tagsB.includes(t));
  const union = new Set([...tagsA, ...tagsB]);
  return intersection.length / union.size;
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = supabaseService();

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const { data: limit } = await client
      .from("soul_echo_daily_limits")
      .select("*")
      .eq("user_id", user.id)
      .eq("submission_date", today)
      .maybeSingle();

    const currentCount = (limit as { submission_count: number } | null)?.submission_count || 0;
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily limit reached. Come back tomorrow for more reflections." },
        { status: 429 }
      );
    }

    // Extract emotion tags
    const emotionTags = extractEmotionTags(content.trim());

    // Create reflection
    const { data: reflection, error: insertError } = await client
      .from("soul_echo_reflections")
      .insert({
        user_id: user.id,
        content: content.trim(),
        emotion_tags: emotionTags,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to save reflection" }, { status: 500 });
    }

    // Update daily limit
    if (limit) {
      await client
        .from("soul_echo_daily_limits")
        .update({ submission_count: currentCount + 1 })
        .eq("user_id", user.id)
        .eq("submission_date", today);
    } else {
      await client
        .from("soul_echo_daily_limits")
        .insert({ user_id: user.id, submission_date: today, submission_count: 1 });
    }

    // Find a match: look for active, unmatched reflections from other users
    const { data: candidates } = await client
      .from("soul_echo_reflections")
      .select("*")
      .eq("is_active", true)
      .eq("is_matched", false)
      .neq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20);

    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates || []) {
      const score = calculateEmotionalSimilarity(emotionTags, (candidate as { emotion_tags: string[] }).emotion_tags);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    // If we found a match with meaningful similarity (>0.15), create the match
    if (bestMatch && bestScore > 0.15) {
      const candidate = bestMatch as { id: string; user_id: string };

      // Mark both reflections as matched
      await client
        .from("soul_echo_reflections")
        .update({ is_matched: true })
        .in("id", [reflection.id, candidate.id]);

      // Create match record
      const { data: match, error: matchError } = await client
        .from("soul_echo_matches")
        .insert({
          reflection_a_id: reflection.id,
          reflection_b_id: candidate.id,
          user_a_id: user.id,
          user_b_id: candidate.user_id,
          status: "active",
        })
        .select()
        .single();

      if (matchError) {
        // If match creation fails (e.g., duplicate), just return the reflection
        return NextResponse.json({
          reflection,
          matched: false,
          dailyRemaining: DAILY_LIMIT - currentCount - 1,
        });
      }

      return NextResponse.json({
        reflection,
        matched: true,
        match,
        matchedReflection: bestMatch,
        dailyRemaining: DAILY_LIMIT - currentCount - 1,
      });
    }

    // No match found - reflection waits
    return NextResponse.json({
      reflection,
      matched: false,
      dailyRemaining: DAILY_LIMIT - currentCount - 1,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
