"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Notification, KillFeedEntry, GameState } from "@/lib/nebula-orb/types";
import { GameCanvasRef } from "./GameCanvas";
import Minimap from "./Minimap";

interface GameHUDProps {
  score: number;
  kills: number;
  radius: number;
  killStreak: number;
  eclipseMode: boolean;
  activePowerUps: { type: string; timeLeft: number }[];
  notifications: Notification[];
  killFeed: KillFeedEntry[];
  leaderboard: { name: string; score: number; kills: number }[];
  onLobby: () => void;
  isMobile?: boolean;
  gameStateRef: RefObject<GameState | null>;
  canvasRef: RefObject<GameCanvasRef | null>;
}

const POWERUP_ICONS: Record<string, string> = {
  speed: "⚡",
  shield: "🛡",
  ghost: "👻",
  glow: "💡",
  magnet: "🧲",
  shrink: "✨",
  freeze: "❄",
  rage: "🔥",
  phase: "🌀",
};

const POWERUP_COLORS: Record<string, string> = {
  speed: "#00cc6a",
  shield: "#10b981",
  ghost: "#a78bfa",
  glow: "#22d3ee",
  magnet: "#f472b6",
  shrink: "#fbbf24",
  freeze: "#67e8f9",
  rage: "#f87171",
  phase: "#c084fc",
};

