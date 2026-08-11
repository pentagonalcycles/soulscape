"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SKIN_DEFINITIONS } from "@/lib/nebula-orb/constants";
import { OrbCustomization, GameSettings, BodyPattern, TrailStyle, PetStyle } from "@/lib/nebula-orb/types";

interface GameLobbyProps {
  onStart: (name: string, skinId: string, customization: OrbCustomization, settings: GameSettings) => void;
  isMobile?: boolean;
  siteBg?: string | null;
}

const TRAIL_STYLES: { id: TrailStyle; name: string; icon: string }[] = [
  { id: "dots", name: "Dots", icon: "•••" },
  { id: "line", name: "Line", icon: "───" },
  { id: "glow", name: "Glow", icon: "≈≈≈" },
  { id: "ribbon", name: "Ribbon", icon: "~~~" },
  { id: "sparkle", name: "Sparkle", icon: "✦✦✦" },
  { id: "flame", name: "Flame", icon: "🔥" },
  { id: "aurora", name: "Aurora", icon: "🌈" },
  { id: "petal", name: "Petal", icon: "🌸" },
];

const BODY_PATTERNS: { id: BodyPattern; name: string }[] = [
  { id: "circuit", name: "Circuit" },
  { id: "rings", name: "Rings" },
  { id: "dots", name: "Dots" },
  { id: "stripes", name: "Stripes" },
  { id: "hex", name: "Hex" },
  { id: "wave", name: "Wave" },
  { id: "swirl", name: "Swirl" },
  { id: "diamond", name: "Diamond" },
  { id: "stars", name: "Stars" },
  { id: "none", name: "None" },
];

const PET_STYLES: { id: PetStyle; name: string; icon: string }[] = [
  { id: "none", name: "None", icon: "○" },
  { id: "nova", name: "Nova", icon: "⭐" },
  { id: "stardust", name: "Glow", icon: "✨" },
  { id: "cosmo", name: "Cosmo", icon: "🌟" },
  { id: "luna", name: "Luna", icon: "🌙" },
  { id: "pulsar", name: "Pulsar", icon: "✦" },
  { id: "nebula", name: "Nebula", icon: "✧" },
  { id: "stella", name: "Stella", icon: "✴" },
  { id: "wisp", name: "Wisp", icon: "👻" },
  { id: "flare", name: "Flare", icon: "💥" },
  { id: "aurora", name: "Aurora", icon: "🌈" },
];

const GAME_MODES = [
  { id: "ffa" as const, name: "Free For All", icon: "⚔", desc: "Bots + multiplayer" },
  { id: "solo" as const, name: "Solo Practice", icon: "🎯", desc: "Bots only, train alone" },
  { id: "zen" as const, name: "Zen Garden", icon: "🌿", desc: "No enemies, just peace" },
];

