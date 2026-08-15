import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Auth failed" }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: file, error: fetchError } = await admin
      .from("community_files")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const urlParts = file.file_url.split("/community-files/");
    if (urlParts.length === 2) {
      const storagePath = urlParts[1];
      await admin.storage.from("community-files").remove([storagePath]);
    }

    const { error: dbError } = await admin
      .from("community_files")
      .delete()
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: `Server error: ${String(error)}` }, { status: 500 });
  }
}
