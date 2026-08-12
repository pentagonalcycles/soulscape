import { NextRequest, NextResponse } from "next/server";
import { stripe, getMonthlyPriceId } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

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

    const priceId = getMonthlyPriceId();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe().checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/account?upgraded=true`,
      cancel_url: `${origin}/shop`,
      allow_promotion_codes: true,
      metadata: { userId: user.id },
      ...(user.email ? { customer_email: user.email } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Membership checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
