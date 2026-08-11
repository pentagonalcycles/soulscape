"use client";

import { useEffect, useRef, useCallback } from "react";
import { PLAYER_HEIGHT, PLAYER_WIDTH, GRAVITY, JUMP_VELOCITY, PLAYER_SPEED, FLY_SPEED, MAX_REACH, PLAYER_SPRINT_SPEED, CROUCH_SPEED, SWIM_SPEED } from "@/lib/dream-world/constants";
import { isSolid, getBreakSpeed } from "@/lib/dream-world/blocks";
import { worldToChunk, worldToLocal, getBlock } from "@/lib/dream-world/chunk";
import type { ChunkData, PlayerState } from "@/lib/dream-world/types";

interface PlayerControllerProps {
  chunks: Map<string, ChunkData>;
  player: PlayerState;
  onPlayerUpdate: (updates: Partial<PlayerState>) => void;
  onBlockBreak: (wx: number, wy: number, wz: number) => void;
  onBlockPlace: (wx: number, wy: number, wz: number, blockId: number) => void;
  activeBlockId: number;
  activeToolId?: string;
  flying: boolean;
  onToggleFlying: () => void;
  sprinting?: boolean;
  onSprintChange?: (sprinting: boolean) => void;
  crouching?: boolean;
  onCrouchChange?: (crouching: boolean) => void;
  stamina?: number;
  onStaminaChange?: (stamina: number) => void;
  onBreakProgress?: (progress: number, wx: number, wy: number, wz: number) => void;
}

const EYE_HEIGHT = 1.62;

