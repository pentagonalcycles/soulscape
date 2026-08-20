"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameLobby from "./GameLobby";
import GameCanvas, { GameCanvasRef } from "./GameCanvas";
import GameHUD from "./GameHUD";
import DeathScreen from "./DeathScreen";
import { GameState, GameSettings, OrbCustomization, KillFeedEntry, Notification } from "@/lib/nebula-orb/types";
import { createInitialState, getLeaderboard } from "@/lib/nebula-orb/engine";
import { createOrb, getOrbRadius } from "@/lib/nebula-orb/orb";
import { useIsMobile } from "@/lib/useIsMobile";

export default function NebulaOrbGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLobby, setShowLobby] = useState(true);
  const [showDeath, setShowDeath] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalKills, setFinalKills] = useState(0);
  const [finalTimeSurvived, setFinalTimeSurvived] = useState(0);
  const [siteBg, setSiteBg] = useState<string | null>(null);
  const canvasRef = useRef<GameCanvasRef>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const { isMobile } = useIsMobile();

  // Load website background on mount
  useEffect(() => {
    const storedBg = localStorage.getItem("bg-color");
    if (storedBg) {
      setSiteBg(storedBg);
    }
  }, []);

  const [hudState, setHudState] = useState({
    score: 0,
    kills: 0,
    radius: 0,
    killStreak: 0,
    eclipseMode: false,
    activePowerUps: [] as { type: string; timeLeft: number }[],
    notifications: [] as Notification[],
    killFeed: [] as KillFeedEntry[],
    leaderboard: [] as { name: string; score: number; kills: number }[],
  });

  const updateHud = useCallback(() => {
    if (!canvasRef.current) return;
    const state = canvasRef.current.getState();
    const player = state.playerId ? state.orbs.get(state.playerId) : null;
    if (!player) return;

    gameStateRef.current = state;
    const now = Date.now();
    setHudState({
      score: player.score,
      kills: player.kills,
      radius: getOrbRadius(player),
      killStreak: player.killStreak,
      eclipseMode: player.eclipseMode,
      activePowerUps: player.activePowerUps
        .filter((p) => p.expiresAt > now)
        .map((p) => ({ type: p.type, timeLeft: p.expiresAt - now })),
      notifications: state.notifications,
      killFeed: state.killFeed,
      leaderboard: getLeaderboard(state).slice(0, 5),
    });
  }, []);

  useEffect(() => {
    if (showLobby || showDeath) return;
    const interval = setInterval(updateHud, 100);
    return () => clearInterval(interval);
  }, [showLobby, showDeath, updateHud]);

  const handleStart = useCallback((name: string, skinId: string, custom: OrbCustomization, settings: GameSettings) => {
    const state = createInitialState(settings);
    const orb = createOrb(name, 0, skinId, custom, state.mapWidth, state.mapHeight);
    state.orbs.set(orb.id, orb);
    state.playerId = orb.id;
    setGameState(state);
    gameStateRef.current = state;
    setShowLobby(false);
    setShowDeath(false);
  }, []);

  const handleDeath = useCallback((score: number, kills: number, timeSurvived: number) => {
    setFinalScore(score);
    setFinalKills(kills);
    setFinalTimeSurvived(timeSurvived);
    setShowDeath(true);
  }, []);

  const handleRestart = useCallback(() => {
    setShowDeath(false);
    setShowLobby(true);
    setGameState(null);
    gameStateRef.current = null;
  }, []);

  const handleReturnToSite = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleReturnToLobby = useCallback(() => {
    setShowLobby(true);
    setGameState(null);
    gameStateRef.current = null;
  }, []);

  return (
    <div className="relative w-full h-screen supports-[height:100dvh]:h-dvh overflow-hidden" style={{ background: "transparent", touchAction: "none" }}>
      <AnimatePresence>
        {showLobby && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20"
          >
            <GameLobby onStart={handleStart} isMobile={isMobile} siteBg={siteBg} />
          </motion.div>
        )}
      </AnimatePresence>

      {gameState && !showLobby && (
        <>
          <GameCanvas
            ref={canvasRef}
            state={gameState}
            onDeath={handleDeath}
            isMobile={isMobile}
            siteBg={siteBg}
          />
          <GameHUD
            score={hudState.score}
            kills={hudState.kills}
            radius={hudState.radius}
            killStreak={hudState.killStreak}
            eclipseMode={hudState.eclipseMode}
            activePowerUps={hudState.activePowerUps}
            notifications={hudState.notifications}
            killFeed={hudState.killFeed}
            leaderboard={hudState.leaderboard}
            onLobby={handleReturnToLobby}
            isMobile={isMobile}
            gameStateRef={gameStateRef}
            canvasRef={canvasRef}
          />
        </>
      )}

      <AnimatePresence>
        {showDeath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30"
          >
            <DeathScreen
              score={finalScore}
              kills={finalKills}
              timeSurvived={finalTimeSurvived}
              onPlayAgain={handleRestart}
              onReturnToSite={handleReturnToSite}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
