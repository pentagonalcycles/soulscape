export interface Vec2 {
  x: number;
  y: number;
}

export type PowerUpType = "speed" | "shield" | "ghost" | "glow" | "magnet" | "shrink" | "freeze" | "rage" | "phase";

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  spawnTime: number;
  pulsePhase: number;
  rotation: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}

export interface FoodParticle {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  value: number;
  pulsePhase: number;
  spawnTime: number;
  type: "normal" | "plasma" | "void" | "solar" | "cosmic" | "nebula";
}

export interface Orb {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  speed: number;
  targetSpeed: number;
  baseSpeed: number;
  boostSpeed: number;
  isBoosting: boolean;
  score: number;
  kills: number;
  killStreak: number;
  eclipseMode: boolean;
  eclipseTimer: number;
  color: string;
  glowColor: string;
  skin: SkinDef;
  alive: boolean;
  spawnTime: number;
  invincibleUntil: number;
  activePowerUps: ActivePowerUp[];
  lastUpdate: number;
  pulseTimer: number;
  massPulseActive: boolean;
  massPulseRadius: number;
  trail: TrailDot[];
  wobble: number;
  targetAngle: number;
  isRemote?: boolean;
  customization: OrbCustomization;
  _ai?: {
    wanderAngle: number;
    wanderTimer: number;
    boostTimer: number;
    targetX: number;
    targetY: number;
    aggression: number;
    fearFactor: number;
    lastKillTime: number;
  };
}

export interface TrailDot {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface GravityWell {
  id: string;
  x: number;
  y: number;
  strength: number;
  radius: number;
  pullRadius: number;
  rotation: number;
  pulsePhase: number;
}

export interface Wormhole {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  partnerId: string;
  radius: number;
  rotation: number;
  active: boolean;
  cooldown: number;
}

export interface CosmicRift {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  damage: number;
  speed: number;
  rotationSpeed: number;
  pulsePhase: number;
}

export interface Storm {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  intensity: number;
  rotation: number;
  lifetime: number;
  color: string;
  type: "electromagnetic" | "void" | "solar";
}

export interface Singularity {
  x: number;
  y: number;
  radius: number;
  growthRate: number;
  pullStrength: number;
  pullRadius: number;
  maxRadius: number;
  phase: number;
}

export interface SkinDef {
  id: string;
  name: string;
  bodyColor: string;
  innerColor: string;
  glowColor: string;
  eyeColor: string;
  accentColor: string;
  ringColor: string;
}

export type PetStyle = "none" | "nova" | "stardust" | "cosmo" | "luna" | "pulsar" | "nebula" | "stella" | "wisp" | "flare" | "aurora";
export type BodyPattern = "none" | "circuit" | "stripes" | "dots" | "hex" | "wave" | "swirl" | "rings" | "diamond" | "stars";
export type TrailStyle = "dots" | "glow" | "sparkle" | "line" | "ribbon" | "flame" | "aurora" | "petal";

export interface OrbCustomization {
  petStyle: PetStyle;
  bodyPattern: BodyPattern;
  trailStyle: TrailStyle;
}

export const PET_STYLES: { id: PetStyle; name: string; icon: string }[] = [
  { id: "none", name: "None", icon: "○" },
  { id: "nova", name: "Nova", icon: "⭐" },
  { id: "stardust", name: "Stardust", icon: "✨" },
  { id: "cosmo", name: "Cosmo", icon: "🌟" },
  { id: "luna", name: "Luna", icon: "🌙" },
  { id: "pulsar", name: "Pulsar", icon: "✦" },
  { id: "nebula", name: "Nebula", icon: "✧" },
  { id: "stella", name: "Stella", icon: "✴" },
  { id: "wisp", name: "Wisp", icon: "👻" },
  { id: "flare", name: "Flare", icon: "💥" },
  { id: "aurora", name: "Aurora", icon: "🌈" },
];

export const BODY_PATTERNS: { id: BodyPattern; name: string; icon: string }[] = [
  { id: "none", name: "Clean", icon: "○" },
  { id: "circuit", name: "Circuit", icon: "⚡" },
  { id: "stripes", name: "Stripes", icon: "≡" },
  { id: "dots", name: "Dots", icon: "∷" },
  { id: "hex", name: "Hex", icon: "⬡" },
  { id: "wave", name: "Wave", icon: "∿" },
  { id: "swirl", name: "Swirl", icon: "🌀" },
  { id: "rings", name: "Rings", icon: "◎" },
  { id: "diamond", name: "Diamond", icon: "◆" },
  { id: "stars", name: "Stars", icon: "⁂" },
];

export const TRAIL_STYLES: { id: TrailStyle; name: string; icon: string }[] = [
  { id: "dots", name: "Dots", icon: "⋯" },
  { id: "glow", name: "Glow", icon: "✨" },
  { id: "sparkle", name: "Sparkle", icon: "💫" },
  { id: "line", name: "Line", icon: "━" },
  { id: "ribbon", name: "Ribbon", icon: "〰" },
  { id: "flame", name: "Flame", icon: "🔥" },
  { id: "aurora", name: "Aurora", icon: "🌈" },
  { id: "petal", name: "Petal", icon: "🌸" },
];

export interface GameCamera {
  x: number;
  y: number;
  zoom: number;
  targetZoom: number;
  shake: number;
}

export interface GameState {
  orbs: Map<string, Orb>;
  food: FoodParticle[];
  powerUps: PowerUp[];
  gravityWells: GravityWell[];
  wormholes: Wormhole[];
  cosmicRifts: CosmicRift[];
  storms: Storm[];
  singularity: Singularity;
  mapWidth: number;
  mapHeight: number;
  gameTime: number;
  lastFoodSpawn: number;
  lastPowerUpSpawn: number;
  lastStormSpawn: number;
  playerId: string | null;
  particles: DeathParticle[];
  collectParticles: CollectParticle[];
  killFeed: KillFeedEntry[];
  screenShake: number;
  notifications: Notification[];
  difficulty: GameDifficulty;
}

export interface Notification {
  id: string;
  text: string;
  type: "kill" | "powerup" | "eclipse" | "rift" | "wormhole" | "singularity";
  time: number;
  duration: number;
}

export interface CollectParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface DeathParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  type: "circle" | "spark" | "ring" | "shard";
}

