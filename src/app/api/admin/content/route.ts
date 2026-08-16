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

  async function fetchTable(tableName: string, typeLabel: string) {
    try {
      const { data } = await client
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (data) results.push(...data.map(d => ({ ...d, _type: typeLabel })));
    } catch {
      // Table may not exist
    }
  }

  if (type === "all" || type === "posts") await fetchTable("posts", "posts");
  if (type === "all" || type === "ideas") await fetchTable("ideas", "ideas");
  if (type === "all" || type === "poems") await fetchTable("poems", "poems");
  if (type === "all" || type === "wish_lanterns") await fetchTable("wish_lanterns", "wish_lanterns");

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
    ideas: "ideas",
    poems: "poems",
    wish_lanterns: "wish_lanterns",
  };

  const table = tableMap[type];
  if (!table) return NextResponse.json({ error: "Invalid content type" }, { status: 400 });

  const { error } = await client.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
