import { supabase } from "./supabase";

export interface Feature {
  id: string;
  name: string;
  description: string;
  pricePence: number;
  priceLabel: string;
  icon: string;
  path: string;
}

export const FEATURES: Record<string, Feature> = {
  "luna-ai": {
    id: "luna-ai",
    name: "Luna AI",
    description: "Your personal AI companion — chat, code, create, and get help",
    pricePence: 699,
    priceLabel: "£6.99",
    icon: "✦",
    path: "/elyra",
  },
};

export const ALL_FEATURES = Object.values(FEATURES);

export const BUNDLE_PRICE = 500;
export const BUNDLE_LABEL = "£5";

export async function hasUnlocked(userId: string | null, featureId: string): Promise<boolean> {
  if (!userId) return false;

  const client = supabase();

  // Check individual feature purchase
  const { data: purchase } = await client
    .from("feature_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("feature_id", featureId)
    .eq("status", "completed")
    .maybeSingle();

  if (purchase) return true;

  // Check if user has "all-access" bundle
  const { data: bundle } = await client
    .from("feature_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("feature_id", "all-access")
    .eq("status", "completed")
    .maybeSingle();

  return !!bundle;
}

export async function getUnlockedFeatures(userId: string | null): Promise<string[]> {
  if (!userId) return [];

  const client = supabase();
  const { data } = await client
    .from("feature_purchases")
    .select("feature_id")
    .eq("user_id", userId)
    .eq("status", "completed");

  if (!data) return [];
  return data.map((r) => r.feature_id);
}
