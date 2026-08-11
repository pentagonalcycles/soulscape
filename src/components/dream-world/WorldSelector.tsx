"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface WorldSelectorProps {
  onJoinWorld: (worldId: string, mode: "dream" | "create") => void;
  onCreateWorld: (name: string, mode: "dream" | "create", options: WorldOptions) => void;
  isPlus: boolean;
}

interface WorldOptions {
  biome: string;
  timeOfDay: string;
  weather: string;
  difficulty: string;
  gameStyle: string;
}

const BIOMES = [
  { id: "plains", name: "Plains", icon: "🌿", color: "#6bba62" },
  { id: "crystal_meadows", name: "Crystal Meadows", icon: "✦", color: "#a78bfa" },
  { id: "cloud_forest", name: "Cloud Forest", icon: "☁", color: "#2dd4a8" },
  { id: "starlight_desert", name: "Starlight Desert", icon: "✧", color: "#10b981" },
  { id: "nebula_peaks", name: "Nebula Peaks", icon: "◈", color: "#06b6d4" },
  { id: "void_depths", name: "Void Depths", icon: "⊗", color: "#6366f1" },
  { id: "coral_reef", name: "Coral Reef", icon: "◎", color: "#f093b8" },
];

const WEATHER_OPTIONS = [
  { id: "clear", name: "Clear Skies", icon: "☀" },
  { id: "stardust_rain", name: "Glow Rain", icon: "✧" },
  { id: "aurora", name: "Aurora", icon: "◎" },
  { id: "nebula_fog", name: "Nebula Fog", icon: "☁" },
  { id: "meteor_shower", name: "Meteor Shower", icon: "☄" },
  { id: "random", name: "Dynamic", icon: "◇" },
];

const DIFFICULTY_OPTIONS = [
  { id: "peaceful", name: "Peaceful", desc: "No damage, pure building" },
  { id: "normal", name: "Normal", desc: "Standard survival" },
  { id: "hard", name: "Dreamweaver", desc: "Challenging survival" },
];

const GAME_STYLE_OPTIONS = [
  { id: "survival", name: "Survival", icon: "🌙", desc: "Gather, craft, survive" },
  { id: "creative", name: "Creative", icon: "✦", desc: "Unlimited building, fly" },
  { id: "adventure", name: "Adventure", icon: "◈", desc: "Explore, no breaking" },
];

const TIME_OPTIONS = [
  { id: "real", name: "Real Time", icon: "⏰" },
  { id: "morning", name: "Morning", icon: "🌅" },
  { id: "noon", name: "Noon", icon: "☀" },
  { id: "sunset", name: "Sunset", icon: "🌇" },
  { id: "night", name: "Night", icon: "🌙" },
  { id: "eternal_dawn", name: "Eternal Dawn", icon: "🌄" },
  { id: "eternal_dusk", name: "Eternal Dusk", icon: "🌆" },
];

const WORLDS = [
  { id: "dream-world-free", name: "Dream World", biome: "Mixed", desc: "A free trial — survive, gather, build in a dreamy cosmos", icon: "🌙", color: "#a78bfa", free: true },
  { id: "plains-haven-1a2b", name: "Emerald Plains", biome: "Plains", desc: "Rolling green hills and open skies", icon: "🌿", color: "#6bba62", free: false },
  { id: "crystal-haven-7x9k", name: "Crystal Haven", biome: "Crystal Meadows", desc: "Floating crystal gardens and glowing meadows", icon: "✦", color: "#a78bfa", free: false },
  { id: "cloud-sanctum-2m4p", name: "Cloud Sanctum", biome: "Cloud Forest", desc: "Ancient trees touching the clouds", icon: "☁", color: "#2dd4a8", free: false },
  { id: "starlight-wastes-5n8r", name: "Starlight Wastes", biome: "Starlight Desert", desc: "Endless dunes under a canopy of stars", icon: "✧", color: "#10b981", free: false },
  { id: "nebula-summit-9t1v", name: "Nebula Summit", biome: "Nebula Peaks", desc: "Mountain peaks wrapped in nebula clouds", icon: "◈", color: "#06b6d4", free: false },
  { id: "void-abyss-3k7w", name: "Void Abyss", biome: "Void Depths", desc: "Deep bioluminescent caverns", icon: "⊗", color: "#6366f1", free: false },
  { id: "coral-paradise-8j2x", name: "Coral Paradise", biome: "Coral Reef", desc: "Underwater coral gardens and sea life", icon: "◎", color: "#f093b8", free: false },
];