export default function GameHUD({
  score,
  kills,
  radius,
  killStreak,
  eclipseMode,
  activePowerUps,
  notifications,
  killFeed,
  leaderboard,
  onLobby,
  isMobile = false,
  gameStateRef,
  canvasRef,
}: GameHUDProps) {
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });

  const updateCamera = useCallback(() => {
    const gs = gameStateRef.current;
    const player = gs?.playerId ? gs.orbs.get(gs.playerId) : null;
    if (player) {
      const autoZoom = Math.max(0.3, Math.min(1.5, 60 / player.radius));
      setCamera({ x: player.x, y: player.y, zoom: autoZoom });
    }
  }, [gameStateRef]);

  useEffect(() => {
    const interval = setInterval(updateCamera, 100);
    return () => clearInterval(interval);
  }, [updateCamera]);

  const gs = gameStateRef.current;

  // Game HUD colors - always dark for game aesthetic
  const panelBg = "rgba(15, 15, 35, 0.9)";
  const panelBorder = "rgba(0, 255, 136, 0.2)";
  const textPrimary = "#e2e8f0";
  const textSecondary = "#94a3b8";
  const textMuted = "#64748b";

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Top Left - Menu */}
      <div className="absolute top-3 left-3 pointer-events-auto">
        <button
          onClick={onLobby}
          className="px-3 py-2 rounded-lg text-xs cursor-pointer transition-all"
          style={{
            background: panelBg,
            border: `1px solid ${panelBorder}`,
            color: textSecondary,
            backdropFilter: "blur(8px)",
            minHeight: "36px",
          }}
        >
          ← Menu
        </button>
      </div>

      {/* Top Right - Stats */}
      <div className="absolute top-3 right-3 pointer-events-auto">
        <div
          className={isMobile ? "px-3 py-2 rounded-xl" : "px-4 py-3 rounded-xl"}
          style={{
            background: panelBg,
            border: `1px solid ${panelBorder}`,
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div className={isMobile ? "flex items-center gap-3" : "flex items-center gap-6"}>
            <div>
              <div className="text-[8px] uppercase tracking-wider" style={{ color: textMuted }}>Score</div>
              <div className={isMobile ? "text-base font-bold" : "text-lg font-bold"} style={{ color: "#00ff88" }}>{Math.round(score)}</div>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-wider" style={{ color: textMuted }}>Kills</div>
              <div className={isMobile ? "text-base font-bold" : "text-lg font-bold"} style={{ color: "#10b981" }}>{kills}</div>
            </div>
            {!isMobile && (
              <div>
                <div className="text-[8px] uppercase tracking-wider" style={{ color: textMuted }}>Size</div>
                <div className="text-lg font-bold" style={{ color: "#00cc6a" }}>{Math.round(radius)}</div>
              </div>
            )}
          </div>

          {/* Active Power-ups */}
          {activePowerUps.length > 0 && (
            <div className="mt-2 pt-2 flex gap-2 flex-wrap" style={{ borderTop: "1px solid rgba(0, 255, 136, 0.08)" }}>
              {activePowerUps.map((pu, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px]"
                  style={{
                    background: `${POWERUP_COLORS[pu.type]}15`,
                    border: `1px solid ${POWERUP_COLORS[pu.type]}30`,
                    color: POWERUP_COLORS[pu.type],
                  }}
                >
                  <span>{POWERUP_ICONS[pu.type]}</span>
                  <span>{Math.ceil(pu.timeLeft / 1000)}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kill Streak Indicator */}
      <AnimatePresence>
        {killStreak >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2"
          >
            <div
              className={isMobile ? "px-3 py-1.5 rounded-xl text-xs" : "px-4 py-2 rounded-xl text-sm"}
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.9), rgba(0, 204, 106, 0.9))",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(0, 255, 136, 0.4)",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                fontWeight: 500,
              }}
            >
              {killStreak === 2 ? "🔥 DOUBLE KILL!" : killStreak === 3 ? "⚡ UNSTOPPABLE!" : `💀 GODLIKE! (${killStreak})`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eclipse Mode Indicator */}
      <AnimatePresence>
        {eclipseMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-24 left-1/2 -translate-x-1/2"
          >
            <div
              className={isMobile ? "px-4 py-1.5 rounded-xl text-xs" : "px-5 py-2 rounded-xl text-sm"}
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.9), rgba(16, 185, 129, 0.9))",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(0, 255, 136, 0.4)",
                fontWeight: 500,
              }}
            >
              🌟 ECLIPSE MODE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kill Feed */}
      {!isMobile && (
        <div className="absolute top-16 left-3 space-y-1">
          <AnimatePresence>
            {killFeed.slice(-5).map((entry, i) => (
              <motion.div
                key={`${entry.killer}-${entry.victim}-${entry.time}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 rounded-lg text-[10px]"
                style={{
                  background: panelBg,
                  border: `1px solid ${panelBorder}`,
                  color: textSecondary,
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{ color: "#00ff88" }}>{entry.killer}</span>
                <span style={{ color: textMuted }}> eliminated </span>
                <span style={{ color: "#f87171" }}>{entry.victim}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Leaderboard */}
      {!isMobile && leaderboard.length > 0 && (
        <div className="absolute top-4 right-4 mt-20">
          <div
            className="px-3 py-2 rounded-xl"
            style={{
              background: panelBg,
              border: `1px solid ${panelBorder}`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="text-[9px] uppercase tracking-wider mb-2" style={{ color: textMuted }}>Leaderboard</div>
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5 text-[10px]">
                <span style={{ color: i === 0 ? "#10b981" : i === 1 ? "#00ff88" : i === 2 ? "#00cc6a" : textMuted }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                </span>
                <span style={{ color: textPrimary }}>{entry.name}</span>
                <span className="ml-auto" style={{ color: textSecondary }}>{Math.round(entry.score)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className={isMobile ? "absolute bottom-28 left-1/2 -translate-x-1/2 space-y-2 w-[90%]" : "absolute bottom-20 left-1/2 -translate-x-1/2 space-y-2"}>
        <AnimatePresence>
          {notifications.slice(-3).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={isMobile ? "px-3 py-2 rounded-xl text-[10px] text-center" : "px-4 py-2 rounded-xl text-xs text-center"}
              style={{
                background: notif.type === "eclipse"
                  ? "linear-gradient(135deg, rgba(0, 255, 136, 0.9), rgba(16, 185, 129, 0.9))"
                  : notif.type === "kill"
                  ? "linear-gradient(135deg, rgba(0, 255, 136, 0.8), rgba(0, 204, 106, 0.8))"
                  : "rgba(10, 10, 30, 0.9)",
                color: "#fff",
                border: "1px solid rgba(0, 255, 136, 0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                fontWeight: 500,
              }}
            >
              {notif.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Minimap */}
      {gs && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <Minimap
            state={gs}
            cameraX={camera.x}
            cameraY={camera.y}
            cameraZoom={camera.zoom}
            screenWidth={window.innerWidth}
            screenHeight={window.innerHeight}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Controls hint */}
      {!isMobile && (
        <div className="absolute bottom-4 left-4 text-[9px]" style={{ color: textMuted }}>
          WASD/Arrows: Move | Click/Space: Boost | +/-: Zoom
        </div>
      )}
    </div>
  );
}
