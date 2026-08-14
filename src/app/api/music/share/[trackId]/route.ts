import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
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

    const { trackId } = await params;
    const body = await request.json().catch(() => ({}));

    // Verify ownership
    const { data: track, error: trackError } = await supabaseService()
      .from("music_tracks")
      .select("id, is_shared")
      .eq("id", trackId)
      .eq("user_id", user.id)
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const newShared = !track.is_shared;
    const { error: updateError } = await supabaseService()
      .from("music_tracks")
      .update({
        is_shared: newShared,
        share_text: body.share_text || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trackId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ is_shared: newShared });
  } catch (error) {
    console.error("Music share error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
