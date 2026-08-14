"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateViewProps {
  onTrackCreated: () => void;
  userId: string | null;
}

const STYLE_PRESETS = [
  { id: "pop", label: "Pop", emoji: "🎤", color: "#ec4899" },
  { id: "rock", label: "Rock", emoji: "🎸", color: "#ef4444" },
  { id: "hiphop", label: "Hip Hop", emoji: "🎙", color: "#f97316" },
  { id: "electronic", label: "Electronic", emoji: "⚡", color: "#8b5cf6" },
  { id: "jazz", label: "Jazz", emoji: "🎷", color: "#eab308" },
  { id: "classical", label: "Classical", emoji: "🎻", color: "#6366f1" },
  { id: "rnb", label: "R&B", emoji: "💜", color: "#f43f5e" },
  { id: "folk", label: "Folk", emoji: "🪕", color: "#84cc16" },
  { id: "lofi", label: "Lo-Fi", emoji: "☁️", color: "#00cc6a" },
  { id: "ambient", label: "Ambient", emoji: "🌊", color: "#10b981" },
  { id: "synthwave", label: "Synthwave", emoji: "🌆", color: "#d946ef" },
  { id: "acoustic", label: "Acoustic", emoji: "🪵", color: "#d97706" },
];

const MOOD_PRESETS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Melancholic", emoji: "🌧" },
  { id: "energetic", label: "Energetic", emoji: "🔥" },
  { id: "calm", label: "Calm", emoji: "🍃" },
  { id: "dark", label: "Dark", emoji: "🖤" },
  { id: "dreamy", label: "Dreamy", emoji: "✨" },
  { id: "hopeful", label: "Hopeful", emoji: "🌅" },
  { id: "nostalgic", label: "Nostalgic", emoji: "📼" },
];

const LYRIC_HELPERS = [
  { tag: "[Verse]", desc: "Main verse" },
  { tag: "[Chorus]", desc: "Hook / chorus" },
  { tag: "[Bridge]", desc: "Bridge section" },
  { tag: "[Outro]", desc: "Ending" },
  { tag: "[Intro]", desc: "Opening" },
  { tag: "[Pre-Chorus]", desc: "Build-up to chorus" },
];

