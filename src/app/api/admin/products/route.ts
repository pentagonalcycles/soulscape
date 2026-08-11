import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET() {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { data } = await client.from("products").select("*").order("sort_order", { ascending: true });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { data, error } = await client.from("products").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  const { data, error } = await client.from("products").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  const { error } = await client.from("products").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
