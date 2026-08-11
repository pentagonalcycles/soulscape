// Dream World — Enhanced Mesh Builder
// Procedural textures, plant geometry, better shading

import { CHUNK_SIZE, AIR } from "./constants";
import { isTransparent, getBlockColor, getLightLevel, isSolid, getBlockDef, getRoughness, getMetalness } from "./blocks";
import { getBlock } from "./chunk";
import type { ChunkData, ChunkMesh } from "./types";

const FACES = [
  { dir: [0, 1, 0], corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]], name: "top" as const },
  { dir: [0, -1, 0], corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]], name: "bottom" as const },
  { dir: [1, 0, 0], corners: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]], name: "right" as const },
  { dir: [-1, 0, 0], corners: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]], name: "left" as const },
  { dir: [0, 0, 1], corners: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]], name: "front" as const },
  { dir: [0, 0, -1], corners: [[1,0,0],[0,0,0],[0,1,0],[1,1,0]], name: "back" as const },
];

// Simple hash for procedural variation
function hash(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1103515245) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function hash2(x: number, z: number): number {
  return hash(x, 0, z);
}

function parseColor(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

// Get block at position, checking neighbors if needed
function getBlockAt(
  blocks: Uint8Array, lx: number, ly: number, lz: number,
  neighbors: Map<string, Uint8Array> | null, cx: number, cy: number, cz: number
): number {
  if (lx >= 0 && lx < CHUNK_SIZE && ly >= 0 && ly < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
    return blocks[lx + ly * CHUNK_SIZE + lz * CHUNK_SIZE * CHUNK_SIZE];
  }
  if (!neighbors) return AIR;
  const ncx = cx + (lx < 0 ? -1 : lx >= CHUNK_SIZE ? 1 : 0);
  const ncy = cy + (ly < 0 ? -1 : ly >= CHUNK_SIZE ? 1 : 0);
  const ncz = cz + (lz < 0 ? -1 : lz >= CHUNK_SIZE ? 1 : 0);
  const nlx = ((lx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const nly = ((ly % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const nlz = ((lz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const key = `${ncx},${ncy},${ncz}`;
  const nb = neighbors.get(key);
  if (!nb) return AIR;
  return nb[nlx + nly * CHUNK_SIZE + nlz * CHUNK_SIZE * CHUNK_SIZE];
}

// ── Procedural color variation ──

function varyColor(r: number, g: number, b: number, wx: number, wy: number, wz: number, amount: number = 0.08): [number, number, number] {
  // Multi-scale noise for natural variation
  const n1 = hash(wx * 3, wy * 7, wz * 11);
  const n2 = hash(Math.floor(wx * 0.5), Math.floor(wy * 0.5), Math.floor(wz * 0.5));
  const n3 = hash(wx * 17, wy * 23, wz * 31);
  const variation = ((n1 - 0.5) * 0.6 + (n2 - 0.5) * 0.3 + (n3 - 0.5) * 0.1) * amount * 2;
  return [
    Math.max(0, Math.min(1, r + variation)),
    Math.max(0, Math.min(1, g + variation * 0.85)),
    Math.max(0, Math.min(1, b + variation * 0.65)),
  ];
}

// Wood grain pattern for logs — detailed rings and streaks
function woodGrainColor(baseR: number, baseG: number, baseB: number, wx: number, wy: number, wz: number): [number, number, number] {
  // Growth rings — concentric circles when viewed from top
  const ringDist = Math.sqrt((wx % 1 - 0.5) * (wx % 1 - 0.5) + (wz % 1 - 0.5) * (wz % 1 - 0.5));
  const ring = Math.sin(ringDist * 12 + wy * 0.3) * 0.5 + 0.5;
  // Vertical grain streaks
  const grain1 = Math.sin(wx * 3.5 + wz * 1.8 + wy * 0.1) * 0.5 + 0.5;
  const grain2 = Math.sin(wx * 1.2 + wz * 2.8 + wy * 0.05) * 0.5 + 0.5;
  // Knot noise
  const knotNoise = hash(Math.floor(wx * 0.3), Math.floor(wy * 0.4), Math.floor(wz * 0.3));
  const knot = knotNoise > 0.92 ? 0.15 : 0;
  // Fine grain noise
  const fine = hash(wx * 5, wy * 3, wz * 5) * 0.06;

  const darken = ring * 0.06 + grain1 * 0.04 + grain2 * 0.03 + fine + knot;
  return [
    Math.max(0, baseR - darken),
    Math.max(0, baseG - darken * 0.75),
    Math.max(0, baseB - darken * 0.45),
  ];
}

// Leaf color with natural variation — veins, tips, patches
function leafColor(baseR: number, baseG: number, baseB: number, wx: number, wy: number, wz: number, emissive: boolean): [number, number, number] {
  const noise1 = hash(wx * 3, wy * 5, wz * 3);
  const noise2 = hash(wx * 7, wy * 2, wz * 9);
  const noise3 = hash(Math.floor(wx * 0.8), Math.floor(wy * 0.8), Math.floor(wz * 0.8));

  // Leaf vein pattern — branching lines
  const veinX = Math.sin(wx * 2.0 + wz * 1.5 + wy * 0.3) * 0.5 + 0.5;
  const veinZ = Math.cos(wx * 1.2 + wz * 2.5 + wy * 0.2) * 0.5 + 0.5;
  const vein = Math.min(veinX, veinZ);
  const veinDarken = vein < 0.3 ? 0.08 : 0;

  // Lighter tips — sun-exposed parts
  const tipLighten = noise1 * 0.08;

  // Large patch variation — some leaves are darker
  const patchDarken = noise3 > 0.7 ? 0.05 : noise3 < 0.2 ? -0.04 : 0;

  // Yellow-green variation for natural look
  const colorShift = (noise2 - 0.5) * 0.06;

  let r = baseR + tipLighten - veinDarken - patchDarken + colorShift;
  let g = baseG + tipLighten * 1.3 - veinDarken * 0.4 - patchDarken * 0.5;
  let b = baseB + tipLighten * 0.4 - veinDarken * 0.2 - patchDarken * 0.3;

  if (emissive) {
    const glowPatch = noise2 * 0.12;
    r += glowPatch;
    g += glowPatch;
    b += glowPatch;
  }

  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b)),
  ];
}

// Stone texture with mineral speckles and layering
function stoneColor(baseR: number, baseG: number, baseB: number, wx: number, wy: number, wz: number): [number, number, number] {
  // Fine speckles
  const speckle = hash(Math.floor(wx * 3), Math.floor(wy * 3), Math.floor(wz * 3));
  // Medium-scale variation — stone layers
  const layer = Math.sin(wy * 2.5 + hash(Math.floor(wx * 0.2), 0, Math.floor(wz * 0.2)) * 8) * 0.5 + 0.5;
  // Large-scale color zones
  const zone = hash(Math.floor(wx * 0.15), Math.floor(wy * 0.15), Math.floor(wz * 0.15));
  // Crack-like dark lines
  const crack = hash(Math.floor(wx * 4), Math.floor(wy * 4), Math.floor(wz * 4));

  let speckleEffect = 0;
  if (speckle > 0.88) speckleEffect = 0.1; // bright mineral fleck
  else if (speckle < 0.08) speckleEffect = -0.08; // dark mineral fleck

  const layerEffect = layer * 0.04;
  const zoneEffect = (zone - 0.5) * 0.06;
  const crackEffect = crack > 0.96 ? -0.06 : 0;

  return [
    Math.max(0, Math.min(1, baseR + speckleEffect + layerEffect + zoneEffect + crackEffect)),
    Math.max(0, Math.min(1, baseG + speckleEffect + layerEffect + zoneEffect + crackEffect)),
    Math.max(0, Math.min(1, baseB + speckleEffect + layerEffect * 0.7 + zoneEffect * 0.8 + crackEffect)),
  ];
}

// Grass color with natural patchiness
function grassColor(baseR: number, baseG: number, baseB: number, wx: number, wz: number): [number, number, number] {
  // Large patches — some areas are greener
  const patch = hash2(Math.floor(wx * 0.3), Math.floor(wz * 0.3));
  // Medium patches — individual tufts
  const tuft = hash2(Math.floor(wx * 1.5), Math.floor(wz * 1.5));
  // Fine detail
  const detail = hash2(wx * 4, wz * 4);
  // Dry/brown patches
  const dryPatch = detail > 0.92 ? 0.1 : 0;

  const greenBoost = patch * 0.08 + tuft * 0.04;
  const brownShift = dryPatch * 0.5;

  return [
    Math.max(0, Math.min(1, baseR - greenBoost * 0.5 + dryPatch * 0.3)),
    Math.max(0, Math.min(1, baseG + greenBoost * 0.6 - brownShift)),
    Math.max(0, Math.min(1, baseB - greenBoost * 0.3 + dryPatch * 0.15)),
  ];
}

// Dirt/soil texture — warm browns with root hints
function dirtColor(baseR: number, baseG: number, baseB: number, wx: number, wy: number, wz: number): [number, number, number] {
  const n1 = hash(Math.floor(wx * 2), Math.floor(wy * 2), Math.floor(wz * 2));
  const n2 = hash(Math.floor(wx * 0.5), Math.floor(wy * 0.5), Math.floor(wz * 0.5));
  const root = hash(Math.floor(wx * 5), Math.floor(wy * 5), Math.floor(wz * 5));

  const variation = (n1 - 0.5) * 0.06 + (n2 - 0.5) * 0.04;
  const rootDarken = root > 0.94 ? 0.05 : 0;

  return [
    Math.max(0, Math.min(1, baseR + variation - rootDarken)),
    Math.max(0, Math.min(1, baseG + variation * 0.7 - rootDarken * 0.6)),
    Math.max(0, Math.min(1, baseB + variation * 0.5 - rootDarken * 0.3)),
  ];
}

// ── Enhanced AO calculation — smooth per-vertex ambient occlusion ──

function computeFaceAO(
  blocks: Uint8Array, lx: number, ly: number, lz: number,
  face: typeof FACES[0], neighbors: Map<string, Uint8Array> | null,
  cx: number, cy: number, cz: number
): number {
  const [dx, dy, dz] = face.dir;

  // Base AO by face direction — sky-facing brighter, ground-facing darker
  let ao = 1.0;
  if (face.name === "top") ao = 0.95;
  else if (face.name === "bottom") ao = 0.6;
  else ao = 0.78;

  // Check surrounding blocks for occlusion — 8 neighbors around the face
  let occluders = 0;
  let cornerOccluders = 0;
  for (let ox = -1; ox <= 1; ox++) {
    for (let oz = -1; oz <= 1; oz++) {
      if (ox === 0 && oz === 0) continue;
      const checkX = lx + dx + ox;
      const checkY = ly + dy;
      const checkZ = lz + dz + oz;
      const neighbor = getBlockAt(blocks, checkX, checkY, checkZ, neighbors, cx, cy, cz);
      if (isSolid(neighbor)) {
        if (ox !== 0 && oz !== 0) {
          cornerOccluders++; // corner blocks have less AO effect
        } else {
          occluders++; // direct neighbors have stronger AO
        }
      }
    }
  }

  // Also check above and below for vertical AO
  const above = getBlockAt(blocks, lx + dx, ly + dy + 1, lz + dz, neighbors, cx, cy, cz);
  const below = getBlockAt(blocks, lx + dx, ly + dy - 1, lz + dz, neighbors, cx, cy, cz);
  if (isSolid(above)) occluders++;
  if (isSolid(below)) occluders++;

  // Apply AO — direct neighbors darken more than corners
  ao -= occluders * 0.04;
  ao -= cornerOccluders * 0.02;

  return Math.max(0.35, ao);
}

// ── Plant geometry generators ──

function addGrassBlade(
  positions: number[], normals: number[], colors: number[], indices: number[],
  wx: number, wy: number, wz: number, r: number, g: number, b: number
) {
  // Cross-shaped grass blade (2 quads)
  const h = 0.3 + hash(wx, wy, wz) * 0.4; // blade height
  const sway = hash(wx * 3, wz * 7, 0) * 0.15; // lean direction
  const baseIdx = positions.length / 3;

  // Quad 1 (facing X)
  const bladeColor: [number, number, number] = [r * 0.9, g * 1.1, b * 0.8];
  positions.push(
    wx + 0.2, wy, wz + 0.5,
    wx + 0.8, wy, wz + 0.5,
    wx + 0.5 + sway, wy + h, wz + 0.5,
    wx + 0.5 + sway, wy + h, wz + 0.5,
  );
  normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
  colors.push(...bladeColor, ...bladeColor, r, g * 1.15, b * 0.85, r, g * 1.15, b * 0.85);
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);

  // Quad 2 (facing Z)
  const baseIdx2 = positions.length / 3;
  positions.push(
    wx + 0.5, wy, wz + 0.2,
    wx + 0.5, wy, wz + 0.8,
    wx + 0.5, wy + h, wz + 0.5 + sway,
    wx + 0.5, wy + h, wz + 0.5 + sway,
  );
  normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
  colors.push(...bladeColor, ...bladeColor, r, g * 1.15, b * 0.85, r, g * 1.15, b * 0.85);
  indices.push(baseIdx2, baseIdx2 + 1, baseIdx2 + 2, baseIdx2, baseIdx2 + 2, baseIdx2 + 3);
}

function addFlowerGeometry(
  positions: number[], normals: number[], colors: number[], indices: number[],
  wx: number, wy: number, wz: number, blockId: number
) {
  const def = getBlockDef(blockId);
  const [r, g, b] = parseColor(def.color);
  const h = 0.3 + hash(wx, wy, wz) * 0.2;

  // Stem
  const stemR = 0.25, stemG = 0.45, stemB = 0.2;
  const baseIdx = positions.length / 3;
  positions.push(
    wx + 0.45, wy, wz + 0.5,
    wx + 0.55, wy, wz + 0.5,
    wx + 0.55, wy + h, wz + 0.5,
    wx + 0.45, wy + h, wz + 0.5,
  );
  normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
  colors.push(stemR, stemG, stemB, stemR, stemG, stemB, stemR, stemG, stemB, stemR, stemG, stemB);
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);

  // Flower head — cross billboards
  const petalSize = 0.25;
  const cy = wy + h;
  for (let angle = 0; angle < 2; angle++) {
    const bi = positions.length / 3;
    const cos = Math.cos(angle * Math.PI / 2) * petalSize;
    const sin = Math.sin(angle * Math.PI / 2) * petalSize;
    positions.push(
      wx + 0.5 - cos, cy - 0.05, wz + 0.5 - sin,
      wx + 0.5 + cos, cy - 0.05, wz + 0.5 + sin,
      wx + 0.5 + cos, cy + 0.15, wz + 0.5 + sin,
      wx + 0.5 - cos, cy + 0.15, wz + 0.5 - sin,
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    const pr = r * 1.1, pg = g * 0.9, pb = b * 1.05; // slightly brighter petals
    colors.push(pr, pg, pb, pr, pg, pb, r, g, b, r, g, b);
    indices.push(bi, bi + 1, bi + 2, bi, bi + 2, bi + 3);
  }

  // Center dot
  const ci = positions.length / 3;
  const dotSize = 0.08;
  positions.push(
    wx + 0.5 - dotSize, cy + 0.05, wz + 0.5 - dotSize,
    wx + 0.5 + dotSize, cy + 0.05, wz + 0.5 - dotSize,
    wx + 0.5 + dotSize, cy + 0.05, wz + 0.5 + dotSize,
    wx + 0.5 - dotSize, cy + 0.05, wz + 0.5 + dotSize,
  );
  normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
  const cr = Math.min(1, r + 0.3), cg = Math.min(1, g + 0.2), cb = b;
  colors.push(cr, cg, cb, cr, cg, cb, cr, cg, cb, cr, cg, cb);
  indices.push(ci, ci + 1, ci + 2, ci, ci + 2, ci + 3);
}

function addFernFrond(
  positions: number[], normals: number[], colors: number[], indices: number[],
  wx: number, wy: number, wz: number, r: number, g: number, b: number
) {
  const frondCount = 3 + Math.floor(hash(wx, wy, wz) * 3);
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2 + hash(wx, wy, wz + f) * 0.5;
    const length = 0.4 + hash(wx + f, wy, wz) * 0.3;
    const droop = 0.2 + hash(wx, wy + f, wz) * 0.3;
    const bi = positions.length / 3;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Frond as a tapered quad
    positions.push(
      wx + 0.5, wy + 0.1, wz + 0.5,
      wx + 0.5 + cos * length, wy + 0.05, wz + 0.5 + sin * length,
      wx + 0.5 + cos * length * 0.7, wy - droop, wz + 0.5 + sin * length * 0.7,
      wx + 0.5 + cos * length * 0.3, wy - droop * 0.5, wz + 0.5 + sin * length * 0.3,
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    const dr = r * 0.8, dg = g * 1.1, db = b * 0.7; // fern green
    colors.push(r, g, b, dr, dg, db, dr * 0.9, dg * 0.9, db * 0.9, r, g, b);
    indices.push(bi, bi + 1, bi + 2, bi, bi + 2, bi + 3);
  }
}

function addMushroomCap(
  positions: number[], normals: number[], colors: number[], indices: number[],
  wx: number, wy: number, wz: number, r: number, g: number, b: number, emissive: boolean
) {
  const capRadius = 0.35 + hash(wx, wy, wz) * 0.15;
  const capHeight = 0.2 + hash(wx + 1, wy, wz) * 0.1;
  const segments = 6;

  // Stem
  const stemR = r * 0.7, stemG = g * 0.8, stemB = b * 0.6;
  const si = positions.length / 3;
  positions.push(
    wx + 0.35, wy, wz + 0.35,
    wx + 0.65, wy, wz + 0.35,
    wx + 0.65, wy + 0.3, wz + 0.35,
    wx + 0.35, wy + 0.3, wz + 0.35,
  );
  positions.push(
    wx + 0.35, wy, wz + 0.65,
    wx + 0.65, wy, wz + 0.65,
    wx + 0.65, wy + 0.3, wz + 0.65,
    wx + 0.35, wy + 0.3, wz + 0.65,
  );
  normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
  for (let i = 0; i < 8; i++) colors.push(stemR, stemG, stemB);
  indices.push(si, si+1, si+2, si, si+2, si+3, si+4, si+5, si+6, si+4, si+6, si+7);

  // Cap — dome made of triangles
  const capBase = wy + 0.3;
  const cx = wx + 0.5, cz = wz + 0.5;
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    const bi = positions.length / 3;

    const x1 = cx + Math.cos(a1) * capRadius;
    const z1 = cz + Math.sin(a1) * capRadius;
    const x2 = cx + Math.cos(a2) * capRadius;
    const z2 = cz + Math.sin(a2) * capRadius;

    // Base of cap
    positions.push(cx, capBase, cz, x1, capBase, z1, x2, capBase, z2);
    // Top of cap
    positions.push(cx, capBase + capHeight, cz, x1, capBase + capHeight * 0.6, z1, x2, capBase + capHeight * 0.6, z2);

    // Normals — outward for sides, up for top
    const nx1 = Math.cos(a1), nz1 = Math.sin(a1);
    const nx2 = Math.cos(a2), nz2 = Math.sin(a2);
    normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, nx1, 0.5, nz1, nx2, 0.5, nz2);

    // Colors — cap top is brighter, spots pattern
    const spotNoise = hash(Math.floor(x1 * 4), Math.floor(z1 * 4), 0);
    const spotBright = spotNoise > 0.7 ? 0.15 : 0;
    const capR = Math.min(1, r + spotBright), capG = Math.min(1, g + spotBright), capB = Math.min(1, b + spotBright);
    if (emissive) {
      colors.push(r * 1.2, g * 1.2, b * 1.2, r * 0.9, g * 0.9, b * 0.9, r * 0.9, g * 0.9, b * 0.9);
      colors.push(capR * 1.3, capG * 1.3, capB * 1.3, capR, capG, capB, capR, capG, capB);
    } else {
      colors.push(r, g, b, r * 0.8, g * 0.8, b * 0.8, r * 0.8, g * 0.8, b * 0.8);
      colors.push(capR, capG, capB, capR * 0.85, capG * 0.85, capB * 0.85, capR * 0.85, capG * 0.85, capB * 0.85);
    }

    indices.push(bi, bi+1, bi+2, bi+3, bi+4, bi+5);
  }
}

// ── Main mesh builder ──

export function buildChunkMesh(
  chunk: ChunkData,
  neighbors: Map<string, Uint8Array> | null
): ChunkMesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const tPositions: number[] = [];
  const tNormals: number[] = [];
  const tColors: number[] = [];
  const tIndices: number[] = [];

  // Separate arrays for plant geometry (rendered with double-side)
  const plantPositions: number[] = [];
  const plantNormals: number[] = [];
  const plantColors: number[] = [];
  const plantIndices: number[] = [];

  const { cx, cy, cz, blocks } = chunk;

  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const blockId = blocks[lx + ly * CHUNK_SIZE + lz * CHUNK_SIZE * CHUNK_SIZE];
        if (blockId === AIR) continue;

        const blockDef = getBlockDef(blockId);
        const blockTransparent = blockDef.transparent;
        const blockLight = blockDef.lightLevel;
        const wx = cx * CHUNK_SIZE + lx;
        const wy = cy * CHUNK_SIZE + ly;
        const wz = cz * CHUNK_SIZE + lz;

        // ── Standard block faces ──
        for (const face of FACES) {
          const nx = lx + face.dir[0];
          const ny = ly + face.dir[1];
          const nz = lz + face.dir[2];
          const neighborId = getBlockAt(blocks, nx, ny, nz, neighbors, cx, cy, cz);
          const neighborTransparent = isTransparent(neighborId);

          if (!neighborTransparent) continue;
          if (blockTransparent && neighborId === blockId) continue;

          const colorFace = face.name === "top" ? "top" : face.name === "bottom" ? "bottom" : "side";
          const color = getBlockColor(blockId, colorFace as "top" | "side" | "bottom");
          let r = parseInt(color.slice(1, 3), 16) / 255;
          let g = parseInt(color.slice(3, 5), 16) / 255;
          let b = parseInt(color.slice(5, 7), 16) / 255;

          // ── Apply procedural textures ──
          const category = blockDef.category;

          if (category === "wood") {
            // Wood grain
            [r, g, b] = woodGrainColor(r, g, b, wx, wy, wz);
          } else if (category === "nature" && blockId === 40) {
            // Dream grass
            [r, g, b] = grassColor(r, g, b, wx, wz);
          } else if (category === "nature" && blockId === 44) {
            // Dream soil
            [r, g, b] = dirtColor(r, g, b, wx, wy, wz);
          } else if (category === "nature" && blockId === 120) {
            // Star sand — warm variation
            [r, g, b] = varyColor(r, g, b, wx, wy, wz, 0.05);
          } else if (category === "stone") {
            [r, g, b] = stoneColor(r, g, b, wx, wy, wz);
          } else if (category === "vegetation") {
            // Leaves, ferns, mushrooms
            [r, g, b] = leafColor(r, g, b, wx, wy, wz, blockDef.emissive);
          } else if (category === "glow" || category === "essence") {
            // Emissive blocks get subtle variation
            [r, g, b] = varyColor(r, g, b, wx, wy, wz, 0.04);
          } else {
            [r, g, b] = varyColor(r, g, b, wx, wy, wz, 0.05);
          }

          // ── Enhanced AO with material-aware shading ──
          let ao = computeFaceAO(blocks, lx, ly, lz, face, neighbors, cx, cy, cz);

          // Rough surfaces get deeper shadows, smooth surfaces stay brighter
          const roughness = getRoughness(blockId);
          const metalness = getMetalness(blockId);
          if (blockLight === 0) {
            ao *= 0.85 + (1 - roughness) * 0.15; // smooth surfaces are brighter
          }

          // Emissive blocks are full brightness
          if (blockLight > 0) ao = 1.0;

          // Top faces slightly brighter (sky exposure)
          if (face.name === "top") ao *= 1.05;

          // Metallic surfaces get slight specular boost on angled faces
          if (metalness > 0.1 && face.name !== "top" && face.name !== "bottom") {
            ao *= 1.0 + metalness * 0.05;
          }

          const targetPos = blockTransparent ? tPositions : positions;
          const targetNorm = blockTransparent ? tNormals : normals;
          const targetCol = blockTransparent ? tColors : colors;
          const targetIdx = blockTransparent ? tIndices : indices;
          const baseIndex = targetPos.length / 3;

          for (const corner of face.corners) {
            targetPos.push(wx + corner[0], wy + corner[1], wz + corner[2]);
            targetNorm.push(face.dir[0], face.dir[1], face.dir[2]);
            targetCol.push(
              Math.min(1, r * ao),
              Math.min(1, g * ao),
              Math.min(1, b * ao)
            );
          }

          targetIdx.push(baseIndex, baseIndex + 1, baseIndex + 2);
          targetIdx.push(baseIndex, baseIndex + 2, baseIndex + 3);
        }

        // ── Plant geometry — only on surface blocks with air above ──
        if (ly < CHUNK_SIZE - 1) {
          const aboveBlock = getBlockAt(blocks, lx, ly + 1, lz, neighbors, cx, cy, cz);
          if (aboveBlock === AIR) {
            const [br, bg, bb] = parseColor(getBlockColor(blockId, "top"));

            if (blockId === 40) {
              // Dream grass — add grass blades on top
              const bladeCount = 2 + Math.floor(hash(wx, wy, wz) * 3);
              for (let i = 0; i < bladeCount; i++) {
                const bx = wx + hash(wx + i, wy, wz) * 0.8 + 0.1;
                const bz = wz + hash(wx, wy + i, wz) * 0.8 + 0.1;
                addGrassBlade(plantPositions, plantNormals, plantColors, plantIndices,
                  bx, wy + 1, bz, br * 0.8, bg * 1.1, bb * 0.7);
              }
            } else if (blockId === 51 || blockId === 57 || blockId === 58 || blockId === 59) {
              // Crystal flower, Star blossom, Void lily, Moon bloom — add flower geometry
              addFlowerGeometry(plantPositions, plantNormals, plantColors, plantIndices, wx, wy, wz, blockId);
            } else if (blockId === 52 || blockId === 56) {
              // Luminous fern or Vine — add frond geometry
              addFernFrond(plantPositions, plantNormals, plantColors, plantIndices, wx, wy + 1, wz, br, bg, bb);
            } else if (blockId === 53) {
              // Glow mushroom — add mushroom cap
              addMushroomCap(plantPositions, plantNormals, plantColors, plantIndices, wx, wy, wz, br, bg, bb, blockDef.emissive);
            } else if (blockId === 54) {
              // Tall dream grass — taller, denser grass blades
              const bladeCount = 4 + Math.floor(hash(wx, wy, wz) * 4);
              for (let i = 0; i < bladeCount; i++) {
                const bx = wx + hash(wx + i, wy, wz) * 0.9 + 0.05;
                const bz = wz + hash(wx, wy + i, wz) * 0.9 + 0.05;
                addGrassBlade(plantPositions, plantNormals, plantColors, plantIndices,
                  bx, wy + 1, bz, br * 0.7, bg * 1.15, bb * 0.65);
              }
            } else if (blockId === 121 || blockId === 122) {
              // Pebble or small rock — low poly stone shape
              const rockSize = blockId === 121 ? 0.15 : 0.25;
              const bi = plantPositions.length / 3;
              const cx = wx + 0.5, cz = wz + 0.5, cy = wy + 1;
              const rs = rockSize;
              // Diamond-ish rock
              plantPositions.push(
                cx, cy + rs * 0.6, cz,
                cx - rs, cy, cz,
                cx, cy, cz + rs,
                cx + rs, cy, cz,
                cx, cy, cz - rs,
                cx, cy - rs * 0.2, cz,
              );
              for (let n = 0; n < 6; n++) plantNormals.push(0, 0.5, 0);
              for (let n = 0; n < 6; n++) plantColors.push(br * 0.9, bg * 0.9, bb * 0.9);
              plantIndices.push(bi, bi+1, bi+2, bi, bi+2, bi+3, bi, bi+3, bi+4, bi, bi+4, bi+1);
              plantIndices.push(bi+5, bi+2, bi+1, bi+5, bi+3, bi+2, bi+5, bi+4, bi+3, bi+5, bi+1, bi+4);
            } else if (blockId === 55) {
              // Bush — cluster of leaf spheres
              const bushSize = 0.3 + hash(wx, wy, wz) * 0.15;
              for (let bx = -1; bx <= 1; bx++) {
                for (let bz = -1; bz <= 1; bz++) {
                  if (hash(wx + bx, wy, wz + bz) > 0.6) {
                    const bi = plantPositions.length / 3;
                    const cx = wx + 0.5 + bx * 0.3;
                    const cz = wz + 0.5 + bz * 0.3;
                    const cy = wy + 1 + hash(wx + bx, wy, wz + bz) * 0.2;
                    const s = bushSize * (0.8 + hash(wx + bx * 3, wy, wz + bz * 3) * 0.4);
                    // Leaf cluster as a diamond
                    plantPositions.push(
                      cx, cy + s, cz,
                      cx - s, cy, cz,
                      cx, cy, cz + s,
                      cx + s, cy, cz,
                      cx, cy, cz - s,
                      cx, cy - s * 0.3, cz,
                    );
                    const lr = br * 0.8, lg = bg * 1.1, lb = bb * 0.7;
                    for (let i = 0; i < 6; i++) plantNormals.push(bx * 0.3, 0.5, bz * 0.3);
                    for (let i = 0; i < 6; i++) plantColors.push(lr, lg, lb);
                    plantIndices.push(bi, bi+1, bi+2, bi, bi+2, bi+3, bi, bi+3, bi+4, bi, bi+4, bi+1);
                    plantIndices.push(bi+5, bi+2, bi+1, bi+5, bi+3, bi+2, bi+5, bi+4, bi+3, bi+5, bi+1, bi+4);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Merge plant geometry into transparent (double-sided) pass
  const allTPos = [...tPositions, ...plantPositions];
  const allTNorm = [...tNormals, ...plantNormals];
  const allTCol = [...tColors, ...plantColors];
  const baseTIdx = tPositions.length / 3;
  const allTIdx = [...tIndices, ...plantIndices.map((i: number) => i + baseTIdx)];

  return {
    cx, cy, cz,
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    transparentPositions: new Float32Array(allTPos),
    transparentNormals: new Float32Array(allTNorm),
    transparentColors: new Float32Array(allTCol),
    transparentIndices: new Uint32Array(allTIdx),
    uvs: new Float32Array(0),
    transparentUvs: new Float32Array(0),
  };
}
