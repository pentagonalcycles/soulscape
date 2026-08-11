// Dream World — Terrain Generator (Unique Dream Aesthetic)

import { SeededNoise } from "./noise";
import { CHUNK_SIZE, AIR } from "./constants";
import { createChunk, getBlockIndex } from "./chunk";
import type { ChunkData, BiomeType } from "./types";

const B = {
  air: 0, void_stone: 1, nebula_rock: 2, moonstone: 3, glow_crystal: 30,
  dream_grass: 40, dream_soil: 44, starwood_log: 10, starwood_plank: 11,
  crystal_flower: 51, luminous_fern: 52, glow_mushroom: 53, cloud: 41,
  mist: 42, star_sand: 120, coral: 43, neon_cube: 33, aurora_block: 32,
  cosmic_brick: 70, torch: 84, violet_glass: 20,
  liquid_starlight: 60,
  tall_grass: 54, bush: 55, vine: 56, star_blossom: 57, void_lily: 58, moon_bloom: 59,
  pebble: 121, small_rock: 122,
};

// Safe modulo that works correctly for negative numbers
function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// World configuration — each seed generates unique world characteristics
interface WorldConfig {
  terrainScale: number;      // 0.5-2.0 — how tall mountains are
  hillFrequency: number;     // 0.5-2.0 — how frequent hills are
  flatness: number;          // 0-1 — how flat the terrain is
  waterLevel: number;        // 55-75 — base water level
  caveDensity: number;       // 0.5-2.0 — how many caves
  islandDensity: number;     // 0-1 — floating island amount
  vegetationDensity: number; // 0.5-2.0 — how much vegetation
  treeDensity: number;       // 0.5-2.0 — how many trees
  boulderDensity: number;    // 0.5-2.0 — how many boulders
  dominantBiome: BiomeType;  // which biome covers most of the world
  skyTopColor: string;       // unique sky color per world
  skyHorizonColor: string;   // unique horizon color
  fogColor: string;          // unique fog color
  accentColor: string;       // unique accent for particles/lights
}

export class WorldGenerator {
  private noise: SeededNoise;
  private seed: number;
  private config: WorldConfig;

  constructor(seed: number) {
    this.seed = seed;
    this.noise = new SeededNoise(seed);
    this.config = this.generateConfig(seed);
  }

  private generateConfig(seed: number): WorldConfig {
    const rng = seededRandom(seed);
    const r = () => rng();

    // Terrain shape
    const terrainScale = 0.5 + r() * 1.5; // 0.5-2.0
    const hillFrequency = 0.5 + r() * 1.5; // 0.5-2.0
    const flatness = r() * 0.6; // 0-0.6 (some worlds are flatter)

    // Water and caves
    const waterLevel = 58 + Math.floor(r() * 15); // 58-73
    const caveDensity = 0.5 + r() * 1.5;

    // Features — moderate density for natural look
    const islandDensity = 0.2 + r() * 0.4; // 0.2-0.6
    const vegetationDensity = 0.4 + r() * 0.8; // 0.4-1.2
    const treeDensity = 0.4 + r() * 0.8; // 0.4-1.2
    const boulderDensity = 0.3 + r() * 0.6; // 0.3-0.9

    // Dominant biome — weighted selection
    const biomes: BiomeType[] = ["plains", "crystal_meadows", "cloud_forest", "starlight_desert", "nebula_peaks", "void_depths", "coral_reef"];
    const dominantBiome = biomes[Math.floor(r() * biomes.length)];

    // Sky colors — unique per world
    const skyHue = Math.floor(r() * 360);
    const skyTopColor = `hsl(${skyHue}, 40%, 8%)`;
    const skyHorizonColor = `hsl(${(skyHue + 30) % 360}, 50%, 20%)`;
    const fogColor = `hsl(${(skyHue + 15) % 360}, 45%, 15%)`;
    const accentHue = Math.floor(r() * 360);
    const accentColor = `hsl(${accentHue}, 70%, 60%)`;

    return {
      terrainScale,
      hillFrequency,
      flatness,
      waterLevel,
      caveDensity,
      islandDensity,
      vegetationDensity,
      treeDensity,
      boulderDensity,
      dominantBiome,
      skyTopColor,
      skyHorizonColor,
      fogColor,
      accentColor,
    };
  }

  getConfig(): WorldConfig {
    return this.config;
  }

  getBiome(wx: number, wz: number): BiomeType {
    const n = this.noise.fbm2D(wx * 0.003 + this.seed * 0.001, wz * 0.003, 3);
    // Each world has a different dominant biome that covers more area
    const dominant = this.config.dominantBiome;
    const allBiomes: BiomeType[] = ["plains", "crystal_meadows", "cloud_forest", "starlight_desert", "coral_reef", "nebula_peaks", "void_depths"];
    const dominantIdx = allBiomes.indexOf(dominant);
    // Shift thresholds so dominant biome gets 40% more area
    const shift = dominantIdx * 0.12 - 0.3;
    if (n < -0.3 + shift) return "plains";
    if (n < -0.1 + shift) return "crystal_meadows";
    if (n < 0.1 + shift) return "cloud_forest";
    if (n < 0.3 + shift) return "starlight_desert";
    if (n < 0.5 + shift) return "coral_reef";
    if (n < 0.7 + shift) return "nebula_peaks";
    return "void_depths";
  }

