// Dream World — Type Definitions

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BlockDef {
  id: number;
  name: string;
  category: BlockCategory;
  color: string;           // hex color for the block face
  colorTop?: string;       // optional different top face color
  colorSide?: string;      // optional different side face color
  transparent: boolean;
  solid: boolean;
  lightLevel: number;      // 0-15, emitted light
  hardness: number;        // 0 = instant break, 1 = normal, 2 = hard
  gravity: boolean;        // falls like sand
  flammable: boolean;
  interactive: boolean;    // has special use behavior
  emissive: boolean;       // glows (bloom target)
  roughness?: number;      // 0-1, surface roughness (default 0.85)
  metalness?: number;      // 0-1, metallic feel (default 0.05)
  texture?: string;        // texture atlas key (future)
}

export type BlockCategory =
  | "stone" | "wood" | "glass" | "glow" | "nature"
  | "vegetation" | "liquid" | "building" | "furniture"
  | "circuit" | "special" | "essence";

export type EssenceType =
  | "stardust" | "dreamstone" | "memory_silk"
  | "void_crystal" | "ember_dew" | "moon_thread";

export type BiomeType =
  | "plains" | "crystal_meadows" | "nebula_peaks" | "cloud_forest"
  | "starlight_desert" | "void_depths" | "coral_reef";

export type WeatherType = "clear" | "stardust_rain" | "aurora" | "nebula_fog" | "meteor_shower";

export type GameMode = "dream" | "create"; // dream = survival, create = creative
export type GamePhase = "lobby" | "playing" | "paused";

export interface ChunkData {
  cx: number;
  cy: number;
  cz: number;
  blocks: Uint8Array;      // CHUNK_SIZE^3 bytes
  light: Uint8Array;       // CHUNK_SIZE^3 bytes (sky light high 4 bits, block light low 4 bits)
  dirty: boolean;          // needs remesh
  meshVersion: number;     // incremented on mesh rebuild
}

export interface ChunkMesh {
  cx: number;
  cy: number;
  cz: number;
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  colors: Float32Array;   // per-vertex color for lighting
  indices: Uint32Array;
  transparentPositions: Float32Array;
  transparentNormals: Float32Array;
  transparentUvs: Float32Array;
  transparentColors: Float32Array;
  transparentIndices: Uint32Array;
}

export interface WorldData {
  id: string;
  name: string;
  ownerId: string;
  visibility: "public" | "private";
  seed: number;
  spawnX: number;
  spawnY: number;
  spawnZ: number;
  createdAt: string;
}

export interface PlayerState {
  id: string;
  name: string;
  skinId: string;
  position: Vec3;
  rotation: Vec3;
  velocity: Vec3;
  onGround: boolean;
  flying: boolean;
  resonance: number;
  emote: string | null;
  emoteExpiry: number;
  health: number;
  maxHealth: number;
}

export interface Animal {
  id: string;
  type: "dream_fox" | "star_bunny" | "crystal_deer" | "glow_butterfly" | "void_cat";
  position: Vec3;
  targetPosition: Vec3;
  rotation: number;
  speed: number;
  color: string;
  size: number;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  breakSpeed: number;
  durability: number;
  maxDurability: number;
}

export interface InventorySlot {
  blockId: number;
  count: number;
}

export interface Hotbar {
  slots: InventorySlot[]; // 9 slots
  activeIndex: number;
}

export interface ToolDef {
  id: string;
  name: string;
  icon: string;
  type: "hand" | "pickaxe" | "axe" | "shovel" | "sword";
  speed: number;        // multiplier for break speed
  durability: number;   // -1 = infinite
  effectiveAgainst: BlockCategory[]; // categories this tool is fast against
}

export interface DroppedItem {
  id: string;
  blockId: number;
  x: number;
  y: number;
  z: number;
  vy: number; // vertical velocity
  age: number; // seconds alive
  pickupDelay: number; // seconds before can be picked up
}

export interface CraftingRecipe {
  id: string;
  name: string;
  icon: string;
  ingredients: { blockId: number; count: number }[];
  result: { blockId: number; count: number };
  category: string;
}

export interface WeatherState {
  type: WeatherType;
  intensity: number;   // 0-1
  timeRemaining: number; // seconds
}

export interface DayNightState {
  time: number;        // 0-1 (0 = midnight, 0.5 = noon)
  sunAngle: number;    // radians
  moonPhase: number;   // 0-7
  ambientColor: string;
  sunIntensity: number;
  fogColor: string;
  starVisibility: number; // 0-1
}

export interface CircuitSignal {
  strength: number; // 0-15
  source: Vec3;
}

export interface NPCState {
  id: string;
  type: "starkeeper" | "cloud_shepherd" | "void_merchant";
  position: Vec3;
  targetPosition: Vec3;
  rotation: number;
  tradeItems: { give: number; giveCount: number; receive: number; receiveCount: number }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
  unlocked: boolean;
}

export interface PlayerStats {
  blocksPlaced: number;
  blocksBroken: number;
  essencesCollected: Record<EssenceType, number>;
  biomesVisited: Set<BiomeType>;
  deepestY: number;
  highestY: number;
  craftingRecipesUsed: number;
  screenshotsTaken: number;
  emotesUsed: Set<string>;
  playersNearby: number;
  fullCyclesWitnessed: number;
  weatherEventsWitnessed: Set<WeatherType>;
}

export interface MultiplayerEvent {
  type: "player_join" | "player_leave" | "player_move" | "player_emote"
    | "block_place" | "block_break" | "chat_message" | "circuit_update";
  playerId: string;
  data: unknown;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
}
