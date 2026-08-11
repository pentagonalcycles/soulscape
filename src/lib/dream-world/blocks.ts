// Dream World — Block Registry (40+ dream-themed blocks)

import type { BlockDef } from "./types";

export const BLOCKS: Record<number, BlockDef> = {};
const BLOCK_BY_NAME: Record<string, BlockDef> = {};

function reg(def: BlockDef): BlockDef {
  BLOCKS[def.id] = def;
  BLOCK_BY_NAME[def.name.toLowerCase().replace(/\s+/g, "_")] = def;
  return def;
}

// ─── AIR ───
reg({ id: 0, name: "Air", category: "stone", color: "#000000", transparent: true, solid: false, lightLevel: 0, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: false });

// ─── STONE ───
reg({ id: 1, name: "Void Stone", category: "stone", color: "#1a1545", colorTop: "#221e55", colorSide: "#161238", transparent: false, solid: true, lightLevel: 0, hardness: 1.5, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 2, name: "Nebula Rock", category: "stone", color: "#2d1f5e", colorTop: "#3a2878", colorSide: "#251a4e", transparent: false, solid: true, lightLevel: 0, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 3, name: "Moonstone", category: "stone", color: "#c8b8e8", colorTop: "#d8ccf0", colorSide: "#b0a0d0", transparent: false, solid: true, lightLevel: 2, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 4, name: "Obsidian Shard", category: "stone", color: "#0a0820", colorTop: "#120e30", colorSide: "#08061a", transparent: false, solid: true, lightLevel: 0, hardness: 3, gravity: false, flammable: false, interactive: false, emissive: false });

// ─── WOOD ───
reg({ id: 10, name: "Starwood Log", category: "wood", color: "#4a3060", colorTop: "#5a3d75", colorSide: "#3d2852", transparent: false, solid: true, lightLevel: 0, hardness: 1.2, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 11, name: "Starwood Plank", category: "wood", color: "#6b4d8a", colorTop: "#755a96", colorSide: "#5f427a", transparent: false, solid: true, lightLevel: 0, hardness: 1, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 12, name: "Dream Bark", category: "wood", color: "#3a2555", colorTop: "#4a3268", colorSide: "#301e48", transparent: false, solid: true, lightLevel: 0, hardness: 1.2, gravity: false, flammable: true, interactive: false, emissive: false });

// ─── GLASS ───
reg({ id: 20, name: "Violet Glass", category: "glass", color: "#9d7cd8", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 21, name: "Prismatic Glass", category: "glass", color: "#e8b4f8", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 22, name: "Frosted Glass", category: "glass", color: "#d0e8f8", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 23, name: "Rose Glass", category: "glass", color: "#f093b8", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 24, name: "Gold Glass", category: "glass", color: "#f5d062", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 25, name: "Teal Glass", category: "glass", color: "#2dd4a8", transparent: true, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });

// ─── GLOW ───
reg({ id: 30, name: "Glow Crystal", category: "glow", color: "#a78bfa", transparent: false, solid: true, lightLevel: 14, hardness: 0.8, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 31, name: "Starlight Block", category: "glow", color: "#f5d062", transparent: false, solid: true, lightLevel: 15, hardness: 0.5, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 32, name: "Aurora Block", category: "glow", color: "#2dd4a8", transparent: false, solid: true, lightLevel: 12, hardness: 0.5, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 33, name: "Neon Cube", category: "glow", color: "#e879a8", transparent: false, solid: true, lightLevel: 13, hardness: 0.5, gravity: false, flammable: false, interactive: false, emissive: true });

// ─── NATURE ───
reg({ id: 40, name: "Dream Grass", category: "nature", color: "#3a6848", colorTop: "#4a8a5a", colorSide: "#2d5238", transparent: false, solid: true, lightLevel: 0, hardness: 0.6, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 41, name: "Cloud Block", category: "nature", color: "#e8e0f0", transparent: true, solid: true, lightLevel: 0, hardness: 0.2, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 42, name: "Mist Block", category: "nature", color: "#c8b8e0", transparent: true, solid: false, lightLevel: 0, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 43, name: "Coral Shard", category: "nature", color: "#f093b8", colorTop: "#f8b0c8", colorSide: "#e07898", transparent: false, solid: true, lightLevel: 0, hardness: 0.8, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 44, name: "Dream Soil", category: "nature", color: "#2a1a3a", colorTop: "#3a2848", colorSide: "#221430", transparent: false, solid: true, lightLevel: 0, hardness: 0.8, gravity: false, flammable: false, interactive: false, emissive: false });

