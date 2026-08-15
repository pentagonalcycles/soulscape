import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file_name, file_type, file_url, file_size, description, is_downloadable } = body;

    if (!file_name || !file_type || !file_url || !file_size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: `Auth failed: ${authError?.message || "no user"}` }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: dbData, error: dbError } = await admin
      .from("community_files")
      .insert({
        user_id: user.id,
        file_name,
        file_type,
        file_url,
        file_size,
        description: description || "",
        is_downloadable: is_downloadable !== false,
        category: file_type,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: dbData });
  } catch (error) {
    return NextResponse.json({ error: `Server error: ${String(error)}` }, { status: 500 });
  }
}
