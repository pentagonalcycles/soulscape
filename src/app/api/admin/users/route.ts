import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET(req: NextRequest) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search");

  let query = client
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    query = query.ilike("display_name", `%${search}%`);
  }

  const { data: users } = await query;
  if (!users) return NextResponse.json([]);

  // Enrich with content counts
  const enriched = await Promise.all(
    users.map(async (u: Record<string, unknown>) => {
      const [posts, neras, ideas, poems] = await Promise.all([
        client.from("posts").select("id", { count: "exact", head: true }).eq("user_id", u.id),
        client.from("neras").select("id", { count: "exact", head: true }).eq("host_id", u.id),
        client.from("ideas").select("id", { count: "exact", head: true }).eq("user_id", u.id),
        client.from("poems").select("id", { count: "exact", head: true }).eq("user_id", u.id),
      ]);

      return {
        id: u.id,
        display_name: u.display_name,
        identity_type: u.identity_type,
        avatar_url: u.avatar_url,
        bio: u.bio,
        is_banned: u.is_banned || false,
        ban_reason: u.ban_reason || null,
        banned_at: u.banned_at || null,
        created_at: u.created_at,
        post_count: posts.count || 0,
        nera_count: neras.count || 0,
        idea_count: ideas.count || 0,
        poem_count: poems.count || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function PUT(req: NextRequest) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { user_id, is_banned, ban_reason } = body;

  const updateData: Record<string, unknown> = {
    is_banned,
    ban_reason: ban_reason || null,
    banned_at: is_banned ? new Date().toISOString() : null,
  };

  const { error } = await client.from("users").update(updateData).eq("id", user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
