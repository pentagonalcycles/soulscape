import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  // Fetch user profile
  const { data: profile } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Fetch all their content in parallel
  const [posts, neras, ideas, poems, stargazer, wishLanterns] = await Promise.all([
    client.from("posts").select("id, content, content_type, is_anonymous, display_name, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("neras").select("id, title, description, status, created_at").eq("host_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("ideas").select("id, title, description, category, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("poems").select("id, title, content, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("stargazer_messages").select("id, content, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    client.from("wish_lanterns").select("id, message, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
  ]);

  return NextResponse.json({
    profile,
    content: {
      posts: posts.data || [],
      neras: neras.data || [],
      ideas: ideas.data || [],
      poems: poems.data || [],
      stargazer_messages: stargazer.data || [],
      wish_lanterns: wishLanterns.data || [],
    },
  });
}
