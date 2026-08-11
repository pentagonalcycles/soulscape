import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function stripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_REPLACE_ME") {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local"
    );
  }

  stripeInstance = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });

  return stripeInstance;
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_REPLACE_ME";
}

export function getMonthlyPriceId(): string {
  return process.env.STRIPE_MONTHLY_PRICE_ID || "price_REPLACE_ME";
}
