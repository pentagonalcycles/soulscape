import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export const runtime = "nodejs";

const NAME_MAX = 40;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitor_id, name } = body || {};

    if (!visitor_id || typeof visitor_id !== "string") {
      return NextResponse.json({ error: "Missing visitor_id" }, { status: 400 });
    }
    const cleanName =
      typeof name === "string" ? name.trim().slice(0, NAME_MAX) : "";
    if (!cleanName) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const client = supabaseService();
    const { error } = await client
      .from("visits")
      .update({ visitor_name: cleanName })
      .eq("visitor_id", visitor_id)
      .is("user_id", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, name: cleanName });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
