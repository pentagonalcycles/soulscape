import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase().auth.getUser(token);
  if (error || !user) return null;
  if (!(await checkIsAdmin(user.id))) return null;
  return { user, client: supabaseService() };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

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
      const [posts, ideas, poems] = await Promise.all([
        client.from("posts").select("id", { count: "exact", head: true }).eq("user_id", u.id),
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
        idea_count: ideas.count || 0,
        poem_count: poems.count || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

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
