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
  "dream-canvas": {
    id: "dream-canvas",
    name: "Dream Canvas",
    description: "Digital painting studio with 24+ premium brushes and layers",
    pricePence: 200,
    priceLabel: "£2",
    icon: "🖌️",
    path: "/dream-canvas",
  },
  "mural": {
    id: "mural",
    name: "Mural",
    description: "Real-time collaborative painting with other visitors",
    pricePence: 100,
    priceLabel: "£1",
    icon: "🎨",
    path: "/mural",
  },
  "nebula-orb": {
    id: "nebula-orb",
    name: "Nebula Orb",
    description: "Multiplayer cosmic arena — grow, compete, survive",
    pricePence: 100,
    priceLabel: "£1",
    icon: "🌐",
    path: "/nebula-orb",
  },
  "cosmic-camera": {
    id: "cosmic-camera",
    name: "Cosmic Camera",
    description: "36 photo filters and effects for your camera",
    pricePence: 100,
    priceLabel: "£1",
    icon: "📷",
    path: "/camera",
  },
  "tarot": {
    id: "tarot",
    name: "Tarot",
    description: "Interactive tarot card readings with AI interpretation",
    pricePence: 100,
    priceLabel: "£1",
    icon: "🃏",
    path: "/tarot",
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
