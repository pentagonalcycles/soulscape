"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CampfireRoom, CampfireMessage, CampfirePresence } from "@/lib/campfire/types";
import { CampfireMultiplayer } from "@/lib/campfire/multiplayer";
import { AmbientSoundEngine } from "@/lib/sound/engine";
import CampfireLobby from "./CampfireLobby";
import CampfireScene from "./CampfireScene";
import CampfireChat from "./CampfireChat";

export type CampfireTheme = "dark" | "light";

export default function CampfirePage() {
  const [currentRoom, setCurrentRoom] = useState<CampfireRoom | null>(null);
  const [messages, setMessages] = useState<CampfireMessage[]>([]);
  const [presences, setPresences] = useState<CampfirePresence[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<CampfireTheme>("dark");
  const multiRef = useRef<CampfireMultiplayer | null>(null);
  const soundRef = useRef<AmbientSoundEngine | null>(null);

  const handleJoin = useCallback(async (room: CampfireRoom, displayName: string) => {
    setCurrentRoom(room);
    setMessages([]);
    setPresences([]);

    const sound = new AmbientSoundEngine();
    soundRef.current = sound;
    await sound.play("fireplace");
    sound.setVolume(0.3);

    const multi = new CampfireMultiplayer();
    multiRef.current = multi;

    multi.onMessage = (msg) => {
      setMessages((prev) => [...prev.slice(-99), msg]);
    };

    multi.onPresenceUpdate = (p) => {
      setPresences(p);
    };

    const userId = `campfire-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await multi.join(room.id, userId, displayName);
  }, []);

  const handleLeave = useCallback(() => {
    multiRef.current?.leave();
    multiRef.current = null;
    soundRef.current?.stop();
    soundRef.current?.destroy();
    soundRef.current = null;
    setCurrentRoom(null);
    setMessages([]);
    setPresences([]);
  }, []);

  const handleSend = useCallback((text: string) => {
    multiRef.current?.sendMessage(text);
  }, []);

  const handleTyping = useCallback(() => {
    multiRef.current?.startTyping();
    multiRef.current?.scheduleStopTyping();
  }, []);

  const handleStopTyping = useCallback(() => {
    multiRef.current?.stopTyping();
  }, []);

  const toggleSound = useCallback(() => {
    if (soundOn) {
      soundRef.current?.setVolume(0);
    } else {
      soundRef.current?.setVolume(0.3);
    }
    setSoundOn(!soundOn);
  }, [soundOn]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    return () => {
      multiRef.current?.leave();
      soundRef.current?.stop();
      soundRef.current?.destroy();
    };
  }, []);

  if (!currentRoom) {
    return <CampfireLobby onJoinRoom={handleJoin} theme={theme} onToggleTheme={toggleTheme} />;
  }

  const isLight = theme === "light";

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: isLight ? "#f5f0e8" : "#050510" }}
    >
      {/* Fire scene */}
      <CampfireScene isPlaying={true} theme={theme} />

      {/* Room info header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">🔥</span>
          <span
            className="text-sm font-light truncate max-w-[120px] sm:max-w-none"
            style={{ color: isLight ? "rgba(30, 20, 10, 0.7)" : "rgba(255, 255, 255, 0.7)" }}
          >
            {currentRoom.name}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Presence dots */}
          <div className="flex gap-1">
            {presences.map((p) => (
              <div
                key={p.name}
                className="w-3 h-3 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 8px ${p.color}60` }}
                title={p.name}
              />
            ))}
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transition-colors"
            style={{
              background: isLight ? "rgba(30, 20, 10, 0.08)" : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${isLight ? "rgba(30, 20, 10, 0.15)" : "rgba(245, 158, 11, 0.2)"}`,
              color: isLight ? "rgba(30, 20, 10, 0.6)" : "rgba(255, 255, 255, 0.5)",
              fontSize: "14px",
            }}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? "🌙" : "☀️"}
          </button>
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              background: isLight ? "rgba(30, 20, 10, 0.08)" : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${isLight ? "rgba(30, 20, 10, 0.15)" : "rgba(245, 158, 11, 0.2)"}`,
              color: isLight ? "rgba(30, 20, 10, 0.6)" : "rgba(255, 255, 255, 0.5)",
              fontSize: "14px",
            }}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          {/* Leave button */}
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 rounded-lg text-xs cursor-pointer pointer-events-auto"
            style={{
              background: isLight ? "rgba(30, 20, 10, 0.06)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${isLight ? "rgba(30, 20, 10, 0.12)" : "rgba(255, 255, 255, 0.1)"}`,
              color: isLight ? "rgba(30, 20, 10, 0.5)" : "rgba(255, 255, 255, 0.4)",
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Chat */}
      <CampfireChat
        messages={messages}
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        theme={theme}
      />
    </div>
  );
}