  // Blended biome — returns primary, secondary, and blend factor (0-1)
  private getBlendedBiome(wx: number, wz: number): { primary: BiomeType; secondary: BiomeType; blend: number } {
    const primary = this.getBiome(wx, wz);
    // Sample neighbours at multiple distances for smoother transitions
    const sampleDist = 16;
    const right = this.getBiome(wx + sampleDist, wz);
    const forward = this.getBiome(wx, wz + sampleDist);
    const diag = this.getBiome(wx + sampleDist, wz + sampleDist);
    // Pick the most common adjacent biome
    const adjacent = [right, forward, diag].filter(b => b !== primary);
    const secondary = adjacent.length > 0 ? adjacent[0] : primary;
    if (secondary === primary) return { primary, secondary: primary, blend: 0 };
    // Smooth blend factor using distance-based noise
    const edgeNoise = this.noise.fbm2D(wx * 0.004 + this.seed * 0.001, wz * 0.004, 4);
    const thresholds: Record<string, number> = {
      plains: -0.3, crystal_meadows: -0.1, cloud_forest: 0.1,
      starlight_desert: 0.3, coral_reef: 0.5, nebula_peaks: 0.7, void_depths: 1.0,
    };
    const t1 = thresholds[primary] ?? 0;
    const keys = Object.keys(thresholds);
    const idx = keys.indexOf(primary);
    const prevThreshold = idx > 0 ? thresholds[keys[idx - 1]] ?? -1 : -1;
    const bandWidth = t1 - prevThreshold;
    const distIntoBand = edgeNoise - prevThreshold;
    // Smoother blend — wider transition zone
    const rawBlend = bandWidth > 0 ? distIntoBand / bandWidth : 0;
    const blend = Math.max(0, Math.min(1, rawBlend * 0.5)); // 50% wider transition
    return { primary, secondary, blend };
  }

  getHeight(wx: number, wz: number): number {
    const cfg = this.config;
    const seedOffset = this.seed * 0.001;
    // Multi-octave terrain — each world has different shape
    const continental = this.noise.fbm2D(wx * 0.002 * cfg.hillFrequency + seedOffset, wz * 0.002 * cfg.hillFrequency, 4) * 30 * cfg.terrainScale;
    const hills = this.noise.fbm2D(wx * 0.008 * cfg.hillFrequency + seedOffset * 2, wz * 0.008 * cfg.hillFrequency, 3) * 15 * cfg.terrainScale * (1 - cfg.flatness);
    const detail = this.noise.fbm2D(wx * 0.03, wz * 0.03, 2) * 5;
    const micro = this.noise.noise2D(wx * 0.08, wz * 0.08) * 2;
    // Erosion
    const erosionNoise = this.noise.fbm2D(wx * 0.005 + 100 + seedOffset, wz * 0.005 + 100, 3);
    const erosion = erosionNoise > 0.3 ? (erosionNoise - 0.3) * 15 : 0;
    // Rivers
    const riverX = Math.sin(wx * 0.003 + this.seed * 0.01) * 40;
    const riverZ = wz * 0.004;
    const riverDist = Math.abs(this.noise.noise2D(riverX + seedOffset, riverZ));
    const river = riverDist < 0.08 ? (0.08 - riverDist) * 80 : 0;
    // Combine with world-specific base height
    const baseHeight = cfg.waterLevel + 5;
    const height = baseHeight + continental + hills + detail + micro - erosion - river;
    return Math.floor(Math.max(45, Math.min(130, height)));
  }

  // Get terrain slope — for cliff detection
  private getSlope(wx: number, wz: number): number {
    const h = this.getHeight(wx, wz);
    const hx = this.getHeight(wx + 2, wz);
    const hz = this.getHeight(wx, wz + 2);
    return Math.max(Math.abs(h - hx), Math.abs(h - hz));
  }

  // Check if position is near water (low terrain)
  private isNearWater(wx: number, wz: number): boolean {
    const h = this.getHeight(wx, wz);
    return h < 66;
  }

  // Get water depth — for shoreline variation
  private getWaterDepth(wx: number, wz: number): number {
    const h = this.getHeight(wx, wz);
    return Math.max(0, 66 - h);
  }

  // ── Floating Islands (y=100-160) ─────────────────────────────────────

