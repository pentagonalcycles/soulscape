"use client";

import { useRef, useEffect, useCallback } from "react";
import { GameState, Orb, FoodParticle, PowerUp, GravityWell, Wormhole, CosmicRift, Storm } from "@/lib/nebula-orb/types";
import { POWERUP_COLORS } from "@/lib/nebula-orb/constants";

interface MinimapProps {
  state: GameState;
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  screenWidth: number;
  screenHeight: number;
  isMobile?: boolean;
}

const MAP_PADDING = 8;

export default function Minimap({ state, cameraX, cameraY, cameraZoom, screenWidth, screenHeight, isMobile = false }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = isMobile ? 120 : 160;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const { mapWidth, mapHeight } = state;
    const scaleX = (size - MAP_PADDING * 2) / mapWidth;
    const scaleY = (size - MAP_PADDING * 2) / mapHeight;
    const scale = Math.min(scaleX, scaleY);

    // Background
    ctx.fillStyle = "rgba(5, 5, 16, 0.92)";
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = "rgba(13, 148, 136, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 10);
    ctx.stroke();

    // Map area origin
    const ox = MAP_PADDING + (size - MAP_PADDING * 2 - mapWidth * scale) / 2;
    const oy = MAP_PADDING + (size - MAP_PADDING * 2 - mapHeight * scale) / 2;

    // Map area background
    ctx.fillStyle = "rgba(10, 10, 30, 0.5)";
    ctx.fillRect(ox, oy, mapWidth * scale, mapHeight * scale);

    // Map border
    ctx.strokeStyle = "rgba(13, 148, 136, 0.1)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(ox, oy, mapWidth * scale, mapHeight * scale);

    // Helper: world coords to minimap coords
    const mx = (x: number) => ox + x * scale;
    const my = (y: number) => oy + y * scale;

    // --- Draw Gravity Wells ---
    for (const gw of state.gravityWells) {
      const cx = mx(gw.x);
      const cy = my(gw.y);
      const r = Math.max(3, gw.pullRadius * scale);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(100, 80, 200, 0.2)");
      grad.addColorStop(1, "rgba(100, 80, 200, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = "rgba(130, 100, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2, gw.radius * scale), 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Draw Wormholes ---
    for (const wh of state.wormholes) {
      const cx = mx(wh.x);
      const cy = my(wh.y);
      const r = Math.max(3, wh.radius * scale);
      ctx.strokeStyle = wh.active ? "rgba(34, 211, 238, 0.7)" : "rgba(34, 211, 238, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Partner line
      if (wh.active) {
        const partner = state.wormholes.find((w) => w.id === wh.partnerId);
        if (partner) {
          ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
          ctx.lineWidth = 0.5;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(mx(partner.x), my(partner.y));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // --- Draw Cosmic Rifts ---
    for (const rift of state.cosmicRifts) {
      ctx.save();
      const cx = mx(rift.x);
      const cy = my(rift.y);
      ctx.translate(cx, cy);
      ctx.rotate(rift.angle);
      ctx.fillStyle = "rgba(220, 38, 38, 0.4)";
      ctx.fillRect(-rift.width * scale * 0.5, -2, rift.width * scale, 4);
      ctx.restore();
    }

    // --- Draw Storms ---
    for (const storm of state.storms) {
      const cx = mx(storm.x);
      const cy = my(storm.y);
      const r = Math.max(3, storm.radius * scale);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const stormColor = storm.type === "electromagnetic" ? "59, 130, 246" : storm.type === "void" ? "139, 92, 246" : "251, 191, 36";
      grad.addColorStop(0, `rgba(${stormColor}, 0.3)`);
      grad.addColorStop(1, `rgba(${stormColor}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Draw Singularity ---
    if (state.singularity) {
      const s = state.singularity;
      const cx = mx(s.x);
      const cy = my(s.y);
      const r = Math.max(4, s.radius * scale);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(20, 20, 40, 0.9)");
      grad.addColorStop(0.5, "rgba(100, 50, 200, 0.3)");
      grad.addColorStop(1, "rgba(100, 50, 200, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // Pull radius
      const pullR = Math.max(5, s.pullRadius * scale);
      ctx.strokeStyle = "rgba(150, 80, 255, 0.15)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, pullR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- Draw Food (tiny dots, sampled for performance) ---
    const foodSampleRate = Math.max(1, Math.floor(state.food.length / 300));
    for (let i = 0; i < state.food.length; i += foodSampleRate) {
      const f = state.food[i];
      const cx = mx(f.x);
      const cy = my(f.y);
      ctx.fillStyle = f.color || "#60a5fa";
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // --- Draw Power-ups ---
    for (const pu of state.powerUps) {
      const cx = mx(pu.x);
      const cy = my(pu.y);
      const colors = POWERUP_COLORS[pu.type];
      if (colors) {
        ctx.fillStyle = colors.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // --- Draw Orbs ---
    const allOrbs = Array.from(state.orbs.values()).filter((o) => o.alive);
    // Sort: player on top
    allOrbs.sort((a, b) => {
      if (a.id === state.playerId) return 1;
      if (b.id === state.playerId) return -1;
      return a.radius - b.radius;
    });

    for (const orb of allOrbs) {
      const cx = mx(orb.x);
      const cy = my(orb.y);
      const r = Math.max(2, orb.radius * scale);
      const isPlayer = orb.id === state.playerId;

      // Glow for player
      if (isPlayer) {
        const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 3);
        glow.addColorStop(0, "rgba(13, 148, 136, 0.3)");
        glow.addColorStop(1, "rgba(13, 148, 136, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orb body
      ctx.fillStyle = orb.skin?.bodyColor || orb.color || "#60a5fa";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Player border
      if (isPlayer) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Eclipse indicator
      if (orb.eclipseMode) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Name label for larger orbs or player
      if (isPlayer || orb.radius > 20) {
        ctx.fillStyle = isPlayer ? "#ffffff" : "rgba(226, 232, 240, 0.7)";
        ctx.font = `${isPlayer ? "bold " : ""}${isMobile ? 6 : 7}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(orb.name, cx, cy - r - 2);
      }
    }

    // --- Camera viewport rectangle ---
    const vpLeft = (cameraX - screenWidth / 2 / cameraZoom) * scale + ox;
    const vpTop = (cameraY - screenHeight / 2 / cameraZoom) * scale + oy;
    const vpW = (screenWidth / cameraZoom) * scale;
    const vpH = (screenHeight / cameraZoom) * scale;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(vpLeft, vpTop, vpW, vpH);
    ctx.setLineDash([]);

    // Fill viewport lightly
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(vpLeft, vpTop, vpW, vpH);
  }, [state, cameraX, cameraY, cameraZoom, screenWidth, screenHeight, isMobile]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  const size = isMobile ? 120 : 160;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: "rgba(5, 5, 16, 0.9)",
        border: "1px solid rgba(13, 148, 136, 0.12)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px`, display: "block" }}
      />
    </div>
  );
}
