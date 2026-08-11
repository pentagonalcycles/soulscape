import { NextRequest, NextResponse } from "next/server";
import { stripe, getMonthlyPriceId } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const priceId = getMonthlyPriceId();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe().checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/account?upgraded=true`,
      cancel_url: `${origin}/shop`,
      allow_promotion_codes: true,
      metadata: { userId },
      ...(email ? { customer_email: email } : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Membership checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