export default function PlayerController({
  chunks, player, onPlayerUpdate, onBlockBreak, onBlockPlace, activeBlockId, activeToolId = "hand", flying, onToggleFlying,
  sprinting, onSprintChange, crouching, onCrouchChange, stamina, onStaminaChange, onBreakProgress,
}: PlayerControllerProps) {
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ pitch: -0.3, yaw: 0 });
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef(player);
  const chunksRef = useRef(chunks);
  const staminaRef = useRef(stamina ?? 100);
  const sprintingRef = useRef(sprinting ?? false);
  const crouchingRef = useRef(crouching ?? false);

  useEffect(() => {
    playerRef.current = player;
    chunksRef.current = chunks;
    if (stamina !== undefined) staminaRef.current = stamina;
    if (sprinting !== undefined) sprintingRef.current = sprinting;
    if (crouching !== undefined) crouchingRef.current = crouching;
  });

  const getBlockAt = useCallback((wx: number, wy: number, wz: number): number => {
    const { cx, cy, cz } = worldToChunk(wx, wy, wz);
    const key = `${cx},${cy},${cz}`;
    const chunk = chunksRef.current.get(key);
    if (!chunk) return 0;
    const { lx, ly, lz } = worldToLocal(wx, wy, wz);
    return getBlock(chunk, lx, ly, lz);
  }, []);

  const checkCollision = useCallback((x: number, y: number, z: number): boolean => {
    const halfW = PLAYER_WIDTH / 2;
    for (let dy = 0; dy < PLAYER_HEIGHT; dy += 0.5) {
      for (let dx = -halfW; dx <= halfW; dx += PLAYER_WIDTH) {
        for (let dz = -halfW; dz <= halfW; dz += PLAYER_WIDTH) {
          if (isSolid(getBlockAt(Math.floor(x + dx), Math.floor(y + dy), Math.floor(z + dz)))) return true;
        }
      }
    }
    return false;
  }, [getBlockAt]);

  // Pointer lock
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleClick = () => { if (document.pointerLockElement !== container) container.requestPointerLock(); };
    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  // Mouse look
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        const s = 0.002;
        mouseRef.current.yaw -= e.movementX * s;
        mouseRef.current.pitch -= e.movementY * s;
        mouseRef.current.pitch = Math.max(-1.5, Math.min(1.5, mouseRef.current.pitch));
      }
    };
    let lastTouch = { x: 0, y: 0 };
    const ts = (e: TouchEvent) => { lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const tm = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      mouseRef.current.yaw -= dx * 0.005;
      mouseRef.current.pitch -= dy * 0.005;
      mouseRef.current.pitch = Math.max(-1.5, Math.min(1.5, mouseRef.current.pitch));
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchstart", ts, { passive: true });
    document.addEventListener("touchmove", tm, { passive: true });
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", ts);
      document.removeEventListener("touchmove", tm);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === "Space") e.preventDefault();
      if (e.code === "KeyF") onToggleFlying();
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") onSprintChange?.(true);
      if (e.code === "ControlLeft" || e.code === "ControlRight") onCrouchChange?.(true);
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") onSprintChange?.(false);
      if (e.code === "ControlLeft" || e.code === "ControlRight") onCrouchChange?.(false);
    };
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    return () => { document.removeEventListener("keydown", down); document.removeEventListener("keyup", up); };
  }, [onToggleFlying, onSprintChange, onCrouchChange]);

  // Block interaction — progressive breaking with tool speed
  useEffect(() => {
    let breaking = false;
    let breakProgress = 0;
    let breakTarget = { x: 0, y: 0, z: 0 };
    let breakBlockId = 0;
    let mouseDown = false;

    const raycast = (): { hit: boolean; x: number; y: number; z: number; prevX: number; prevY: number; prevZ: number; blockId: number } => {
      const pos = playerRef.current.position;
      const eyeX = pos.x;
      const eyeY = pos.y + EYE_HEIGHT;
      const eyeZ = pos.z;
      const { pitch, yaw } = mouseRef.current;

      const dirX = -Math.sin(yaw) * Math.cos(pitch);
      const dirY = Math.sin(pitch);
      const dirZ = -Math.cos(yaw) * Math.cos(pitch);

      let x = Math.floor(eyeX);
      let y = Math.floor(eyeY);
      let z = Math.floor(eyeZ);

      const stepX = dirX > 0 ? 1 : -1;
      const stepY = dirY > 0 ? 1 : -1;
      const stepZ = dirZ > 0 ? 1 : -1;

      const tDeltaX = dirX !== 0 ? Math.abs(1 / dirX) : Infinity;
      const tDeltaY = dirY !== 0 ? Math.abs(1 / dirY) : Infinity;
      const tDeltaZ = dirZ !== 0 ? Math.abs(1 / dirZ) : Infinity;

      let tMaxX = dirX > 0 ? (x + 1 - eyeX) * tDeltaX : (eyeX - x) * tDeltaX;
      let tMaxY = dirY > 0 ? (y + 1 - eyeY) * tDeltaY : (eyeY - y) * tDeltaY;
      let tMaxZ = dirZ > 0 ? (z + 1 - eyeZ) * tDeltaZ : (eyeZ - z) * tDeltaZ;

      let prevX = x, prevY = y, prevZ = z;

      // Check block at starting position (player might be inside it)
      const startBlock = getBlockAt(x, y, z);
      if (startBlock !== 0) return { hit: true, x, y, z, prevX: x, prevY: y, prevZ: z, blockId: startBlock };

      for (let i = 0; i < MAX_REACH * 3; i++) {
        prevX = x; prevY = y; prevZ = z;

        if (tMaxX < tMaxY && tMaxX < tMaxZ) {
          x += stepX;
          tMaxX += tDeltaX;
        } else if (tMaxY < tMaxZ) {
          y += stepY;
          tMaxY += tDeltaY;
        } else {
          z += stepZ;
          tMaxZ += tDeltaZ;
        }

        const block = getBlockAt(x, y, z);
        if (block !== 0) return { hit: true, x, y, z, prevX, prevY, prevZ, blockId: block };

        // Forgiveness: check nearby blocks for vegetation/decorations
        // Check block below (grass under grass blades)
        const blockBelow = getBlockAt(x, y - 1, z);
        if (blockBelow !== 0 && i < 3) {
          return { hit: true, x: x, y: y - 1, z: z, prevX, prevY, prevZ, blockId: blockBelow };
        }
      }
      return { hit: false, x: 0, y: 0, z: 0, prevX: 0, prevY: 0, prevZ: 0, blockId: 0 };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseDown = true;
        const result = raycast();
        if (result.hit) {
          // Start or continue breaking
          if (breakTarget.x !== result.x || breakTarget.y !== result.y || breakTarget.z !== result.z) {
            // New block target
            breakTarget = { x: result.x, y: result.y, z: result.z };
            breakBlockId = result.blockId;
            breakProgress = 0;
          }
          breaking = true;
          // Instant break for zero-hardness blocks
          const speed = getBreakSpeed(result.blockId, activeToolId);
          if (speed >= 100) {
            onBlockBreak(result.x, result.y, result.z);
            breaking = false;
            breakProgress = 0;
          }
        }
      } else if (e.button === 2) {
        const result = raycast();
        if (result.hit) onBlockPlace(result.prevX, result.prevY, result.prevZ, activeBlockId);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseDown = false;
        breaking = false;
        breakProgress = 0;
        onBreakProgress?.(0, 0, 0, 0);
      }
    };

    // Progressive break loop
    const breakInterval = setInterval(() => {
      if (!breaking || !mouseDown) return;

      // Check if still looking at same block
      const result = raycast();
      if (!result.hit || result.x !== breakTarget.x || result.y !== breakTarget.y || result.z !== breakTarget.z) {
        // Looking at different block — reset
        breaking = false;
        breakProgress = 0;
        onBreakProgress?.(0, 0, 0, 0);
        return;
      }

      // Calculate break speed
      const speed = getBreakSpeed(breakBlockId, activeToolId);
      breakProgress += speed * 0.05; // 50ms interval

      // Report progress
      onBreakProgress?.(Math.min(1, breakProgress), breakTarget.x, breakTarget.y, breakTarget.z);

      // Block broken
      if (breakProgress >= 1) {
        onBlockBreak(breakTarget.x, breakTarget.y, breakTarget.z);
        breaking = false;
        breakProgress = 0;
        onBreakProgress?.(0, 0, 0, 0);
      }
    }, 50);

    const ctx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("contextmenu", ctx);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("contextmenu", ctx);
      clearInterval(breakInterval);
    };
  }, [activeBlockId, activeToolId, getBlockAt, onBlockBreak, onBlockPlace, onBreakProgress]);

  // Game loop
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const keys = keysRef.current;
      const pos = { ...playerRef.current.position };
      const yaw = mouseRef.current.yaw;
      const vel = velocityRef.current;
      const fwd = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
      const rgt = { x: Math.cos(yaw), z: -Math.sin(yaw) };

      let mx = 0, mz = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) { mx += fwd.x; mz += fwd.z; }
      if (keys.has("KeyS") || keys.has("ArrowDown")) { mx -= fwd.x; mz -= fwd.z; }
      if (keys.has("KeyA") || keys.has("ArrowLeft")) { mx -= rgt.x; mz -= rgt.z; }
      if (keys.has("KeyD") || keys.has("ArrowRight")) { mx += rgt.x; mz += rgt.z; }
      const len = Math.sqrt(mx * mx + mz * mz);
      if (len > 0) { mx /= len; mz /= len; }

      // Check if player is in liquid (block 60 = liquid starlight)
      const feetBlock = getBlockAt(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
      const headBlock = getBlockAt(Math.floor(pos.x), Math.floor(pos.y + 1), Math.floor(pos.z));
      const inLiquid = feetBlock === 60 || headBlock === 60;

      // Determine speed based on state
      let spd = PLAYER_SPEED;
      if (flying) spd = FLY_SPEED;
      else if (inLiquid) spd = SWIM_SPEED;
      else if (crouchingRef.current) spd = CROUCH_SPEED;
      else if (sprintingRef.current && staminaRef.current > 0 && (keys.has("KeyW") || keys.has("ArrowUp"))) spd = PLAYER_SPRINT_SPEED;

      // Stamina drain/regen
      if (!flying && onStaminaChange) {
        if (sprintingRef.current && (keys.has("KeyW") || keys.has("ArrowUp"))) {
          onStaminaChange(Math.max(0, staminaRef.current - 15 * dt));
        } else {
          onStaminaChange(Math.min(100, staminaRef.current + 10 * dt));
        }
      }

      if (flying) {
        vel.x = mx * spd; vel.z = mz * spd; vel.y = 0;
        if (keys.has("Space")) vel.y = FLY_SPEED;
        if ((keys.has("ShiftLeft") || keys.has("ShiftRight")) && !sprinting) vel.y = -FLY_SPEED;
        pos.x += vel.x * dt; pos.y += vel.y * dt; pos.z += vel.z * dt;
      } else if (inLiquid) {
        // Swimming physics
        vel.x = mx * spd; vel.z = mz * spd;
        vel.y -= GRAVITY * 0.3 * dt; // reduced gravity in liquid
        if (keys.has("Space")) vel.y = SWIM_SPEED * 0.8;
        vel.y = Math.max(vel.y, -SWIM_SPEED * 0.5); // terminal velocity in liquid
        const nx = pos.x + vel.x * dt, ny = pos.y + vel.y * dt, nz = pos.z + vel.z * dt;
        if (!checkCollision(nx, pos.y, pos.z)) pos.x = nx; else vel.x = 0;
        if (!checkCollision(pos.x, pos.y, nz)) pos.z = nz; else vel.z = 0;
        if (!checkCollision(pos.x, ny, pos.z)) { pos.y = ny; } else { vel.y = 0; }
      } else {
        vel.x = mx * spd; vel.z = mz * spd;
        vel.y -= GRAVITY * dt;
        if (keys.has("Space") && playerRef.current.onGround) vel.y = JUMP_VELOCITY;
        const nx = pos.x + vel.x * dt, ny = pos.y + vel.y * dt, nz = pos.z + vel.z * dt;
        if (!checkCollision(nx, pos.y, pos.z)) pos.x = nx; else vel.x = 0;
        if (!checkCollision(pos.x, pos.y, nz)) pos.z = nz; else vel.z = 0;
        if (!checkCollision(pos.x, ny, pos.z)) {
          pos.y = ny;
          onPlayerUpdate({ onGround: false });
        } else {
          if (vel.y < 0) onPlayerUpdate({ onGround: true });
          vel.y = 0;
        }
      }
      if (pos.y < -50) { pos.y = 100; vel.y = 0; }
      onPlayerUpdate({ position: pos, rotation: { x: mouseRef.current.pitch, y: yaw, z: 0 }, velocity: { ...vel } });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [flying, checkCollision, onPlayerUpdate, onStaminaChange]);

  return <div ref={containerRef} className="dw-controller" />;
}
