import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/monetisation";

export async function GET() {
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user || !(await checkIsAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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

  const { data: donations } = await client
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: bookings } = await client
    .from("bookings")
    .select("*, users(display_name, identity_type), experiences(title, experience_date)")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ purchases: purchases || [], memberships: memberships || [], donations: donations || [], bookings: bookings || [] });
}