export default function WorldSelector({ onJoinWorld, onCreateWorld, isPlus }: WorldSelectorProps) {
  const [worldName, setWorldName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [options, setOptions] = useState<WorldOptions>({
    biome: "crystal_meadows",
    timeOfDay: "real",
    weather: "random",
    difficulty: "normal",
    gameStyle: "survival",
  });

  const handleJoinWorld = (worldId: string, free: boolean) => {
    if (!free && !isPlus) return;
    const mode = options.gameStyle === "creative" ? "create" : "dream";
    onJoinWorld(worldId, mode);
  };

  return (
    <div className="dw-lobby">
      <div className="dw-lobby-bg">
        <div className="dw-lobby-nebula dw-lobby-nebula--1" />
        <div className="dw-lobby-nebula dw-lobby-nebula--2" />
        <div className="dw-lobby-nebula dw-lobby-nebula--3" />
      </div>

      <motion.div
        className="dw-lobby-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="dw-lobby-header">
          <div className="dw-lobby-icon">◈</div>
          <h1 className="dw-lobby-title">Dream World</h1>
          <p className="dw-lobby-subtitle">Build your own dream in the cosmos</p>
          {!isPlus && (
            <p className="dw-lobby-plus-hint">
              Dream World is free. Unlock all worlds and Creative mode with{" "}
              <Link href="/shop#membership" className="dw-lobby-plus-link">Plus</Link>
            </p>
          )}
        </div>

        {/* World list */}
        <div className="dw-lobby-worlds">
          <h2 className="dw-lobby-section">Worlds</h2>
          {WORLDS.map((world) => {
            const locked = !world.free && !isPlus;
            return (
              <motion.button
                key={world.id}
                onClick={() => handleJoinWorld(world.id, world.free)}
                className={`dw-world-card ${locked ? "dw-world-locked" : ""}`}
                whileHover={locked ? {} : { scale: 1.02 }}
                whileTap={locked ? {} : { scale: 0.98 }}
                style={{ borderLeftColor: world.color }}
                disabled={locked}
              >
                <div className="dw-world-icon" style={{ color: locked ? "rgba(139,92,246,0.3)" : world.color }}>
                  {locked ? "🔒" : world.icon}
                </div>
                <div className="dw-world-info">
                  <span className="dw-world-name" style={locked ? { opacity: 0.5 } : undefined}>
                    {world.name}
                    {world.free && <span className="dw-world-free-badge">FREE</span>}
                  </span>
                  <span className="dw-world-desc">{world.desc}</span>
                  <span className="dw-world-meta">{world.biome}</span>
                </div>
                <span className="dw-world-join" style={locked ? { opacity: 0.3 } : undefined}>
                  {locked ? "Plus Required" : "Enter →"}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Game Style — Plus gets all options, free gets survival only */}
        <div className="dw-option-group">
          <label className="dw-option-label">
            Game Style
            {!isPlus && <span className="dw-option-locked-hint"> (Plus unlocks Creative & Adventure)</span>}
          </label>
          <div className="dw-option-grid">
            {GAME_STYLE_OPTIONS.map((gs) => {
              const locked = !isPlus && gs.id !== "survival";
              return (
                <button
                  key={gs.id}
                  onClick={() => !locked && setOptions(o => ({...o, gameStyle: gs.id}))}
                  className={`dw-option-chip ${options.gameStyle === gs.id ? "active" : ""} ${locked ? "dw-option-locked" : ""}`}
                  disabled={locked}
                >
                  <span>{locked ? "🔒" : gs.icon}</span>
                  <span>{gs.name}</span>
                  {locked && <span className="dw-option-locked-badge">PLUS</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New World — Plus only */}
        {!showCreate ? (
          <motion.button
            onClick={() => isPlus && setShowCreate(true)}
            className={`dw-create-btn ${!isPlus ? "dw-create-btn-locked" : ""}`}
            whileHover={isPlus ? { scale: 1.03 } : {}}
            whileTap={isPlus ? { scale: 0.97 } : {}}
            disabled={!isPlus}
          >
            <span>{isPlus ? "◈" : "🔒"}</span>
            <span>{isPlus ? "Create Custom World" : "Create World (Plus Required)"}</span>
          </motion.button>
        ) : (
          <motion.div className="dw-create-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <input
              type="text" value={worldName} onChange={(e) => setWorldName(e.target.value)}
              placeholder="Name your world..." className="dw-create-input" maxLength={30}
            />

            {/* Biome selector */}
            <div className="dw-option-group">
              <label className="dw-option-label">Starting Biome</label>
              <div className="dw-option-grid">
                {BIOMES.map((b) => (
                  <button key={b.id} onClick={() => setOptions(o => ({...o, biome: b.id}))}
                    className={`dw-option-chip ${options.biome === b.id ? "active" : ""}`}
                    style={options.biome === b.id ? { borderColor: b.color, background: `${b.color}15` } : undefined}
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time of day */}
            <div className="dw-option-group">
              <label className="dw-option-label">Time of Day</label>
              <div className="dw-option-grid">
                {TIME_OPTIONS.map((t) => (
                  <button key={t.id} onClick={() => setOptions(o => ({...o, timeOfDay: t.id}))}
                    className={`dw-option-chip ${options.timeOfDay === t.id ? "active" : ""}`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="dw-option-group">
              <label className="dw-option-label">Weather</label>
              <div className="dw-option-grid">
                {WEATHER_OPTIONS.map((w) => (
                  <button key={w.id} onClick={() => setOptions(o => ({...o, weather: w.id}))}
                    className={`dw-option-chip ${options.weather === w.id ? "active" : ""}`}
                  >
                    <span>{w.icon}</span>
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="dw-option-group">
              <label className="dw-option-label">Difficulty</label>
              <div className="dw-option-grid">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button key={d.id} onClick={() => setOptions(o => ({...o, difficulty: d.id}))}
                    className={`dw-option-chip ${options.difficulty === d.id ? "active" : ""}`}
                  >
                    <span>{d.name}</span>
                    <span className="dw-option-desc">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="dw-create-actions">
              <button onClick={() => { if (worldName.trim()) onCreateWorld(worldName.trim(), options.gameStyle === "creative" ? "create" : "dream", options); }}
                className="dw-create-submit" disabled={!worldName.trim()}
              >
                Create World
              </button>
              <button onClick={() => setShowCreate(false)} className="dw-create-cancel">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="dw-lobby-footer">
          <Link href="/" className="dw-lobby-link">← Return Home</Link>
          <span className="dw-lobby-version">Dream World v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
