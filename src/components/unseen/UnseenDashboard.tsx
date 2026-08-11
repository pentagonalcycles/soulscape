"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { UnseenMatch, UnseenProfile } from "@/lib/unseen/types";

interface UnseenDashboardProps {
  onDiscover: () => void;
  onReveal: (matchId: string) => void;
  onEditProfile: () => void;
  onPreferences: () => void;
  onSafety: () => void;
}

interface MatchWithOther extends UnseenMatch {
  other_profile: UnseenProfile;
}

export default function UnseenDashboard({ onDiscover, onReveal, onEditProfile, onPreferences, onSafety }: UnseenDashboardProps) {
  const { userId } = useAuth();
  const [matches, setMatches] = useState<MatchWithOther[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"discover" | "connections" | "messages">("discover");

  useEffect(() => {
    async function loadMatches() {
      if (!userId) return;
      const client = supabase();

      const { data } = await client
        .from("unseen_matches")
        .select("*")
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .neq("current_stage", "ended")
        .order("updated_at", { ascending: false });

      if (data) {
        const enriched: MatchWithOther[] = [];
        for (const m of data) {
          const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
          const { data: profile } = await client
            .from("unseen_profiles")
            .select("*")
            .eq("user_id", otherId)
            .single();
          if (profile) {
            enriched.push({ ...m, other_profile: profile });
          }
        }
        setMatches(enriched);
      }
      setLoading(false);
    }
    loadMatches();
  }, [userId]);

  const stageLabels: Record<string, string> = {
    mind: "The Mind",
    voice: "The Voice",
    reveal: "The Reveal",
    door: "The Door",
  };

  const stageColors: Record<string, string> = {
    mind: "rgba(139,92,246,0.5)",
    voice: "rgba(99,102,241,0.5)",
    reveal: "rgba(236,72,153,0.5)",
    door: "rgba(13,148,136,0.5)",
  };

  return (
    <div className="min-h-screen px-4 py-20 sm:px-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)", letterSpacing: "0.1em" }}>
            My UNSEEN
          </h1>
          <div className="flex gap-2">
            <button onClick={onEditProfile} className="text-[10px] px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
              Profile
            </button>
            <button onClick={onPreferences} className="text-[10px] px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
              Preferences
            </button>
            <button onClick={onSafety} className="text-[10px] px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
              Safety
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.03)" }}>
          {(["discover", "connections", "messages"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-xs capitalize transition-all"
              style={{
                background: activeTab === tab ? "rgba(139,92,246,0.1)" : "transparent",
                color: activeTab === tab ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.4)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Discover tab */}
        {activeTab === "discover" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              onClick={onDiscover}
              className="w-full py-5 rounded-2xl text-sm tracking-wide transition-all mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))",
                border: "1px solid rgba(139,92,246,0.2)",
                color: "rgba(224,231,255,0.9)",
              }}
            >
              Discover People
            </button>
          </motion.div>
        )}

        {/* Connections tab */}
        {activeTab === "connections" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {loading ? (
              <p className="text-xs text-center py-8" style={{ color: "rgba(148,163,184,0.3)" }}>Loading...</p>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm mb-2" style={{ color: "rgba(224,231,255,0.6)" }}>Nothing mutual yet.</p>
                <p className="text-xs" style={{ color: "rgba(148,163,184,0.3)" }}>Your next connection hasn&apos;t begun.</p>
              </div>
            ) : (
              matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => onReveal(m.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(139,92,246,0.1)" }}>
                    <span className="text-sm">◎</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "rgba(224,231,255,0.8)" }}>{m.other_profile.display_name}</p>
                    <p className="text-[10px]" style={{ color: stageColors[m.current_stage] }}>
                      {stageLabels[m.current_stage]}
                    </p>
                  </div>
                  <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>→</span>
                </button>
              ))
            )}
          </motion.div>
        )}

        {/* Messages tab */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {matches.filter(m => m.current_stage === "door").length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: "rgba(224,231,255,0.6)" }}>No conversations yet.</p>
              </div>
            ) : (
              matches.filter(m => m.current_stage === "door").map(m => (
                <button
                  key={m.id}
                  onClick={() => onReveal(m.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(13,148,136,0.1)" }}>
                    <span className="text-sm">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "rgba(224,231,255,0.8)" }}>{m.other_profile.display_name}</p>
                    <p className="text-[10px]" style={{ color: "rgba(13,148,136,0.5)" }}>Door open</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
