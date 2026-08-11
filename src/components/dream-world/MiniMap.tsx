"use client";

import { useRef, useEffect } from "react";
import type { ChunkData } from "@/lib/dream-world/types";
import { worldToChunk, worldToLocal, getBlock } from "@/lib/dream-world/chunk";
import { isSolid } from "@/lib/dream-world/blocks";

interface MiniMapProps {
  chunks: Map<string, ChunkData>;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: { x: number; y: number; z: number };
}

export default function MiniMap({ chunks, playerPosition, playerRotation }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 140;
    const scale = 2; // pixels per block
    const range = Math.floor(size / scale / 2);

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = "rgba(13, 148, 136, 0.08)";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw terrain from top-down
    const px = Math.floor(playerPosition.x);
    const pz = Math.floor(playerPosition.z);
    const py = Math.floor(playerPosition.y);

    for (let dx = -range; dx <= range; dx++) {
      for (let dz = -range; dz <= range; dz++) {
        const wx = px + dx;
        const wz = pz + dz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > range) continue;

        // Find the topmost solid block at this x,z
        let topBlock = 0;
        for (let wy = py + 20; wy >= py - 20; wy--) {
          const { cx, cy, cz } = worldToChunk(wx, wy, wz);
          const key = `${cx},${cy},${cz}`;
          const chunk = chunks.get(key);
          if (!chunk) continue;
          const { lx, ly, lz } = worldToLocal(wx, wy, wz);
          const block = getBlock(chunk, lx, ly, lz);
          if (isSolid(block)) { topBlock = block; break; }
        }

        // Color based on block type
        let color = "rgba(18, 16, 42, 0.3)"; // void
        if (topBlock === 40) color = "#3a6848"; // dream grass
        else if (topBlock === 44) color = "#2a1a3a"; // dream soil
        else if (topBlock === 1) color = "#1a1545"; // void stone
        else if (topBlock === 2) color = "#2d1f5e"; // nebula rock
        else if (topBlock === 3) color = "#c8b8e8"; // moonstone
        else if (topBlock === 10) color = "#4a3060"; // starwood log
        else if (topBlock === 30) color = "#a78bfa"; // glow crystal
        else if (topBlock === 51) color = "#06b6d4"; // crystal flower
        else if (topBlock === 120) color = "#e8d8b0"; // star sand
        else if (topBlock === 43) color = "#f093b8"; // coral

        const sx = (dx + range) * scale;
        const sy = (dz + range) * scale;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, scale, scale);
      }
    }

    // Player dot
    const centerX = size / 2;
    const centerY = size / 2;
    ctx.fillStyle = "#a78bfa";
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Direction indicator
    const dirLen = 8;
    const dirX = centerX + Math.sin(playerRotation.y) * dirLen;
    const dirY = centerY + Math.cos(playerRotation.y) * dirLen;
    ctx.strokeStyle = "#f0eaf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(dirX, dirY);
    ctx.stroke();

    // Border ring
    ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [chunks, playerPosition, playerRotation]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={140}
      className="dw-minimap"
    />
  );
}