  private getFloatingIsland(wx: number, wy: number, wz: number): number | null {
    if (wy < 100 || wy > 180) return null;
    const islandNoise = this.noise.noise3D(wx * 0.015, wy * 0.02, wz * 0.015);
    const verticalBias = 1 - Math.abs(wy - 130) / 50;
    const threshold = this.config.islandDensity - verticalBias * 0.15;
    if (islandNoise < threshold) return null;

    // Determine island "surface" by checking if block above is air
    const aboveNoise = this.noise.noise3D(wx * 0.015, (wy + 1) * 0.02, wz * 0.015);
    const isSurface = aboveNoise < threshold;

    // Mini-biome per island cluster (deterministic by position)
    const clusterX = Math.floor(wx / 40);
    const clusterZ = Math.floor(wz / 40);
    const clusterHash = Math.abs(this.noise.noise2D(clusterX * 7.3, clusterZ * 13.7));

    if (isSurface) {
      if (clusterHash < 0.25) return B.dream_grass;
      if (clusterHash < 0.5) return B.moonstone;
      if (clusterHash < 0.75) return B.star_sand;
      return B.nebula_rock;
    }
    return B.dream_soil;
  }

  // Waterfalls of liquid starlight hanging from floating island undersides
  private isWaterfall(wx: number, wy: number, wz: number): boolean {
    if (wy > 180 || wy < 80) return false;
    const islandNoise = this.noise.noise3D(wx * 0.015, wy * 0.02, wz * 0.015);
    const verticalBias = 1 - Math.abs(wy - 130) / 50;
    const threshold = 0.35 - verticalBias * 0.15;
    // Must be below an island block but not inside island
    if (islandNoise >= threshold) return false;
    const aboveNoise = this.noise.noise3D(wx * 0.015, (wy + 3) * 0.02, wz * 0.015);
    if (aboveNoise < threshold) return false;
    // Narrow column — only certain xz positions
    const fallNoise = this.noise.noise2D(wx * 0.3 + 200, wz * 0.3 + 200);
    return fallNoise > 0.7;
  }

  // ── Water Bodies — ponds and streams ─────────────────────────────────

  private getWaterBlock(wx: number, wy: number, wz: number): number | null {
    const surfaceHeight = this.getHeight(wx, wz);
    const wl = this.config.waterLevel;
    if (wy >= wl || wy < surfaceHeight) return null;
    if (wy !== wl - 1) return null;
    if (surfaceHeight >= wl) return null;
    return B.liquid_starlight;
  }

  // Shoreline — sand/gravel at water edges
  private getShoreline(wx: number, wy: number, wz: number, surfaceHeight: number): number | null {
    if (wy !== surfaceHeight) return null;
    const wl = this.config.waterLevel;
    if (surfaceHeight < wl - 2 || surfaceHeight > wl + 2) return null;
    const waterNearby = this.getHeight(wx + 2, wz) < wl || this.getHeight(wx - 2, wz) < wl ||
                        this.getHeight(wx, wz + 2) < wl || this.getHeight(wx, wz - 2) < wl;
    if (!waterNearby) return null;
    return B.star_sand;
  }

  // Mist patches in low valleys — atmospheric fog
  private getMist(wx: number, wy: number, wz: number): number | null {
    const surfaceHeight = this.getHeight(wx, wz);
    // Mist appears in low areas, slightly above surface
    if (wy < surfaceHeight + 1 || wy > surfaceHeight + 6) return null;
    if (surfaceHeight > 70) return null; // only in valleys
    const mistNoise = this.noise.fbm2D(wx * 0.02 + 3000, wz * 0.02 + 3000, 3);
    const heightFactor = 1 - (wy - surfaceHeight) / 6; // denser near ground
    if (mistNoise * heightFactor > 0.4) return B.mist;
    return null;
  }

  // ── Crystal Caves (underground) ──────────────────────────────────────

  private isCrystalCave(wx: number, wy: number, wz: number): boolean {
    const surfaceHeight = this.getHeight(wx, wz);
    if (wy >= surfaceHeight - 2 || wy < 5) return false;
    const caveNoise = this.noise.noise3D(wx * 0.04 + 50, wy * 0.05, wz * 0.04 + 50);
    const largeCave = this.noise.noise3D(wx * 0.02, wy * 0.025, wz * 0.02);
    const threshold = 0.52 / this.config.caveDensity;
    const largeThreshold = 0.6 / this.config.caveDensity;
    return caveNoise > threshold || largeCave > largeThreshold;
  }

