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
  const { data } = await client.from("products").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

  const body = await req.json();
  const { data, error } = await client.from("products").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

  const body = await req.json();
  const { id, ...updates } = body;
  const { data, error } = await client.from("products").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const client = auth.client;

  const { id } = await req.json();
  const { error } = await client.from("products").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
