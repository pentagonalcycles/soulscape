"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: Session | null;
  userId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = supabase();

    const initAuth = async () => {
      const {
        data: { session: existingSession },
      } = await client.auth.getSession();

      if (existingSession) {
        setSession(existingSession);
        await ensureUserProfile(client, existingSession.user.id);
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.user?.id ?? null,
        loading,
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