// ─── VEGETATION ───
reg({ id: 50, name: "Dream Sapling", category: "vegetation", color: "#6b8a5a", transparent: true, solid: false, lightLevel: 0, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 51, name: "Crystal Flower", category: "vegetation", color: "#e879a8", transparent: true, solid: false, lightLevel: 4, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: true });
reg({ id: 52, name: "Luminous Fern", category: "vegetation", color: "#2dd4a8", transparent: true, solid: false, lightLevel: 3, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: true });
reg({ id: 53, name: "Glow Mushroom", category: "vegetation", color: "#a78bfa", transparent: false, solid: false, lightLevel: 8, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 54, name: "Tall Dream Grass", category: "vegetation", color: "#4a8a5a", transparent: true, solid: false, lightLevel: 0, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 55, name: "Bush", category: "vegetation", color: "#3a7848", transparent: true, solid: false, lightLevel: 0, hardness: 0.3, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 56, name: "Vine", category: "vegetation", color: "#2d6838", transparent: true, solid: false, lightLevel: 0, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: false });
reg({ id: 57, name: "Star Blossom", category: "vegetation", color: "#f5d062", transparent: true, solid: false, lightLevel: 5, hardness: 0, gravity: false, flammable: true, interactive: false, emissive: true });
reg({ id: 58, name: "Void Lily", category: "vegetation", color: "#6366f1", transparent: true, solid: false, lightLevel: 6, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 59, name: "Moon Bloom", category: "vegetation", color: "#c0d8ff", transparent: true, solid: false, lightLevel: 4, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: true });

// ─── LIQUID ───
reg({ id: 60, name: "Liquid Starlight", category: "liquid", color: "#60a5fa", transparent: true, solid: false, lightLevel: 5, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: true });

// ─── BUILDING ───
reg({ id: 70, name: "Cosmic Brick", category: "building", color: "#3a2878", colorTop: "#4a3590", colorSide: "#302060", transparent: false, solid: true, lightLevel: 0, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 71, name: "Starstone Tile", category: "building", color: "#2a2050", colorTop: "#352868", colorSide: "#221840", transparent: false, solid: true, lightLevel: 0, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 72, name: "Moon Marble", category: "building", color: "#d8ccf0", colorTop: "#e8e0ff", colorSide: "#c0b0d8", transparent: false, solid: true, lightLevel: 1, hardness: 2.5, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 73, name: "Ethereal Pillar", category: "building", color: "#9d7cd8", colorTop: "#b090e8", colorSide: "#8a68c0", transparent: false, solid: true, lightLevel: 0, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: false });

// ─── FURNITURE ───
reg({ id: 80, name: "Dream Chair", category: "furniture", color: "#6b4d8a", transparent: false, solid: true, lightLevel: 0, hardness: 0.8, gravity: false, flammable: true, interactive: true, emissive: false });
reg({ id: 81, name: "Dream Table", category: "furniture", color: "#5a3d75", transparent: false, solid: true, lightLevel: 0, hardness: 1, gravity: false, flammable: true, interactive: true, emissive: false });
reg({ id: 82, name: "Dream Bed", category: "furniture", color: "#a78bfa", colorTop: "#c8b0f8", colorSide: "#8a68d0", transparent: false, solid: true, lightLevel: 0, hardness: 0.8, gravity: false, flammable: true, interactive: true, emissive: false });
reg({ id: 83, name: "Painting Frame", category: "furniture", color: "#4a3060", transparent: false, solid: true, lightLevel: 0, hardness: 0.5, gravity: false, flammable: true, interactive: true, emissive: false });
reg({ id: 84, name: "Torch", category: "furniture", color: "#f5d062", transparent: true, solid: false, lightLevel: 14, hardness: 0, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 85, name: "Chest", category: "furniture", color: "#6b4d8a", colorTop: "#7a5a9a", colorSide: "#5a3d75", transparent: false, solid: true, lightLevel: 0, hardness: 1.2, gravity: false, flammable: true, interactive: true, emissive: false });
reg({ id: 86, name: "Crafting Table", category: "furniture", color: "#9d7cd8", colorTop: "#b090e8", colorSide: "#8a68c0", transparent: false, solid: true, lightLevel: 0, hardness: 1.5, gravity: false, flammable: false, interactive: true, emissive: false });

