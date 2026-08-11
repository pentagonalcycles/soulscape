"use client";

import { useState, useEffect } from "react";
import type { PlayerState, Hotbar } from "@/lib/dream-world/types";
import { getBlockDef } from "@/lib/dream-world/blocks";

interface GameHUDProps {
  player: PlayerState;
  hotbar: Hotbar;
  flying: boolean;
  resonance: number;
  playerCount: number;
  fps: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  hunger: number;
  essences: Record<number, number>;
  biomeName: string | null;
  biomeFadeTimer: number;
  weatherType: string;
  onSelectSlot: (index: number) => void;
  onToggleMenu: () => void;
}

const ESSENCE_BLOCKS: Record<number, { name: string; icon: string; color: string }> = {
  30: { name: "Glow Crystal", icon: "✦", color: "#a78bfa" },
  31: { name: "Starlight", icon: "★", color: "#10b981" },
  32: { name: "Aurora", icon: "◎", color: "#2dd4a8" },
  33: { name: "Neon", icon: "◆", color: "#06b6d4" },
  51: { name: "Crystal", icon: "❀", color: "#06b6d4" },
  52: { name: "Fern", icon: "❋", color: "#2dd4a8" },
  53: { name: "Mushroom", icon: "🍄", color: "#a78bfa" },
};

const WEATHER_LABELS: Record<string, { name: string; icon: string }> = {
  clear: { name: "Clear", icon: "☀" },
  stardust_rain: { name: "Glow Rain", icon: "✧" },
  aurora: { name: "Aurora", icon: "◎" },
  nebula_fog: { name: "Nebula Fog", icon: "☁" },
  meteor_shower: { name: "Meteor Shower", icon: "☄" },
};

export default function GameHUD({
  player, hotbar, flying, resonance, playerCount, fps, health, maxHealth,
  stamina, maxStamina, hunger, essences, biomeName, biomeFadeTimer, weatherType,
  onSelectSlot, onToggleMenu,
}: GameHUDProps) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const healthPercent = (health / maxHealth) * 100;
  const healthColor = healthPercent > 60 ? "#a78bfa" : healthPercent > 30 ? "#10b981" : "#06b6d4";
  const staminaPercent = (stamina / maxStamina) * 100;
  const staminaColor = staminaPercent > 50 ? "#2dd4a8" : staminaPercent > 20 ? "#10b981" : "#06b6d4";
  const hungerPercent = hunger;
  const hungerColor = hungerPercent > 60 ? "#10b981" : hungerPercent > 30 ? "#fb923c" : "#06b6d4";
  const weather = WEATHER_LABELS[weatherType] || WEATHER_LABELS.clear;
  const essenceEntries = Object.entries(essences).filter(([, count]) => count > 0);

  return (
    <div className="dw-hud">
      {/* Crosshair */}
      <div className="dw-crosshair">
        <div className="dw-crosshair-h" />
        <div className="dw-crosshair-v" />
      </div>

      {/* Top bar */}
      <div className="dw-hud-top">
        <span className="dw-hud-text">
          {Math.floor(player.position.x)} / {Math.floor(player.position.y)} / {Math.floor(player.position.z)}
        </span>
        <span className="dw-hud-sep">│</span>
        <span className="dw-hud-text">{fps} FPS</span>
        <span className="dw-hud-sep">│</span>
        <span className="dw-hud-text">{playerCount} online</span>
        <span className="dw-hud-sep">│</span>
        <span className="dw-hud-text">⏰ {time}</span>
        <span className="dw-hud-sep">│</span>
        <span className="dw-hud-text">{weather.icon} {weather.name}</span>
        {flying && <><span className="dw-hud-sep">│</span><span className="dw-hud-text dw-hud-fly">FLYING</span></>}
      </div>

      {/* Biome name */}
      {biomeName && biomeFadeTimer > 0 && (
        <div className="dw-biome-name" style={{ opacity: Math.min(1, biomeFadeTimer) }}>
          {biomeName}
        </div>
      )}

      {/* Health bar */}
      <div className="dw-health-bar">
        <div className="dw-health-icon">♥</div>
        <div className="dw-health-track">
          <div className="dw-health-fill" style={{ width: `${healthPercent}%`, background: healthColor }} />
        </div>
        <span className="dw-health-text">{Math.floor(health)}/{maxHealth}</span>
      </div>

      {/* Stamina bar */}
      <div className="dw-stamina-bar">
        <div className="dw-stamina-icon">◈</div>
        <div className="dw-stamina-track">
          <div className="dw-stamina-fill" style={{ width: `${staminaPercent}%`, background: staminaColor }} />
        </div>
        <span className="dw-stamina-text">{Math.floor(stamina)}</span>
      </div>

      {/* Hunger bar */}
      <div className="dw-hunger-bar">
        <div className="dw-hunger-icon">🍖</div>
        <div className="dw-hunger-track">
          <div className="dw-hunger-fill" style={{ width: `${hungerPercent}%`, background: hungerColor }} />
        </div>
        <span className="dw-hunger-text">{Math.floor(hunger)}</span>
      </div>

      {/* Resonance orb */}
      <div className="dw-resonance">
        <div className="dw-resonance-ring" style={{
          background: `conic-gradient(rgba(157,124,216,0.6) ${resonance * 3.6}deg, rgba(157,124,216,0.1) ${resonance * 3.6}deg)`,
        }} />
        <div className="dw-resonance-inner">
          <span className="dw-resonance-value">{Math.floor(resonance)}</span>
        </div>
      </div>

      {/* Hotbar */}
      <div className="dw-hotbar">
        {hotbar.slots.map((slot, i) => {
          const block = slot.blockId > 0 ? getBlockDef(slot.blockId) : null;
          return (
            <button key={i} className={`dw-hotbar-slot ${hotbar.activeIndex === i ? "active" : ""}`} onClick={() => onSelectSlot(i)}>
              {block && (
                <>
                  <div className="dw-hotbar-block" style={{ background: block.color }} />
                  {slot.count > 1 && <span className="dw-hotbar-count">{slot.count}</span>}
                </>
              )}
              <span className="dw-hotbar-key">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {hotbar.slots[hotbar.activeIndex]?.blockId > 0 && (
        <div className="dw-active-block">
          {getBlockDef(hotbar.slots[hotbar.activeIndex].blockId)?.name}
        </div>
      )}

      {/* Essence inventory */}
      {essenceEntries.length > 0 && (
        <div className="dw-essences">
          {essenceEntries.map(([blockId, count]) => {
            const info = ESSENCE_BLOCKS[Number(blockId)];
            if (!info) return null;
            return (
              <div key={blockId} className="dw-essence" title={info.name}>
                <span className="dw-essence-icon" style={{ color: info.color }}>{info.icon}</span>
                <span className="dw-essence-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="dw-hints">
        <span className="dw-hint">E Blocks</span>
        <span className="dw-hint">C Craft</span>
        <span className="dw-hint">T Chat</span>
        <span className="dw-hint">F Fly</span>
        <span className="dw-hint">⇧ Sprint</span>
      </div>

      <button onClick={onToggleMenu} className="dw-menu-btn">ESC</button>
    </div>
  );
}
