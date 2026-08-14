"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TrackCard from "./TrackCard";

interface CommunityTrack {
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
  creator_name: string;
}

export default function CommunityView() {
  const [tracks, setTracks] = useState<CommunityTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const accent = "#0d9488";

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const res = await fetch("/api/music/community?limit=30");
        const data = await res.json();
        if (res.ok) setTracks(data.tracks || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 animate-spin mb-3" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading discoveries...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-5xl mb-4">◎</div>
        <h2 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>Discover Music</h2>
        <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          No shared songs yet. Be the first to share a creation with the community!
        </p>
      </div>
    );
  }

  // Group by style
  const styleGroups = tracks.reduce((acc, track) => {
    const style = track.style || "Other";
    if (!acc[style]) acc[style] = [];
    acc[style].push(track);
    return acc;
  }, {} as Record<string, CommunityTrack[]>);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Discover
        </h1>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Songs shared by the community
        </p>
      </div>

      {/* Recent */}
      <div className="mb-8">
        <h2 className="text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Recent</h2>
        <div className="space-y-1">
          {tracks.slice(0, 5).map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              showActions={false}
            />
          ))}
        </div>
      </div>

      {/* By Genre */}
      {Object.entries(styleGroups).map(([style, groupTracks]) => (
        <div key={style} className="mb-8">
          <h2 className="text-xs font-medium mb-3 capitalize" style={{ color: "var(--text-secondary)" }}>
            {style}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {groupTracks.slice(0, 6).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                showActions={false}
                compact
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
