"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { GameState } from "@/lib/nebula-orb/types";
import { updateGame } from "@/lib/nebula-orb/engine";
import { getOrbRadius } from "@/lib/nebula-orb/orb";
import { render } from "@/lib/nebula-orb/renderer";

export interface GameCanvasRef {
  getState: () => GameState;
}

interface GameCanvasProps {
  state: GameState;
  onDeath: (score: number, kills: number, timeSurvived: number) => void;
  isMobile?: boolean;
  siteBg?: string | null;
}

const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ state, onDeath, isMobile = false, siteBg }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const mouseAngleRef = useRef<number>(0);
  const isBoostingRef = useRef<boolean>(false);
  const zoomRef = useRef<number>(1);
  const gameStateRef = useRef<GameState>(state);
  const deathHandled = useRef<boolean>(false);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Joystick state (virtual joystick for mobile)
  const joystickRef = useRef({ active: false, touchId: null as number | null, x: 0, y: 0, dx: 0, dy: 0 });
  const boostTouchRef = useRef({ active: false, touchId: null as number | null });

  useImperativeHandle(ref, () => ({
    getState: () => gameStateRef.current,
  }));

  useEffect(() => {
    gameStateRef.current = state;
    deathHandled.current = false;
    zoomRef.current = 1;
    gameStartTimeRef.current = Date.now();
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const gs = gameStateRef.current;
      const player = gs.playerId ? gs.orbs.get(gs.playerId) : null;
      if (!player) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isBoostingRef.current = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isBoostingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoomRef.current = Math.max(0.3, Math.min(3, zoomRef.current + delta));
    };

    // --- TOUCH CONTROLS ---
    const JOYSTICK_RADIUS = 60;
    const JOYSTICK_KNOB_RADIUS = 24;
    const BOOST_BTN_SIZE = 56;
    const SCREEN_W = () => window.innerWidth;
    const SCREEN_H = () => window.innerHeight;

    // Find the joystick base position (bottom-left corner)
    const joystickBase = () => ({ x: 80, y: SCREEN_H() - 100 });
    // Find the boost button position (bottom-right corner)
    const boostBtnPos = () => ({ x: SCREEN_W() - 70, y: SCREEN_H() - 100 });

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const now = Date.now();
      const joy = joystickRef.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const bx = boostBtnPos().x;
        const by = boostBtnPos().y;

        // Check if touch is on boost button
        if (Math.abs(touch.clientX - bx) < BOOST_BTN_SIZE && Math.abs(touch.clientY - by) < BOOST_BTN_SIZE) {
          boostTouchRef.current = { active: true, touchId: touch.identifier };
          isBoostingRef.current = true;
          continue;
        }

        // Otherwise it's a joystick touch (if not already active)
        if (!joy.active) {
          const base = joystickBase();
          joy.active = true;
          joy.touchId = touch.identifier;
          joy.x = base.x;
          joy.y = base.y;
          joy.dx = 0;
          joy.dy = 0;

          // Calculate initial direction
          const dx = touch.clientX - base.x;
          const dy = touch.clientY - base.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            joy.dx = dx / dist;
            joy.dy = dy / dist;
            mouseAngleRef.current = Math.atan2(dy, dx);
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const joy = joystickRef.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Update joystick
        if (joy.active && touch.identifier === joy.touchId) {
          const dx = touch.clientX - joy.x;
          const dy = touch.clientY - joy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = JOYSTICK_RADIUS;

          if (dist > maxDist) {
            joy.dx = dx / dist;
            joy.dy = dy / dist;
          } else {
            joy.dx = dist > 5 ? dx / dist : 0;
            joy.dy = dist > 5 ? dy / dist : 0;
          }

          if (joy.dx !== 0 || joy.dy !== 0) {
            mouseAngleRef.current = Math.atan2(joy.dy, joy.dx);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const joy = joystickRef.current;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (boostTouchRef.current.active && touch.identifier === boostTouchRef.current.touchId) {
          boostTouchRef.current = { active: false, touchId: null };
          isBoostingRef.current = false;
        }

        if (joy.active && touch.identifier === joy.touchId) {
          joy.active = false;
          joy.touchId = null;
          joy.dx = 0;
          joy.dy = 0;
        }
      }
    };

    // Pinch to zoom
    let pinchDistRef = 0;
    const handleTouchStartForZoom = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const handleTouchMoveForZoom = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const delta = (newDist - pinchDistRef) * 0.005;
        zoomRef.current = Math.max(0.3, Math.min(3, zoomRef.current + delta));
        pinchDistRef = newDist;
      }
    };

    // Keyboard controls
    const keysDown = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.key.toLowerCase());
      if (e.key === " ") isBoostingRef.current = true;
      if (e.key === "+" || e.key === "=") zoomRef.current = Math.min(3, zoomRef.current + 0.15);
      if (e.key === "-") zoomRef.current = Math.max(0.3, zoomRef.current - 0.15);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key.toLowerCase());
      if (e.key === " ") isBoostingRef.current = false;
    };

    const updateKeyboardAngle = () => {
      const gs = gameStateRef.current;
      const player = gs.playerId ? gs.orbs.get(gs.playerId) : null;
      if (!player) return;
      let dx = 0, dy = 0;
      if (keysDown.has("w") || keysDown.has("arrowup")) dy -= 1;
      if (keysDown.has("s") || keysDown.has("arrowdown")) dy += 1;
      if (keysDown.has("a") || keysDown.has("arrowleft")) dx -= 1;
      if (keysDown.has("d") || keysDown.has("arrowright")) dx += 1;
      if (dx !== 0 || dy !== 0) {
        mouseAngleRef.current = Math.atan2(dy, dx);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchstart", handleTouchStartForZoom, { passive: true });
    window.addEventListener("touchmove", handleTouchMoveForZoom, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    lastTimeRef.current = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;
      const gs = gameStateRef.current;

      const player = gs.playerId ? gs.orbs.get(gs.playerId) : null;
      if (!player) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      updateKeyboardAngle();
      player.isBoosting = isBoostingRef.current;
      player.targetAngle = mouseAngleRef.current;

      updateGame(gs, dt);

      const updatedPlayer = gs.playerId ? gs.orbs.get(gs.playerId) : null;
      if (updatedPlayer && !updatedPlayer.alive && !deathHandled.current) {
        deathHandled.current = true;
        const timeSurvived = (Date.now() - gameStartTimeRef.current) / 1000;
        onDeath(updatedPlayer.score, updatedPlayer.kills, timeSurvived);
        return;
      }

      // Render
      const renderPlayer = gs.playerId ? gs.orbs.get(gs.playerId) : null;
      const autoZoom = renderPlayer ? Math.max(0.3, Math.min(1.5, 60 / renderPlayer.radius)) : 1;
      const camera = {
        x: renderPlayer?.x || gs.mapWidth / 2,
        y: renderPlayer?.y || gs.mapHeight / 2,
        zoom: autoZoom * zoomRef.current,
        targetZoom: 1,
        shake: gs.screenShake,
      };
      render(ctx, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement, gs, camera, siteBg);

      // Draw cursor (desktop only)
      if (!isMobile && renderPlayer && renderPlayer.alive) {
        const cursorX = window.innerWidth / 2 + Math.cos(mouseAngleRef.current) * 40;
        const cursorY = window.innerHeight / 2 + Math.sin(mouseAngleRef.current) * 40;
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cursorX - 10, cursorY);
        ctx.lineTo(cursorX + 10, cursorY);
        ctx.moveTo(cursorX, cursorY - 10);
        ctx.lineTo(cursorX, cursorY + 10);
        ctx.stroke();
        ctx.restore();
      }

      // Draw virtual joystick (mobile only)
      if (isMobile && renderPlayer && renderPlayer.alive) {
        const joy = joystickRef.current;
        const base = joystickBase();
        const boost = boostBtnPos();

        // Joystick base
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "rgba(13, 148, 136, 0.15)";
        ctx.strokeStyle = "rgba(13, 148, 136, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(base.x, base.y, JOYSTICK_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Joystick knob
        const knobX = base.x + joy.dx * JOYSTICK_RADIUS;
        const knobY = base.y + joy.dy * JOYSTICK_RADIUS;
        ctx.globalAlpha = joy.active ? 0.5 : 0.35;
        ctx.fillStyle = "#0d9488";
        ctx.beginPath();
        ctx.arc(knobX, knobY, JOYSTICK_KNOB_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Boost button
        ctx.save();
        ctx.globalAlpha = isBoostingRef.current ? 0.55 : 0.3;
        ctx.fillStyle = isBoostingRef.current ? "#10b981" : "rgba(13, 148, 136, 0.2)";
        ctx.strokeStyle = isBoostingRef.current ? "#34d399" : "rgba(13, 148, 136, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boost.x - BOOST_BTN_SIZE / 2, boost.y - BOOST_BTN_SIZE / 2, BOOST_BTN_SIZE, BOOST_BTN_SIZE, 14);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡", boost.x, boost.y);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchstart", handleTouchStartForZoom);
      window.removeEventListener("touchmove", handleTouchMoveForZoom);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onDeath, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ cursor: "none", background: "#050510", touchAction: "none" }}
      tabIndex={0}
    />
  );
});

GameCanvas.displayName = "GameCanvas";
export default GameCanvas;
