import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function ensureAnonymousAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Anonymous auth failed:", error.message);
      return null;
    }
    return (await supabase.auth.getSession()).data.session;
  }

  return session;
}

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          theme_colors: Record<string, string>;
          ambient_settings: Record<string, unknown>;
          created_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          content_type: "text" | "poem" | "story" | "art" | "voice";
          room_id: string | null;
          emotion_tags: string[];
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          reaction_type: "understanding" | "hope" | "company" | "less_alone" | "comfort";
          created_at: string;
        };
      };
      users: {
        Row: {
          id: string;
          identity_type: "anonymous" | "alias" | "real";
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
