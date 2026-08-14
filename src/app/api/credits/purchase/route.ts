import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

const CREDIT_PACKAGES = [
  { id: "credits_100", credits: 100, priceInCents: 1000, label: "10 Songs" },
  { id: "credits_500", credits: 500, priceInCents: 4000, label: "50 Songs" },
];

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { packageId } = body;

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Elovayne Music — ${pkg.label}`,
              description: `${pkg.credits} credits for AI music generation`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        type: "credit_purchase",
        credits: String(pkg.credits),
        packageId: pkg.id,
      },
      success_url: `${request.headers.get("origin")}/music?credits=purchased`,
      cancel_url: `${request.headers.get("origin")}/music`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Credit purchase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
