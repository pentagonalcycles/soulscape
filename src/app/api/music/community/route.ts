import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: tracks, error } = await supabaseService()
      .from("music_tracks")
      .select("id, title, prompt, style, mood, duration, audio_url, image_url, share_text, created_at, user_id")
      .eq("is_shared", true)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
    }

    // Fetch display names for creators
    const userIds = [...new Set((tracks || []).map((t) => t.user_id))];
    const { data: profiles } = await supabaseService()
      .from("users")
      .select("id, display_name")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name]));

    const enriched = (tracks || []).map((t) => ({
      ...t,
      creator_name: profileMap.get(t.user_id) || "Anonymous",
    }));

    return NextResponse.json({ tracks: enriched });
  } catch (error) {
    console.error("Music community error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