// ─── CIRCUIT ───
reg({ id: 90, name: "Dream Wire", category: "circuit", color: "#a78bfa", transparent: false, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: true, emissive: false });
reg({ id: 91, name: "Dream Repeater", category: "circuit", color: "#9d7cd8", transparent: false, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: true, emissive: false });
reg({ id: 92, name: "Dream Lamp", category: "circuit", color: "#f5d062", transparent: false, solid: true, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: true, emissive: true });
reg({ id: 93, name: "Pressure Plate", category: "circuit", color: "#6b4d8a", transparent: true, solid: false, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: true, emissive: false });
reg({ id: 94, name: "Lever", category: "circuit", color: "#8a68c0", transparent: true, solid: false, lightLevel: 0, hardness: 0.2, gravity: false, flammable: false, interactive: true, emissive: false });

// ─── SPECIAL ───
reg({ id: 100, name: "Portal Block", category: "special", color: "#e879a8", transparent: true, solid: true, lightLevel: 10, hardness: 2, gravity: false, flammable: false, interactive: true, emissive: true });
reg({ id: 101, name: "Gravity Block", category: "special", color: "#60a5fa", transparent: false, solid: true, lightLevel: 0, hardness: 2, gravity: false, flammable: false, interactive: true, emissive: false });
reg({ id: 102, name: "Mirror Block", category: "special", color: "#e0e0ff", transparent: false, solid: true, lightLevel: 0, hardness: 1.5, gravity: false, flammable: false, interactive: true, emissive: false });

// ─── ESSENCE (collected items, not placed) ───
reg({ id: 110, name: "Stardust Block", category: "essence", color: "#f5d062", transparent: false, solid: true, lightLevel: 10, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 111, name: "Dreamstone Block", category: "essence", color: "#a78bfa", transparent: false, solid: true, lightLevel: 6, hardness: 2, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 112, name: "Memory Silk Block", category: "essence", color: "#e8b4f8", transparent: true, solid: true, lightLevel: 3, hardness: 0.5, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 113, name: "Void Crystal Block", category: "essence", color: "#1a0a30", transparent: false, solid: true, lightLevel: 8, hardness: 3, gravity: false, flammable: false, interactive: true, emissive: true });
reg({ id: 114, name: "Ember Dew Block", category: "essence", color: "#ff8040", transparent: false, solid: true, lightLevel: 12, hardness: 0.5, gravity: false, flammable: false, interactive: false, emissive: true });
reg({ id: 115, name: "Moon Thread Block", category: "essence", color: "#c0d8ff", transparent: true, solid: true, lightLevel: 4, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: true });

// ─── SAND ───
reg({ id: 120, name: "Star Sand", category: "nature", color: "#e8d8b0", colorTop: "#f0e4c0", colorSide: "#d8c8a0", transparent: false, solid: true, lightLevel: 0, hardness: 0.5, gravity: true, flammable: false, interactive: false, emissive: false });

// ─── GROUND DETAIL ───
reg({ id: 121, name: "Pebble", category: "nature", color: "#6b5a80", transparent: false, solid: false, lightLevel: 0, hardness: 0.3, gravity: false, flammable: false, interactive: false, emissive: false });
reg({ id: 122, name: "Small Rock", category: "stone", color: "#4a3868", transparent: false, solid: false, lightLevel: 0, hardness: 1, gravity: false, flammable: false, interactive: false, emissive: false });

// Helper functions
export function getBlockDef(id: number): BlockDef {
  return BLOCKS[id] || BLOCKS[0]; // fallback to air
}

export function getBlockByName(name: string): BlockDef | undefined {
  return BLOCK_BY_NAME[name.toLowerCase().replace(/\s+/g, "_")];
}

export function isTransparent(id: number): boolean {
  return id === 0 || (BLOCKS[id]?.transparent ?? true);
}

export function isSolid(id: number): boolean {
  return BLOCKS[id]?.solid ?? false;
}

export function getLightLevel(id: number): number {
  return BLOCKS[id]?.lightLevel ?? 0;
}

export function getBlockColor(id: number, face: "top" | "side" | "bottom"): string {
  const def = BLOCKS[id];
  if (!def) return "#000000";
  if (face === "top" && def.colorTop) return def.colorTop;
  if (face === "side" && def.colorSide) return def.colorSide;
  return def.color;
}