  // Stalactites — tall narrow columns hanging from cave ceiling
  private isStalactite(wx: number, wy: number, wz: number): boolean {
    const surfaceHeight = this.getHeight(wx, wz);
    if (wy >= surfaceHeight - 2 || wy < 8) return false;
    const stalactiteNoise = this.noise.noise2D(wx * 0.15 + 300, wz * 0.15 + 300);
    if (stalactiteNoise < 0.78) return false;
    // Must be a thin column — check that neighbours are not also stalactites
    const left = this.noise.noise2D((wx - 1) * 0.15 + 300, wz * 0.15 + 300);
    const right = this.noise.noise2D((wx + 1) * 0.15 + 300, wz * 0.15 + 300);
    const front = this.noise.noise2D(wx * 0.15 + 300, (wz - 1) * 0.15 + 300);
    const back = this.noise.noise2D(wx * 0.15 + 300, (wz + 1) * 0.15 + 300);
    const thinColumn = left < 0.78 || right < 0.78 || front < 0.78 || back < 0.78;
    if (!thinColumn) return false;
    // Height — extends down from ceiling
    const caveTop = surfaceHeight - 4;
    const stalLength = 3 + Math.floor((stalactiteNoise - 0.78) * 40);
    return wy > caveTop - stalLength && wy <= caveTop;
  }

  // Underground pools of liquid starlight
  private isUndergroundPool(wx: number, wy: number, wz: number): boolean {
    const surfaceHeight = this.getHeight(wx, wz);
    if (wy >= surfaceHeight - 5 || wy < 10) return false;
    const poolNoise = this.noise.fbm2D(wx * 0.06 + 400, wz * 0.06 + 400, 3);
    if (poolNoise < 0.45) return false;
    // Pool surface at a consistent height
    const poolHeight = Math.floor(20 + this.noise.noise2D(wx * 0.01, wz * 0.01) * 10);
    return wy === poolHeight;
  }

  // ── Giant Trees per biome ────────────────────────────────────────────

  private getGiantTree(wx: number, wy: number, wz: number, biome: BiomeType, surfaceHeight: number): number | null {
    if (wy <= surfaceHeight) return null;
    const treeNoise = this.noise.noise2D(wx * 0.08 + this.seed * 0.005, wz * 0.08);
    const treeThreshold = 0.72 - this.config.treeDensity * 0.12; // denser worlds have lower threshold
    if (treeNoise < treeThreshold) return null;

    switch (biome) {
      case "cloud_forest": {
        const treeHeight = 20 + Math.floor((treeNoise - 0.55) * 60);
        const trunkTop = surfaceHeight + Math.floor(treeHeight * 0.55);
        const canopyTop = surfaceHeight + treeHeight;
        if (wy > surfaceHeight && wy <= trunkTop) {
          const trunkH = wy - surfaceHeight;
          if (trunkH < treeHeight * 0.15) {
            const rx = safeMod(wx, 3), rz = safeMod(wz, 3);
            if ((rx === 0 || rx === 1) && (rz === 0 || rz === 1)) return B.starwood_log;
            return null;
          }
          const rx = safeMod(wx, 2), rz = safeMod(wz, 2);
          if (rx === 0 && rz === 0) return B.starwood_log;
          if (trunkH > treeHeight * 0.3 && trunkH < treeHeight * 0.5) {
            const branchNoise = this.noise.noise2D(wx * 0.2 + wy, wz * 0.2 + wy);
            if (branchNoise > 0.6) return B.starwood_log;
          }
          return null;
        }
        if (wy > trunkTop && wy <= canopyTop) {
          // Thick cloud canopy
          const canopyNoise = this.noise.noise3D(wx * 0.08, wy * 0.1, wz * 0.08);
          if (canopyNoise > -0.1) return B.cloud;
          // Leaves edge
          const edgeDist = Math.abs(canopyNoise);
          if (edgeDist < 0.15) return B.mist;
          return null;
        }
        return null;
      }
      case "crystal_meadows": {
        const treeHeight = 12 + Math.floor((treeNoise - 0.55) * 50);
        const trunkTop = surfaceHeight + Math.floor(treeHeight * 0.45);
        if (wy > surfaceHeight && wy <= trunkTop) {
          const trunkH = wy - surfaceHeight;
          if (trunkH < 2) {
            const rx = safeMod(wx, 3), rz = safeMod(wz, 3);
            if ((rx === 0 || rx === 1) && (rz === 0 || rz === 1)) return B.starwood_log;
            return null;
          }
          const rx = safeMod(wx, 2), rz = safeMod(wz, 2);
          if (rx === 0 && rz === 0) return B.starwood_log;
          return null;
        }
        if (wy > trunkTop && wy <= surfaceHeight + treeHeight) {
          const leafNoise = this.noise.noise3D(wx * 0.12, wy * 0.15, wz * 0.12);
          if (leafNoise > -0.15) return B.glow_crystal;
          return null;
        }
        return null;
      }
      case "void_depths": {
        const mushHeight = 6 + Math.floor((treeNoise - 0.55) * 20);
        const stemTop = surfaceHeight + Math.floor(mushHeight * 0.55);
        if (wy > surfaceHeight && wy <= stemTop) {
          const stemH = wy - surfaceHeight;
          if (stemH < 2) {
            const rx = safeMod(wx, 3), rz = safeMod(wz, 3);
            if ((rx === 0 || rx === 1) && (rz === 0 || rz === 1)) return B.starwood_log;
            return null;
          }
          const rx = safeMod(wx, 2), rz = safeMod(wz, 2);
          if (rx === 0 && rz === 0) return B.starwood_log;
          return null;
        }
        if (wy > stemTop && wy <= surfaceHeight + mushHeight) {
          const capNoise = this.noise.noise3D(wx * 0.1, wy * 0.12, wz * 0.1);
          if (capNoise > -0.2) return B.glow_mushroom;
          return null;
        }
        return null;
      }
      case "starlight_desert": {
        // Sparse tall cacti-like structures
        if (treeNoise < 0.7) return null;
        const cactusHeight = 8 + Math.floor((treeNoise - 0.7) * 40);
        if (wy > surfaceHeight && wy <= surfaceHeight + cactusHeight) {
          const rx = safeMod(wx, 3), rz = safeMod(wz, 3);
          if (rx === 1 && rz === 1) return B.neon_cube;
          return null;
        }
        // Arms
        const armY = surfaceHeight + Math.floor(cactusHeight * 0.6);
        if (wy === armY && ((safeMod(wx, 3) === 0 && safeMod(wz, 3) === 1) || (safeMod(wx, 3) === 1 && safeMod(wz, 3) === 0))) {
          return B.neon_cube;
        }
        return null;
      }
      case "plains": {
        // Sparse scattered trees — oak-like
        if (treeNoise < 0.68) return null;
        const plainTreeHeight = 5 + Math.floor((treeNoise - 0.68) * 25);
        if (wy > surfaceHeight && wy <= surfaceHeight + plainTreeHeight) {
          const trunkH = wy - surfaceHeight;
          if (trunkH < 2) {
            const rx = safeMod(wx, 3), rz = safeMod(wz, 3);
            if ((rx === 0 || rx === 1) && (rz === 0 || rz === 1)) return B.starwood_log;
            return null;
          }
          if (wy < surfaceHeight + plainTreeHeight - 3) return B.starwood_log;
          const canopyNoise = this.noise.noise3D(wx * 0.15, wy * 0.2, wz * 0.15);
          if (canopyNoise > -0.2) return B.glow_crystal;
          return null;
        }
        return null;
      }
      default: {
        // Generic trees for other biomes
        const treeHeight = 5 + Math.floor((treeNoise - 0.55) * 30);
        if (wy > surfaceHeight && wy <= surfaceHeight + treeHeight) {
          if (wy < surfaceHeight + treeHeight - 2) return B.starwood_log;
          return B.glow_crystal;
        }
        return null;
      }
    }
  }

