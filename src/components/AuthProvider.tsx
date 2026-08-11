"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
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
  default_page: string;
  anonymous_default: boolean;
  text_size: "small" | "medium" | "large";
  reduce_motion: boolean;
}

interface AuthContextType {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences;
  membership: { status: string; plan: string } | null;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, "display_name" | "bio" | "avatar_url" | "identity_type" | "contact_info" | "contact_type">>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAnonymous: boolean;
}

const defaultPreferences: UserPreferences = {
  accent_color: "#0d9488",
  default_page: "/",
  anonymous_default: true,
  text_size: "medium",
  reduce_motion: false,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  loading: true,
  userProfile: null,
  userPreferences: defaultPreferences,
  membership: null,
  isAdmin: false,
  isBanned: false,
  banReason: null,
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
  const [membership, setMembership] = useState<{ status: string; plan: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  useEffect(() => { sessionRef.current = session; });

  const fetchProfile = useCallback(async (userId: string) => {
    const client = supabase();

    const { data: profile } = await client
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserProfile(profile as UserProfile);
      setIsBanned((profile as Record<string, unknown>).is_banned === true);
      setBanReason((profile as Record<string, unknown>).ban_reason as string | null);
    }

    const { data: prefs } = await client
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (prefs) {
      setUserPreferences(prefs as UserPreferences);
    }

    try {
      const { data: mem } = await client
        .from("memberships")
        .select("status, plan")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      setMembership(mem as { status: string; plan: string } | null);
    } catch {
      // memberships table may not exist
    }

    try {
      const { data: admin } = await client
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      setIsAdmin(!!admin);
    } catch {
      // admin_users table may not exist
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (currentSession?.user?.id) {
      await fetchProfile(currentSession.user.id);
    }
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "display_name" | "bio" | "avatar_url" | "identity_type" | "contact_info" | "contact_type">>) => {
    const currentSession = sessionRef.current;
    if (!currentSession?.user?.id) return;

    const client = supabase();
    const { error } = await client
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", currentSession.user.id);

    if (!error) {
      await fetchProfile(currentSession.user.id);
    }
  }, [fetchProfile]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const currentSession = sessionRef.current;
    if (!currentSession?.user?.id) {
      console.error("No session found when updating preferences");
      return;
    }

    setUserPreferences((prev) => ({ ...prev, ...updates }));

    const client = supabase();
    const { error } = await client
      .from("user_preferences")
      .upsert({
        user_id: currentSession.user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Error updating preferences:", error.message, error);
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
    sessionRef.current = null;
    setUserProfile(null);
    setUserPreferences(defaultPreferences);
    setMembership(null);
    setIsAdmin(false);
    setIsBanned(false);
    setBanReason(null);
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
      } else {
        console.error("Anonymous auth failed:", error.message);
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
        membership,
        isAdmin,
        isBanned,
        banReason,
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
