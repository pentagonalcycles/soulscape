"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useIsPlus } from "@/lib/premium";
import { useAuth } from "@/components/AuthProvider";
import { WorldGenerator } from "@/lib/dream-world/world-gen";
import { createChunk, chunkKey, worldToChunk } from "@/lib/dream-world/chunk";
import { BLOCKS } from "@/lib/dream-world/blocks";
import { AIR, STAMINA_MAX } from "@/lib/dream-world/constants";
import { CHUNK_SIZE } from "@/lib/dream-world/constants";
import type { ChunkData, PlayerState, Hotbar, DayNightState, GameMode, GamePhase, DroppedItem } from "@/lib/dream-world/types";
import { WeatherEngine } from "@/lib/dream-world/weather";
import WorldSelector from "./WorldSelector";
import GameRenderer from "./GameRenderer";
import PlayerController from "./PlayerController";
import GameHUD from "./GameHUD";
import BlockPalette from "./BlockPalette";
import MiniMap from "./MiniMap";
import ChatBar from "./ChatBar";
import CraftingMenu from "./CraftingMenu";
import type { CraftingRecipe } from "./CraftingMenu";
import Link from "next/link";

const DEFAULT_HOTBAR: Hotbar = {
  slots: [
    { blockId: 1, count: 64 },  // Void Stone
    { blockId: 11, count: 64 }, // Starwood Plank
    { blockId: 30, count: 64 }, // Glow Crystal
    { blockId: 20, count: 64 }, // Violet Glass
    { blockId: 40, count: 64 }, // Dream Grass
    { blockId: 70, count: 64 }, // Cosmic Brick
    { blockId: 31, count: 64 }, // Starlight Block
    { blockId: 0, count: 0 },
    { blockId: 0, count: 0 },
  ],
  activeIndex: 0,
};

