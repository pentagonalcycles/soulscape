// Dream World — Chunk System (Uint8Array storage)

import { CHUNK_SIZE, CHUNK_SIZE_SQ, CHUNK_SIZE_CB, AIR } from "./constants";
import { isTransparent, getLightLevel } from "./blocks";
import type { ChunkData } from "./types";

export function createChunk(cx: number, cy: number, cz: number): ChunkData {
  return {
    cx,
    cy,
    cz,
    blocks: new Uint8Array(CHUNK_SIZE_CB),
    light: new Uint8Array(CHUNK_SIZE_CB),
    dirty: true,
    meshVersion: 0,
  };
}

export function getBlockIndex(x: number, y: number, z: number): number {
  return x + y * CHUNK_SIZE + z * CHUNK_SIZE_SQ;
}

export function getBlock(chunk: ChunkData, lx: number, ly: number, lz: number): number {
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return AIR;
  return chunk.blocks[getBlockIndex(lx, ly, lz)];
}

export function setBlock(chunk: ChunkData, lx: number, ly: number, lz: number, blockId: number): void {
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return;
  chunk.blocks[getBlockIndex(lx, ly, lz)] = blockId;
  chunk.dirty = true;
}

export function getLight(chunk: ChunkData, lx: number, ly: number, lz: number): { sky: number; block: number } {
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) {
    return { sky: 15, block: 0 };
  }
  const val = chunk.light[getBlockIndex(lx, ly, lz)];
  return { sky: (val >> 4) & 0xf, block: val & 0xf };
}

export function setLight(chunk: ChunkData, lx: number, ly: number, lz: number, sky: number, block: number): void {
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return;
  chunk.light[getBlockIndex(lx, ly, lz)] = ((sky & 0xf) << 4) | (block & 0xf);
}

export function chunkKey(cx: number, cy: number, cz: number): string {
  return `${cx},${cy},${cz}`;
}

export function parseChunkKey(key: string): { cx: number; cy: number; cz: number } {
  const parts = key.split(",");
  return { cx: +parts[0], cy: +parts[1], cz: +parts[2] };
}

export function worldToChunk(wx: number, wy: number, wz: number): { cx: number; cy: number; cz: number } {
  return {
    cx: Math.floor(wx / CHUNK_SIZE),
    cy: Math.floor(wy / CHUNK_SIZE),
    cz: Math.floor(wz / CHUNK_SIZE),
  };
}

export function worldToLocal(wx: number, wy: number, wz: number): { lx: number; ly: number; lz: number } {
  return {
    lx: ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
    ly: ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
    lz: ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
  };
}

export function localToWorld(cx: number, cy: number, cz: number, lx: number, ly: number, lz: number): { wx: number; wy: number; wz: number } {
  return {
    wx: cx * CHUNK_SIZE + lx,
    wy: cy * CHUNK_SIZE + ly,
    wz: cz * CHUNK_SIZE + lz,
  };
}

// Serialize chunk for storage (blocks only, light is recomputed)
export function serializeChunk(chunk: ChunkData): Uint8Array {
  return chunk.blocks;
}

// Deserialize chunk from storage
export function deserializeChunk(cx: number, cy: number, cz: number, data: Uint8Array): ChunkData {
  const chunk = createChunk(cx, cy, cz);
  chunk.blocks.set(data);
  chunk.dirty = true;
  return chunk;
}

// Fill chunk with a single block type
export function fillChunk(chunk: ChunkData, blockId: number): void {
  chunk.blocks.fill(blockId);
  chunk.dirty = true;
}

// Count non-air blocks in chunk
export function countBlocks(chunk: ChunkData): number {
  let count = 0;
  for (let i = 0; i < CHUNK_SIZE_CB; i++) {
    if (chunk.blocks[i] !== AIR) count++;
  }
  return count;
}
