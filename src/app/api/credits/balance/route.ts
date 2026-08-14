import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseService()
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    const credits = profile?.credits ?? 0;

    const { data: recentTransactions } = await supabaseService()
      .from("credit_transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      credits,
      costPerSong: 10,
      transactions: recentTransactions || [],
    });
  } catch (error) {
    console.error("Credits balance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
