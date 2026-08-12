import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const client = supabaseService();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (session.mode === "subscription" && userId) {
          const existing = await client
            .from("memberships")
            .select("id")
            .eq("stripe_subscription_id", session.subscription as string)
            .maybeSingle();
          if (!existing.data) {
            let priceId: string | undefined;
            if (session.subscription) {
              const sub = await stripe().subscriptions.retrieve(session.subscription as string);
              priceId = sub.items.data[0]?.price?.id;
            }
            await client.from("memberships").insert({
              user_id: userId,
              status: "active",
              plan: "plus_monthly",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              stripe_price_id: priceId,
            });
          }
        } else if (session.mode === "payment" && userId) {
          const existing = await client
            .from("purchases")
            .select("id")
            .eq("stripe_session_id", session.id)
            .maybeSingle();
          if (!existing.data) {
            const lineItems = await stripe().checkout.sessions.listLineItems(session.id);
            for (const item of lineItems.data) {
              const productId = item.price?.metadata?.product_id;
              if (productId) {
                const { data: purchase } = await client.from("purchases").insert({
                  user_id: userId,
                  product_id: productId,
                  stripe_payment_intent_id: session.payment_intent as string,
                  stripe_session_id: session.id,
                  amount_cents: item.amount_total || 0,
                  status: "completed",
                }).select("id").single();
                if (purchase) {
                  await client.from("downloads").insert({
                    user_id: userId,
                    purchase_id: purchase.id,
                    product_id: productId,
                  });
                }
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status =
          subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
            ? "past_due"
            : "expired";

        await client
          .from("memberships")
          .update({
            status,
            expires_at: new Date(
              (subscription as unknown as { current_period_end: number })
                .current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await client
          .from("memberships")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await client
          .from("purchases")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", pi.id);
        await client
          .from("donations")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
