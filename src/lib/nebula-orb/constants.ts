import { SkinDef } from "./types";

export const MAP_WIDTH = 10000;
export const MAP_HEIGHT = 10000;

export const ORB_BASE_RADIUS = 15;
export const ORB_MIN_RADIUS = 8;
export const ORB_MAX_RADIUS = 120;
export const ORB_FOOD_GROWTH = 0.35;
export const ORB_BOOST_SHRINK = 0.04;
export const ORB_BOOST_MIN = 12;

// Difficulty-based growth multipliers
export const GROWTH_CHILL = 1.5;
export const GROWTH_NORMAL = 0.8;
export const GROWTH_INTENSE = 0.35;

// Difficulty-based food values
export const FOOD_VALUE_CHILL = 2.0;
export const FOOD_VALUE_NORMAL = 1.0;
export const FOOD_VALUE_INTENSE = 0.5;

// Difficulty-based kill growth
export const KILL_GROWTH_CHILL = 0.5;
export const KILL_GROWTH_NORMAL = 0.3;
export const KILL_GROWTH_INTENSE = 0.15;

export const ORB_BASE_SPEED = 2.8;
export const ORB_BOOST_SPEED = 5.5;
export const ORB_SPEED_ACCELERATION = 0.15;
export const ORB_SPEED_FRICTION = 0.92;
export const ORB_FRICTION = 0.96;

export const FOOD_COUNT = 1500;
export const FOOD_RADIUS_MIN = 2.5;
export const FOOD_RADIUS_MAX = 6;
export const FOOD_VALUE_MIN = 1.5;
export const FOOD_VALUE_MAX = 6;
export const FOOD_SPAWN_INTERVAL = 60;
export const FOOD_DESPAWN_TIME = 30000;

export const POWERUP_COUNT = 24;
export const POWERUP_RADIUS = 10;
export const POWERUP_SPAWN_INTERVAL = 3500;
export const POWERUP_DESPAWN_TIME = 20000;

export const POWERUP_DURATION_SPEED = 5000;
export const POWERUP_DURATION_SHIELD = 4000;
export const POWERUP_DURATION_GHOST = 6000;
export const POWERUP_DURATION_GLOW = 8000;
export const POWERUP_DURATION_MAGNET = 7000;
export const POWERUP_DURATION_SHRINK = 5000;

export const SPAWN_INVINCIBILITY_DURATION = 3000;

export const KILL_FOOD_DROP_COUNT = 20;
export const KILL_FOOD_VALUE = 3;

export const DEATH_PARTICLE_COUNT = 40;
export const DEATH_PARTICLE_SPEED = 5;
export const DEATH_PARTICLE_LIFE = 70;

export const TRAIL_DOT_COUNT = 2;
export const TRAIL_LIFETIME = 30;

export const GRAVITY_WELL_COUNT = 8;
export const GRAVITY_WELL_RADIUS = 100;
export const GRAVITY_WELL_PULL_RADIUS = 450;
export const GRAVITY_WELL_STRENGTH = 0.06;

export const WORMHOLE_COUNT = 6;
export const WORMHOLE_RADIUS = 35;
export const WORMHOLE_COOLDOWN = 3000;

export const COSMIC_RIFT_COUNT = 6;
export const COSMIC_RIFT_DAMAGE = 0.03;

export const STORM_COUNT = 4;
export const STORM_SPAWN_INTERVAL = 15000;
export const STORM_MAX_LIFETIME = 600;

export const ECLIPSE_KILLS_REQUIRED = 3;
export const ECLIPSE_DURATION = 8000;
export const ECLIPSE_SPEED_MULTIPLIER = 1.3;
export const ECLIPSE_RADIUS_REGEN = 0.02;

export const MAGNET_RANGE = 250;
export const MAGNET_STRENGTH = 0.03;

export const SHRINK_RADIUS_RATIO = 0.5;
export const SHRINK_SPEED_MULTIPLIER = 1.5;

export const MASS_PULSE_RADIUS = 200;
export const MASS_PULSE_FORCE = 4;
export const MASS_PULSE_COOLDOWN = 2000;
export const MASS_PULSE_COST = 2;

