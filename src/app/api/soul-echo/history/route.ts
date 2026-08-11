import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const client = supabase();
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's matches
    const { data: matches } = await client
      .from("soul_echo_matches")
      .select("*, reflection_a:soul_echo_reflections!reflection_a_id(content, emotion_tags), reflection_b:soul_echo_reflections!reflection_b_id(content, emotion_tags)")
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    // Get today's submission count
    const today = new Date().toISOString().split("T")[0];
    const { data: limit } = await client
      .from("soul_echo_daily_limits")
      .select("submission_count")
      .eq("user_id", user.id)
      .eq("submission_date", today)
      .maybeSingle();

    const dailyRemaining = 5 - ((limit as { submission_count: number } | null)?.submission_count || 0);

    return NextResponse.json({
      matches: matches || [],
      dailyRemaining: Math.max(0, dailyRemaining),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
