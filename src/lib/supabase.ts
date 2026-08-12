import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

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

let serviceClient: SupabaseClient | null = null;

export function supabaseService(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  return serviceClient;
}

export async function getServerUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  const client = createSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;
  return { user, client };
}
