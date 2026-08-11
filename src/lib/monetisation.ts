import { supabase } from "./supabase";

export interface Membership {
  id: string;
  user_id: string;
  status: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  details: string | null;
  price_cents: number;
  image_url: string | null;
  category: string;
  download_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string | null;
  experience_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string | null;
  experience_date: string;
  experience_time: string | null;
  price_cents: number;
  total_spots: number;
  booked_spots: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  experience_id: string;
  spots: number;
  amount_cents: number;
  status: string;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id: string | null;
  amount_cents: number;
  status: string;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export async function getUserMembership(userId: string): Promise<Membership | null> {
  const client = supabase();
  const { data } = await client
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Membership | null;
}

export async function checkIsPlus(userId: string): Promise<boolean> {
  const membership = await getUserMembership(userId);
  return membership?.status === "active";
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const client = supabase();
  const { data } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const client = supabase();
  const { data } = await client
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Purchase[]) || [];
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const client = supabase();
  const { data } = await client
    .from("bookings")
    .select("*, experiences(title, experience_date, experience_time)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Booking[]) || [];
}

export async function getUserDonations(userId: string): Promise<Donation[]> {
  const client = supabase();
  const { data } = await client
    .from("donations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Donation[]) || [];
}

export async function getAllProducts(): Promise<Product[]> {
  const client = supabase();
  const { data } = await client
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Product[]) || [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const client = supabase();
  const { data } = await client
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  return data as Product | null;
}

export async function getAllExperiences(): Promise<Experience[]> {
  const client = supabase();
  const { data } = await client
    .from("experiences")
    .select("*")
    .eq("is_active", true)
    .order("experience_date", { ascending: true });
  return (data as Experience[]) || [];
}

export async function getExperience(id: string): Promise<Experience | null> {
  const client = supabase();
  const { data } = await client
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();
  return data as Experience | null;
}