  // ── Natural Arches ───────────────────────────────────────────────────

  private getArchBlock(wx: number, wy: number, wz: number, surfaceHeight: number): number | null {
    if (wy <= surfaceHeight) return null;
    // Arch formation: noise determines arch centre, spanning 8-15 blocks
    const archNoise = this.noise.noise2D(wx * 0.025 + 500, wz * 0.025 + 500);
    if (archNoise < 0.65) return null;
    // Arch shape — parabolic curve
    const archSpan = 8 + Math.floor((archNoise - 0.65) * 40); // 8-15 blocks
    const archHeight = Math.floor(archSpan * 0.6);
    const archTop = surfaceHeight + archHeight;
    if (wy > archTop || wy <= surfaceHeight) return null;
    // Check if this block is on the arch surface (thin shell)
    const localX = safeMod(wx, archSpan);
    const normalizedX = localX / archSpan;
    const parabola = 4 * normalizedX * (1 - normalizedX); // 0 at edges, 1 at centre
    const expectedY = surfaceHeight + Math.floor(parabola * archHeight);
    const thickness = 1;
    if (Math.abs(wy - expectedY) <= thickness) {
      const matNoise = this.noise.noise2D(wx * 0.1 + 600, wz * 0.1 + 600);
      return matNoise > 0.5 ? B.moonstone : B.nebula_rock;
    }
    return null;
  }

  // ── Crystal Formations ───────────────────────────────────────────────

  private isCrystalFormation(wx: number, wy: number, wz: number): boolean {
    const crystalNoise = this.noise.noise3D(wx * 0.04 + 100, wy * 0.04, wz * 0.04 + 100);
    if (crystalNoise < 0.6) return false;
    const surfaceHeight = this.getHeight(wx, wz);
    return wy > surfaceHeight + 2 && wy < surfaceHeight + 15;
  }

  // ── Paths ────────────────────────────────────────────────────────────

  private isPath(wx: number, wz: number): boolean {
    const pathNoise = this.noise.noise2D(wx * 0.03 + 50, wz * 0.03 + 50);
    return pathNoise > 0.7;
  }

  // ── Village ──────────────────────────────────────────────────────────

