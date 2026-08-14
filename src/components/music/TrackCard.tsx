"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AudioPlayer from "./AudioPlayer";

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
  creator_name?: string;
}

interface TrackCardProps {
  track: Track;
  accent?: string;
  showActions?: boolean;
  onShare?: (trackId: string) => void;
  onDelete?: (trackId: string) => void;
  compact?: boolean;
}

const GRADIENT_MAP: Record<string, string[]> = {
  pop: ["#ec4899", "#f472b6", "#fdf2f8"],
  rock: ["#ef4444", "#f87171", "#fef2f2"],
  hiphop: ["#f97316", "#fb923c", "#fff7ed"],
  electronic: ["#8b5cf6", "#a78bfa", "#f5f3ff"],
  jazz: ["#eab308", "#facc15", "#fefce8"],
  classical: ["#6366f1", "#818cf8", "#eef2ff"],
  rnb: ["#f43f5e", "#fb7185", "#fff1f2"],
  folk: ["#84cc16", "#a3e635", "#f7fee7"],
  lofi: ["#00cc6a", "#22d3ee", "#ecfeff"],
  ambient: ["#10b981", "#34d399", "#ecfdf5"],
  synthwave: ["#d946ef", "#e879f9", "#fdf4ff"],
  acoustic: ["#d97706", "#f59e0b", "#fffbeb"],
};

function getGradient(style: string | null): string {
  const colors = GRADIENT_MAP[style || ""] || ["#00ff88", "#14b8a6", "#f0fdfa"];
  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]} 60%, ${colors[2]})`;
}

function getAccentColor(style: string | null): string {
  const colors = GRADIENT_MAP[style || ""];
  return colors?.[0] || "#00ff88";
}

export default function TrackCard({ track, showActions = true, onShare, onDelete, compact }: TrackCardProps) {
  const [showLyrics, setShowLyrics] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const accentColor = getAccentColor(track.style);

  function handleDelete() {
    if (confirmDelete) {
      setDeleting(true);
      onDelete?.(track.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  function handleDownload() {
    if (!track.audio_url) return;
    const a = document.createElement("a");
    a.href = track.audio_url;
    a.download = `${track.title || "song"}.mp3`;
    a.click();
  }

  // Generating state
  if (track.status === "pending" || track.status === "generating") {
    return (
      <div
        className="rounded-2xl p-4 mb-3"
        style={{ background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}10` }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {track.title || "Untitled"}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
              Composing your song...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (track.status === "failed") {
    return (
      <div
        className="rounded-2xl p-4 mb-3"
        style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.06)" }}>
            <span className="text-sm">✕</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{track.title || "Untitled"}</div>
            <div className="text-[10px]" style={{ color: "#ef4444" }}>Generation failed</div>
          </div>
          {showActions && onDelete && (
            <button onClick={handleDelete} className="text-[10px] px-2 py-1 rounded-lg cursor-pointer" style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "none" }}>
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  // Completed track
  if (compact) {
    return (
      <div
        className="rounded-xl p-3 mb-2 transition-all hover:scale-[1.01] cursor-pointer"
        style={{ background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: getGradient(track.style) }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {track.title || "Untitled"}
            </div>
            <div className="text-[9px] truncate" style={{ color: "var(--text-dim)" }}>
              {track.creator_name || "You"}
            </div>
          </div>
        </div>
        {track.audio_url && (
          <div className="mt-2">
            <AudioPlayer src={track.audio_url} accent={accentColor} compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Album Art Header */}
      <div
        className="relative h-32 sm:h-40 flex items-end p-5"
        style={{ background: getGradient(track.style) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative z-10">
          <div className="text-white text-sm sm:text-base font-medium drop-shadow-lg">
            {track.title || "Untitled"}
          </div>
          {track.creator_name && (
            <div className="text-white/70 text-[10px] mt-0.5">
              by {track.creator_name}
            </div>
          )}
        </div>
        {/* Decorative music note */}
        <div className="absolute top-4 right-4 text-white/10 text-4xl">♪</div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Prompt */}
        <p className="text-[11px] mb-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {track.prompt}
        </p>

        {/* Tags */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {track.style && (
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${accentColor}10`, color: accentColor }}
            >
              {track.style}
            </span>
          )}
          {track.mood && (
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(0,255,136,0.06)", color: "var(--text-muted)" }}>
              {track.mood}
            </span>
          )}
        </div>

        {/* Player */}
        {track.audio_url && (
          <div className="mb-4">
            <AudioPlayer src={track.audio_url} accent={accentColor} />
          </div>
        )}

        {/* Lyrics */}
        {track.lyrics && (
          <div className="mb-3">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="flex items-center gap-1.5 text-[10px] cursor-pointer mb-2"
              style={{ color: "var(--text-dim)", background: "none", border: "none" }}
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: showLyrics ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {showLyrics ? "Hide lyrics" : "Show lyrics"}
            </button>
            {showLyrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-xl text-[10px] whitespace-pre-wrap"
                style={{
                  background: "rgba(0,255,136,0.03)",
                  border: "1px solid rgba(0,255,136,0.08)",
                  color: "var(--text-secondary)",
                  lineHeight: "2",
                  fontFamily: "monospace",
                }}
              >
                {track.lyrics}
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {track.audio_url && (
              <button
                onClick={handleDownload}
                className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.12)", color: accentColor }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(track.id)}
                className="flex-1 py-2 rounded-xl text-[10px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: track.is_shared ? `${accentColor}10` : "rgba(0,255,136,0.06)",
                  border: `1px solid ${track.is_shared ? `${accentColor}25` : "rgba(0,255,136,0.12)"}`,
                  color: track.is_shared ? accentColor : "var(--text-muted)",
                }}
              >
                {track.is_shared ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    Shared
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Share
                  </>
                )}
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="py-2 px-3 rounded-xl text-[10px] cursor-pointer transition-all"
                style={{
                  background: confirmDelete ? "rgba(239,68,68,0.08)" : "rgba(0,255,136,0.06)",
                  border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(0,255,136,0.12)"}`,
                  color: confirmDelete ? "#ef4444" : "var(--text-dim)",
                }}
              >
                {deleting ? "..." : confirmDelete ? "Confirm?" : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
