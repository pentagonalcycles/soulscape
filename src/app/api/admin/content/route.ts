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
  const type = url.searchParams.get("type") || "all";
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const results: Record<string, unknown>[] = [];

  const fetchers: PromiseLike<void>[] = [];

  if (type === "all" || type === "posts") {
    fetchers.push(
      client.from("posts").select("id, content, content_type, is_anonymous, display_name, user_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(({ data }) => {
        if (data) results.push(...data.map(d => ({ ...d, _type: "posts" })));
      })
    );
  }

  if (type === "all" || type === "neras") {
    fetchers.push(
      client.from("neras").select("id, title, description, status, host_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(async ({ data }) => {
        if (data) {
          for (const n of data) {
            const { data: host } = await client.from("users").select("display_name").eq("id", n.host_id).single();
            results.push({ ...n, _type: "neras", author_name: host?.display_name || "Unknown" });
          }
        }
      })
    );
  }

  if (type === "all" || type === "ideas") {
    fetchers.push(
      client.from("ideas").select("id, title, description, category, user_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(({ data }) => {
        if (data) results.push(...data.map(d => ({ ...d, _type: "ideas" })));
      })
    );
  }

  if (type === "all" || type === "poems") {
    fetchers.push(
      client.from("poems").select("id, title, content, user_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(({ data }) => {
        if (data) results.push(...data.map(d => ({ ...d, _type: "poems" })));
      })
    );
  }

  if (type === "all" || type === "stargazer") {
    fetchers.push(
      client.from("stargazer_messages").select("id, content, user_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(({ data }) => {
        if (data) results.push(...data.map(d => ({ ...d, _type: "stargazer" })));
      })
    );
  }

  if (type === "all" || type === "wish_lanterns") {
    fetchers.push(
      client.from("wish_lanterns").select("id, message, user_id, created_at").order("created_at", { ascending: false }).range(offset, offset + limit - 1).then(({ data }) => {
        if (data) results.push(...data.map(d => ({ ...d, _type: "wish_lanterns" })));
      })
    );
  }

  await Promise.all(fetchers);

  // Sort combined results by created_at
  results.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());

  return NextResponse.json(results.slice(0, limit));
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

  const body = await req.json();
  const { type, id } = body;

  const tableMap: Record<string, string> = {
    posts: "posts",
    neras: "neras",
    ideas: "ideas",
    poems: "poems",
    stargazer: "stargazer_messages",
    wish_lanterns: "wish_lanterns",
  };

  const table = tableMap[type];
  if (!table) return NextResponse.json({ error: "Invalid content type" }, { status: 400 });

  const { error } = await client.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
