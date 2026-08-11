// Dream World — BFS Flood-Fill Lighting Engine

import { CHUNK_SIZE, AIR } from "./constants";
import { isTransparent, getLightLevel } from "./blocks";
import { getBlock, getLight, setLight, getBlockIndex } from "./chunk";
import type { ChunkData } from "./types";

interface LightNode {
  lx: number;
  ly: number;
  lz: number;
  value: number;
}

// Compute sky light for a chunk (sunlight from above)
export function computeSkyLight(chunk: ChunkData): void {
  const { cy } = chunk;
  const maxY = (cy + 1) * CHUNK_SIZE;

  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      let skyLight = 15;
      // Cast ray downward from top
      for (let ly = CHUNK_SIZE - 1; ly >= 0; ly--) {
        const blockId = getBlock(chunk, lx, ly, lz);
        if (!isTransparent(blockId)) {
          skyLight = 0;
        }
        const { block } = getLight(chunk, lx, ly, lz);
        setLight(chunk, lx, ly, lz, skyLight, block);
      }
    }
  }
}

// Compute block light (from emissive blocks)
export function computeBlockLight(chunk: ChunkData): void {
  const queue: LightNode[] = [];

  // Find all light sources
  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    for (let ly = 0; ly < CHUNK_SIZE; ly++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const blockId = getBlock(chunk, lx, ly, lz);
        const lightLevel = getLightLevel(blockId);
        if (lightLevel > 0) {
          const { sky } = getLight(chunk, lx, ly, lz);
          setLight(chunk, lx, ly, lz, sky, lightLevel);
          queue.push({ lx, ly, lz, value: lightLevel });
        }
      }
    }
  }

  // BFS propagation
  const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  while (queue.length > 0) {
    const node = queue.shift()!;
    const nextValue = node.value - 1;
    if (nextValue <= 0) continue;

    for (const [dx, dy, dz] of dirs) {
      const nx = node.lx + dx;
      const ny = node.ly + dy;
      const nz = node.lz + dz;
      if (nx < 0 || nx >= CHUNK_SIZE || ny < 0 || ny >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) continue;

      const neighborId = getBlock(chunk, nx, ny, nz);
      if (!isTransparent(neighborId)) continue;

      const { sky, block } = getLight(chunk, nx, ny, nz);
      if (block < nextValue) {
        setLight(chunk, nx, ny, nz, sky, nextValue);
        queue.push({ lx: nx, ly: ny, lz: nz, value: nextValue });
      }
    }
  }
}

// Full lighting computation for a chunk
export function computeLighting(chunk: ChunkData): void {
  computeSkyLight(chunk);
  computeBlockLight(chunk);
}

// Get the max light value at a world position (for rendering)
export function getLightAt(chunk: ChunkData, lx: number, ly: number, lz: number): number {
  if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return 15;
  const { sky, block } = getLight(chunk, lx, ly, lz);
  return Math.max(sky, block);
}
