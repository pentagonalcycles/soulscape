import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase().auth.getUser(token);
  if (authError || !user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const client = supabaseService();

  try {
    const { data: purchases } = await client
      .from("purchases")
      .select("*, users(display_name, identity_type), products(title)")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: memberships } = await client
      .from("memberships")
      .select("*, users(display_name, identity_type)")
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({ purchases: purchases || [], memberships: memberships || [] });
  } catch {
    // Tables may not exist
    return NextResponse.json({ purchases: [], memberships: [] });
  }
}
