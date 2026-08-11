// Dream World — Constants

export const CHUNK_SIZE = 16;
export const CHUNK_SIZE_SQ = CHUNK_SIZE * CHUNK_SIZE;
export const CHUNK_SIZE_CB = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE;

export const WORLD_HEIGHT_CHUNKS = 16; // 16 chunks tall = 256 blocks
export const WORLD_HEIGHT = WORLD_HEIGHT_CHUNKS * CHUNK_SIZE;

export const VIEW_DISTANCE = 8; // chunks
export const UNLOAD_DISTANCE = VIEW_DISTANCE + 2;

// Physics
export const GRAVITY = 24;           // blocks/s²
export const JUMP_VELOCITY = 8.5;    // blocks/s
export const PLAYER_SPEED = 5.5;     // blocks/s
export const PLAYER_SPRINT_SPEED = 9;
export const FLY_SPEED = 12;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_WIDTH = 0.6;
export const PLAYER_EYE_HEIGHT = 1.62;
export const PLAYER_CROUCH_HEIGHT = 1.2;
export const CROUCH_SPEED = 2.5;
export const SWIM_SPEED = 3.5;

// Stamina
export const STAMINA_MAX = 100;
export const SPRINT_DRAIN = 15;      // per second
export const STAMINA_REGEN = 10;     // per second when not sprinting

// Raycast
export const MAX_REACH = 6; // blocks

// Day/Night
export const DAY_DURATION = 600; // seconds for full cycle
export const DAWN_START = 0.2;
export const DAWN_END = 0.3;
export const DUSK_START = 0.7;
export const DUSK_END = 0.8;

// Weather
export const WEATHER_MIN_DURATION = 60;  // seconds
export const WEATHER_MAX_DURATION = 300;

// Dream Resonance
export const RESONANCE_MAX = 100;
export const RESONANCE_DECAY = 0.5;     // per second
export const RESONANCE_DISCOVER = 15;   // new biome
export const RESONANCE_BUILD = 1;       // per block placed
export const RESONANCE_WITNESS = 10;    // rare event
export const RESONANCE_REST = 0.2;      // per second near water/shelter
export const RESONANCE_VISITOR = 5;     // another player visits

// World Gen
export const SEA_LEVEL = 64;
export const ISLAND_CENTER_Y = 72;
export const CAVE_THRESHOLD = 0.35;
export const ISLAND_FALLOFF = 0.025;

// Mesh building
export const MAX_CHUNKS_MESH_PER_FRAME = 2;

// Multiplayer
export const MOVE_BROADCAST_INTERVAL = 50; // ms
export const MAX_PLAYERS_PER_WORLD = 20;

// Colors — dreamy palette
export const SKY_DAY = "#4a6fa5";
export const SKY_DAWN = "#e8a87c";
export const SKY_DUSK = "#c678a8";
export const SKY_NIGHT = "#0a0a2e";
export const FOG_DAY = "#8aa2c8";
export const FOG_NIGHT = "#12102a";
export const VOID_COLOR = "#050510";

// Block ID constants
export const AIR = 0;

// Dream essence IDs
export const ESSENCE_STARDUST = 110;
export const ESSENCE_DREAMSTONE = 111;
export const ESSENCE_MEMORY_SILK = 112;
export const ESSENCE_VOID_CRYSTAL = 113;
export const ESSENCE_EMBER_DEW = 114;
export const ESSENCE_MOON_THREAD = 115;
