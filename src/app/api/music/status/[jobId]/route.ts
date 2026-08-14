import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

    const { jobId } = await params;

    // Find the track by apiframe job ID
    const { data: track, error: trackError } = await supabaseService()
      .from("music_tracks")
      .select("*")
      .eq("user_id", user.id)
      .contains("metadata", JSON.stringify({ apiframe_job_id: jobId }))
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // If already completed or failed, return immediately
    if (track.status === "completed" || track.status === "failed") {
      return NextResponse.json({
        status: track.status,
        audioUrl: track.audio_url,
        imageUrl: track.image_url,
        title: track.title,
      });
    }

    // Poll Apiframe for status
    const apiKey = process.env.APIFRAME_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const apiResponse = await fetch(`https://api.apiframe.ai/v2/jobs/${jobId}`, {
      headers: { "X-API-Key": apiKey },
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ status: track.status, audioUrl: null });
    }

    const apiData = await apiResponse.json();
    const apiStatus = apiData.status?.toUpperCase();

    if (apiStatus === "COMPLETED" || apiStatus === "SUCCEEDED") {
      const tracks = apiData.result?.tracks || apiData.tracks || [];
      const firstTrack = tracks[0];

      if (firstTrack?.audioUrl || firstTrack?.audio_url) {
        const audioUrl = firstTrack.audioUrl || firstTrack.audio_url;
        const imageUrl = firstTrack.imageUrl || firstTrack.image_url || null;
        const duration = firstTrack.duration || 180;

        await supabaseService()
          .from("music_tracks")
          .update({
            status: "completed",
            audio_url: audioUrl,
            image_url: imageUrl,
            duration,
            updated_at: new Date().toISOString(),
          })
          .eq("id", track.id);

        return NextResponse.json({
          status: "completed",
          audioUrl,
          imageUrl,
          title: track.title,
          duration,
        });
      }
    }

    if (apiStatus === "FAILED" || apiStatus === "ERROR") {
      await supabaseService()
        .from("music_tracks")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", track.id);

      return NextResponse.json({ status: "failed", audioUrl: null });
    }

    // Still processing
    return NextResponse.json({ status: "pending", audioUrl: null });
  } catch (error) {
    console.error("Music status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
