import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase, supabaseService } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase().auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = supabaseService();
    const { data: membership } = await client
      .from("memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership?.stripe_customer_id) {
      return NextResponse.json({ error: "No active membership found" }, { status: 404 });
    }

    const session = await stripe().billingPortal.sessions.create({
      customer: membership.stripe_customer_id,
      return_url: `${req.headers.get("origin") || "http://localhost:3000"}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Portal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
