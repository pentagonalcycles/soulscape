import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

const CREDITS_PER_SONG = 10;

const STYLE_PRESETS: Record<string, string> = {
  pop: "catchy pop song, polished production, upbeat",
  rock: "driving rock anthem, electric guitars, powerful drums",
  hiphop: "modern hip-hop beat, rhythmic flow, bass heavy",
  electronic: "electronic dance music, synthesizers, energetic",
  jazz: "smooth jazz, saxophone, walking bass, relaxed",
  classical: "orchestral composition, strings and piano, cinematic",
  rnb: "soulful R&B, smooth vocals, groovy",
  folk: "acoustic folk, storytelling, warm and intimate",
  lofi: "lo-fi beats, chill, relaxing, mellow",
  ambient: "ambient soundscape, ethereal textures, atmospheric",
  synthwave: "retro synthwave, neon, 80s aesthetic, pulsing",
  acoustic: "unplugged acoustic, intimate, raw",
};

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { prompt, lyrics, style, mood, title } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check credits
    const { data: profile } = await supabaseService()
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    const currentCredits = profile?.credits ?? 0;
    if (currentCredits < CREDITS_PER_SONG) {
      return NextResponse.json(
        { error: "Not enough credits", creditsNeeded: CREDITS_PER_SONG, creditsAvailable: currentCredits },
        { status: 402 }
      );
    }

    // Build the full prompt with style and mood modifiers
    let fullPrompt = prompt.trim();
    if (style && STYLE_PRESETS[style]) {
      fullPrompt += `, ${STYLE_PRESETS[style]}`;
    } else if (style) {
      fullPrompt += `, ${style}`;
    }
    if (mood) {
      fullPrompt += `, ${mood} mood`;
    }

    // Call Apiframe Suno API
    const apiKey = process.env.APIFRAME_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Music generation service not configured" }, { status: 500 });
    }

    const sunoParams: Record<string, unknown> = {
      model_version: "V5_5",
    };

    if (lyrics && lyrics.trim().length > 0) {
      sunoParams.custom_mode = true;
      sunoParams.lyrics = lyrics.trim();
      sunoParams.style = fullPrompt;
      if (title) sunoParams.title = title.trim();
    }

    const apiResponse = await fetch("https://api.apiframe.ai/v2/music/generate", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: lyrics && lyrics.trim().length > 0 ? undefined : fullPrompt,
        model: "suno",
        sunoParams,
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("Apiframe error:", errText);
      return NextResponse.json({ error: "Music generation failed" }, { status: 502 });
    }

    const apiData = await apiResponse.json();
    const jobId = apiData.jobId || apiData.id || apiData.job_id;

    if (!jobId) {
      return NextResponse.json({ error: "No job ID returned" }, { status: 502 });
    }

    // Store track in database
    const { data: track, error: insertError } = await supabaseService()
      .from("music_tracks")
      .insert({
        user_id: user.id,
        title: title?.trim() || "Untitled",
        prompt: prompt.trim(),
        lyrics: lyrics?.trim() || null,
        style: style || null,
        mood: mood || null,
        status: "pending",
        metadata: { apiframe_job_id: jobId, full_prompt: fullPrompt },
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      return NextResponse.json({ error: "Failed to save track" }, { status: 500 });
    }

    // Deduct credits
    const newCredits = currentCredits - CREDITS_PER_SONG;
    await supabaseService()
      .from("users")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // Log transaction
    await supabaseService()
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: -CREDITS_PER_SONG,
        type: "generation",
        description: `Generated: ${title?.trim() || "Untitled"}`,
      });

    return NextResponse.json({
      jobId,
      trackId: track.id,
      status: "pending",
      creditsRemaining: newCredits,
    });
  } catch (error) {
    console.error("Music generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