  private getVillageBlock(wx: number, wy: number, wz: number): number | null {
    const vcx = Math.round(wx / 200) * 200;
    const vcz = Math.round(wz / 200) * 200;
    const villageNoise = this.noise.noise2D(vcx * 0.01 + this.seed * 0.003, vcz * 0.01);
    if (villageNoise < 0.4) return null;

    const surfaceHeight = this.getHeight(wx, wz);
    const buildingNoise = this.noise.noise2D(wx * 0.1, wz * 0.1);
    if (buildingNoise < 0.6) return null;

    const bw = 3 + Math.floor((buildingNoise - 0.6) * 15);
    const bd = 3 + Math.floor(this.noise.noise2D(wx * 0.15, wz * 0.15) * 10);
    const bh = 4 + Math.floor(this.noise.noise2D(wx * 0.2, wz * 0.2) * 4);
    const bx = safeMod(wx, bw);
    const bz = safeMod(wz, bd);

    if (wy === surfaceHeight) {
      if (bx === 0 || bx === bw - 1 || bz === 0 || bz === bd - 1) return B.cosmic_brick;
      return B.starwood_plank;
    }
    if (wy > surfaceHeight && wy <= surfaceHeight + bh) {
      if (bx === 0 || bx === bw - 1 || bz === 0 || bz === bd - 1) {
        if (wy === surfaceHeight + 2 && (bx === Math.floor(bw / 2) || bz === Math.floor(bd / 2))) return B.violet_glass;
        if (wy <= surfaceHeight + 2 && bx === Math.floor(bw / 2) && bz === 0) return B.air;
        return B.cosmic_brick;
      }
      return B.air;
    }
    if (wy === surfaceHeight + bh) return B.starwood_plank;
    if (wy === surfaceHeight + bh + 1 && (bx === 0 || bx === bw - 1 || bz === 0 || bz === bd - 1)) return B.neon_cube;

    return null;
  }

  // ── Surface Decorations (dream flowers & foliage) ────────────────────

  // Boulders and rock formations
  private getBoulder(wx: number, wy: number, wz: number, surfaceHeight: number): number | null {
    if (wy < surfaceHeight + 1 || wy > surfaceHeight + 4) return null;
    const boulderNoise = this.noise.noise2D(wx * 0.06 + 2000, wz * 0.06 + 2000);
    const boulderThreshold = 0.88 - this.config.boulderDensity * 0.1;
    if (boulderNoise < boulderThreshold) return null;
    const boulderSize = 1 + Math.floor((boulderNoise - 0.72) * 15); // 1-5 blocks tall
    const boulderHeight = surfaceHeight + boulderSize;
    if (wy > boulderHeight) return null;
    // Shape — roughly spherical using distance from center
    const centerX = Math.round(wx / 3) * 3;
    const centerZ = Math.round(wz / 3) * 3;
    const distX = Math.abs(wx - centerX);
    const distZ = Math.abs(wz - centerZ);
    const distY = wy - surfaceHeight;
    const dist = Math.sqrt(distX * distX + distZ * distZ + distY * distY);
    if (dist > boulderSize) return null;
    // Material — varies by biome
    const biome = this.getBiome(wx, wz);
    if (biome === "starlight_desert") return B.star_sand;
    if (biome === "coral_reef") return B.coral;
    if (biome === "void_depths") return B.nebula_rock;
    return B.moonstone;
  }

