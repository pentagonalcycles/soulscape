import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let browserClient: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (typeof window === "undefined") {
    return createSupabaseClient();
  }
  if (!browserClient) {
    browserClient = createSupabaseClient();
  }
  return browserClient;
}
