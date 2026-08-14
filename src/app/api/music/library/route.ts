import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: tracks, error } = await supabaseService()
      .from("music_tracks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
    }

    // Get daily limit info
    const today = new Date().toISOString().split("T")[0];
    const { data: limitRow } = await supabaseService()
      .from("music_daily_limits")
      .select("count")
      .eq("user_id", user.id)
      .eq("gen_date", today)
      .maybeSingle();

    return NextResponse.json({
      tracks: tracks || [],
      dailyUsed: limitRow?.count || 0,
      dailyLimit: 10,
    });
  } catch (error) {
    console.error("Music library error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
