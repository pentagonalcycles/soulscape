import { BrushType } from "./types";

export interface BrushParams {
  color: string;
  brushSize: number;
  opacity: number;
  brushType: BrushType;
  brushHardness: number;
}

export const BRUSH_PRESETS: { type: BrushType; name: string; icon: string; description: string; category: string }[] = [
  { type: "pen", name: "Pen", icon: "✏️", description: "Clean, smooth lines", category: "basic" },
  { type: "pencil", name: "Pencil", icon: "✏", description: "Soft, textured strokes", category: "basic" },
  { type: "airbrush", name: "Airbrush", icon: "💨", description: "Soft spray effect", category: "basic" },
  { type: "calligraphy", name: "Calligraphy", icon: "🖊", description: "Variable width nib", category: "basic" },
  { type: "marker", name: "Marker", icon: "🖍", description: "Bold, semi-transparent", category: "basic" },
  { type: "eraser", name: "Eraser", icon: "🧹", description: "Remove strokes", category: "basic" },
  { type: "ink", name: "Ink Pen", icon: "🖋", description: "Sharp, wet ink lines", category: "basic" },
  { type: "charcoal", name: "Charcoal", icon: "🪨", description: "Rough, dusty texture", category: "basic" },
  { type: "neon", name: "Neon Glow", icon: "💡", description: "Glowing neon effect", category: "creative" },
  { type: "rainbow", name: "Rainbow", icon: "🌈", description: "Color-shifting strokes", category: "creative" },
  { type: "watercolor", name: "Watercolor", icon: "🎨", description: "Soft, flowing paint", category: "creative" },
  { type: "fire", name: "Fire", icon: "🔥", description: "Fiery particle trails", category: "creative" },
  { type: "sparkle", name: "Sparkle", icon: "✨", description: "Glittering particles", category: "creative" },
  { type: "galaxy", name: "Galaxy", icon: "🌌", description: "Swirling dust particles", category: "creative" },
  { type: "aurora", name: "Aurora", icon: "🌠", description: "Northern lights flow", category: "creative" },
  { type: "electric", name: "Electric", icon: "⚡", description: "Lightning bolts", category: "creative" },
  { type: "confetti", name: "Confetti", icon: "🎊", description: "Colorful paper bits", category: "creative" },
  { type: "halftone", name: "Halftone", icon: "⚬", description: "Dot pattern shading", category: "creative" },
  { type: "glitch", name: "Glitch", icon: "📡", description: "Digital distortion", category: "creative" },
  { type: "ribbon", name: "Ribbon", icon: "🎀", description: "Flowing fabric strip", category: "creative" },
  { type: "fur", name: "Fur", icon: "🦊", description: "Soft fur strands", category: "creative" },
  { type: "snow", name: "Snow", icon: "❄️", description: "Falling snowflakes", category: "nature" },
  { type: "vines", name: "Vines", icon: "🌿", description: "Growing plant tendrils", category: "nature" },
  { type: "smoke", name: "Smoke", icon: "🌫️", description: "Wispy smoke trails", category: "nature" },
  { type: "bubbles", name: "Bubbles", icon: "🫧", description: "Floating soap bubbles", category: "nature" },
  { type: "stars", name: "Starfield", icon: "⭐", description: "Twinkling star map", category: "nature" },
  { type: "spray", name: "Spray Paint", icon: "🎨", description: "Aerosol paint speckle", category: "nature" },
  { type: "mosaic", name: "Mosaic", icon: "🔮", description: "Tile pattern effect", category: "textured" },
  { type: "dna", name: "DNA Helix", icon: "🧬", description: "Double helix pattern", category: "textured" },
  { type: "chalk", name: "Chalk", icon: "🖍", description: "Soft chalk texture", category: "textured" },
  { type: "oil", name: "Oil Paint", icon: "🖌", description: "Thick, buttery strokes", category: "textured" },
  { type: "pixel", name: "Pixel", icon: "🟩", description: "Retro pixel art", category: "textured" },
];