export default function GameLobby({ onStart, isMobile = false, siteBg }: GameLobbyProps) {
  const [name, setName] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("quantum");
  const [difficulty, setDifficulty] = useState<"chill" | "normal" | "intense">("normal");
  const [mapSize, setMapSize] = useState<"small" | "medium" | "large">("medium");
  const [gameMode, setGameMode] = useState<"ffa" | "solo" | "zen">("ffa");
  const [trailStyle, setTrailStyle] = useState<TrailStyle>("dots");
  const [bodyPattern, setBodyPattern] = useState<BodyPattern>("circuit");
  const [petStyle, setPetStyle] = useState<PetStyle>("nova");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bgColor, setBgColor] = useState(siteBg || "#050510");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentSkin = SKIN_DEFINITIONS.find((s) => s.id === selectedSkin) || SKIN_DEFINITIONS[0];

  // Game colors
  const pageBg = bgColor;
  const isLightBg = (() => {
    if (bgColor.startsWith("#") && bgColor.length >= 7) {
      const r = parseInt(bgColor.slice(1, 3), 16) / 255;
      const g = parseInt(bgColor.slice(3, 5), 16) / 255;
      const b = parseInt(bgColor.slice(5, 7), 16) / 255;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.5;
    }
    return false;
  })();
  const cardBg = isLightBg ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.04)";
  const cardBorder = isLightBg ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.1)";
  const cardShadow = isLightBg ? "0 8px 40px rgba(0,0,0,0.06)" : "0 8px 40px rgba(0,0,0,0.3)";
  const titleColor = "#0d9488";
  const subtitleColor = isLightBg ? "rgba(15, 23, 42, 0.5)" : "rgba(148, 163, 184, 0.6)";
  const labelColor = isLightBg ? "rgba(15, 23, 42, 0.6)" : "rgba(148, 163, 184, 0.5)";
  const inputBg = isLightBg ? "rgba(13, 148, 136, 0.08)" : "rgba(255, 255, 255, 0.05)";
  const inputBorder = isLightBg ? "rgba(13, 148, 136, 0.15)" : "rgba(255, 255, 255, 0.08)";
  const inputText = isLightBg ? "#0f172a" : "#e2e8f0";
  const activeBg = isLightBg ? "rgba(13, 148, 136, 0.12)" : "rgba(13, 148, 136, 0.2)";
  const activeBorder = isLightBg ? "rgba(13, 148, 136, 0.25)" : "rgba(13, 148, 136, 0.35)";
  const activeText = "#0d9488";
  const inactiveBg = isLightBg ? "rgba(13, 148, 136, 0.04)" : "rgba(255, 255, 255, 0.04)";
  const inactiveBorder = isLightBg ? "rgba(13, 148, 136, 0.1)" : "rgba(255, 255, 255, 0.06)";
  const inactiveText = isLightBg ? "rgba(15, 23, 42, 0.5)" : "rgba(148, 163, 184, 0.5)";
  const hintColor = isLightBg ? "rgba(15, 23, 42, 0.35)" : "rgba(100, 116, 139, 0.5)";
  const orbGlow1 = isLightBg ? "rgba(13,148,136,0.06)" : "rgba(13,148,136,0.1)";
  const orbGlow2 = isLightBg ? "rgba(6,182,212,0.04)" : "rgba(6,182,212,0.08)";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = isMobile ? 120 : 160;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = isMobile ? 38 : 50;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#000";
    ctx.filter = "blur(10px)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.3, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();

    const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 2.5);
    glow.addColorStop(0, currentSkin.glowColor);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2); ctx.fill();

    const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    body.addColorStop(0, currentSkin.innerColor);
    body.addColorStop(0.6, currentSkin.bodyColor);
    body.addColorStop(1, currentSkin.glowColor);
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    const glass = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx - r * 0.2, cy - r * 0.2, r * 0.6);
    glass.addColorStop(0, "rgba(255,255,255,0.25)");
    glass.addColorStop(0.5, "rgba(255,255,255,0.08)");
    glass.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glass;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = currentSkin.ringColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = currentSkin.eyeColor;
    ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.28, cy - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.2, r * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.28, cy - r * 0.2, r * 0.06, 0, Math.PI * 2); ctx.fill();
  }, [selectedSkin, currentSkin, isMobile]);

  const handleStart = () => {
    if (!name.trim()) return;
    onStart(name.trim(), selectedSkin, { petStyle, bodyPattern, trailStyle }, { mode: gameMode, difficulty, mapSize });
  };

  const updateBgColor = (color: string) => {
    setBgColor(color);
    localStorage.setItem("bg-color", color);
  };

  const bgPresets = [
    { name: "Dark", value: "#050510" },
    { name: "Midnight", value: "#0a0a2e" },
    { name: "Deep Blue", value: "#0c1018" },
    { name: "Forest", value: "#0a1410" },
    { name: "White", value: "#ffffff" },
    { name: "Cream", value: "#fffdd0" },
    { name: "Mint", value: "#f5fffa" },
    { name: "Lavender", value: "#e6e6fa" },
    { name: "Rose", value: "#ffe4e1" },
    { name: "Sky", value: "#e8f4fd" },
    { name: "Sage", value: "#f0f4f0" },
    { name: "Peach", value: "#ffdab9" },
  ];

  return (
    <div
      className="absolute inset-0 flex items-start justify-center overflow-y-auto"
      style={{ background: pageBg, WebkitOverflowScrolling: "touch", transition: "background 0.5s ease" }}
    >
      {/* Ambient orbs */}
      <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full" style={{ background: `radial-gradient(circle, ${orbGlow1} 0%, transparent 70%)`, filter: "blur(80px)", transition: "background 0.5s ease" }} />
      <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: `radial-gradient(circle, ${orbGlow2} 0%, transparent 70%)`, filter: "blur(60px)", transition: "background 0.5s ease" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={isMobile
          ? "relative w-full max-w-sm mx-3 my-3 p-4 rounded-2xl"
          : "relative w-full max-w-md mx-4 my-6 p-5 sm:p-6 rounded-2xl"
        }
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: cardShadow,
          transition: "background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
        }}
      >
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className={isMobile ? "text-2xl mb-1" : "text-3xl mb-1"} style={{ color: titleColor, fontWeight: 200, letterSpacing: "0.05em" }}>Nebula Orb</h1>
          <p className="text-xs" style={{ color: subtitleColor }}>Consume. Grow. Dominate.</p>
        </div>

        {/* Orb preview */}
        <div className="flex justify-center mb-4">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <canvas ref={canvasRef} className="rounded-full" style={{ width: isMobile ? "120px" : "160px", height: isMobile ? "120px" : "160px" }} />
          </motion.div>
        </div>

        {/* Name input */}
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Player Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={16}
            onKeyDown={e => { if (e.key === "Enter") handleStart(); }}
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: inputText,
              outline: "none",
              fontSize: "16px",
              transition: "background 0.3s, border-color 0.3s",
            }}
          />
        </div>

        {/* Game mode selector */}
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Game Mode</label>
          <div className="grid grid-cols-3 gap-1.5">
            {GAME_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setGameMode(mode.id)}
                className={isMobile ? "py-2.5 rounded-lg text-xs text-center cursor-pointer transition-all" : "py-2 rounded-lg text-xs text-center cursor-pointer transition-all"}
                style={{
                  background: gameMode === mode.id ? activeBg : inactiveBg,
                  border: `1px solid ${gameMode === mode.id ? activeBorder : inactiveBorder}`,
                  color: gameMode === mode.id ? activeText : inactiveText,
                }}
              >
                <div className={isMobile ? "text-lg mb-0.5" : "text-base mb-0.5"}>{mode.icon}</div>
                <div className="font-medium">{mode.name}</div>
                <div className="text-[8px] opacity-60">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skin selector */}
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: labelColor }}>Choose Your Orb</label>
          <div className={isMobile ? "grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1" : "grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-44 overflow-y-auto pr-1"}>
            {SKIN_DEFINITIONS.map(skin => (
              <button
                key={skin.id}
                onClick={() => setSelectedSkin(skin.id)}
                className="p-2 rounded-xl text-center transition-all cursor-pointer"
                style={{
                  background: selectedSkin === skin.id ? activeBg : inactiveBg,
                  border: `1.5px solid ${selectedSkin === skin.id ? activeBorder : inactiveBorder}`,
                  boxShadow: selectedSkin === skin.id ? `0 0 12px ${skin.bodyColor}30` : "none",
                }}
              >
                <div className={isMobile ? "w-6 h-6 rounded-full mx-auto mb-1" : "w-7 h-7 rounded-full mx-auto mb-1"} style={{ background: `linear-gradient(135deg, ${skin.innerColor}, ${skin.bodyColor})`, boxShadow: `0 0 8px ${skin.glowColor}` }} />
                <div className="text-[9px] truncate" style={{ color: selectedSkin === skin.id ? activeText : inactiveText }}>{skin.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Background</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={bgColor.startsWith("#") ? bgColor : "#050510"}
              onChange={(e) => updateBgColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              style={{ background: "none" }}
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateBgColor(val);
              }}
              maxLength={7}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none font-mono"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputText }}
              placeholder="#050510"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {bgPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => updateBgColor(preset.value)}
                className="w-full aspect-square rounded-lg cursor-pointer transition-all"
                title={preset.name}
                style={{
                  background: preset.value,
                  border: bgColor === preset.value ? `2px solid ${activeText}` : `1px solid ${inactiveBorder}`,
                  transform: bgColor === preset.value ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Game settings */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Difficulty</label>
            <div className="flex gap-1">
              {(["chill", "normal", "intense"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={isMobile ? "flex-1 py-2 rounded-lg text-xs capitalize cursor-pointer transition-all" : "flex-1 py-1.5 rounded-lg text-xs capitalize cursor-pointer transition-all"}
                  style={{ background: difficulty === d ? activeBg : inactiveBg, border: `1px solid ${difficulty === d ? activeBorder : inactiveBorder}`, color: difficulty === d ? activeText : inactiveText }}
                >{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Map Size</label>
            <div className="flex gap-1">
              {(["small", "medium", "large"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setMapSize(s)}
                  className={isMobile ? "flex-1 py-2 rounded-lg text-xs capitalize cursor-pointer transition-all" : "flex-1 py-1.5 rounded-lg text-xs capitalize cursor-pointer transition-all"}
                  style={{ background: mapSize === s ? activeBg : inactiveBg, border: `1px solid ${mapSize === s ? activeBorder : inactiveBorder}`, color: mapSize === s ? activeText : inactiveText }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced options toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2 mb-2 text-xs cursor-pointer"
          style={{ background: "none", border: "none", color: labelColor }}
        >
          <span>Advanced Options</span>
          <span>{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {/* Advanced options */}
        {showAdvanced && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mb-3 space-y-3">
            {/* Trail style */}
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Trail Style</label>
              <div className={isMobile ? "grid grid-cols-4 gap-1" : "grid grid-cols-4 gap-1.5"}>
                {TRAIL_STYLES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTrailStyle(t.id)}
                    className={isMobile ? "py-2.5 rounded-lg text-xs text-center cursor-pointer transition-all" : "py-2 rounded-lg text-xs text-center cursor-pointer transition-all"}
                    style={{
                      background: trailStyle === t.id ? activeBg : inactiveBg,
                      border: `1px solid ${trailStyle === t.id ? activeBorder : inactiveBorder}`,
                      color: trailStyle === t.id ? activeText : inactiveText,
                    }}
                  >
                    <div className="text-base mb-0.5">{t.icon}</div>
                    <div>{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Body pattern */}
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Body Pattern</label>
              <div className={isMobile ? "grid grid-cols-5 gap-1" : "grid grid-cols-5 gap-1.5"}>
                {BODY_PATTERNS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setBodyPattern(p.id)}
                    className={isMobile ? "py-2 rounded-lg text-[10px] text-center cursor-pointer transition-all" : "py-1.5 rounded-lg text-[10px] text-center cursor-pointer transition-all"}
                    style={{
                      background: bodyPattern === p.id ? activeBg : inactiveBg,
                      border: `1px solid ${bodyPattern === p.id ? activeBorder : inactiveBorder}`,
                      color: bodyPattern === p.id ? activeText : inactiveText,
                    }}
                  >{p.name}</button>
                ))}
              </div>
            </div>

            {/* Pet companion */}
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: labelColor }}>Pet Companion</label>
              <div className={isMobile ? "grid grid-cols-4 gap-1" : "grid grid-cols-4 gap-1.5"}>
                {PET_STYLES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPetStyle(p.id)}
                    className={isMobile ? "py-2.5 rounded-lg text-xs text-center cursor-pointer transition-all" : "py-2 rounded-lg text-xs text-center cursor-pointer transition-all"}
                    style={{
                      background: petStyle === p.id ? activeBg : inactiveBg,
                      border: `1px solid ${petStyle === p.id ? activeBorder : inactiveBorder}`,
                      color: petStyle === p.id ? activeText : inactiveText,
                    }}
                  >
                    <div className="text-base mb-0.5">{p.icon}</div>
                    <div>{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Play button */}
        <motion.button
          onClick={handleStart}
          disabled={!name.trim()}
          className={isMobile
            ? "w-full py-4 rounded-xl text-base uppercase tracking-wider cursor-pointer transition-all"
            : "w-full py-3.5 rounded-xl text-sm uppercase tracking-wider cursor-pointer transition-all"
          }
          style={{
            background: name.trim() ? "linear-gradient(135deg, #0d9488, #06b6d4)" : "rgba(13, 148, 136, 0.06)",
            color: name.trim() ? "#ffffff" : "rgba(148, 163, 184, 0.3)",
            border: name.trim() ? "1px solid rgba(13, 148, 136, 0.3)" : "1px solid rgba(13, 148, 136, 0.08)",
            boxShadow: name.trim() ? "0 4px 20px rgba(13, 148, 136, 0.25)" : "none",
            fontWeight: 500,
            letterSpacing: "0.08em",
          }}
          whileHover={name.trim() ? { scale: 1.02 } : {}}
          whileTap={name.trim() ? { scale: 0.98 } : {}}
        >
          {name.trim() ? "▶  Play" : "Enter your name"}
        </motion.button>

        {/* Controls hint */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[9px]" style={{ color: hintColor }}>
          {isMobile ? (
            <>
              <div>👆 Drag — Move</div>
              <div>👆👆 Double-tap — Boost</div>
              <div>🤏 Pinch — Zoom</div>
              <div>⚡ Button — Boost</div>
            </>
          ) : (
            <>
              <div>🖱️ Mouse — Move</div>
              <div>🖱️ Click — Boost</div>
              <div>⌨️ WASD/Arrows — Move</div>
              <div>⌨️ Space — Boost</div>
              <div>⌨️ +/- — Zoom</div>
              <div>🖱️ Scroll — Zoom</div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
