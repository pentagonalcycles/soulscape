"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  identity_type: "anonymous" | "alias" | "real";
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  contact_info: string | null;
  contact_type: "email" | "discord" | "website" | "other" | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  accent_color: string;
  show_starfield: boolean;
  nebula_intensity: "off" | "subtle" | "normal" | "vivid";
  animation_speed: "minimal" | "normal";
  compact_mode: boolean;
  ambient_sound: boolean;
  sound_volume: number;
}

interface AuthContextType {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, "display_name" | "bio" | "avatar_url" | "identity_type" | "contact_info" | "contact_type">>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAnonymous: boolean;
}

const defaultPreferences: UserPreferences = {
  accent_color: "#9d7cd8",
  show_starfield: true,
  nebula_intensity: "normal",
  animation_speed: "normal",
  compact_mode: false,
  ambient_sound: false,
  sound_volume: 0.5,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  loading: true,
  userProfile: null,
  userPreferences: defaultPreferences,
  refreshProfile: async () => {},
  updateProfile: async () => {},
  updatePreferences: async () => {},
  signInWithEmail: async () => ({}),
  signOut: async () => {},
  isAnonymous: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);

  const fetchProfile = useCallback(async (userId: string) => {
    const client = supabase();

    const { data: profile } = await client
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserProfile(profile as UserProfile);
    }

    const { data: prefs } = await client
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (prefs) {
      setUserPreferences(prefs as UserPreferences);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const client = supabase();
    const { data: { session: currentSession } } = await client.auth.getSession();
    if (currentSession?.user?.id) {
      await fetchProfile(currentSession.user.id);
    }
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "display_name" | "bio" | "avatar_url" | "identity_type" | "contact_info" | "contact_type">>) => {
    const client = supabase();
    const { data: { session: currentSession } } = await client.auth.getSession();
    if (!currentSession?.user?.id) return;

    const { error } = await client
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", currentSession.user.id);

    if (!error) {
      await fetchProfile(currentSession.user.id);
    }
  }, [fetchProfile]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const client = supabase();
    const { data: { session: currentSession } } = await client.auth.getSession();
    if (!currentSession?.user?.id) return;

    setUserPreferences((prev) => ({ ...prev, ...updates }));

    const { error } = await client
      .from("user_preferences")
      .upsert({
        user_id: currentSession.user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Error updating preferences:", error.message);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const client = supabase();
    const { error } = await client.auth.signInWithOtp({ email });
    if (error) {
      return { error: error.message };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const client = supabase();
    await client.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setUserPreferences(defaultPreferences);
  }, []);

  const isAnonymous = session?.user?.app_metadata?.provider === "anonymous" ||
    !session?.user?.app_metadata?.provider;

  useEffect(() => {
    const client = supabase();

    const initAuth = async () => {
      const {
        data: { session: existingSession },
      } = await client.auth.getSession();

      if (existingSession) {
        setSession(existingSession);
        await ensureUserProfile(client, existingSession.user.id);
        await fetchProfile(existingSession.user.id);
        setLoading(false);
        return;
      }

      const { error } = await client.auth.signInAnonymously();
      if (!error) {
        const {
          data: { session: newSession },
        } = await client.auth.getSession();
        setSession(newSession);
        if (newSession) {
          await ensureUserProfile(client, newSession.user.id);
          await fetchProfile(newSession.user.id);
        }
      }

      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await ensureUserProfile(client, newSession.user.id);
        await fetchProfile(newSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.user?.id ?? null,
        loading,
        userProfile,
        userPreferences,
        refreshProfile,
        updateProfile,
        updatePreferences,
        signInWithEmail,
        signOut,
        isAnonymous,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function ensureUserProfile(client: ReturnType<typeof supabase>, userId: string) {
  const { data } = await client.from("users").select("id").eq("id", userId).single();

  if (!data) {
    await client.from("users").insert({
      id: userId,
      identity_type: "anonymous",
    });
  }
}
