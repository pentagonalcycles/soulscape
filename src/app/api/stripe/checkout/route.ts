import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { FEATURES } from "@/lib/feature-gate";

export async function POST(request: NextRequest) {
  try {
    const { featureId, successUrl, cancelUrl, userId } = await request.json();

    if (!featureId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const feature = FEATURES[featureId];
    if (!feature) {
      return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "https://elovayne.com";

    const session = await stripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: feature.name,
              description: feature.description,
            },
            unit_amount: feature.pricePence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        featureId,
        userId: userId || "anonymous",
        type: "feature_unlock",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