export const SINGULARITY_INITIAL_RADIUS = 50;
export const SINGULARITY_GROWTH_RATE = 0.003;
export const SINGULARITY_MAX_RADIUS = 600;
export const SINGULARITY_PULL_RADIUS = 800;
export const SINGULARITY_PULL_STRENGTH = 0.04;
export const SINGULARITY_DAMAGE = 0.05;

export const ORB_COLORS = [
  { body: "#3b82f6", inner: "#93c5fd", glow: "rgba(59, 130, 246, 0.5)", eye: "#ffffff", accent: "#93c5fd", ring: "rgba(147, 197, 253, 0.3)" },
  { body: "#ef4444", inner: "#fca5a5", glow: "rgba(239, 68, 68, 0.5)", eye: "#ffffff", accent: "#fca5a5", ring: "rgba(252, 165, 165, 0.3)" },
  { body: "#10b981", inner: "#6ee7b7", glow: "rgba(16, 185, 129, 0.5)", eye: "#ffffff", accent: "#6ee7b7", ring: "rgba(110, 231, 183, 0.3)" },
  { body: "#f97316", inner: "#fdba74", glow: "rgba(249, 115, 22, 0.5)", eye: "#ffffff", accent: "#fdba74", ring: "rgba(253, 186, 116, 0.3)" },
  { body: "#ec4899", inner: "#f9a8d4", glow: "rgba(236, 72, 153, 0.5)", eye: "#ffffff", accent: "#f9a8d4", ring: "rgba(249, 168, 212, 0.3)" },
  { body: "#eab308", inner: "#fde047", glow: "rgba(234, 179, 8, 0.5)", eye: "#1a0a00", accent: "#fde047", ring: "rgba(253, 224, 71, 0.3)" },
  { body: "#a855f7", inner: "#d8b4fe", glow: "rgba(168, 85, 247, 0.5)", eye: "#ffffff", accent: "#d8b4fe", ring: "rgba(216, 180, 254, 0.3)" },
  { body: "#00cc6a", inner: "#67e8f9", glow: "rgba(0, 204, 106, 0.5)", eye: "#ffffff", accent: "#67e8f9", ring: "rgba(103, 232, 249, 0.3)" },
];

export const PLASMA_FOOD = [{ color: "#ef4444", glow: "rgba(239, 68, 68, 0.8)" }];
export const VOID_FOOD = [{ color: "#00ff88", glow: "rgba(0, 255, 136, 0.8)" }];
export const SOLAR_FOOD = [{ color: "#fbbf24", glow: "rgba(251, 191, 36, 0.9)" }];
export const COSMIC_FOOD = [{ color: "#22d3ee", glow: "rgba(34, 211, 238, 0.8)" }];
export const NEBULA_FOOD = [{ color: "#00cc6a", glow: "rgba(0, 204, 106, 0.8)" }];

export const POWERUP_COLORS: Record<string, { color: string; glow: string; icon: string; ring: string }> = {
  speed: { color: "#0ea5e9", glow: "rgba(14, 165, 233, 0.8)", icon: "⚡", ring: "rgba(14, 165, 233, 0.3)" },
  shield: { color: "#10b981", glow: "rgba(16, 185, 129, 0.8)", icon: "🛡", ring: "rgba(16, 185, 129, 0.3)" },
  ghost: { color: "#5eead4", glow: "rgba(94, 234, 212, 0.8)", icon: "👻", ring: "rgba(94, 234, 212, 0.3)" },
  glow: { color: "#00cc6a", glow: "rgba(0, 204, 106, 0.8)", icon: "💡", ring: "rgba(0, 204, 106, 0.3)" },
  magnet: { color: "#00ff88", glow: "rgba(0, 255, 136, 0.8)", icon: "🧲", ring: "rgba(0, 255, 136, 0.3)" },
  shrink: { color: "#2dd4bf", glow: "rgba(45, 212, 191, 0.8)", icon: "✨", ring: "rgba(45, 212, 191, 0.3)" },
  freeze: { color: "#22d3ee", glow: "rgba(34, 211, 238, 0.8)", icon: "❄", ring: "rgba(34, 211, 238, 0.3)" },
  rage: { color: "#00ff88", glow: "rgba(0, 255, 136, 0.8)", icon: "🔥", ring: "rgba(0, 255, 136, 0.3)" },
  phase: { color: "#5eead4", glow: "rgba(94, 234, 212, 0.8)", icon: "🌀", ring: "rgba(94, 234, 212, 0.3)" },
};

