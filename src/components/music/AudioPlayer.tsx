"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  accent?: string;
  compact?: boolean;
}

export default function AudioPlayer({ src, accent = "#0d9488", compact }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  function togglePlay(e: React.MouseEvent) {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  }

  function formatTime(s: number) {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          onClick={togglePlay}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
          style={{ background: `${accent}15`, color: accent }}
        >
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1" width="3" height="10" rx="1" /><rect x="7" y="1" width="3" height="10" rx="1" /></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5v9l8-4.5z" /></svg>
          )}
        </button>
        <div className="flex-1 h-1 rounded-full cursor-pointer relative" style={{ background: `${accent}15` }} onClick={seek}>
          <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${progress}%`, background: accent }} />
        </div>
        <span className="text-[8px] tabular-nums" style={{ color: "var(--text-faint)" }}>{formatTime(currentTime)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:scale-105"
        style={{
          background: accent,
          color: "white",
          boxShadow: `0 2px 10px ${accent}40`,
        }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1" width="3" height="10" rx="1" /><rect x="7" y="1" width="3" height="10" rx="1" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5v9l8-4.5z" /></svg>
        )}
      </button>

      {/* Progress */}
      <div className="flex-1 flex items-center gap-2.5">
        <span className="text-[9px] tabular-nums w-7 text-right" style={{ color: "var(--text-faint)" }}>
          {formatTime(currentTime)}
        </span>
        <div
          className="flex-1 h-1.5 rounded-full cursor-pointer relative group"
          style={{ background: `${accent}15` }}
          onClick={seek}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: accent }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `calc(${progress}% - 7px)`,
              background: accent,
              boxShadow: `0 0 6px ${accent}60`,
            }}
          />
        </div>
        <span className="text-[9px] tabular-nums w-7" style={{ color: "var(--text-faint)" }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
