"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  src: string;
  fileName: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const onEnded = () => setIsPlaying(false);
    const onLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setError("Failed to load audio");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadstart", onLoadStart);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadstart", onLoadStart);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setError("Playback failed");
        setIsPlaying(false);
      }
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * duration;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ width: "100%" }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {error && (
        <div style={{
          padding: "8px 12px",
          borderRadius: "8px",
          background: "rgba(255, 80, 80, 0.08)",
          border: "1px solid rgba(255, 80, 80, 0.15)",
          color: "rgba(255, 120, 120, 0.8)",
          fontSize: "11px",
          marginBottom: "8px",
        }}>
          {error}
        </div>
      )}

      {/* Play button + progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <motion.button
          onClick={togglePlay}
          whileTap={{ scale: 0.9 }}
          disabled={isLoading}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            background: "rgba(0, 255, 136, 0.08)",
            color: "#00ff88",
            fontSize: "14px",
            cursor: isLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isLoading ? "..." : isPlaying ? "⏸" : "▶"}
        </motion.button>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Progress bar */}
          <div
            onClick={seek}
            style={{
              height: "4px",
              background: "rgba(0, 255, 136, 0.1)",
              borderRadius: "2px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                background: "linear-gradient(90deg, #00ff88, #00cc6a)",
                borderRadius: "2px",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Time display */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(224, 245, 232, 0.35)" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <span style={{ fontSize: "12px", color: "rgba(224, 245, 232, 0.35)" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: "50px",
              height: "3px",
              accentColor: "#00ff88",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </div>
  );
}