export const COLOR_PALETTE = [
  ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff"],
  ["#0369a1", "#0ea5e9", "#38bdf8", "#00ff88", "#14b8a6", "#2dd4bf"],
  ["#065f46", "#059669", "#10b981", "#34d399", "#84cc16", "#a3e635"],
  ["#dc2626", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#fbbf24"],
  ["#7c3aed", "#8b5cf6", "#a855f7", "#ec4899", "#f472b6", "#fb7185"],
  ["#78350f", "#92400e", "#b45309", "#d97706", "#fcd34d", "#fef3c7"],
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lastX: number,
  lastY: number,
  params: BrushParams,
  seed: number = 0
): void {
  const { color, brushSize, opacity, brushType, brushHardness } = params;
  const rand = seed > 0 ? seededRandom(seed) : Math.random;

  ctx.save();
  ctx.globalAlpha = opacity;

  if (brushType === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
  }

  const dx = x - lastX;
  const dy = y - lastY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  switch (brushType) {
    case "pen":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (brushHardness < 100) {
        ctx.shadowColor = color;
        ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 1.5;
      }
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    case "pencil":
      for (let i = 0; i < 5; i++) {
        const offset = (rand() - 0.5) * brushSize * 0.5;
        const jitter = (rand() - 0.5) * brushSize * 0.15;
        ctx.globalAlpha = opacity * (0.15 + rand() * 0.4);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * (0.3 + rand() * 0.4);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastX + offset, lastY + jitter);
        ctx.lineTo(x + offset, y + jitter);
        ctx.stroke();
      }
      break;
    case "airbrush":
      for (let i = 0; i < Math.max(1, Math.floor(dist)); i++) {
        const t = i / Math.max(1, Math.floor(dist));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 2;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 2;
        ctx.globalAlpha = opacity * (0.02 + rand() * 0.05);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, rand() * brushSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "calligraphy":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * (0.5 + Math.abs(Math.sin(angle)) * 0.5);
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      break;
    case "marker":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 1.5;
      ctx.lineCap = "round";
      ctx.globalAlpha = opacity * 0.4;
      if (brushHardness < 100) {
        ctx.shadowColor = color;
        ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 2;
      }
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    case "eraser":
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = "round";
      if (brushHardness < 100) {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 2;
      }
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    case "neon":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = "round";
      ctx.globalAlpha = opacity * 0.1;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      ctx.lineWidth = brushSize * 2;
      ctx.globalAlpha = opacity * 0.3;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      ctx.lineWidth = brushSize * 0.5;
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      break;
    case "rainbow": {
      const hue = (Date.now() / 10) % 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = opacity * 0.3;
      ctx.strokeStyle = `hsl(${(hue + 60) % 360}, 100%, 70%)`;
      ctx.lineWidth = brushSize * 0.5;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      break;
    }
    case "watercolor":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 2));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        const bleed = brushSize * (0.6 + rand() * 1.2);
        ctx.globalAlpha = opacity * (0.01 + rand() * 0.04);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px + (rand() - 0.5) * brushSize * 0.6, py + (rand() - 0.5) * brushSize * 0.6, bleed, 0, Math.PI * 2);
        ctx.fill();
        if (rand() > 0.6) {
          ctx.globalAlpha = opacity * 0.008;
          ctx.beginPath();
          ctx.arc(px + (rand() - 0.5) * brushSize, py + (rand() - 0.5) * brushSize, bleed * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "fire":
      for (let i = 0; i < Math.max(1, Math.floor(dist)); i++) {
        const t = i / Math.max(1, Math.floor(dist));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize;
        const py = lastY + dy * t - rand() * brushSize * 2;
        ctx.globalAlpha = opacity * (0.1 + rand() * 0.2);
        ctx.fillStyle = `hsl(${rand() * 60}, 100%, ${50 + rand() * 30}%)`;
        ctx.beginPath();
        ctx.arc(px, py, rand() * brushSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "sparkle":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 3)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 3));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 3;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 3;
        const size = rand() * brushSize * 0.3;
        ctx.globalAlpha = opacity * (0.3 + rand() * 0.7);
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let j = 0; j < 8; j++) {
          const a = (j * Math.PI) / 4;
          const r = j % 2 === 0 ? size : size * 0.3;
          const sx = px + Math.cos(a) * r;
          const sy = py + Math.sin(a) * r;
          if (j === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;
    case "galaxy":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 2));
        const a2 = Date.now() / 200 + t * 5;
        const r = brushSize * (0.5 + rand());
        const px = lastX + dx * t + Math.cos(a2) * r;
        const py = lastY + dy * t + Math.sin(a2) * r;
        ctx.globalAlpha = opacity * (0.05 + rand() * 0.15);
        ctx.fillStyle = `hsl(${(Date.now() / 20 + i * 30) % 360}, 80%, ${60 + rand() * 30}%)`;
        ctx.beginPath();
        ctx.arc(px, py, rand() * brushSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "aurora":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 3)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 3));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        const wave = Math.sin(px * 0.01 + Date.now() * 0.001) * brushSize * 3;
        const h = (Date.now() / 20 + px * 0.5) % 360;
        ctx.globalAlpha = opacity * (0.05 + rand() * 0.1);
        ctx.fillStyle = `hsl(${h}, 80%, 60%)`;
        ctx.beginPath();
        ctx.ellipse(px, py + wave, brushSize * 2, brushSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "electric":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 5)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 5));
        const sx = lastX + dx * t;
        const sy = lastY + dy * t;
        const ex = lastX + dx * (t + 1 / Math.max(1, Math.floor(dist / 5)));
        const ey = lastY + dy * (t + 1 / Math.max(1, Math.floor(dist / 5)));
        const mx = (sx + ex) / 2 + (rand() - 0.5) * brushSize * 3;
        const my = (sy + ey) / 2 + (rand() - 0.5) * brushSize * 3;
        ctx.globalAlpha = opacity * 0.8;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = brushSize * 0.3;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = brushSize * 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = opacity * 0.2;
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = brushSize;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
      }
      break;
    case "confetti":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 4)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 4));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 3;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 3;
        const w = rand() * brushSize * 0.4 + 2;
        const h = rand() * brushSize * 0.2 + 1;
        ctx.globalAlpha = opacity * (0.5 + rand() * 0.5);
        ctx.fillStyle = `hsl(${rand() * 360}, 80%, 60%)`;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rand() * Math.PI);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
      break;
    case "snow":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 5)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 5));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 2;
        const py = lastY + dy * t + rand() * brushSize;
        const size = rand() * brushSize * 0.3 + 1;
        ctx.globalAlpha = opacity * (0.3 + rand() * 0.5);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(200, 220, 255, 0.6)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = (j * Math.PI) / 3;
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(a) * size, py + Math.sin(a) * size);
        }
        ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, size * 0.3, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "vines":
      ctx.globalAlpha = opacity * 0.6;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 0.5;
      ctx.beginPath(); ctx.moveTo(lastX, lastY);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * brushSize * 2, y + (rand() - 0.5) * brushSize, x, y);
      ctx.stroke();
      if (rand() > 0.7) {
        ctx.globalAlpha = opacity * 0.4;
        ctx.fillStyle = `hsl(${120 + rand() * 40}, 60%, ${40 + rand() * 30}%)`;
        ctx.beginPath();
        ctx.ellipse(x + (rand() - 0.5) * brushSize, y + (rand() - 0.5) * brushSize, brushSize * 0.4, brushSize * 0.2, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "smoke":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 4)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 4));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize;
        const py = lastY + dy * t - rand() * brushSize * 2;
        ctx.globalAlpha = opacity * (0.01 + rand() * 0.03);
        ctx.fillStyle = `rgba(${100 + rand() * 50}, ${100 + rand() * 50}, ${110 + rand() * 50}, 1)`;
        ctx.beginPath();
        ctx.arc(px, py, brushSize * (0.5 + rand() * 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "bubbles":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 6)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 6));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 2;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 2;
        const r = rand() * brushSize * 0.5 + 2;
        ctx.globalAlpha = opacity * (0.1 + rand() * 0.2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = opacity * 0.3;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case "stars":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 8)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 8));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 4;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 4;
        const size = rand() * brushSize * 0.3 + 1;
        ctx.globalAlpha = opacity * (0.5 + rand() * 0.5);
        ctx.fillStyle = `hsl(${40 + rand() * 40}, 100%, ${70 + rand() * 30}%)`;
        ctx.beginPath();
        for (let j = 0; j < 10; j++) {
          const a = (j * Math.PI) / 5 - Math.PI / 2;
          const r = j % 2 === 0 ? size : size * 0.4;
          const sx = px + Math.cos(a) * r;
          const sy = py + Math.sin(a) * r;
          if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;
    case "mosaic": {
      const tileSize = Math.max(4, brushSize);
      for (let i = 0; i < Math.max(1, Math.floor(dist / tileSize)); i++) {
        const t = i / Math.max(1, Math.floor(dist / tileSize));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        ctx.globalAlpha = opacity * (0.5 + rand() * 0.5);
        ctx.fillStyle = `hsl(${rand() * 360}, 60%, ${40 + rand() * 40}%)`;
        ctx.fillRect(Math.floor(px / tileSize) * tileSize, Math.floor(py / tileSize) * tileSize, tileSize - 1, tileSize - 1);
      }
      break;
    }
    case "dna":
      for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 2));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        const wave = Math.sin(py * 0.05 + Date.now() * 0.002) * brushSize * 2;
        ctx.globalAlpha = opacity * 0.6;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(px + wave, py, brushSize * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsl(${(Date.now() / 10) % 360}, 70%, 50%)`;
        ctx.beginPath(); ctx.arc(px - wave, py, brushSize * 0.3, 0, Math.PI * 2); ctx.fill();
        if (i % 3 === 0) {
          ctx.globalAlpha = opacity * 0.2;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px + wave, py); ctx.lineTo(px - wave, py); ctx.stroke();
        }
      }
      break;
    case "chalk":
      for (let i = 0; i < Math.max(1, Math.floor(dist * 1.5)); i++) {
        const t = i / Math.max(1, Math.floor(dist * 1.5));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        for (let j = 0; j < 4; j++) {
          const angle2 = rand() * Math.PI * 2;
          const r = rand() * brushSize * 0.6;
          ctx.globalAlpha = opacity * (0.08 + rand() * 0.18);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px + Math.cos(angle2) * r, py + Math.sin(angle2) * r, rand() * brushSize * 0.35 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "oil":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 1.8;
      ctx.lineCap = "round";
      ctx.globalAlpha = opacity * 0.7;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
        const t = i / Math.max(1, Math.floor(dist / 2));
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);
        const offset = (rand() - 0.5) * brushSize * 0.8;
        ctx.globalAlpha = opacity * (0.15 + rand() * 0.15);
        ctx.fillStyle = rand() > 0.7 ? "#ffffff" : color;
        ctx.beginPath();
        ctx.ellipse(
          lastX + dx * t + perpX * offset, lastY + dy * t + perpY * offset,
          brushSize * (0.2 + rand() * 0.3), brushSize * (0.05 + rand() * 0.1),
          Math.atan2(dy, dx) + (rand() - 0.5) * 0.5, 0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
    case "ink":
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * (0.6 + Math.abs(Math.sin(angle)) * 0.8);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = opacity * 0.9;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
      if (rand() > 0.85) {
        const splatX = x + (rand() - 0.5) * brushSize * 2;
        const splatY = y + (rand() - 0.5) * brushSize * 2;
        ctx.globalAlpha = opacity * (0.1 + rand() * 0.2);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(splatX, splatY, rand() * brushSize * 0.4 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "charcoal":
      for (let i = 0; i < Math.max(1, Math.floor(dist * 2)); i++) {
        const t = i / Math.max(1, Math.floor(dist * 2));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        for (let j = 0; j < 3; j++) {
          const a = rand() * Math.PI * 2;
          const r = rand() * brushSize * 0.7;
          const grain = rand() * brushSize * 0.15 + 0.5;
          ctx.globalAlpha = opacity * (0.06 + rand() * 0.14);
          ctx.fillStyle = rand() > 0.3 ? color : "#000000";
          ctx.beginPath();
          ctx.arc(px + Math.cos(a) * r, py + Math.sin(a) * r, grain, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "halftone": {
      const dotSpacing = Math.max(4, brushSize * 0.5);
      for (let sx2 = -brushSize; sx2 <= brushSize; sx2 += dotSpacing) {
        for (let sy2 = -brushSize; sy2 <= brushSize; sy2 += dotSpacing) {
          const px2 = x + sx2;
          const py2 = y + sy2;
          const d = Math.sqrt(sx2 * sx2 + sy2 * sy2);
          if (d > brushSize) continue;
          const dotR = (1 - d / brushSize) * dotSpacing * 0.4;
          if (dotR < 0.5) continue;
          ctx.globalAlpha = opacity * 0.8;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px2, py2, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "spray":
      for (let i = 0; i < Math.max(1, Math.floor(dist * 1.2)); i++) {
        const t = i / Math.max(1, Math.floor(dist * 1.2));
        const px = lastX + dx * t + (rand() - 0.5) * brushSize * 3;
        const py = lastY + dy * t + (rand() - 0.5) * brushSize * 3;
        const d2 = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
        const fade = Math.max(0, 1 - d2 / (brushSize * 1.5));
        ctx.globalAlpha = opacity * fade * 0.6;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, rand() * 1.5 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "glitch": {
      const sliceH = Math.max(2, brushSize * 0.3);
      for (let i = 0; i < Math.max(1, Math.floor(dist / sliceH)); i++) {
        const t = i / Math.max(1, Math.floor(dist / sliceH));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        const shiftX = (rand() - 0.5) * brushSize * 4;
        ctx.globalAlpha = opacity * (0.3 + rand() * 0.5);
        ctx.fillStyle = rand() > 0.5 ? color : `hsl(${rand() * 360}, 100%, 50%)`;
        ctx.fillRect(px + shiftX, py - sliceH / 2, brushSize * (0.5 + rand()), sliceH);
      }
      break;
    }
    case "ribbon": {
      const ribbonWidth = brushSize * 0.8;
      const perpX2 = -dy / (dist || 1);
      const perpY2 = dx / (dist || 1);
      const wave = Math.sin(Date.now() * 0.005) * ribbonWidth * 0.5;
      ctx.globalAlpha = opacity * 0.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(lastX + perpX2 * ribbonWidth, lastY + perpY2 * ribbonWidth);
      ctx.lineTo(x + perpX2 * ribbonWidth + wave, y + perpY2 * ribbonWidth + wave);
      ctx.lineTo(x - perpX2 * ribbonWidth - wave, y - perpY2 * ribbonWidth - wave);
      ctx.lineTo(lastX - perpX2 * ribbonWidth, lastY - perpY2 * ribbonWidth);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = opacity * 0.15;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lastX + perpX2 * ribbonWidth * 0.5, lastY + perpY2 * ribbonWidth * 0.5);
      ctx.lineTo(x + perpX2 * ribbonWidth * 0.5 + wave * 0.5, y + perpY2 * ribbonWidth * 0.5 + wave * 0.5);
      ctx.stroke();
      break;
    }
    case "fur":
      for (let i = 0; i < Math.max(1, Math.floor(dist * 1.5)); i++) {
        const t = i / Math.max(1, Math.floor(dist * 1.5));
        const px = lastX + dx * t;
        const py = lastY + dy * t;
        const strandAngle = angle + (rand() - 0.5) * 1.2;
        const strandLen = brushSize * (0.4 + rand() * 0.8);
        ctx.globalAlpha = opacity * (0.2 + rand() * 0.4);
        ctx.strokeStyle = color;
        ctx.lineWidth = rand() * 1.5 + 0.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(strandAngle) * strandLen, py + Math.sin(strandAngle) * strandLen);
        ctx.stroke();
      }
      break;
    case "pixel": {
      const pixSize = Math.max(3, Math.floor(brushSize * 0.4));
      const gridX = Math.floor(x / pixSize) * pixSize;
      const gridY = Math.floor(y / pixSize) * pixSize;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.fillRect(gridX, gridY, pixSize, pixSize);
      const steps = Math.max(1, Math.floor(dist / pixSize));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const sx3 = Math.floor((lastX + dx * t) / pixSize) * pixSize;
        const sy3 = Math.floor((lastY + dy * t) / pixSize) * pixSize;
        ctx.fillRect(sx3, sy3, pixSize, pixSize);
      }
      break;
    }
  }
  ctx.restore();
}