  private getSurfaceDecoration(wx: number, wy: number, wz: number, biome: BiomeType, surfaceHeight: number): number | null {
    if (wy !== surfaceHeight + 1) return null;
    const vd = this.config.vegetationDensity;
    const flowerNoise = this.noise.noise2D(wx * 0.2 + 700, wz * 0.2 + 700);
    const foliageNoise = this.noise.noise2D(wx * 0.15 + 800, wz * 0.15 + 800);
    const grassNoise = this.noise.noise2D(wx * 0.25 + 900, wz * 0.25 + 900);
    const rareNoise = this.noise.noise2D(wx * 0.5 + 1200, wz * 0.5 + 1200);
    const bushNoise = this.noise.noise2D(wx * 0.12 + 1100, wz * 0.12 + 1100);
    const rockNoise = this.noise.noise2D(wx * 0.3 + 1500, wz * 0.3 + 1500);

    // Pebbles and rocks — sparse ground detail
    if (rockNoise > 0.88) return B.small_rock;
    if (rockNoise > 0.84 && rockNoise <= 0.88) return B.pebble;

    switch (biome) {
      case "plains":
        if (grassNoise > 0.5 / vd) return B.tall_grass;
        if (flowerNoise > 0.85 / vd) return B.crystal_flower;
        if (bushNoise > 0.9 / vd) return B.bush;
        break;
      case "crystal_meadows":
        if (rareNoise > 0.92 / vd) return B.star_blossom;
        if (rareNoise < -0.9 / vd) return B.moon_bloom;
        if (flowerNoise > 0.55 / vd) return B.crystal_flower;
        if (foliageNoise > 0.6 / vd) return B.luminous_fern;
        if (grassNoise > 0.55 / vd) return B.tall_grass;
        if (bushNoise > 0.8 / vd) return B.bush;
        break;
      case "cloud_forest":
        if (foliageNoise > 0.55 / vd) return B.luminous_fern;
        if (flowerNoise > 0.75 / vd) return B.crystal_flower;
        if (grassNoise > 0.65 / vd) return B.tall_grass;
        if (bushNoise > 0.75 / vd) return B.bush;
        if (rareNoise > 0.9 / vd) return B.vine;
        if (grassNoise < -0.7 / vd) return B.glow_mushroom;
        break;
      case "void_depths":
        if (flowerNoise > 0.6 / vd) return B.glow_mushroom;
        if (foliageNoise > 0.65 / vd) return B.luminous_fern;
        if (rareNoise > 0.88 / vd) return B.void_lily;
        if (grassNoise > 0.75 / vd) return B.tall_grass;
        if (bushNoise > 0.85 / vd) return B.bush;
        break;
      case "starlight_desert":
        if (flowerNoise > 0.85 / vd) return B.crystal_flower;
        if (grassNoise > 0.88 / vd) return B.tall_grass;
        if (rareNoise > 0.95 / vd) return B.star_blossom;
        break;
      case "coral_reef":
        if (foliageNoise > 0.65 / vd) return B.coral;
        if (flowerNoise > 0.8 / vd) return B.crystal_flower;
        if (rareNoise > 0.92 / vd) return B.star_blossom;
        break;
      case "nebula_peaks":
        if (flowerNoise > 0.8 / vd) return B.crystal_flower;
        if (grassNoise > 0.82 / vd) return B.tall_grass;
        if (bushNoise > 0.88 / vd) return B.bush;
        if (rareNoise > 0.93 / vd) return B.moon_bloom;
        break;
    }
    // Transition zone — sparse mix from both biomes
    const { blend } = this.getBlendedBiome(wx, wz);
    if (blend > 0.3) {
      if (flowerNoise > 0.7) return B.crystal_flower;
      if (foliageNoise > 0.75) return B.luminous_fern;
      if (grassNoise > 0.7) return B.tall_grass;
    }
    return null;
  }

  // ── Underground Cave Vegetation ──────────────────────────────────────

  private getCaveVegetation(wx: number, wy: number, wz: number): number | null {
    const surfaceHeight = this.getHeight(wx, wz);
    if (wy >= surfaceHeight - 2 || wy < 8) return null;
    const vegNoise = this.noise.noise2D(wx * 0.18 + 1300, wz * 0.18 + 1300);
    const mushNoise = this.noise.noise2D(wx * 0.12 + 1400, wz * 0.12 + 1400);

    // Glow mushrooms on cave floors
    if (mushNoise > 0.65) return B.glow_mushroom;
    // Luminous ferns in caves
    if (vegNoise > 0.72) return B.luminous_fern;
    // Rare void lilies deep underground
    if (wy < 25 && vegNoise < -0.8) return B.void_lily;
    return null;
  }

  // ── Cave Wall Decoration ─────────────────────────────────────────────

  private getCaveWallDecoration(wx: number, wy: number, wz: number): number | null {
    const surfaceHeight = this.getHeight(wx, wz);
    if (wy >= surfaceHeight - 2 || wy < 5) return null;
    const decoNoise = this.noise.noise3D(wx * 0.12 + 900, wy * 0.12, wz * 0.12 + 900);
    // Glow crystal and moonstone clusters on cave walls
    if (decoNoise > 0.55) return B.glow_crystal;
    if (decoNoise > 0.45) return B.moonstone;
    // Glow mushrooms in lower caves
    if (wy < 30) {
      const mushNoise = this.noise.noise2D(wx * 0.18 + 1000, wz * 0.18 + 1000);
      if (mushNoise > 0.7) return B.glow_mushroom;
    }
    return null;
  }

  // ── Main Block Resolver ──────────────────────────────────────────────