export const POWERUP_DURATION_FREEZE = 5000;
export const POWERUP_DURATION_RAGE = 6000;
export const POWERUP_DURATION_PHASE = 4000;
export const FREEZE_RADIUS = 300;
export const FREEZE_STRENGTH = 0.5;
export const RAGE_SIZE_MULTIPLIER = 1.5;
export const RAGE_SPEED_MULTIPLIER = 1.4;

export const SKIN_DEFINITIONS: SkinDef[] = [
  { id: "quantum", name: "Quantum", bodyColor: "#3b82f6", innerColor: "#93c5fd", glowColor: "rgba(59, 130, 246, 0.5)", eyeColor: "#ffffff", accentColor: "#93c5fd", ringColor: "rgba(147, 197, 253, 0.3)" },
  { id: "plasma-core", name: "Plasma Core", bodyColor: "#ef4444", innerColor: "#fca5a5", glowColor: "rgba(239, 68, 68, 0.5)", eyeColor: "#ffffff", accentColor: "#fca5a5", ringColor: "rgba(252, 165, 165, 0.3)" },
  { id: "circuit", name: "Circuit", bodyColor: "#10b981", innerColor: "#6ee7b7", glowColor: "rgba(16, 185, 129, 0.5)", eyeColor: "#ffffff", accentColor: "#6ee7b7", ringColor: "rgba(110, 231, 183, 0.3)" },
  { id: "neon-wireframe", name: "Neon Wire", bodyColor: "#f97316", innerColor: "#fdba74", glowColor: "rgba(249, 115, 22, 0.5)", eyeColor: "#ffffff", accentColor: "#fdba74", ringColor: "rgba(253, 186, 116, 0.3)" },
  { id: "holo", name: "Holographic", bodyColor: "#ec4899", innerColor: "#f9a8d4", glowColor: "rgba(236, 72, 153, 0.5)", eyeColor: "#ffffff", accentColor: "#f9a8d4", ringColor: "rgba(249, 168, 212, 0.3)" },
  { id: "fusion", name: "Fusion", bodyColor: "#eab308", innerColor: "#fde047", glowColor: "rgba(234, 179, 8, 0.5)", eyeColor: "#1a0a00", accentColor: "#fde047", ringColor: "rgba(253, 224, 71, 0.3)" },
  { id: "dark-matter", name: "Dark Matter", bodyColor: "#1e293b", innerColor: "#334155", glowColor: "rgba(30, 41, 59, 0.5)", eyeColor: "#22d3ee", accentColor: "#475569", ringColor: "rgba(51, 65, 85, 0.3)" },
  { id: "solar-flare", name: "Solar Flare", bodyColor: "#f43f5e", innerColor: "#fb7185", glowColor: "rgba(244, 63, 94, 0.5)", eyeColor: "#ffffff", accentColor: "#fb7185", ringColor: "rgba(251, 113, 133, 0.3)" },
  { id: "ice-core", name: "Ice Core", bodyColor: "#00cc6a", innerColor: "#67e8f9", glowColor: "rgba(0, 204, 106, 0.5)", eyeColor: "#ffffff", accentColor: "#a5f3fc", ringColor: "rgba(165, 243, 252, 0.3)" },
  { id: "void", name: "Void", bodyColor: "#6366f1", innerColor: "#a5b4fc", glowColor: "rgba(99, 102, 241, 0.5)", eyeColor: "#ffffff", accentColor: "#a5b4fc", ringColor: "rgba(165, 180, 252, 0.3)" },
  { id: "cyber", name: "Cyber", bodyColor: "#22c55e", innerColor: "#86efac", glowColor: "rgba(34, 197, 94, 0.5)", eyeColor: "#ffffff", accentColor: "#86efac", ringColor: "rgba(134, 239, 172, 0.3)" },
  { id: "nova", name: "Nova", bodyColor: "#f59e0b", innerColor: "#fcd34d", glowColor: "rgba(245, 158, 11, 0.5)", eyeColor: "#ffffff", accentColor: "#fcd34d", ringColor: "rgba(252, 211, 77, 0.3)" },
  { id: "atomic", name: "Atomic", bodyColor: "#14b8a6", innerColor: "#5eead4", glowColor: "rgba(20, 184, 166, 0.5)", eyeColor: "#ffffff", accentColor: "#5eead4", ringColor: "rgba(94, 234, 212, 0.3)" },
  { id: "crystal", name: "Crystal", bodyColor: "#e2e8f0", innerColor: "#f1f5f9", glowColor: "rgba(226, 232, 240, 0.4)", eyeColor: "#3b82f6", accentColor: "#ffffff", ringColor: "rgba(241, 245, 249, 0.3)" },
  { id: "hex-grid", name: "Hex Grid", bodyColor: "#00ff88", innerColor: "#22d3ee", glowColor: "rgba(0, 255, 136, 0.5)", eyeColor: "#ffffff", accentColor: "#67e8f9", ringColor: "rgba(34, 211, 238, 0.3)" },
  { id: "nebula", name: "Nebula", bodyColor: "#a855f7", innerColor: "#d8b4fe", glowColor: "rgba(168, 85, 247, 0.5)", eyeColor: "#ffffff", accentColor: "#d8b4fe", ringColor: "rgba(216, 180, 254, 0.3)" },
  { id: "aurora", name: "Aurora", bodyColor: "#84cc16", innerColor: "#bef264", glowColor: "rgba(132, 204, 22, 0.5)", eyeColor: "#ffffff", accentColor: "#bef264", ringColor: "rgba(190, 242, 100, 0.3)" },
  { id: "supernova", name: "Supernova", bodyColor: "#dc2626", innerColor: "#f87171", glowColor: "rgba(220, 38, 38, 0.5)", eyeColor: "#fbbf24", accentColor: "#f87171", ringColor: "rgba(248, 113, 113, 0.3)" },
  { id: "phantom", name: "Phantom", bodyColor: "#374151", innerColor: "#6b7280", glowColor: "rgba(55, 65, 81, 0.5)", eyeColor: "#22d3ee", accentColor: "#9ca3af", ringColor: "rgba(107, 114, 128, 0.3)" },
  { id: "starfire", name: "Starfire", bodyColor: "#fb923c", innerColor: "#fdba74", glowColor: "rgba(251, 146, 60, 0.5)", eyeColor: "#ffffff", accentColor: "#fed7aa", ringColor: "rgba(254, 215, 170, 0.3)" },
  { id: "cosmos", name: "Cosmos", bodyColor: "#2563eb", innerColor: "#60a5fa", glowColor: "rgba(37, 99, 235, 0.5)", eyeColor: "#ffffff", accentColor: "#93c5fd", ringColor: "rgba(96, 165, 250, 0.3)" },
  { id: "twilight", name: "Twilight", bodyColor: "#7c3aed", innerColor: "#a78bfa", glowColor: "rgba(124, 58, 237, 0.5)", eyeColor: "#ffffff", accentColor: "#c4b5fd", ringColor: "rgba(167, 139, 250, 0.3)" },
  { id: "ember", name: "Ember", bodyColor: "#ea580c", innerColor: "#fb923c", glowColor: "rgba(234, 88, 12, 0.5)", eyeColor: "#fde047", accentColor: "#fdba74", ringColor: "rgba(251, 146, 60, 0.3)" },
  { id: "glacier", name: "Glacier", bodyColor: "#0ea5e9", innerColor: "#7dd3fc", glowColor: "rgba(14, 165, 233, 0.5)", eyeColor: "#ffffff", accentColor: "#bae6fd", ringColor: "rgba(125, 211, 252, 0.3)" },
  { id: "storm", name: "Storm", bodyColor: "#475569", innerColor: "#94a3b8", glowColor: "rgba(71, 85, 105, 0.5)", eyeColor: "#38bdf8", accentColor: "#cbd5e1", ringColor: "rgba(148, 163, 184, 0.3)" },
  { id: "radiance", name: "Radiance", bodyColor: "#fbbf24", innerColor: "#fde68a", glowColor: "rgba(251, 191, 36, 0.5)", eyeColor: "#7c2d12", accentColor: "#fef3c7", ringColor: "rgba(253, 230, 138, 0.3)" },
];
