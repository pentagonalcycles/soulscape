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
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  const results: Record<string, unknown>[] = [];

  // Fetch from all 4 report tables
  const tables = [
    { name: "reports", label: "post", joinTable: "posts", joinField: "post_id" },
    { name: "nera_reports", label: "nera", joinTable: "neras", joinField: "nera_id" },
  ];

  for (const t of tables) {
    if (type && type !== "all" && type !== t.label) continue;

    let query = client.from(t.name).select("*").order("created_at", { ascending: false });
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data } = await query;
    if (!data) continue;

    for (const report of data) {
      const r = report as Record<string, unknown>;
      let contentPreview = "Content deleted";
      let authorName = "Unknown";

      // Try to fetch the reported content
      if (t.label === "post" && r.post_id) {
        const { data: post } = await client
          .from("posts")
          .select("content, content_type, is_anonymous, display_name, user_id")
          .eq("id", r.post_id)
          .single();
        if (post) {
          contentPreview = (post.content as string)?.slice(0, 200) || "Empty post";
          authorName = post.is_anonymous ? "Anonymous" : (post.display_name as string) || "Anonymous";
        }
      } else if (t.label === "nera" && r.nera_id) {
        const { data: nera } = await client
          .from("neras")
          .select("title, description, host_id")
          .eq("id", r.nera_id)
          .single();
        if (nera) {
          contentPreview = `${nera.title}: ${(nera.description as string)?.slice(0, 150) || ""}`;
          const { data: host } = await client.from("users").select("display_name").eq("id", nera.host_id).single();
          authorName = host?.display_name || "Unknown";
        }
      }

      results.push({
        id: r.id,
        source_type: t.label,
        reason: r.reason,
        details: r.details || r.description || null,
        status: r.status,
        created_at: r.created_at,
        reporter_id: r.reporter_id,
        content_id: r.post_id || r.nera_id,
        content_preview: contentPreview,
        author_name: authorName,
      });
    }
  }

  // Sort all results by created_at descending
  results.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());

  return NextResponse.json(results);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

  const body = await req.json();
  const { id, status, source_type } = body;

  const tableMap: Record<string, string> = {
    post: "reports",
    nera: "nera_reports",
  };

  const table = tableMap[source_type];
  if (!table) return NextResponse.json({ error: "Invalid source type" }, { status: 400 });

  const { error } = await client.from(table).update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