export function getAllBlocks(): BlockDef[] {
  return Object.values(BLOCKS).filter(b => b.id !== 0);
}

export function getBlocksByCategory(category: string): BlockDef[] {
  return Object.values(BLOCKS).filter(b => b.id !== 0 && b.category === category);
}

// ── Tool Definitions ──
export const TOOLS: Record<string, import("./types").ToolDef> = {
  hand: { id: "hand", name: "Hand", icon: "✋", type: "hand", speed: 1, durability: -1, effectiveAgainst: [] },
  wooden_pickaxe: { id: "wooden_pickaxe", name: "Wooden Pickaxe", icon: "⛏", type: "pickaxe", speed: 2, durability: 60, effectiveAgainst: ["stone"] },
  stone_pickaxe: { id: "stone_pickaxe", name: "Stone Pickaxe", icon: "⛏", type: "pickaxe", speed: 4, durability: 132, effectiveAgainst: ["stone"] },
  iron_pickaxe: { id: "iron_pickaxe", name: "Iron Pickaxe", icon: "⛏", type: "pickaxe", speed: 6, durability: 251, effectiveAgainst: ["stone"] },
  wooden_axe: { id: "wooden_axe", name: "Wooden Axe", icon: "🪓", type: "axe", speed: 2, durability: 60, effectiveAgainst: ["wood"] },
  stone_axe: { id: "stone_axe", name: "Stone Axe", icon: "🪓", type: "axe", speed: 4, durability: 132, effectiveAgainst: ["wood"] },
  wooden_shovel: { id: "wooden_shovel", name: "Wooden Shovel", icon: "⛏", type: "shovel", speed: 2, durability: 60, effectiveAgainst: ["nature"] },
  stone_shovel: { id: "stone_shovel", name: "Stone Shovel", icon: "⛏", type: "shovel", speed: 4, durability: 132, effectiveAgainst: ["nature"] },
  dream_sword: { id: "dream_sword", name: "Dream Sword", icon: "⚔", type: "sword", speed: 1.5, durability: 251, effectiveAgainst: [] },
};

export function getTool(id: string): import("./types").ToolDef {
  return TOOLS[id] || TOOLS.hand;
}

// Map block IDs to tool IDs for crafted tools
const BLOCK_TO_TOOL: Record<number, string> = {
  1001: "wooden_pickaxe",
  1002: "stone_pickaxe",
  1003: "wooden_axe",
  1004: "stone_axe",
  1005: "wooden_shovel",
  1006: "stone_shovel",
  1007: "dream_sword",
};

export function getToolFromBlockId(blockId: number): import("./types").ToolDef {
  const toolId = BLOCK_TO_TOOL[blockId];
  return toolId ? TOOLS[toolId] : TOOLS.hand;
}

export function getBreakSpeed(blockId: number, toolId: string): number {
  const block = BLOCKS[blockId];
  if (!block) return 1;
  // Try to get tool by block ID first, then by string ID
  const tool = BLOCK_TO_TOOL[Number(toolId)] ? TOOLS[BLOCK_TO_TOOL[Number(toolId)]] : getTool(toolId);
  const hardness = block.hardness;
  // Hardness 0 or undefined = instant break (vegetation, flowers, etc.)
  if (!hardness || hardness === 0) return 100;
  let speed = tool.speed;
  // Tool is effective against this block type
  if (tool.effectiveAgainst.includes(block.category)) {
    speed *= 2;
  }
  return speed / hardness;
}

export function getRoughness(id: number): number {
  const def = BLOCKS[id];
  if (!def) return 0.85;
  if (def.roughness !== undefined) return def.roughness;
  // Default roughness by category
  switch (def.category) {
    case "glass": return 0.1;
    case "glow": return 0.4;
    case "essence": return 0.3;
    case "stone": return 0.9;
    case "wood": return 0.75;
    case "nature": return 0.85;
    case "vegetation": return 0.6;
    case "building": return 0.8;
    case "liquid": return 0.05;
    default: return 0.85;
  }
}

export function getMetalness(id: number): number {
  const def = BLOCKS[id];
  if (!def) return 0.05;
  if (def.metalness !== undefined) return def.metalness;
  switch (def.category) {
    case "glass": return 0.1;
    case "glow": return 0.15;
    case "essence": return 0.2;
    case "stone": return 0.02;
    case "wood": return 0.0;
    case "building": return 0.05;
    case "liquid": return 0.3;
    default: return 0.05;
  }
}
