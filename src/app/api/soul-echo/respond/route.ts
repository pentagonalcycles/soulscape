import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { matchId, content, messageType } = await request.json();

    if (!matchId || !content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Match ID and content are required" }, { status: 400 });
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

    // Verify the user is part of this match
    const { data: match } = await client
      .from("soul_echo_matches")
      .select("*")
      .eq("id", matchId)
      .eq("status", "active")
      .single();

    if (!match) {
      return NextResponse.json({ error: "Match not found or inactive" }, { status: 404 });
    }

    const matchData = match as { user_a_id: string; user_b_id: string };
    if (matchData.user_a_id !== user.id && matchData.user_b_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Insert message
    const { data: message, error: insertError } = await client
      .from("soul_echo_messages")
      .insert({
        match_id: matchId,
        user_id: user.id,
        content: content.trim(),
        message_type: messageType || "text",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
