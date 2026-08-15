import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = _req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase().auth.getUser(token);
  if (authError || !user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const client = supabaseService();
  const { id } = await params;

  // Fetch user profile
  const { data: profile } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Fetch all their content in parallel
  const [posts, ideas, poems, wishLanterns] = await Promise.all([
    client.from("posts").select("id, content, content_type, is_anonymous, display_name, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("ideas").select("id, title, description, category, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("poems").select("id, title, content, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("wish_lanterns").select("id, message, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
  ]);

  return NextResponse.json({
    profile,
    content: {
      posts: posts.data || [],
      ideas: ideas.data || [],
      poems: poems.data || [],
      wish_lanterns: wishLanterns.data || [],
    },
  });
}