  getBlockAt(wx: number, wy: number, wz: number): number {
    // Check village first
    const villageBlock = this.getVillageBlock(wx, wy, wz);
    if (villageBlock !== null) return villageBlock;

    const biome = this.getBiome(wx, wz);
    const surfaceHeight = this.getHeight(wx, wz);

    // Floating islands
    const islandBlock = this.getFloatingIsland(wx, wy, wz);
    if (islandBlock !== null) return islandBlock;

    // Water bodies
    const waterBlock = this.getWaterBlock(wx, wy, wz);
    if (waterBlock !== null) return waterBlock;

    // Waterfalls from floating islands
    if (this.isWaterfall(wx, wy, wz)) return B.liquid_starlight;

    // Natural arches (above surface)
    const archBlock = this.getArchBlock(wx, wy, wz, surfaceHeight);
    if (archBlock !== null) return archBlock;

    // Crystal caves (underground)
    if (this.isCrystalCave(wx, wy, wz)) {
      // Stalactites take priority inside caves
      if (this.isStalactite(wx, wy, wz)) return B.glow_crystal;
      // Underground pools
      if (this.isUndergroundPool(wx, wy, wz)) return B.liquid_starlight;
      // Cave wall decorations
      const caveDeco = this.getCaveWallDecoration(wx, wy, wz);
      if (caveDeco !== null) return caveDeco;
      // Cave floor vegetation
      const caveVeg = this.getCaveVegetation(wx, wy, wz);
      if (caveVeg !== null) return caveVeg;
      return B.air;
    }

    // Floating crystal formations
    if (this.isCrystalFormation(wx, wy, wz)) return B.glow_crystal;

    // Glowing pathways
    if (wy === surfaceHeight && this.isPath(wx, wz)) return B.neon_cube;

    // Giant trees per biome
    const treeBlock = this.getGiantTree(wx, wy, wz, biome, surfaceHeight);
    if (treeBlock !== null) return treeBlock;

    // Boulders and rock formations
    const boulderBlock = this.getBoulder(wx, wy, wz, surfaceHeight);
    if (boulderBlock !== null) return boulderBlock;

    // Above surface — decorations, mist, and clouds
    if (wy > surfaceHeight) {
      // Mist patches in valleys
      const mist = this.getMist(wx, wy, wz);
      if (mist !== null) return mist;

      // Surface decorations (flowers, ferns, mushrooms)
      const deco = this.getSurfaceDecoration(wx, wy, wz, biome, surfaceHeight);
      if (deco !== null) return deco;

      // Clouds at high altitude
      if (wy > 100 && wy < 130) {
        const cloudNoise = this.noise.fbm2D(wx * 0.008, wz * 0.008, 2);
        if (cloudNoise > 0.2) return B.cloud;
      }

      // Aurora shimmer at very high altitudes
      if (wy > 150 && wy < 165) {
        const auroraNoise = this.noise.fbm2D(wx * 0.005 + 200, wz * 0.005 + 200, 2);
        if (auroraNoise > 0.5) return B.aurora_block;
      }

      return AIR;
    }

    // Surface — with blended biome transitions, shorelines, and cliffs
    if (wy === surfaceHeight) {
      // Shoreline at water edges
      const shore = this.getShoreline(wx, wy, wz, surfaceHeight);
      if (shore !== null) return shore;

      // Cliff detection — steep terrain shows exposed rock
      const slope = this.getSlope(wx, wz);
      if (slope > 4) {
        // Steep slope — show rock face
        const biome = this.getBiome(wx, wz);
        if (biome === "void_depths") return B.nebula_rock;
        if (biome === "nebula_peaks") return B.moonstone;
        return B.void_stone;
      }

      const { primary, secondary, blend } = this.getBlendedBiome(wx, wz);
      const surfaceBlock = this.getBiomeSurfaceBlock(primary);
      if (blend > 0.15 && secondary !== primary) {
        const secondaryBlock = this.getBiomeSurfaceBlock(secondary);
        const blendNoise = this.noise.noise2D(wx * 0.1 + 1100, wz * 0.1 + 1100);
        if (blendNoise < blend) return secondaryBlock;
      }
      return surfaceBlock;
    }

    // Sub-surface
    if (wy > surfaceHeight - 4) return B.dream_soil;

    // Deep underground
    if (wy > surfaceHeight - 30) {
      const oreNoise = this.noise.noise3D(wx * 0.08, wy * 0.08, wz * 0.08);
      if (oreNoise > 0.65) return B.glow_crystal;
      if (oreNoise > 0.55) return B.moonstone;
      return B.void_stone;
    }

    return B.void_stone;
  }

  private getBiomeSurfaceBlock(biome: BiomeType): number {
    switch (biome) {
      case "plains": return B.dream_grass;
      case "starlight_desert": return B.star_sand;
      case "coral_reef": return B.coral;
      case "void_depths": return B.nebula_rock;
      case "crystal_meadows": return B.dream_grass;
      case "cloud_forest": return B.dream_grass;
      case "nebula_peaks": return B.nebula_rock;
      default: return B.dream_grass;
    }
  }

  // ── Chunk Generation ─────────────────────────────────────────────────

  generateChunk(cx: number, cy: number, cz: number): ChunkData {
    const chunk = createChunk(cx, cy, cz);
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let ly = 0; ly < CHUNK_SIZE; ly++) {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          const wx = cx * CHUNK_SIZE + lx;
          const wy = cy * CHUNK_SIZE + ly;
          const wz = cz * CHUNK_SIZE + lz;
          chunk.blocks[getBlockIndex(lx, ly, lz)] = this.getBlockAt(wx, wy, wz);
        }
      }
    }
    chunk.dirty = true;
    return chunk;
  }

  decorateChunk(_chunk: ChunkData): void {}
}
