"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import TrackCard from "./TrackCard";

interface LibraryViewProps {
  userId: string | null;
}

interface Track {
  id: string;
  title: string;
  prompt: string;
  lyrics: string | null;
  style: string | null;
  mood: string | null;
  duration: number;
  audio_url: string | null;
  image_url: string | null;
  status: string;
  is_shared: boolean;
  created_at: string;
}

export default function LibraryView({ userId }: LibraryViewProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyUsed, setDailyUsed] = useState(0);

  const accent = "#0d9488";

  const fetchLibrary = useCallback(async () => {
    if (!userId) return;
    try {
      const { data: { session } } = await supabase().auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/music/library", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setTracks(data.tracks || []);
        setDailyUsed(data.dailyUsed || 0);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  // Auto-refresh pending tracks
  useEffect(() => {
    const pending = tracks.filter((t) => t.status === "pending" || t.status === "generating");
    if (pending.length === 0) return;
    const interval = setInterval(fetchLibrary, 5000);
    return () => clearInterval(interval);
  }, [tracks, fetchLibrary]);

  async function handleShare(trackId: string) {
    try {
      const { data: { session } } = await supabase().auth.getSession();
      if (!session?.access_token) return;
      await fetch(`/api/music/share/${trackId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({}),
      });
      fetchLibrary();
    } catch { /* silent */ }
  }

  async function handleDelete(trackId: string) {
    try {
      const { data: { session } } = await supabase().auth.getSession();
      if (!session?.access_token) return;
      await fetch(`/api/music/${trackId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch { /* silent */ }
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-5xl mb-4">♫</div>
        <h2 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>Your Library</h2>
        <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          Sign in to see all the songs you&apos;ve created
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 animate-spin mb-3" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading your songs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Your Library
        </h1>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          {tracks.length} song{tracks.length !== 1 ? "s" : ""} created
        </p>
      </div>

      {/* Daily Usage */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{ background: "rgba(13, 148, 136, 0.03)", border: "1px solid rgba(13, 148, 136, 0.08)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>Today&apos;s creations</span>
          <span className="text-[10px] font-medium" style={{ color: accent }}>{dailyUsed} / 10</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: `${accent}10` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            initial={{ width: 0 }}
            animate={{ width: `${(dailyUsed / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-4">♪</div>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>No songs yet</p>
          <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
            Create your first AI-generated song to see it here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onShare={handleShare}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
