import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES: Record<string, string[]> = {
  music: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac", "audio/mp4", "audio/aac"],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

function getFileCategory(mimeType: string): "music" | "image" | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) return category as "music" | "image";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) || "";
    const isDownloadable = formData.get("isDownloadable") !== "false";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
    }

    const category = getFileCategory(file.type);
    if (!category) {
      return NextResponse.json({ error: "File type not allowed. Only music and image files are accepted." }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Use a temporary client to validate the user's token
    const { createClient } = await import("@supabase/supabase-js");
    const tempClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const { data: { user }, error: authError } = await tempClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for storage + DB (bypasses RLS)
    const client = supabaseService();

    const ext = file.name.split(".").pop() || "bin";
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await client.storage
      .from("community-files")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const { data: urlData } = client.storage
      .from("community-files")
      .getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await client
      .from("community_files")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: category,
        file_url: urlData.publicUrl,
        file_size: file.size,
        description,
        is_downloadable: isDownloadable,
        category,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: dbData });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
