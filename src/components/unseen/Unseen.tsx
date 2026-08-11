"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { UnseenProfile } from "@/lib/unseen/types";
import UnseenBackground from "./UnseenBackground";
import UnseenLanding from "./UnseenLanding";
import UnseenOnboarding from "./UnseenOnboarding";
import UnseenProfileCreator from "./UnseenProfileCreator";
import UnseenDiscovery from "./UnseenDiscovery";
import UnseenReveal from "./UnseenReveal";
import UnseenDashboard from "./UnseenDashboard";
import UnseenPreferences from "./UnseenPreferences";
import UnseenSafety from "./UnseenSafety";

type View = "landing" | "onboarding" | "create-profile" | "dashboard" | "discovery" | "reveal" | "preferences" | "safety";

export default function Unseen() {
  const { userId } = useAuth();
  const [view, setView] = useState<View>("landing");
  const [profile, setProfile] = useState<UnseenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    async function checkProfile() {
      if (!userId) return;
      const client = supabase();
      const { data } = await client
        .from("unseen_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      setProfile(data);
      setLoading(false);
    }
    checkProfile();
  }, [userId]);

  function handleEnter() {
    if (profile) {
      setView("dashboard");
    } else {
      setView("onboarding");
    }
  }

  function handleOnboardingConfirm() {
    setView("create-profile");
  }

  function handleProfileComplete() {
    // Reload profile
    if (userId) {
      const client = supabase();
      client.from("unseen_profiles").select("*").eq("user_id", userId).single().then(({ data }) => {
        setProfile(data);
        setView("dashboard");
      });
    }
  }

  function handleMatch(matchId: string) {
    setSelectedMatchId(matchId);
    setView("reveal");
  }

  if (loading) {
    return (
      <>
        <UnseenBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="text-sm animate-pulse" style={{ color: "rgba(148,163,184,0.5)" }}>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UnseenBackground mood={view === "reveal" ? "reveal" : view === "discovery" ? "discovery" : "default"} />

      <div className="relative z-10">
        {view === "landing" && (
          <UnseenLanding onEnter={handleEnter} />
        )}

        {view === "onboarding" && (
          <UnseenOnboarding onConfirm={handleOnboardingConfirm} onBack={() => setView("landing")} />
        )}

        {view === "create-profile" && (
          <UnseenProfileCreator onComplete={handleProfileComplete} onBack={() => setView("onboarding")} />
        )}

        {view === "dashboard" && (
          <UnseenDashboard
            onDiscover={() => setView("discovery")}
            onReveal={(id) => { setSelectedMatchId(id); setView("reveal"); }}
            onEditProfile={() => setView("create-profile")}
            onPreferences={() => setView("preferences")}
            onSafety={() => setView("safety")}
          />
        )}

        {view === "discovery" && (
          <UnseenDiscovery
            onMatch={handleMatch}
            onBack={() => setView("dashboard")}
          />
        )}

        {view === "reveal" && selectedMatchId && (
          <UnseenReveal
            matchId={selectedMatchId}
            onBack={() => { setSelectedMatchId(null); setView("dashboard"); }}
          />
        )}

        {view === "preferences" && (
          <UnseenPreferences onBack={() => setView("dashboard")} />
        )}

        {view === "safety" && (
          <UnseenSafety onBack={() => setView("dashboard")} />
        )}
      </div>
    </>
  );
}