export interface KillFeedEntry {
  killer: string;
  victim: string;
  time: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  radius: number;
  kills: number;
}

export interface GameOverStats {
  score: number;
  radius: number;
  kills: number;
  timeSurvived: number;
  rank: number;
}

export interface MultiplayerUpdate {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  score: number;
  kills: number;
  color: string;
  skinId: string;
  alive: boolean;
  activePowerUps: ActivePowerUp[];
  customization?: OrbCustomization;
}

export type GameMode = "ffa" | "solo" | "zen";
export type GameDifficulty = "chill" | "normal" | "intense";
export type MapSize = "small" | "medium" | "large";

export interface GameSettings {
  mode: GameMode;
  difficulty: GameDifficulty;
  mapSize: MapSize;
}

export const GAME_MODES: { id: GameMode; name: string; icon: string; desc: string }[] = [
  { id: "ffa", name: "Free For All", icon: "⚔", desc: "Bots + multiplayer" },
  { id: "solo", name: "Solo Practice", icon: "🎯", desc: "Bots only, train alone" },
  { id: "zen", name: "Zen Garden", icon: "🌿", desc: "No enemies, just peace" },
];

export const DIFFICULTIES: { id: GameDifficulty; name: string; icon: string; botCount: number; speedMult: number }[] = [
  { id: "chill", name: "Chill", icon: "☁", botCount: 15, speedMult: 0.7 },
  { id: "normal", name: "Normal", icon: "◈", botCount: 25, speedMult: 1.0 },
  { id: "intense", name: "Intense", icon: "🔥", botCount: 40, speedMult: 1.3 },
];

export const MAP_SIZES: { id: MapSize; name: string; icon: string; width: number; height: number }[] = [
  { id: "small", name: "Small", icon: "◆", width: 8000, height: 8000 },
  { id: "medium", name: "Medium", icon: "◈", width: 15000, height: 15000 },
  { id: "large", name: "Large", icon: "◇", width: 25000, height: 25000 },
];
