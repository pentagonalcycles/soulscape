import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata?.type === "feature_unlock" && metadata?.featureId) {
      const client = supabaseService();

      // Record the feature purchase
      await client.from("feature_purchases").upsert(
        {
          user_id: metadata.userId,
          feature_id: metadata.featureId,
          stripe_session_id: session.id,
          amount_cents: session.amount_total || 0,
          currency: session.currency || "gbp",
          status: "completed",
        },
        { onConflict: "user_id,feature_id" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