export default function DreamWorldGame() {
  const isPlus = useIsPlus();
  const { userId, userProfile } = useAuth();

  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [mode, setMode] = useState<GameMode>("dream");
  const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map());
  const [player, setPlayer] = useState<PlayerState>({
    id: userId || "anon",
    name: userProfile?.display_name || "Dreamer",
    skinId: "default",
    position: { x: 8, y: 90, z: 8 },
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    onGround: false,
    flying: false,
    resonance: 50,
    emote: null,
    emoteExpiry: 0,
    health: 100,
    maxHealth: 100,
  });
  const [hotbar, setHotbar] = useState<Hotbar>(DEFAULT_HOTBAR);
  const [showPalette, setShowPalette] = useState(false);
  const [flying, setFlying] = useState(false);
  const [health, setHealth] = useState(100);
  const [hunger, setHunger] = useState(100);
  const [animals, setAnimals] = useState<Array<{id: string; type: string; position: {x:number;y:number;z:number}; color: string; size: number}>>([]);
  const [dayNight, setDayNight] = useState<DayNightState>({
    time: 0.25,
    sunAngle: Math.PI * 0.25,
    moonPhase: 0,
    ambientColor: "#e8a87c",
    sunIntensity: 0.8,
    fogColor: "#c8a888",
    starVisibility: 0,
  });
  const [playerCount, setPlayerCount] = useState(1);
  const [fps, setFps] = useState(60);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string; text: string; time: string}>>([]);
  const [stamina, setStamina] = useState(STAMINA_MAX);
  const [essences, setEssences] = useState<Record<number, number>>({});
  const [showCrafting, setShowCrafting] = useState(false);
  const [weatherType, setWeatherType] = useState("clear");
  const [weatherIntensity, setWeatherIntensity] = useState(0);
  const [biomeName, setBiomeName] = useState<string | null>(null);
  const [biomeFadeTimer, setBiomeFadeTimer] = useState(0);
  const [sprinting, setSprinting] = useState(false);
  const [crouching, setCrouching] = useState(false);
  const [blockEvents, setBlockEvents] = useState<Array<{ x: number; y: number; z: number; type: "break" | "place"; color: string }>>([]);
  const [worldConfig, setWorldConfig] = useState<{ skyTopColor: string; skyHorizonColor: string; fogColor: string; accentColor: string } | null>(null);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [breakProgress, setBreakProgress] = useState(0);
  const [breakTarget, setBreakTarget] = useState({ x: 0, y: 0, z: 0 });
  const droppedItemsRef = useRef<DroppedItem[]>([]);
  useEffect(() => { droppedItemsRef.current = droppedItems; });

  const generatorRef = useRef<WorldGenerator | null>(null);
  const weatherRef = useRef(new WeatherEngine());
  const fpsRef = useRef({ frames: 0, lastTime: 0 });
  const playerRef = useRef(player.position);
  useEffect(() => { playerRef.current = player.position; });

  // FPS counter — properly cleanup rAF
  useEffect(() => {
    let rafId: number;
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - fpsRef.current.lastTime) / 1000;
      setFps(Math.round(fpsRef.current.frames / elapsed));
      fpsRef.current = { frames: 0, lastTime: now };
    }, 1000);
    const countFrame = () => {
      fpsRef.current.frames++;
      rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Real-time day/night cycle — uses actual clock time
  useEffect(() => {
    if (phase !== "playing") return;

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeOfDay = (hours + minutes / 60) / 24; // 0-1

      const angle = timeOfDay * Math.PI * 2 - Math.PI / 2; // 0=midnight, 0.5=noon
      const sunHeight = Math.sin(angle);

      let ambientColor: string;
      let fogColor: string;
      let sunIntensity: number;
      let starVisibility: number;

      if (sunHeight > 0.3) {
        // Day — bright
        ambientColor = "#6a8fc8";
        fogColor = "#a0b8d8";
        sunIntensity = 1.8;
        starVisibility = 0;
      } else if (sunHeight > 0) {
        // Dawn/dusk — warm glow
        const t = sunHeight / 0.3;
        ambientColor = lerpColor("#d888b8", "#6a8fc8", t);
        fogColor = lerpColor("#f0b88c", "#a0b8d8", t);
        sunIntensity = 0.5 + t * 1.3;
        starVisibility = 1 - t;
      } else {
        // Night — brighter so you can see
        ambientColor = "#2a1850";
        fogColor = "#14103a";
        sunIntensity = 0.35;
        starVisibility = 1;
      }

      setDayNight({
        time: timeOfDay,
        sunAngle: angle,
        moonPhase: Math.floor(timeOfDay * 8),
        ambientColor,
        fogColor,
        sunIntensity,
        starVisibility,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 5000); // update every 5 seconds
    return () => clearInterval(interval);
  }, [phase]);

  // Hunger drain over time in survival
  useEffect(() => {
    if (phase !== "playing" || mode !== "dream") return;
    const interval = setInterval(() => {
      setHunger((prev) => {
        const next = Math.max(0, prev - 0.05);
        // Low hunger damages health
        if (next <= 0) {
          setHealth((h) => Math.max(0, h - 0.5));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, mode]);

  // Weather update loop
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const state = weatherRef.current.update(5);
      setWeatherType(state.type);
      setWeatherIntensity(state.intensity);
    }, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  // Biome detection
  const biomeNameRef = useRef(biomeName);
  useEffect(() => { biomeNameRef.current = biomeName; });

  useEffect(() => {
    if (phase !== "playing" || !generatorRef.current) return;
    const gen = generatorRef.current;
    const biome = gen.getBiome(Math.floor(player.position.x), Math.floor(player.position.z));
    const formatted = biome.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    if (formatted !== biomeNameRef.current) {
      setBiomeName(formatted);
      setBiomeFadeTimer(3);
    }
  }, [phase, player.position.x, player.position.z]);

  // Biome name fade
  useEffect(() => {
    if (biomeFadeTimer <= 0) return;
    const interval = setInterval(() => {
      setBiomeFadeTimer((prev) => {
        if (prev <= 0.1) return 0;
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [biomeFadeTimer]);

  // Chunk loading — use ref to avoid recreating callback every frame
  const playerPosRef = useRef(player.position);
  useEffect(() => { playerPosRef.current = player.position; });

  const loadChunksAroundPlayer = useCallback(() => {
    if (!generatorRef.current) return;
    const gen = generatorRef.current;
    const pos = playerPosRef.current;
    const { cx: pcx, cy: pcy, cz: pcz } = worldToChunk(pos.x, pos.y, pos.z);

    setChunks((prev) => {
      const next = new Map(prev);
      const needed: string[] = [];

      // Collect needed chunks (reduced range for faster initial load)
      const viewDist = 6;
      for (let dx = -viewDist; dx <= viewDist; dx++) {
        for (let dz = -viewDist; dz <= viewDist; dz++) {
          for (let dy = -1; dy <= 2; dy++) {
            const cx = pcx + dx;
            const cy = pcy + dy;
            const cz = pcz + dz;
            const key = chunkKey(cx, cy, cz);
            if (!next.has(key)) {
              needed.push(key);
            }
          }
        }
      }

      // Sort by distance to player chunk
      needed.sort((a, b) => {
        const [ax, ay, az] = a.split(",").map(Number);
        const [bx, by, bz] = b.split(",").map(Number);
        const da = (ax-pcx)**2 + (ay-pcy)**2 + (az-pcz)**2;
        const db = (bx-pcx)**2 + (by-pcy)**2 + (bz-pcz)**2;
        return da - db;
      });

      // Load up to 8 chunks per tick for faster loading
      let loaded = 0;
      for (const key of needed) {
        if (loaded >= 8) break;
        const [cx, cy, cz] = key.split(",").map(Number);
        const chunk = gen.generateChunk(cx, cy, cz);
        next.set(key, chunk);
        loaded++;
      }

      // Unload distant chunks
      for (const [key] of next) {
        const [cx, , cz] = key.split(",").map(Number);
        const dist = Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
        if (dist > viewDist + 2) {
          next.delete(key);
        }
      }

      return next;
    });
  }, []);

  // Load chunks periodically — faster at start, slower once loaded
  useEffect(() => {
    if (phase !== "playing") return;
    // Load immediately
    loadChunksAroundPlayer();
    // Then load periodically
    const interval = setInterval(loadChunksAroundPlayer, 100);
    return () => clearInterval(interval);
  }, [phase, loadChunksAroundPlayer]);

  // Dropped items physics + pickup
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setDroppedItems((prev) => {
        const playerPos = playerRef.current;
        const updated: DroppedItem[] = [];
        for (const item of prev) {
          // Age
          item.age += 0.05;
          item.pickupDelay = Math.max(0, item.pickupDelay - 0.05);

          // Gravity
          item.vy -= 15 * 0.05; // gravity
          item.y += item.vy * 0.05;

          // Ground collision — stop at terrain height
          if (generatorRef.current) {
            const groundY = generatorRef.current.getHeight(Math.floor(item.x), Math.floor(item.z));
            if (item.y < groundY + 0.5) {
              item.y = groundY + 0.5;
              item.vy = 0;
            }
          }

          // Bobbing when on ground
          if (item.vy === 0) {
            item.y += Math.sin(item.age * 3) * 0.02;
          }

          // Pickup detection
          if (item.pickupDelay <= 0) {
            const dx = playerPos.x - item.x;
            const dy = playerPos.y - item.y;
            const dz = playerPos.z - item.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 2) {
              // Pick up item
              setHotbar((prevHotbar) => {
                const slots = [...prevHotbar.slots];
                const existing = slots.findIndex((s) => s.blockId === item.blockId && s.count < 64);
                if (existing >= 0) {
                  slots[existing] = { ...slots[existing], count: slots[existing].count + 1 };
                } else {
                  const empty = slots.findIndex((s) => s.blockId === 0);
                  if (empty >= 0) {
                    slots[empty] = { blockId: item.blockId, count: 1 };
                  }
                }
                return { ...prevHotbar, slots };
              });
              continue; // don't add to updated
            }
          }

          // Despawn after 5 minutes
          if (item.age > 300) continue;

          updated.push(item);
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  // Start game — each world ID produces a unique seed
  const hashString = (s: string): number => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };

  const handleJoinWorld = useCallback((worldId: string, gameMode: GameMode) => {
    const seed = hashString(worldId);
    const gen = new WorldGenerator(seed);
    generatorRef.current = gen;
    setWorldConfig(gen.getConfig());
    setMode(gameMode);
    const isCreative = gameMode === "create";
    setFlying(isCreative);

    // Find safe spawn position - check multiple spots
    let spawnX = 8;
    let spawnZ = 8;
    let spawnY = 80;

    // Try several positions to find a safe flat area
    const candidates = [
      [8, 8], [16, 16], [0, 16], [16, 0], [-8, 8], [8, -8],
      [32, 32], [-16, 16], [16, -16], [0, 0],
    ];

    for (const [cx, cz] of candidates) {
      const h = gen.getHeight(cx, cz);
      // Check that the area is relatively flat (no steep cliffs)
      const h1 = gen.getHeight(cx + 1, cz);
      const h2 = gen.getHeight(cx, cz + 1);
      const h3 = gen.getHeight(cx - 1, cz);
      const h4 = gen.getHeight(cx, cz - 1);
      const maxDiff = Math.max(Math.abs(h - h1), Math.abs(h - h2), Math.abs(h - h3), Math.abs(h - h4));

      // Check blocks above spawn point are air
      const blockAbove1 = gen.getBlockAt(cx, h + 1, cz);
      const blockAbove2 = gen.getBlockAt(cx, h + 2, cz);
      const blockAbove3 = gen.getBlockAt(cx, h + 3, cz);

      if (maxDiff <= 2 && blockAbove1 === 0 && blockAbove2 === 0 && blockAbove3 === 0) {
        spawnX = cx;
        spawnZ = cz;
        spawnY = h + 2; // 2 blocks above surface
        break;
      }
    }

    setPlayer((prev) => ({
      ...prev,
      position: { x: spawnX, y: spawnY, z: spawnZ },
      flying: isCreative,
    }));

    // In creative mode, give full hotbar; in survival, start with empty inventory
    if (isCreative) {
      setHotbar(DEFAULT_HOTBAR);
    } else {
      setHotbar({
        slots: Array.from({ length: 9 }, () => ({ blockId: 0, count: 0 })),
        activeIndex: 0,
      });
    }
    setPhase("playing");
  }, []);

  const handleCreateWorld = useCallback((name: string, gameMode: GameMode, options?: { biome?: string; timeOfDay?: string; weather?: string; difficulty?: string }) => {
    const seed = hashString(name + Date.now().toString());
    const gen = new WorldGenerator(seed);
    generatorRef.current = gen;
    setWorldConfig(gen.getConfig());
    setMode(gameMode);
    const isCreative = gameMode === "create";
    setFlying(isCreative);

    // Find safe spawn position
    let spawnX = 8;
    let spawnZ = 8;
    let spawnY = 80;

    const candidates = [
      [8, 8], [16, 16], [0, 16], [16, 0], [-8, 8], [8, -8],
      [32, 32], [-16, 16], [16, -16], [0, 0],
    ];

    for (const [cx, cz] of candidates) {
      const h = gen.getHeight(cx, cz);
      const h1 = gen.getHeight(cx + 1, cz);
      const h2 = gen.getHeight(cx, cz + 1);
      const h3 = gen.getHeight(cx - 1, cz);
      const h4 = gen.getHeight(cx, cz - 1);
      const maxDiff = Math.max(Math.abs(h - h1), Math.abs(h - h2), Math.abs(h - h3), Math.abs(h - h4));

      const blockAbove1 = gen.getBlockAt(cx, h + 1, cz);
      const blockAbove2 = gen.getBlockAt(cx, h + 2, cz);
      const blockAbove3 = gen.getBlockAt(cx, h + 3, cz);

      if (maxDiff <= 2 && blockAbove1 === 0 && blockAbove2 === 0 && blockAbove3 === 0) {
        spawnX = cx;
        spawnZ = cz;
        spawnY = h + 2;
        break;
      }
    }

    setPlayer((prev) => ({
      ...prev,
      position: { x: spawnX, y: spawnY, z: spawnZ },
      flying: isCreative,
    }));

    if (isCreative) {
      setHotbar(DEFAULT_HOTBAR);
    } else {
      setHotbar({
        slots: Array.from({ length: 9 }, () => ({ blockId: 0, count: 0 })),
        activeIndex: 0,
      });
    }
    setPhase("playing");
  }, []);

  // Player update
  const handlePlayerUpdate = useCallback((updates: Partial<PlayerState>) => {
    setPlayer((prev) => ({ ...prev, ...updates }));
  }, []);

  // Block interaction — with gathering and particle effects
  const handleBlockBreak = useCallback((wx: number, wy: number, wz: number) => {
    setChunks((prev) => {
      const next = new Map(prev);
      const { cx, cy, cz } = worldToChunk(wx, wy, wz);
      const key = chunkKey(cx, cy, cz);
      const chunk = next.get(key);
      if (!chunk) return prev;
      const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const idx = lx + ly * CHUNK_SIZE + lz * CHUNK_SIZE * CHUNK_SIZE;
      const brokenBlock = chunk.blocks[idx];
      if (brokenBlock === AIR) return prev;

      // In survival mode, spawn a dropped item
      if (mode === "dream") {
        const newItem: DroppedItem = {
          id: `${wx}-${wy}-${wz}-${Date.now()}`,
          blockId: brokenBlock,
          x: wx + 0.5,
          y: wy + 0.5,
          z: wz + 0.5,
          vy: 2 + Math.random() * 2, // pop up
          age: 0,
          pickupDelay: 0.3,
        };
        setDroppedItems((prev) => [...prev, newItem]);
      }

      // Gather essences from special blocks (always)
      if ([30, 31, 32, 33, 51, 52, 53, 57, 58, 59].includes(brokenBlock)) {
        setEssences((prev) => ({
          ...prev,
          [brokenBlock]: (prev[brokenBlock] || 0) + 1,
        }));
      }

      // Emit break particle event
      const blockDef = BLOCKS[brokenBlock];
      if (blockDef) {
        setBlockEvents((prev) => {
          const next = [...prev, { x: wx, y: wy, z: wz, type: "break" as const, color: blockDef.color }];
          return next.length > 100 ? next.slice(-50) : next;
        });
      }

      chunk.blocks[idx] = AIR;
      chunk.dirty = true;
      return next;
    });
  }, [mode]);

  // Crafting handler — with validation
  const handleCraft = useCallback((recipe: CraftingRecipe) => {
    // Check if player has enough essences
    const canCraft = recipe.ingredients.every((ing) => (essences[ing.blockId] || 0) >= ing.count);
    if (!canCraft) return;

    setEssences((prev) => {
      const next = { ...prev };
      for (const ing of recipe.ingredients) {
        next[ing.blockId] = (next[ing.blockId] || 0) - ing.count;
        if (next[ing.blockId] <= 0) delete next[ing.blockId];
      }
      return next;
    });
    // Add result to hotbar
    setHotbar((prev) => {
      const slots = [...prev.slots];
      const existing = slots.findIndex((s) => s.blockId === recipe.result.blockId);
      if (existing >= 0) {
        slots[existing] = { ...slots[existing], count: slots[existing].count + recipe.result.count };
      } else {
        const empty = slots.findIndex((s) => s.blockId === 0);
        if (empty >= 0) {
          slots[empty] = { blockId: recipe.result.blockId, count: recipe.result.count };
        }
      }
      return { ...prev, slots };
    });
  }, []);

  const handleBlockPlace = useCallback((wx: number, wy: number, wz: number, blockId: number) => {
    if (blockId === AIR) return;
    // In survival mode, check if player has the block
    if (mode === "dream") {
      const slot = hotbar.slots[hotbar.activeIndex];
      if (!slot || slot.blockId !== blockId || slot.count <= 0) return;
    }
    setChunks((prev) => {
      const next = new Map(prev);
      const { cx, cy, cz } = worldToChunk(wx, wy, wz);
      const key = chunkKey(cx, cy, cz);
      const chunk = next.get(key);
      if (!chunk) return prev;
      const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const idx = lx + ly * CHUNK_SIZE + lz * CHUNK_SIZE * CHUNK_SIZE;
      if (chunk.blocks[idx] !== AIR) return prev;
      chunk.blocks[idx] = blockId;
      chunk.dirty = true;

      // Consume block from inventory in survival mode
      if (mode === "dream") {
        setHotbar((prev) => {
          const slots = [...prev.slots];
          const active = slots[prev.activeIndex];
          if (active && active.blockId === blockId && active.count > 0) {
            const newCount = active.count - 1;
            slots[prev.activeIndex] = { blockId: newCount > 0 ? blockId : 0, count: newCount };
          }
          return { ...prev, slots };
        });
      }

      // Emit place particle event
      const blockDef = BLOCKS[blockId];
      if (blockDef) {
        setBlockEvents((prev) => {
          const next = [...prev, { x: wx, y: wy, z: wz, type: "place" as const, color: blockDef.color }];
          return next.length > 100 ? next.slice(-50) : next;
        });
      }

      return next;
    });
  }, [mode, hotbar]);

  // Hotbar selection
  const handleSelectSlot = useCallback((index: number) => {
    setHotbar((prev) => ({ ...prev, activeIndex: index }));
  }, []);

  // Break progress handler
  const handleBreakProgress = useCallback((progress: number, wx: number, wy: number, wz: number) => {
    setBreakProgress(progress);
    setBreakTarget({ x: wx, y: wy, z: wz });
  }, []);

  // Keyboard for hotbar, palette, chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys when chat input is focused
      if (showChat && e.code !== "Escape") return;

      if (e.key >= "1" && e.key <= "9") {
        handleSelectSlot(parseInt(e.key) - 1);
      }
      if (e.code === "KeyE") {
        e.preventDefault();
        setShowPalette((p) => {
          const next = !p;
          // Release pointer lock when opening palette
          if (next && document.pointerLockElement) {
            document.exitPointerLock();
          }
          return next;
        });
      }
      if (e.code === "KeyT") {
        e.preventDefault();
        setShowChat(true);
        // Release pointer lock for chat
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
      if (e.code === "Escape") {
        if (showChat) {
          setShowChat(false);
        } else if (showPalette) {
          setShowPalette(false);
        } else if (showCrafting) {
          setShowCrafting(false);
        } else {
          setMenuOpen((p) => !p);
        }
      }
      if (e.code === "KeyC" && !showChat && !showPalette) {
        e.preventDefault();
        setShowCrafting((p) => {
          const next = !p;
          if (next && document.pointerLockElement) {
            document.exitPointerLock();
          }
          return next;
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectSlot, showChat, showPalette, showCrafting]);

  // Lobby
  if (phase === "lobby") {
    return <WorldSelector onJoinWorld={handleJoinWorld} onCreateWorld={handleCreateWorld} isPlus={isPlus} />;
  }

  // Game
  return (
    <div className="dw-game">
      <GameRenderer
        chunks={chunks}
        dayNight={dayNight}
        playerPosition={player.position}
        playerRotation={player.rotation}
        weatherType={weatherType}
        weatherIntensity={weatherIntensity}
        blockEvents={blockEvents}
        worldConfig={worldConfig}
        droppedItems={droppedItems}
        breakProgress={breakProgress}
        breakTarget={breakTarget}
      />
      <PlayerController
        chunks={chunks}
        player={player}
        onPlayerUpdate={handlePlayerUpdate}
        onBlockBreak={handleBlockBreak}
        onBlockPlace={handleBlockPlace}
        activeBlockId={hotbar.slots[hotbar.activeIndex]?.blockId || 0}
        activeToolId={String(hotbar.slots[hotbar.activeIndex]?.blockId || 0)}
        flying={flying}
        onToggleFlying={() => setFlying((p) => !p)}
        sprinting={sprinting}
        onSprintChange={setSprinting}
        crouching={crouching}
        onCrouchChange={setCrouching}
        stamina={stamina}
        onStaminaChange={setStamina}
        onBreakProgress={handleBreakProgress}
      />
      <GameHUD
        player={player}
        hotbar={hotbar}
        flying={flying}
        resonance={player.resonance}
        playerCount={playerCount}
        fps={fps}
        health={health}
        maxHealth={100}
        stamina={stamina}
        maxStamina={STAMINA_MAX}
        hunger={hunger}
        essences={essences}
        biomeName={biomeName}
        biomeFadeTimer={biomeFadeTimer}
        weatherType={weatherType}
        onSelectSlot={handleSelectSlot}
        onToggleMenu={() => setMenuOpen((p) => !p)}
      />

      {/* Minimap */}
      <MiniMap
        chunks={chunks}
        playerPosition={player.position}
        playerRotation={player.rotation}
      />

      {/* Block palette */}
      {showPalette && (
        <BlockPalette
          onSelect={(id) => {
            setHotbar((prev) => {
              const slots = [...prev.slots];
              slots[prev.activeIndex] = { blockId: id, count: 64 };
              return { ...prev, slots };
            });
            setShowPalette(false);
          }}
          onClose={() => setShowPalette(false)}
          activeBlockId={hotbar.slots[hotbar.activeIndex]?.blockId || 0}
        />
      )}

      {/* Chat bar */}
      {showChat && (
        <ChatBar
          messages={chatMessages}
          onSendMessage={(msg) => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            setChatMessages((prev) => [...prev, { sender: player.name || "Dreamer", text: msg, time }]);
          }}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Crafting menu */}
      {showCrafting && (
        <CraftingMenu
          onClose={() => setShowCrafting(false)}
          onCraft={handleCraft}
          inventory={essences}
        />
      )}

      {/* Menu overlay */}
      {menuOpen && (
        <div className="dw-menu-overlay">
          <div className="dw-menu">
            <h2 className="dw-menu-title">Dream World</h2>
            <button onClick={() => setMenuOpen(false)} className="dw-menu-item">Resume</button>
            <button onClick={() => { setPhase("lobby"); setMenuOpen(false); }} className="dw-menu-item">Leave World</button>
            <Link href="/" className="dw-menu-item">Return Home</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, "0")}`;
}