export default function CreateView({ onTrackCreated, userId }: CreateViewProps) {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [customLyrics, setCustomLyrics] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const accent = "#00ff88";

  const inputStyle = {
    background: "rgba(0, 255, 136, 0.04)",
    border: "1px solid rgba(0, 255, 136, 0.12)",
    color: "var(--text-primary)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
    backdropFilter: "blur(16px)",
  };

  async function handleGenerate() {
    if (!prompt.trim() || !userId) return;
    setGenerating(true);
    setError("");

    try {
      const { data: { session } } = await (await import("@/lib/supabase")).supabase().auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("Please sign in to create music");
        setGenerating(false);
        return;
      }

      const res = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          lyrics: customLyrics ? lyrics : undefined,
          style: style || undefined,
          mood: mood || undefined,
          title: title.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      if (data.remaining !== undefined) setRemaining(data.remaining);

      setGenerating(false);
      setPolling(true);
      await pollForCompletion(accessToken, data.jobId);
    } catch {
      setError("Something went wrong. Please try again.");
      setGenerating(false);
    }
  }

  async function pollForCompletion(token: string, jobId: string) {
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(`/api/music/status/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "completed") {
          setPolling(false);
          onTrackCreated();
          return;
        }
        if (data.status === "failed") {
          setPolling(false);
          setError("Generation failed. Try a different description.");
          return;
        }
      } catch { /* continue polling */ }
    }
    setPolling(false);
    setError("Taking longer than expected. Check your library in a moment.");
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-5xl mb-4">♪</div>
        <h2 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>Create with AI</h2>
        <p className="text-xs text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          Sign in to start creating songs with artificial intelligence
        </p>
      </div>
    );
  }

  const isBusy = generating || polling;

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          What do you want to create?
        </h1>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Describe a song and AI will write, compose, and perform it for you
        </p>
      </div>

      {/* Main Prompt Area */}
      <div className="mb-6">
        <div
          className="rounded-2xl overflow-hidden transition-all"
          style={{
            background: "rgba(0, 255, 136, 0.03)",
            border: `1px solid ${isBusy ? `${accent}40` : "rgba(0, 255, 136, 0.12)"}`,
            boxShadow: isBusy ? `0 0 20px ${accent}10` : "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
            backdropFilter: "blur(16px)",
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A dreamy song about watching the sunset over the ocean, feeling peaceful..."
            maxLength={500}
            rows={4}
            disabled={isBusy}
            className="w-full px-5 py-4 text-sm outline-none resize-none"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              lineHeight: "1.7",
            }}
          />
          <div className="flex items-center justify-between px-5 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] tabular-nums" style={{ color: "var(--text-faint)" }}>
                {prompt.length}/500
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isBusy}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
              style={{
                background: isBusy
                  ? "rgba(0, 255, 136, 0.15)"
                  : `linear-gradient(135deg, ${accent}, #00cc6a)`,
                color: "white",
                border: "none",
                boxShadow: isBusy ? "none" : `0 2px 12px ${accent}30`,
              }}
            >
              {generating ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating...
                </>
              ) : polling ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Composing...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      <AnimatePresence>
        {polling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: `${accent}05`, border: `1px solid ${accent}15` }}
            >
              <motion.div
                className="text-4xl mb-3 inline-block"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎵
              </motion.div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Your song is being composed
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                This usually takes 30-90 seconds
              </p>
              {/* Animated progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: accent }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl text-xs text-center"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}
        >
          {error}
        </motion.div>
      )}

      {/* Remaining */}
      {remaining !== null && (
        <p className="text-[10px] text-center mb-6" style={{ color: "var(--text-faint)" }}>
          {remaining} songs left today
        </p>
      )}

      {/* Genre Selection */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Genre</span>
          {style && (
            <button
              onClick={() => setStyle("")}
              className="text-[10px] cursor-pointer"
              style={{ color: "var(--text-dim)", background: "none", border: "none" }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(style === s.id ? "" : s.id)}
              disabled={isBusy}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all cursor-pointer group"
              style={{
                background: style === s.id ? `${s.color}12` : "rgba(0, 255, 136, 0.03)",
                border: `1px solid ${style === s.id ? `${s.color}30` : "rgba(0, 255, 136, 0.08)"}`,
              }}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{s.emoji}</span>
              <span className="text-[10px] font-medium" style={{ color: style === s.id ? s.color : "var(--text-muted)" }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Selection */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Mood</span>
          {mood && (
            <button
              onClick={() => setMood("")}
              className="text-[10px] cursor-pointer"
              style={{ color: "var(--text-dim)", background: "none", border: "none" }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {MOOD_PRESETS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(mood === m.id ? "" : m.id)}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] transition-all cursor-pointer"
              style={{
                background: mood === m.id ? `${accent}12` : "rgba(0, 255, 136, 0.04)",
                border: `1px solid ${mood === m.id ? `${accent}25` : "rgba(0, 255, 136, 0.08)"}`,
                color: mood === m.id ? accent : "var(--text-muted)",
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[11px] cursor-pointer mb-3"
          style={{ color: "var(--text-dim)", background: "none", border: "none" }}
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: showAdvanced ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Advanced options
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Title */}
              <div className="mb-4">
                <label className="text-[10px] mb-1.5 block" style={{ color: "var(--text-dim)" }}>Song title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled"
                  maxLength={60}
                  disabled={isBusy}
                  className="w-full px-4 py-2.5 rounded-xl text-xs outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Custom Lyrics Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setCustomLyrics(!customLyrics)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: customLyrics ? `${accent}08` : "rgba(0, 255, 136, 0.03)",
                    border: `1px solid ${customLyrics ? `${accent}20` : "rgba(0, 255, 136, 0.08)"}`,
                  }}
                >
                  <div
                    className="relative w-10 h-[22px] rounded-full transition-all flex-shrink-0"
                    style={{ background: customLyrics ? accent : "rgba(0, 255, 136, 0.15)" }}
                  >
                    <div
                      className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                        transform: customLyrics ? "translateX(22px)" : "translateX(3px)",
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Custom lyrics</div>
                    <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Write your own lyrics instead of AI-generated</div>
                  </div>
                </button>
              </div>

              {/* Lyrics Input */}
              {customLyrics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px]" style={{ color: "var(--text-dim)" }}>Lyrics</label>
                    <div className="flex gap-1">
                      {LYRIC_HELPERS.map((h) => (
                        <button
                          key={h.tag}
                          onClick={() => setLyrics(lyrics + (lyrics ? "\n\n" : "") + h.tag + "\n")}
                          disabled={isBusy}
                          className="px-1.5 py-0.5 rounded text-[8px] cursor-pointer"
                          style={{ background: `${accent}10`, color: accent, border: "none" }}
                          title={h.desc}
                        >
                          {h.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={"[Verse]\nWrite your lyrics here...\n\n[Chorus]\nThe hook goes here..."}
                    maxLength={3000}
                    rows={10}
                    disabled={isBusy}
                    className="w-full px-4 py-3 rounded-xl text-xs outline-none resize-none"
                    style={{ ...inputStyle, fontFamily: "monospace", lineHeight: "2" }}
                  />
                  <p className="text-[9px] mt-1" style={{ color: "var(--text-faint)" }}>
                    Use tags like [Verse], [Chorus], [Bridge], [Outro] to structure your song
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
