"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { UnseenPreferences } from "@/lib/unseen/types";

interface UnseenPreferencesProps {
  onBack: () => void;
}

export default function UnseenPreferences({ onBack }: UnseenPreferencesProps) {
  const { userId } = useAuth();
  const [prefs, setPrefs] = useState<UnseenPreferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      if (!userId) return;
      const client = supabase();
      const { data } = await client
        .from("unseen_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) setPrefs(data);
    }
    loadPrefs();
  }, [userId]);

  async function save() {
    if (!userId || !prefs) return;
    setSaving(true);
    const client = supabase();
    await client.from("unseen_preferences").upsert({
      user_id: userId,
      age_min: prefs.age_min,
      age_max: prefs.age_max,
      distance_preference: prefs.distance_preference,
      show_me: prefs.show_me,
    }, { onConflict: "user_id" });
    setSaving(false);
  }

  if (!prefs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm animate-pulse" style={{ color: "rgba(148,163,184,0.5)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="mb-8 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>← Back</button>

        <h2 className="text-xl sm:text-2xl mb-8" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          Dating Preferences
        </h2>

        {/* Age range */}
        <div className="mb-6">
          <label className="text-xs mb-2 block" style={{ color: "rgba(148,163,184,0.6)" }}>Age range</label>
          <div className="flex items-center gap-3">
            <input type="number" min={18} max={120} value={prefs.age_min}
              onChange={e => setPrefs({ ...prefs, age_min: parseInt(e.target.value) || 18 })}
              className="w-20 px-3 py-2 rounded-lg text-sm text-center outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>to</span>
            <input type="number" min={18} max={120} value={prefs.age_max}
              onChange={e => setPrefs({ ...prefs, age_max: parseInt(e.target.value) || 99 })}
              className="w-20 px-3 py-2 rounded-lg text-sm text-center outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(224,231,255,0.9)" }} />
          </div>
        </div>

        {/* Show me */}
        <div className="mb-6">
          <label className="text-xs mb-2 block" style={{ color: "rgba(148,163,184,0.6)" }}>Show me</label>
          <div className="flex gap-2">
            {(["women", "men", "everyone"] as const).map(option => (
              <button key={option} onClick={() => setPrefs({ ...prefs, show_me: option })}
                className="flex-1 py-2.5 rounded-lg text-xs capitalize transition-all"
                style={{
                  background: prefs.show_me === option ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${prefs.show_me === option ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: prefs.show_me === option ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.5)",
                }}>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div className="mb-8">
          <label className="text-xs mb-2 block" style={{ color: "rgba(148,163,184,0.6)" }}>Distance preference</label>
          <div className="flex gap-2">
            {(["nearby", "country", "anywhere"] as const).map(option => (
              <button key={option} onClick={() => setPrefs({ ...prefs, distance_preference: option })}
                className="flex-1 py-2.5 rounded-lg text-xs capitalize transition-all"
                style={{
                  background: prefs.distance_preference === option ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${prefs.distance_preference === option ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: prefs.distance_preference === option ? "rgba(224,231,255,0.9)" : "rgba(148,163,184,0.5)",
                }}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
            border: "1px solid rgba(139,92,246,0.3)",
            color: "rgba(224,231,255,0.9)",
          }}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </motion.div>
    </div>
  );
}
