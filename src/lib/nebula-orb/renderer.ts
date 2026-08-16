import {
  GameState,
  FoodParticle,
  PowerUp,
  GravityWell,
  Wormhole,
  CosmicRift,
  Storm,
  Orb,
  GameCamera,
  DeathParticle,
  CollectParticle,
  TrailDot,
  Singularity,
  PetStyle,
  BodyPattern,
  TrailStyle,
} from "./types";
import { getOrbRadius, hasPowerUp } from "./orb";
import { POWERUP_COLORS } from "./constants";

const STAR_COUNT = 300;

export function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameState,
  camera: GameCamera,
  siteBg?: string | null,
  options?: { lowPower?: boolean }
) {
  const lowPower = options?.lowPower ?? false;
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.save();
  ctx.translate(w / 2, h / 2);

  if (camera.shake > 0.5) {
    const shakeX = (Math.random() - 0.5) * camera.shake;
    const shakeY = (Math.random() - 0.5) * camera.shake;
    ctx.translate(shakeX, shakeY);
  }

  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  initStarCaches(state.mapWidth, state.mapHeight, lowPower);

  drawBackground(ctx, state, siteBg, lowPower);
  drawCosmicDustClouds(ctx, state);
  drawCosmicAurora(ctx, state);
  drawShootingStars(ctx, state, lowPower);
  drawPulsarBeams(ctx, state);
  drawScanLines(ctx, state);

  for (const well of state.gravityWells) drawGravityWell(ctx, well);
  for (const wh of state.wormholes) drawWormhole(ctx, wh);
  for (const rift of state.cosmicRifts) drawCosmicRift(ctx, rift);
  for (const storm of state.storms) drawStorm(ctx, storm);
  drawSingularity(ctx, state.singularity);
  for (const food of state.food) drawFood(ctx, food, lowPower);
  for (const pu of state.powerUps) drawPowerUp(ctx, pu);

  const sortedOrbs = Array.from(state.orbs.values())
    .filter((o) => o.alive)
    .sort((a, b) => a.radius - b.radius);

  for (const orb of sortedOrbs) {
    drawOrbTrail(ctx, orb);
    drawOrb(ctx, orb, state.gameTime);
    if (orb.massPulseActive) drawMassPulse(ctx, orb);
    if (orb.customization.petStyle && orb.customization.petStyle !== "none") {
      drawPetCompanion(ctx, orb, state.gameTime);
    }
  }

  for (const p of state.collectParticles) drawCollectParticle(ctx, p);
  for (const p of state.particles) drawDeathParticle(ctx, p);

  drawConstellationConnections(ctx, state);
  drawEnergyBeams(ctx, state);
  drawBoundary(ctx, state);

  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, state: GameState, siteBg?: string | null, lowPower = false) {
  const t = state.gameTime * 0.0001;

  // If siteBg is set, use it as the background
  if (siteBg) {
    ctx.fillStyle = siteBg;
    ctx.fillRect(0, 0, state.mapWidth, state.mapHeight);
  } else {
    // Default dark space background
    const bg = ctx.createRadialGradient(state.mapWidth / 2, state.mapHeight / 2, 0, state.mapWidth / 2, state.mapHeight / 2, state.mapWidth * 0.7);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(0.3, "#060612");
    bg.addColorStop(0.6, "#04040e");
    bg.addColorStop(1, "#020208");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, state.mapWidth, state.mapHeight);
  }

  // Far stars (tiny, dim)
  for (const star of starCacheFar) {
    const twinkle = 0.5 + 0.3 * Math.sin(t * 8 + star.x * 0.005 + star.y * 0.003);
    ctx.globalAlpha = star.brightness * twinkle * 0.4;
    ctx.fillStyle = "#8899cc";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mid stars (medium, with colors)
  for (const star of starCacheMid) {
    const twinkle = 0.6 + 0.4 * Math.sin(t * 5 + star.x * 0.008 + star.y * 0.006);
    ctx.globalAlpha = star.brightness * twinkle * 0.6;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Near stars (bright, with glow)
  for (const star of starCacheNear) {
    const twinkle = 0.6 + 0.4 * Math.sin(t * 3 + star.x * 0.01 + star.y * 0.008);
    ctx.globalAlpha = star.brightness * twinkle * 0.7;

    if (!lowPower) {
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 5);
      glow.addColorStop(0, `${star.color}44`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = star.color;
    ctx.globalAlpha = star.brightness * twinkle * 0.8;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Nebula clouds
  drawNebulaClouds(ctx, state);

  // Dust lanes
  drawDustLanes(ctx, state);

  // Galaxy spiral arm hints
  drawGalaxyArms(ctx, state);

  // Perspective grid (subtle)
  drawPerspectiveGrid(ctx, state);
}

const starCacheFar: { x: number; y: number; size: number; brightness: number }[] = [];
const starCacheMid: { x: number; y: number; size: number; brightness: number; color: string }[] = [];
const starCacheNear: { x: number; y: number; size: number; brightness: number; color: string }[] = [];
let starCacheMode: "full" | "low" | null = null;

function initStarCaches(mapWidth: number, mapHeight: number, lowPower: boolean) {
  const mode: "full" | "low" = lowPower ? "low" : "full";
  if (starCacheMode === mode) return;
  starCacheMode = mode;

  starCacheFar.length = 0;
  starCacheMid.length = 0;
  starCacheNear.length = 0;

  const starColors = [
    "#ffffff", "#aaccff", "#ffddaa", "#ccddff", "#ffccaa",
    "#88bbff", "#ffbbcc", "#bbccff", "#aaffcc", "#ffaaaa",
    "#ff8888", "#88aaff", "#ffaa88", "#aa88ff", "#88ffaa",
    "#66aaff", "#ff88aa", "#88aaff", "#aaffaa", "#ffccff",
  ];

  const farCount = lowPower ? 300 : 600;
  const midCount = lowPower ? 150 : 300;
  const nearCount = lowPower ? 60 : 120;

  // Far stars - tiny, dim, numerous
  for (let i = 0; i < farCount; i++) {
    starCacheFar.push({
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      size: Math.random() * 0.8 + 0.2,
      brightness: 0.2 + Math.random() * 0.4,
    });
  }

  // Mid stars - medium brightness with colors
  for (let i = 0; i < midCount; i++) {
    starCacheMid.push({
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      size: Math.random() * 1.5 + 0.5,
      brightness: 0.4 + Math.random() * 0.5,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    });
  }

  // Near stars - bright with glow
  for (let i = 0; i < nearCount; i++) {
    starCacheNear.push({
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      size: Math.random() * 2 + 1,
      brightness: 0.6 + Math.random() * 0.4,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    });
  }
}

function drawNebulaClouds(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = state.gameTime * 0.00005;

  const nebulae = [
    { x: state.mapWidth * 0.15, y: state.mapHeight * 0.2, r: 900, c1: "rgba(100, 50, 200, 0.12)", c2: "rgba(80, 40, 180, 0.06)" },
    { x: state.mapWidth * 0.75, y: state.mapHeight * 0.25, r: 1000, c1: "rgba(50, 150, 220, 0.12)", c2: "rgba(40, 120, 200, 0.06)" },
    { x: state.mapWidth * 0.45, y: state.mapHeight * 0.65, r: 800, c1: "rgba(200, 80, 180, 0.1)", c2: "rgba(180, 60, 160, 0.05)" },
    { x: state.mapWidth * 0.85, y: state.mapHeight * 0.8, r: 750, c1: "rgba(40, 200, 180, 0.1)", c2: "rgba(30, 180, 160, 0.05)" },
    { x: state.mapWidth * 0.55, y: state.mapHeight * 0.1, r: 650, c1: "rgba(255, 150, 50, 0.08)", c2: "rgba(255, 120, 30, 0.04)" },
    { x: state.mapWidth * 0.1, y: state.mapHeight * 0.55, r: 850, c1: "rgba(80, 220, 255, 0.08)", c2: "rgba(60, 200, 230, 0.04)" },
    { x: state.mapWidth * 0.6, y: state.mapHeight * 0.45, r: 700, c1: "rgba(180, 100, 255, 0.08)", c2: "rgba(160, 80, 230, 0.04)" },
    { x: state.mapWidth * 0.3, y: state.mapHeight * 0.85, r: 600, c1: "rgba(255, 200, 50, 0.06)", c2: "rgba(255, 180, 30, 0.03)" },
  ];

  for (const n of nebulae) {
    const ox = Math.sin(t + n.x * 0.0001) * 50;
    const oy = Math.cos(t + n.y * 0.0001) * 40;

    // Organic multi-layer cloud with more layers
    for (let i = 0; i < 7; i++) {
      const rx = n.r * (0.5 + i * 0.12);
      const ry = n.r * (0.35 + i * 0.1);
      const angle = t * 0.2 + i * 0.4;
      const cx = n.x + ox + Math.sin(angle) * 60;
      const cy = n.y + oy + Math.cos(angle) * 50;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.08);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0, n.c1);
      grad.addColorStop(0.4, n.c2);
      grad.addColorStop(0.7, n.c2.replace(/[\d.]+\)$/, `${parseFloat(n.c2.match(/[\d.]+\)$/)?.[0] || "0") * 0.5})`));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}

function drawDustLanes(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = state.gameTime * 0.00003;

  ctx.save();

  for (let i = 0; i < 12; i++) {
    const startX = Math.sin(t + i * 1.2) * state.mapWidth * 0.3 + state.mapWidth * 0.5;
    const startY = Math.cos(t * 0.7 + i * 0.9) * state.mapHeight * 0.3 + state.mapHeight * 0.5;
    const endX = startX + Math.cos(i * 2.1) * 1200;
    const endY = startY + Math.sin(i * 1.7) * 1000;

    const colors = [
      "rgba(80,40,120,0.6)", "rgba(40,20,80,0.5)", "rgba(30,60,100,0.5)",
      "rgba(100,40,140,0.4)", "rgba(20,50,90,0.5)",
    ];
    const color = colors[i % colors.length];

    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.2, color);
    grad.addColorStop(0.5, color.replace(/[\d.]+\)$/, "0.8)"));
    grad.addColorStop(0.8, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 30 + Math.sin(i * 3) * 15;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      (startX + endX) / 2 + Math.sin(t + i) * 150,
      (startY + endY) / 2 + Math.cos(t + i) * 120,
      endX,
      endY
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawGalaxyArms(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = state.gameTime * 0.00002;
  const centerX = state.mapWidth * 0.5;
  const centerY = state.mapHeight * 0.5;

  ctx.save();

  // Galaxy arms with more vibrant colors
  const armColors = [
    { start: "rgba(140, 60, 255, 0.5)", mid: "rgba(100, 180, 255, 0.35)", end: "rgba(0, 220, 200, 0.15)" },
    { start: "rgba(255, 100, 200, 0.45)", mid: "rgba(255, 180, 100, 0.3)", end: "rgba(255, 220, 120, 0.1)" },
    { start: "rgba(80, 200, 255, 0.4)", mid: "rgba(180, 120, 255, 0.25)", end: "rgba(220, 80, 170, 0.1)" },
  ];

  for (let arm = 0; arm < 3; arm++) {
    const armOffset = (arm * Math.PI * 2) / 3;
    const points = 80;
    const colors = armColors[arm];

    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const pct = i / points;
      const angle = armOffset + pct * Math.PI * 3.5 + t;
      const dist = pct * state.mapWidth * 0.45;
      const wobble = Math.sin(pct * 10 + t * 2) * 50;
      const x = centerX + Math.cos(angle) * (dist + wobble);
      const y = centerY + Math.sin(angle) * (dist * 0.55 + wobble * 0.55);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const armGrad = ctx.createLinearGradient(centerX, centerY, centerX + state.mapWidth * 0.35, centerY);
    armGrad.addColorStop(0, colors.start);
    armGrad.addColorStop(0.5, colors.mid);
    armGrad.addColorStop(1, colors.end);
    ctx.strokeStyle = armGrad;
    ctx.lineWidth = 60;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.06;
    ctx.stroke();
  }

  // Galactic core glow - more dramatic
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 350);
  coreGrad.addColorStop(0, "rgba(255, 230, 200, 0.25)");
  coreGrad.addColorStop(0.15, "rgba(220, 180, 255, 0.15)");
  coreGrad.addColorStop(0.4, "rgba(180, 120, 230, 0.08)");
  coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = coreGrad;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 350, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPerspectiveGrid(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = state.gameTime * 0.0002;

  ctx.save();

  // Radial fade grid
  const gridSize = 200;
  const centerX = state.mapWidth / 2;
  const centerY = state.mapHeight / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  ctx.lineWidth = 0.3;

  for (let x = 0; x <= state.mapWidth; x += gridSize) {
    const dist = Math.abs(x - centerX) / maxDist;
    const alpha = Math.max(0, 0.03 - dist * 0.02);
    ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.mapHeight);
    ctx.stroke();
  }

  for (let y = 0; y <= state.mapHeight; y += gridSize) {
    const dist = Math.abs(y - centerY) / maxDist;
    const alpha = Math.max(0, 0.03 - dist * 0.02);
    ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.mapWidth, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawScanLines(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = (state.gameTime * 0.05) % 200;
  ctx.globalAlpha = 0.02;
  for (let y = t; y < state.mapHeight; y += 200) {
    ctx.fillStyle = "#4488ff";
    ctx.fillRect(0, y, state.mapWidth, 1);
  }
  ctx.globalAlpha = 1;
}

// ═══ NEW VISUAL EFFECTS ═══

// Cosmic Aurora - flowing ribbons of color in the background
const auroraCache: { x: number; y: number; width: number; color: string; speed: number; phase: number }[] = [];
let auroraInitialized = false;

function drawCosmicAurora(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!auroraInitialized) {
    auroraInitialized = true;
    const colors = [
      "rgba(100, 255, 180, 0.8)",
      "rgba(80, 200, 255, 0.7)",
      "rgba(180, 120, 255, 0.6)",
      "rgba(255, 120, 220, 0.6)",
      "rgba(120, 255, 240, 0.7)",
    ];
    for (let i = 0; i < 5; i++) {
      auroraCache.push({
        x: Math.random() * state.mapWidth,
        y: Math.random() * state.mapHeight * 0.6 + state.mapHeight * 0.1,
        width: 350 + Math.random() * 450,
        color: colors[i % colors.length],
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const t = state.gameTime * 0.0001;

  ctx.save();
  for (const aurora of auroraCache) {
    const wave = Math.sin(t * aurora.speed + aurora.phase) * 70;
    const yWave = Math.cos(t * aurora.speed * 0.7 + aurora.phase) * 35;

    ctx.globalAlpha = 0.2 + Math.sin(t * 2 + aurora.phase) * 0.1;
    ctx.strokeStyle = aurora.color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();

    const startX = aurora.x - aurora.width / 2;
    const startY = aurora.y + wave;

    ctx.moveTo(startX, startY);
    for (let i = 0; i <= 30; i++) {
      const pct = i / 30;
      const x = startX + pct * aurora.width;
      const y = startY + Math.sin(pct * Math.PI * 3 + t * 3 + aurora.phase) * (25 + yWave * 0.5);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Shooting stars that streak across the sky
const shootingStarCache: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; length: number; color: string }[] = [];
let lastShootingStarTime = -10000;

function drawShootingStars(ctx: CanvasRenderingContext2D, state: GameState, lowPower = false) {
  const t = state.gameTime;

  // Spawn new shooting stars occasionally
  const spawnInterval = (lowPower ? 14000 : 4000) + Math.random() * (lowPower ? 18000 : 6000);
  if (t - lastShootingStarTime > spawnInterval) {
    lastShootingStarTime = t;
    const startX = Math.random() * state.mapWidth;
    const startY = Math.random() * state.mapHeight * 0.3;
    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2;
    const speed = 5 + Math.random() * 8;
    const colors = ["#ffffff", "#ccddff", "#ffeedd", "#aaddff"];

    shootingStarCache.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + Math.random() * 30,
      maxLife: 40 + Math.random() * 30,
      length: 40 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  // Update and draw
  for (let i = shootingStarCache.length - 1; i >= 0; i--) {
    const star = shootingStarCache[i];
    star.x += star.vx;
    star.y += star.vy;
    star.life--;

    if (star.life <= 0 || star.x > state.mapWidth + 200 || star.y > state.mapHeight + 200) {
      shootingStarCache.splice(i, 1);
      continue;
    }

    const alpha = Math.min(1, star.life / (star.maxLife * 0.3));
    const headX = star.x;
    const headY = star.y;
    const tailX = star.x - star.vx * 3;
    const tailY = star.y - star.vy * 3;

    // Trail gradient
    const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.5, `${star.color}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.95})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(headX, headY);
    ctx.stroke();

    // Head glow
    const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 10);
    glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
    glow.addColorStop(0.5, `${star.color}${Math.round(alpha * 150).toString(16).padStart(2, "0")}`);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(headX, headY, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Cosmic Dust Clouds - floating translucent nebula wisps
const dustCloudCache: { x: number; y: number; radius: number; color: string; speed: number; phase: number }[] = [];
let dustCloudsInitialized = false;

function drawCosmicDustClouds(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!dustCloudsInitialized) {
    dustCloudsInitialized = true;
    const colors = [
      "rgba(80, 40, 160, 0.08)",
      "rgba(40, 100, 200, 0.07)",
      "rgba(200, 80, 180, 0.06)",
      "rgba(60, 180, 160, 0.07)",
      "rgba(200, 150, 50, 0.05)",
    ];
    for (let i = 0; i < 12; i++) {
      dustCloudCache.push({
        x: Math.random() * state.mapWidth,
        y: Math.random() * state.mapHeight,
        radius: 250 + Math.random() * 450,
        color: colors[i % colors.length],
        speed: 0.1 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const t = state.gameTime * 0.00005;

  ctx.save();
  for (const cloud of dustCloudCache) {
    const ox = Math.sin(t * cloud.speed + cloud.phase) * 60;
    const oy = Math.cos(t * cloud.speed * 0.7 + cloud.phase) * 40;
    const cx = cloud.x + ox;
    const cy = cloud.y + oy;
    const pulse = 1 + Math.sin(t * 2 + cloud.phase) * 0.1;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloud.radius * pulse);
    grad.addColorStop(0, cloud.color);
    grad.addColorStop(0.5, cloud.color.replace(/[\d.]+\)$/, "0.03)"));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, cloud.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Pulsar Beams - rotating beams of light from fixed points
const pulsarCache: { x: number; y: number; beamLength: number; rotationSpeed: number; color: string; phase: number }[] = [];
let pulsarsInitialized = false;

function drawPulsarBeams(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!pulsarsInitialized) {
    pulsarsInitialized = true;
    const colors = [
      "rgba(100, 200, 255, 0.15)",
      "rgba(200, 100, 255, 0.12)",
      "rgba(255, 200, 100, 0.1)",
    ];
    for (let i = 0; i < 4; i++) {
      pulsarCache.push({
        x: Math.random() * state.mapWidth,
        y: Math.random() * state.mapHeight,
        beamLength: 400 + Math.random() * 600,
        rotationSpeed: 0.3 + Math.random() * 0.5,
        color: colors[i % colors.length],
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const t = state.gameTime * 0.001;

  ctx.save();
  for (const pulsar of pulsarCache) {
    const rotation = t * pulsar.rotationSpeed + pulsar.phase;
    const pulse = 0.7 + Math.sin(t * 3 + pulsar.phase) * 0.3;

    // Core glow
    const coreGlow = ctx.createRadialGradient(pulsar.x, pulsar.y, 0, pulsar.x, pulsar.y, 20);
    coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.3 * pulse})`);
    coreGlow.addColorStop(0.5, pulsar.color);
    coreGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(pulsar.x, pulsar.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Rotating beams (2 opposite beams)
    for (let beam = 0; beam < 2; beam++) {
      const angle = rotation + beam * Math.PI;
      const beamWidth = 0.05; // radians

      ctx.save();
      ctx.translate(pulsar.x, pulsar.y);
      ctx.rotate(angle);

      const beamGrad = ctx.createLinearGradient(0, 0, pulsar.beamLength, 0);
      beamGrad.addColorStop(0, pulsar.color);
      beamGrad.addColorStop(0.7, pulsar.color.replace(/[\d.]+\)$/, "0.05)"));
      beamGrad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(pulsar.beamLength, -pulsar.beamLength * beamWidth);
      ctx.lineTo(pulsar.beamLength, pulsar.beamLength * beamWidth);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
  ctx.restore();
}

// Constellation connections between nearby orbs
function drawConstellationConnections(ctx: CanvasRenderingContext2D, state: GameState) {
  const orbs = Array.from(state.orbs.values()).filter((o) => o.alive);
  const t = state.gameTime * 0.001;
  const maxDist = 500;

  ctx.save();
  ctx.lineWidth = 1.5;

  for (let i = 0; i < orbs.length; i++) {
    for (let j = i + 1; j < orbs.length; j++) {
      const a = orbs[i];
      const b = orbs[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.5;
        const pulse = 0.8 + Math.sin(t * 2 + i + j) * 0.2;

        // Connection line
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha * pulse})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Node dots along the connection
        const nodeCount = Math.floor(dist / 80);
        for (let n = 1; n <= nodeCount; n++) {
          const pct = n / (nodeCount + 1);
          const nodeX = a.x + dx * pct;
          const nodeY = a.y + dy * pct;
          ctx.fillStyle = `rgba(100, 180, 255, ${alpha * 1.2})`;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  ctx.restore();
}

function drawEnergyBeams(ctx: CanvasRenderingContext2D, state: GameState) {
  const t = state.gameTime * 0.001;
  const orbs = Array.from(state.orbs.values()).filter((o) => o.alive);

  // Boost beams between nearby orbs
  for (let i = 0; i < orbs.length; i++) {
    for (let j = i + 1; j < orbs.length; j++) {
      const a = orbs[i];
      const b = orbs[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 400 && (a.isBoosting || b.isBoosting)) {
        const alpha = (1 - dist / 400) * 0.25;

        // Animated dashed beam
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.lineDashOffset = -t * 20;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      }
    }
  }

  // Energy streams between gravity wells
  const wells = state.gravityWells;
  for (let i = 0; i < wells.length; i++) {
    for (let j = i + 1; j < wells.length; j++) {
      const w1 = wells[i];
      const w2 = wells[j];
      const dx = w2.x - w1.x;
      const dy = w2.y - w1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1200) {
        const alpha = (1 - dist / 1200) * 0.1;
        const wave = Math.sin(t * 2 + i + j) * 25;

        ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w1.x, w1.y);
        ctx.quadraticCurveTo(
          (w1.x + w2.x) / 2 + wave,
          (w1.y + w2.y) / 2 + wave * 0.5,
          w2.x,
          w2.y
        );
        ctx.stroke();
      }
    }
  }

  // Energy streams to singularity from nearby orbs
  const sig = state.singularity;
  for (const orb of orbs) {
    const dx = sig.x - orb.x;
    const dy = sig.y - orb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 600) {
      const alpha = (1 - dist / 600) * 0.08;
      ctx.strokeStyle = `rgba(180, 100, 255, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.moveTo(orb.x, orb.y);
      ctx.lineTo(sig.x, sig.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function drawGravityWell(ctx: CanvasRenderingContext2D, well: GravityWell) {
  const pulse = 1 + 0.08 * Math.sin(well.pulsePhase);
  const t = well.pulsePhase;

  // Outer energy field with multiple layers
  for (let i = 6; i >= 0; i--) {
    const r = well.radius * (1 + i * 0.35) * pulse;
    const grad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, r);
    const alpha = 0.25 - i * 0.03;
    grad.addColorStop(0, `rgba(100, 180, 255, ${alpha})`);
    grad.addColorStop(0.3, `rgba(120, 60, 255, ${alpha * 0.7})`);
    grad.addColorStop(0.6, `rgba(80, 40, 200, ${alpha * 0.3})`);
    grad.addColorStop(1, "rgba(60, 30, 180, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(well.x, well.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(well.x, well.y);
  ctx.rotate(well.rotation);

  // Orbital rings
  for (let ring = 0; ring < 3; ring++) {
    const ringR = well.radius * (0.5 + ring * 0.2);
    const ringAlpha = 0.35 - ring * 0.08;

    ctx.strokeStyle = ring % 2 === 0
      ? `rgba(100, 180, 255, ${ringAlpha})`
      : `rgba(180, 100, 255, ${ringAlpha * 0.8})`;
    ctx.lineWidth = 1.2 - ring * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Spiral arms
  for (let arm = 0; arm < 3; arm++) {
    const armOffset = (arm * Math.PI * 2) / 3;
    ctx.strokeStyle = `rgba(100, 180, 255, ${0.18 + Math.sin(t * 2 + arm) * 0.06})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();

    for (let a = 0; a < Math.PI * 3; a += 0.1) {
      const r = (a / (Math.PI * 3)) * well.radius * 0.8;
      const x = Math.cos(a + armOffset + t * 0.5) * r;
      const y = Math.sin(a + armOffset + t * 0.5) * r;

      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Radial energy lines
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + t * 0.3;
    const lineAlpha = 0.18 + 0.1 * Math.sin(t * 3 + i);
    ctx.strokeStyle = `rgba(100, 180, 255, ${lineAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
    ctx.lineTo(Math.cos(angle) * well.radius * 0.85, Math.sin(angle) * well.radius * 0.85);
    ctx.stroke();
  }

  // Orbiting particles
  for (let i = 0; i < 6; i++) {
    const particleAngle = (Math.PI * 2 * i) / 6 + t * 2;
    const dist = well.radius * (0.3 + Math.sin(t * 3 + i * 1.5) * 0.15);
    const px = Math.cos(particleAngle) * dist;
    const py = Math.sin(particleAngle) * dist;
    const particleAlpha = 0.6 + Math.sin(t * 4 + i) * 0.3;

    ctx.fillStyle = `rgba(150, 220, 255, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    // Particle glow
    const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 8);
    particleGlow.addColorStop(0, `rgba(150, 220, 255, ${particleAlpha * 0.4})`);
    particleGlow.addColorStop(1, "rgba(150, 220, 255, 0)");
    ctx.fillStyle = particleGlow;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, well.radius * 0.2);
  coreGrad.addColorStop(0, `rgba(220, 240, 255, ${0.7 * pulse})`);
  coreGrad.addColorStop(0.5, `rgba(120, 200, 255, ${0.4 * pulse})`);
  coreGrad.addColorStop(1, "rgba(60, 150, 255, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, well.radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWormhole(ctx: CanvasRenderingContext2D, wh: Wormhole) {
  const alpha = wh.active ? 0.85 : 0.35;
  const t = wh.rotation;

  // Outer energy field
  for (let i = 6; i >= 0; i--) {
    const r = wh.radius * (1 + i * 0.4);
    const grad = ctx.createRadialGradient(wh.x, wh.y, 0, wh.x, wh.y, r);
    grad.addColorStop(0, `rgba(120, 220, 255, ${alpha * 0.45})`);
    grad.addColorStop(0.2, `rgba(100, 50, 255, ${alpha * 0.3})`);
    grad.addColorStop(0.5, `rgba(180, 100, 255, ${alpha * 0.15})`);
    grad.addColorStop(1, "rgba(120, 80, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(wh.x, wh.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(wh.x, wh.y);

  // Swirling energy rings
  for (let ring = 0; ring < 4; ring++) {
    const ringR = wh.radius * (0.4 + ring * 0.2);
    const ringAlpha = alpha * (0.65 - ring * 0.1);

    ctx.save();
    ctx.rotate(t * (2 + ring * 0.5));

    ctx.strokeStyle = ring % 2 === 0
      ? `rgba(120, 220, 255, ${ringAlpha})`
      : `rgba(220, 120, 255, ${ringAlpha * 0.8})`;
    ctx.lineWidth = 1.5 - ring * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  // Portal vortex - spiral inward
  ctx.rotate(t * 3);
  for (let i = 0; i < 3; i++) {
    const spiralAlpha = alpha * 0.35;
    ctx.strokeStyle = `rgba(150, 240, 255, ${spiralAlpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();

    for (let a = 0; a < Math.PI * 4; a += 0.1) {
      const r = (a / (Math.PI * 4)) * wh.radius * 0.8;
      const x = Math.cos(a + i * 2.1) * r;
      const y = Math.sin(a + i * 2.1) * r;

      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Central void
  const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, wh.radius * 0.35);
  voidGrad.addColorStop(0, `rgba(0, 0, 30, ${alpha})`);
  voidGrad.addColorStop(0.5, `rgba(20, 0, 80, ${alpha * 0.5})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.arc(0, 0, wh.radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Bright edge ring
  ctx.strokeStyle = `rgba(120, 220, 255, ${alpha * 0.9})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, wh.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = `rgba(220, 120, 255, ${alpha * 0.6})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, wh.radius * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // Energy nodes orbiting
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 + t * 2;
    const dist = wh.radius * (0.3 + Math.sin(t * 3 + i) * 0.15);
    const nx = Math.cos(a) * dist;
    const ny = Math.sin(a) * dist;
    const nodeAlpha = alpha * (0.45 + Math.sin(t * 4 + i * 1.5) * 0.25);

    ctx.fillStyle = `rgba(120, 220, 255, ${nodeAlpha})`;
    ctx.beginPath();
    ctx.arc(nx, ny, 2, 0, Math.PI * 2);
    ctx.fill();

    // Node glow
    const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 6);
    nodeGlow.addColorStop(0, `rgba(120, 220, 255, ${nodeAlpha * 0.5})`);
    nodeGlow.addColorStop(1, "rgba(120, 220, 255, 0)");
    ctx.fillStyle = nodeGlow;
    ctx.beginPath();
    ctx.arc(nx, ny, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Destination indicator
  if (wh.active) {
    const destAngle = Math.atan2(wh.targetY - wh.y, wh.targetX - wh.x);
    ctx.save();
    ctx.rotate(destAngle - t);
    ctx.strokeStyle = `rgba(200, 220, 255, ${alpha * 0.35})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(wh.radius * 0.8, 0);
    ctx.lineTo(wh.radius * 1.5, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.restore();
}

function drawCosmicRift(ctx: CanvasRenderingContext2D, rift: CosmicRift) {
  const pulse = 1 + 0.1 * Math.sin(rift.pulsePhase);

  ctx.save();
  ctx.translate(rift.x, rift.y);
  ctx.rotate(rift.angle);

  const w = rift.width * pulse;
  const h = rift.height * pulse;

  for (let i = 3; i >= 0; i--) {
    const gw = w * (1 + i * 0.3);
    const gh = h * (1 + i * 0.2);
    const alpha = 0.25 - i * 0.05;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(gw, gh) / 2);
    grad.addColorStop(0, `rgba(255, 50, 50, ${alpha})`);
    grad.addColorStop(0.5, `rgba(255, 0, 80, ${alpha * 0.5})`);
    grad.addColorStop(1, "rgba(200, 0, 50, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(-gw / 2, -gh / 2, gw, gh);
  }

  ctx.strokeStyle = "rgba(255, 80, 80, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawStorm(ctx: CanvasRenderingContext2D, storm: Storm) {
  const alpha = Math.min(1, storm.lifetime / 60);

  for (let i = 4; i >= 0; i--) {
    const r = storm.radius * (1 + i * 0.3);
    const grad = ctx.createRadialGradient(storm.x, storm.y, 0, storm.x, storm.y, r);
    const a = 0.18 * alpha - i * 0.035;
    grad.addColorStop(0, `${storm.color}${Math.round(Math.max(0, a) * 255).toString(16).padStart(2, "0")}`);
    grad.addColorStop(0.5, `${storm.color}${Math.round(Math.max(0, a * 0.5) * 255).toString(16).padStart(2, "0")}`);
    grad.addColorStop(1, `${storm.color}00`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(storm.x, storm.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(storm.x, storm.y);
  ctx.rotate(storm.rotation);

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const r = storm.radius * 0.5;
    ctx.strokeStyle = `${storm.color}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      Math.cos(angle) * r * 0.4,
      Math.sin(angle) * r * 0.4,
      r * 0.2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawSingularity(ctx: CanvasRenderingContext2D, sig: Singularity) {
  const pulse = 1 + 0.06 * Math.sin(sig.phase);
  const t = sig.phase;

  // Accretion disk - rotating ring of matter
  ctx.save();
  ctx.translate(sig.x, sig.y);
  ctx.rotate(t * 0.3);

  for (let ring = 0; ring < 3; ring++) {
    const ringR = sig.radius * (0.7 + ring * 0.25);
    const ringWidth = sig.radius * (0.08 - ring * 0.02);
    const ringAlpha = 0.3 - ring * 0.08;

    ctx.strokeStyle = `rgba(200, 100, 255, ${ringAlpha * pulse})`;
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringR, ringR * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Hot spots in accretion disk
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + t * 2;
    const dist = sig.radius * 0.8;
    const hotX = Math.cos(angle) * dist;
    const hotY = Math.sin(angle) * dist * 0.3;
    const hotAlpha = 0.4 + Math.sin(t * 5 + i * 2) * 0.3;

    const hotGlow = ctx.createRadialGradient(hotX, hotY, 0, hotX, hotY, sig.radius * 0.12);
    hotGlow.addColorStop(0, `rgba(255, 200, 100, ${hotAlpha})`);
    hotGlow.addColorStop(1, "rgba(255, 100, 50, 0)");
    ctx.fillStyle = hotGlow;
    ctx.beginPath();
    ctx.arc(hotX, hotY, sig.radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Gravitational lensing rings
  for (let i = 8; i >= 0; i--) {
    const r = sig.radius * (1 + i * 0.5) * pulse;
    const grad = ctx.createRadialGradient(sig.x, sig.y, 0, sig.x, sig.y, r);
    const alpha = 0.25 - i * 0.028;
    grad.addColorStop(0, `rgba(10, 0, 30, ${Math.abs(alpha)})`);
    grad.addColorStop(0.15, `rgba(30, 0, 60, ${Math.abs(alpha) * 0.9})`);
    grad.addColorStop(0.4, `rgba(80, 0, 160, ${Math.abs(alpha) * 0.5})`);
    grad.addColorStop(0.7, `rgba(139, 92, 246, ${Math.abs(alpha) * 0.2})`);
    grad.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sig.x, sig.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Event horizon - pure black center
  const horizonGrad = ctx.createRadialGradient(sig.x, sig.y, 0, sig.x, sig.y, sig.radius * 0.5);
  horizonGrad.addColorStop(0, "#000000");
  horizonGrad.addColorStop(0.7, "#050010");
  horizonGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = horizonGrad;
  ctx.beginPath();
  ctx.arc(sig.x, sig.y, sig.radius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Photon ring - bright edge around event horizon
  ctx.strokeStyle = `rgba(200, 150, 255, ${0.5 + Math.sin(t * 3) * 0.2})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sig.x, sig.y, sig.radius * 0.52, 0, Math.PI * 2);
  ctx.stroke();

  // Relativistic jets
  ctx.save();
  ctx.translate(sig.x, sig.y);

  for (let jet = 0; jet < 2; jet++) {
    const jetDir = jet === 0 ? -1 : 1;
    const jetLen = sig.radius * 2.5;

    ctx.save();
    ctx.rotate(jetDir * Math.PI / 2);

    const jetGrad = ctx.createLinearGradient(0, 0, 0, jetLen);
    jetGrad.addColorStop(0, `rgba(100, 200, 255, ${0.3 * pulse})`);
    jetGrad.addColorStop(0.3, `rgba(150, 100, 255, ${0.15 * pulse})`);
    jetGrad.addColorStop(1, "rgba(0, 204, 106, 0)");

    ctx.fillStyle = jetGrad;
    ctx.beginPath();
    ctx.moveTo(-sig.radius * 0.15, 0);
    ctx.lineTo(-sig.radius * 0.4, jetLen);
    ctx.lineTo(sig.radius * 0.4, jetLen);
    ctx.lineTo(sig.radius * 0.15, 0);
    ctx.closePath();
    ctx.fill();

    // Jet core
    ctx.strokeStyle = `rgba(150, 220, 255, ${0.2 * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, jetLen * 0.8);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();

  // Orbiting debris ring
  ctx.save();
  ctx.translate(sig.x, sig.y);
  ctx.rotate(t * 0.8);

  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    const dist = sig.radius * (0.9 + Math.sin(t * 2 + i) * 0.1);
    const debrisX = Math.cos(angle) * dist;
    const debrisY = Math.sin(angle) * dist * 0.3;
    const debrisAlpha = 0.2 + Math.sin(t * 3 + i * 1.5) * 0.15;

    ctx.fillStyle = `rgba(0, 255, 136, ${debrisAlpha})`;
    ctx.beginPath();
    ctx.arc(debrisX, debrisY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Outer energy tendrils
  for (let i = 0; i < 6; i++) {
    const tendrilAngle = (Math.PI * 2 * i) / 6 + t * 0.5;
    const tendrilLen = sig.radius * (1.5 + Math.sin(t * 2 + i) * 0.5);

    ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 + Math.sin(t * 3 + i) * 0.05})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();

    for (let s = 0; s <= 10; s++) {
      const pct = s / 10;
      const r = sig.radius * 0.6 + pct * tendrilLen;
      const wobble = Math.sin(pct * 8 + t * 3 + i * 2) * sig.radius * 0.15;
      const x = sig.x + Math.cos(tendrilAngle + wobble * 0.01) * r;
      const y = sig.y + Math.sin(tendrilAngle + wobble * 0.01) * r;

      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawFood(ctx: CanvasRenderingContext2D, food: FoodParticle, lowPower = false) {
  const t = Date.now() * 0.001;
  const pulse = 1 + 0.12 * Math.sin(food.pulsePhase + t * 3);
  const float = Math.sin(food.pulsePhase + t * 2) * 2;
  const r = food.radius * pulse;
  const x = food.x;
  const y = food.y + float;

  if (!lowPower) {
    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
    grad.addColorStop(0, food.glowColor);
    grad.addColorStop(0.5, `${food.color}22`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (food.type === "plasma") {
    // Diamond shape for plasma
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 2 + food.pulsePhase);

    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.lineTo(r * 0.8, 0);
    ctx.lineTo(0, r * 1.3);
    ctx.lineTo(-r * 0.8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.3, 0);
    ctx.lineTo(0, r * 0.8);
    ctx.lineTo(-r * 0.3, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  } else if (food.type === "void") {
    // Hexagon for void
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.5);

    ctx.fillStyle = food.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = Math.cos(a) * r * 1.1;
      const py = Math.sin(a) * r * 1.1;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `${food.color}88`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = Math.cos(a) * r * 0.6;
      const py = Math.sin(a) * r * 0.6;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  } else if (food.type === "solar") {
    // Star shape for solar
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.8 + food.pulsePhase);

    ctx.fillStyle = food.color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      const outerR = i % 2 === 0 ? r * 1.3 : r * 0.6;
      const px = Math.cos(a) * outerR;
      const py = Math.sin(a) * outerR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  } else if (food.type === "cosmic") {
    // Crystal shape for cosmic
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.2 + food.pulsePhase);

    // Outer crystal points
    ctx.fillStyle = food.color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const outerR = i % 2 === 0 ? r * 1.4 : r * 0.7;
      const px = Math.cos(a) * outerR;
      const py = Math.sin(a) * outerR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner glow
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (food.type === "nebula") {
    // Swirling nebula cloud
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.8);

    // Multiple overlapping circles for cloud effect
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 + t * 1.5;
      const dist = r * 0.3;
      const cx = Math.cos(a) * dist;
      const cy = Math.sin(a) * dist;
      const cloudR = r * (0.8 + Math.sin(t * 2 + i) * 0.2);

      const cloudGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudR);
      cloudGrad.addColorStop(0, `${food.color}aa`);
      cloudGrad.addColorStop(0.5, `${food.color}44`);
      cloudGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cloudGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  } else {
    // Normal: circle with inner glow
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    const innerGlow = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
    innerGlow.addColorStop(0, "rgba(255,255,255,0.5)");
    innerGlow.addColorStop(0.5, "rgba(255,255,255,0.1)");
    innerGlow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp) {
  const colors = POWERUP_COLORS[pu.type];
  if (!colors) return;

  const t = Date.now() * 0.001;
  const pulse = 1 + 0.15 * Math.sin(pu.pulsePhase + t * 3);
  const r = pu.radius * pulse;
  const rot = t * 0.8 + pu.pulsePhase;

  // Outer glow
  for (let i = 2; i >= 0; i--) {
    const hr = r * (1 + i * 0.6);
    const grad = ctx.createRadialGradient(pu.x, pu.y, 0, pu.x, pu.y, hr);
    grad.addColorStop(0, colors.glow);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pu.x, pu.y, hr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rotating hexagonal frame
  ctx.save();
  ctx.translate(pu.x, pu.y);
  ctx.rotate(rot);

  ctx.strokeStyle = colors.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner rotating hex
  ctx.strokeStyle = `${colors.color}66`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + rot * 0.5;
    const px = Math.cos(a) * r * 0.5;
    const py = Math.sin(a) * r * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Corner energy dots
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    ctx.fillStyle = colors.color;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Floating energy icon
  const iconY = pu.y + Math.sin(t * 3 + pu.pulsePhase) * 2;
  ctx.font = `${r * 1}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(colors.icon, pu.x, iconY);
}

function drawOrbTrail(ctx: CanvasRenderingContext2D, orb: Orb) {
  const style = orb.customization.trailStyle || "dots";
  const trail = orb.trail;
  if (trail.length < 2) return;
  const now = Date.now();

  if (style === "dots") {
    for (const dot of trail) {
      const alpha = (dot.life / dot.maxLife) * 0.6;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "glow") {
    for (const dot of trail) {
      const alpha = (dot.life / dot.maxLife) * 0.5;
      const glowR = dot.radius * 3;
      const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, glowR);
      glow.addColorStop(0, `${dot.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "sparkle") {
    for (let i = 0; i < trail.length; i++) {
      const dot = trail[i];
      const alpha = (dot.life / dot.maxLife) * 0.7;
      const sparkle = 1 + Math.sin(i * 2 + Date.now() * 0.01) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fff";
      const sr = dot.radius * 0.5 * sparkle;

      // Four-pointed star
      ctx.beginPath();
      ctx.moveTo(dot.x, dot.y - sr);
      ctx.lineTo(dot.x + sr * 0.3, dot.y);
      ctx.lineTo(dot.x, dot.y + sr);
      ctx.lineTo(dot.x - sr * 0.3, dot.y);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dot.x - sr, dot.y);
      ctx.lineTo(dot.x, dot.y + sr * 0.3);
      ctx.lineTo(dot.x + sr, dot.y);
      ctx.lineTo(dot.x, dot.y - sr * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  } else if (style === "line") {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = trail[0].color;
    ctx.lineWidth = trail[0].radius * 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    for (let i = trail.length - 2; i >= 0; i--) {
      const alpha = (trail[i].life / trail[i].maxLife);
      ctx.globalAlpha = alpha * 0.4;
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  } else if (style === "ribbon") {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = trail[0].color;
    ctx.lineWidth = trail[0].radius * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    for (let i = trail.length - 2; i >= 0; i--) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();

    // Inner brighter line
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = trail[0].radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    for (let i = trail.length - 2; i >= 0; i--) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
  } else if (style === "flame") {
    for (let i = 0; i < trail.length; i++) {
      const dot = trail[i];
      const alpha = (dot.life / dot.maxLife) * 0.6;
      const flicker = 1 + Math.sin(i * 3.7 + now * 0.008) * 0.35;
      const h = dot.radius * 2.5 * flicker;
      const w = dot.radius * 1.2;

      // Parse base color and shift toward warm tones
      const base = dot.color;
      const flameGrad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y - h * 0.3, h);
      flameGrad.addColorStop(0, base);
      flameGrad.addColorStop(0.4, `${base}99`);
      flameGrad.addColorStop(0.7, "rgba(255,120,20,0.3)");
      flameGrad.addColorStop(1, "rgba(255,60,0,0)");

      ctx.globalAlpha = alpha;
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      // Teardrop shape pointing upward
      ctx.moveTo(dot.x, dot.y - h);
      ctx.bezierCurveTo(
        dot.x + w, dot.y - h * 0.5,
        dot.x + w, dot.y + h * 0.2,
        dot.x, dot.y + h * 0.3
      );
      ctx.bezierCurveTo(
        dot.x - w, dot.y + h * 0.2,
        dot.x - w, dot.y - h * 0.5,
        dot.x, dot.y - h
      );
      ctx.fill();

      // Bright core
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === "aurora") {
    if (trail.length >= 2) {
      const auroraColors = ["rgba(80,255,160,0.5)", "rgba(60,180,255,0.4)", "rgba(160,100,255,0.4)"];
      for (let c = 0; c < auroraColors.length; c++) {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = auroraColors[c];
        ctx.lineWidth = trail[0].radius * (2.5 - c * 0.5);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        const offset = (c - 1) * trail[0].radius * 3;
        const wave = Math.sin(now * 0.001 + c * 1.2) * trail[0].radius * 4;
        ctx.moveTo(
          trail[trail.length - 1].x + offset + wave,
          trail[trail.length - 1].y + Math.sin(now * 0.002 + c) * 5
        );
        for (let i = trail.length - 2; i >= 0; i--) {
          const t = i / trail.length;
          const wx = Math.sin(now * 0.0015 + i * 0.3 + c) * trail[0].radius * 3;
          const wy = Math.cos(now * 0.001 + i * 0.2 + c) * 3;
          ctx.lineTo(trail[i].x + offset + wx, trail[i].y + wy);
        }
        ctx.stroke();
      }
    }
  } else if (style === "petal") {
    for (let i = 0; i < trail.length; i++) {
      const dot = trail[i];
      const alpha = (dot.life / dot.maxLife) * 0.5;
      const spin = now * 0.002 + i * 1.3;
      const petalW = dot.radius * 1.8;
      const petalH = dot.radius * 3;

      ctx.save();
      ctx.translate(dot.x, dot.y);
      ctx.rotate(spin);
      ctx.globalAlpha = alpha;

      // Petal shape
      const petalGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, petalH);
      petalGrad.addColorStop(0, "#fff");
      petalGrad.addColorStop(0.3, dot.color);
      petalGrad.addColorStop(1, `${dot.color}00`);
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, -petalH * 0.3, petalW, petalH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function drawOrb(ctx: CanvasRenderingContext2D, orb: Orb, gameTime: number) {
  const r = getOrbRadius(orb);
  const t = gameTime * 0.001;

  // Shadow under orb (for depth)
  const shadowY = r * 0.15;
  const shadowBlur = r * 0.4;
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#000";
  ctx.filter = `blur(${shadowBlur}px)`;
  ctx.beginPath();
  ctx.ellipse(orb.x, orb.y + shadowY + r * 0.3, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";
  ctx.restore();

  // Speed lines when boosting
  if (orb.isBoosting) {
    drawSpeedLines(ctx, orb, r, t);
  }

  // Outer glow layers (deeper, more layered)
  for (let i = 5; i >= 0; i--) {
    const gr = r * (1 + i * 0.4);
    const grad = ctx.createRadialGradient(orb.x, orb.y, r * 0.15, orb.x, orb.y, gr);
    const alpha = 0.45 - i * 0.08;
    grad.addColorStop(0, orb.skin.glowColor);
    grad.addColorStop(0.4, `${orb.skin.bodyColor}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boost shockwave
  if (orb.isBoosting) {
    const br = r * 1.15;
    const bgrad = ctx.createRadialGradient(orb.x, orb.y, r * 0.4, orb.x, orb.y, br);
    bgrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    bgrad.addColorStop(0.3, `${orb.skin.bodyColor}55`);
    bgrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = bgrad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main body with glass morphism
  const bodyGrad = ctx.createRadialGradient(
    orb.x - r * 0.3,
    orb.y - r * 0.3,
    r * 0.05,
    orb.x,
    orb.y,
    r
  );
  bodyGrad.addColorStop(0, orb.skin.innerColor);
  bodyGrad.addColorStop(0.35, orb.skin.bodyColor);
  bodyGrad.addColorStop(0.75, orb.skin.glowColor);
  bodyGrad.addColorStop(1, `${orb.skin.bodyColor}88`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Glass highlight
  const glassGrad = ctx.createRadialGradient(
    orb.x - r * 0.35,
    orb.y - r * 0.35,
    0,
    orb.x - r * 0.2,
    orb.y - r * 0.2,
    r * 0.6
  );
  glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
  glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  glassGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Electric arcs on surface
  drawElectricArcs(ctx, orb, r, t);

  // Inner energy core
  drawEnergyCore(ctx, orb, r, t);

  // Circuit pattern
  drawOrbCircuitPattern(ctx, orb, r, t);

  // Orbital rings
  drawOrbitalRing(ctx, orb.x, orb.y, r * 1.35, t * 0.8, orb.skin.ringColor, 1.5);
  drawOrbitalRing(ctx, orb.x, orb.y, r * 1.18, -t * 1.2, orb.skin.accentColor, 1);

  // Outer pulse ring
  const pulseR = r * 1.45;
  const pulseAlpha = 0.12 + 0.08 * Math.sin(t * 3);
  ctx.strokeStyle = `${orb.skin.bodyColor}${Math.round(pulseAlpha * 255).toString(16).padStart(2, "0")}`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  // Eclipse mode
  if (orb.eclipseMode) {
    const ep = 1 + 0.1 * Math.sin(gameTime * 0.008);
    ctx.strokeStyle = `rgba(255, 170, 0, ${0.6 + 0.3 * Math.sin(gameTime * 0.01)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r * 1.25 * ep, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 170, 0, ${0.2 + 0.1 * Math.sin(gameTime * 0.012)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r * 1.45 * ep, 0, Math.PI * 2);
    ctx.stroke();

    // Eclipse sparks
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + (Math.PI * 2 * i) / 4;
      const sx = orb.x + Math.cos(a) * r * 1.3 * ep;
      const sy = orb.y + Math.sin(a) * r * 1.3 * ep;
      ctx.fillStyle = `rgba(255, 200, 50, ${0.5 + 0.3 * Math.sin(t * 5 + i)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shield
  const hasShieldPowerUp = orb.activePowerUps.some((p) => p.type === "shield" && p.expiresAt > Date.now());
  if (hasShieldPowerUp) {
    const sp = 1 + 0.05 * Math.sin(gameTime * 0.005);
    ctx.strokeStyle = `rgba(245, 208, 98, ${0.6 + 0.2 * Math.sin(gameTime * 0.008)})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r * 1.3 * sp, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Name
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.font = `bold ${Math.max(10, Math.min(16, r * 0.4))}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(orb.name, orb.x, orb.y - r - 10);

  // Eclipse text
  if (orb.eclipseMode) {
    ctx.fillStyle = `rgba(255, 200, 50, ${0.8 + 0.2 * Math.sin(gameTime * 0.008)})`;
    ctx.font = `bold ${Math.max(9, Math.min(13, r * 0.3))}px Inter, sans-serif`;
    ctx.fillText("ECLIPSE", orb.x, orb.y - r - 24);
  }

  // Score display
  if (r > 25) {
    ctx.fillStyle = "rgba(200, 220, 255, 0.8)";
    ctx.font = `${Math.max(8, r * 0.25)}px Inter, sans-serif`;
    ctx.fillText(`${Math.round(orb.score)}`, orb.x, orb.y + r + 14);
  }
}

function drawSpeedLines(ctx: CanvasRenderingContext2D, orb: Orb, r: number, t: number) {
  ctx.save();
  ctx.translate(orb.x, orb.y);
  ctx.rotate(orb.targetAngle + Math.PI);

  const lineCount = 8;
  for (let i = 0; i < lineCount; i++) {
    const angle = (Math.random() - 0.5) * 0.8;
    const dist = r + 5 + Math.random() * 15;
    const len = 15 + Math.random() * 25;
    const alpha = 0.2 + Math.random() * 0.3;

    ctx.strokeStyle = `${orb.skin.bodyColor}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
    ctx.lineTo(Math.cos(angle) * (dist + len), Math.sin(angle) * (dist + len));
    ctx.stroke();
  }

  ctx.restore();
}

function drawElectricArcs(ctx: CanvasRenderingContext2D, orb: Orb, r: number, t: number) {
  const arcCount = 3;
  for (let i = 0; i < arcCount; i++) {
    const startAngle = t * 1.5 + (Math.PI * 2 * i) / arcCount;
    const arcLen = 0.4 + 0.3 * Math.sin(t * 2 + i * 3);

    ctx.strokeStyle = `${orb.skin.accentColor}55`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();

    const segments = 6;
    for (let s = 0; s <= segments; s++) {
      const pct = s / segments;
      const angle = startAngle + pct * arcLen;
      const wobble = Math.sin(pct * 12 + t * 4) * r * 0.08;
      const dist = r * 0.7 + wobble;
      const x = orb.x + Math.cos(angle) * dist;
      const y = orb.y + Math.sin(angle) * dist;

      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawEnergyCore(ctx: CanvasRenderingContext2D, orb: Orb, r: number, t: number) {
  const coreR = r * 0.25;
  const corePulse = 1 + 0.15 * Math.sin(t * 4);

  // Core glow
  const coreGlow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, coreR * 2 * corePulse);
  coreGlow.addColorStop(0, `${orb.skin.innerColor}88`);
  coreGlow.addColorStop(0.5, `${orb.skin.bodyColor}33`);
  coreGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, coreR * 2 * corePulse, 0, Math.PI * 2);
  ctx.fill();

  // Core bright center
  const coreGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, coreR * corePulse);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.3, orb.skin.innerColor);
  coreGrad.addColorStop(1, `${orb.skin.bodyColor}00`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, coreR * corePulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawPetCompanion(ctx: CanvasRenderingContext2D, orb: Orb, gameTime: number) {
  ctx.save();
  const t = gameTime * 0.001;
  const r = getOrbRadius(orb);
  const petStyle = orb.customization.petStyle || "nova";

  // Pet floats well outside the orb body and all its glow layers
  const charCode = orb.id.length > 0 ? orb.id.charCodeAt(orb.id.length - 1) : 0;
  const orbitAngle = t * 1.2 + charCode * 0.7;
  const dist = r * 3.5 + 40;
  const px = orb.x + Math.cos(orbitAngle) * dist;
  const bob = Math.sin(t * 2.8) * 3;
  const py = orb.y + Math.sin(orbitAngle) * dist * 0.5 + bob;
  const petR = Math.max(5, Math.min(10, r * 0.3));

  // Trail
  for (let i = 0; i < 4; i++) {
    const tt = t - i * 0.08;
    const ta = tt * 1.2 + charCode * 0.7;
    const tx = orb.x + Math.cos(ta) * dist;
    const ty = orb.y + Math.sin(ta) * dist * 0.5 + Math.sin(tt * 2.8) * 3;
    const ta2 = (1 - i / 4) * 0.25;
    const ts = petR * (1 - i / 4) * 0.5;
    ctx.fillStyle = `rgba(245, 208, 98, ${ta2})`;
    ctx.beginPath();
    ctx.arc(tx, ty, ts, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tether to orb
  ctx.strokeStyle = "rgba(245, 208, 98, 0.07)";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(orb.x, orb.y);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.setLineDash([]);

  switch (petStyle) {
    case "nova":
      drawPetNova(ctx, px, py, petR, t);
      break;
    case "stardust":
      drawPetStardust(ctx, px, py, petR, t);
      break;
    case "cosmo":
      drawPetCosmo(ctx, px, py, petR, t);
      break;
    case "luna":
      drawPetLuna(ctx, px, py, petR, t);
      break;
    case "pulsar":
      drawPetPulsar(ctx, px, py, petR, t);
      break;
    case "nebula":
      drawPetNebula(ctx, px, py, petR, t);
      break;
    case "stella":
      drawPetStella(ctx, px, py, petR, t);
      break;
    case "wisp":
      drawPetWisp(ctx, px, py, petR, t);
      break;
    case "flare":
      drawPetFlare(ctx, px, py, petR, t);
      break;
    case "aurora":
      drawPetAurora(ctx, px, py, petR, t);
      break;
  }

  // Sparkles around all pets
  for (let i = 0; i < 3; i++) {
    const sa = t * 4.5 + i * 2.1;
    const sd = petR * (2.2 + Math.sin(t * 2 + i) * 0.6);
    const sx = px + Math.cos(sa) * sd;
    const sy = py + Math.sin(sa) * sd;
    ctx.fillStyle = `rgba(255, 240, 150, ${0.3 + Math.sin(t * 5 + i * 2) * 0.3})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPetNova(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Star-shaped pet with eyes and smile
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 2.8);
  glow.addColorStop(0, "rgba(245, 208, 98, 0.3)");
  glow.addColorStop(0.5, "rgba(245, 208, 98, 0.08)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(px, py, petR * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t * 1.8);

  const pts = 5;
  const outer = petR;
  const inner = petR * 0.4;

  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, outer);
  sg.addColorStop(0, "#fffde8");
  sg.addColorStop(0.35, "#f5d062");
  sg.addColorStop(0.8, "#d4a020");
  sg.addColorStop(1, "#b08018");
  ctx.fillStyle = sg;
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (Math.PI * 2 * i) / (pts * 2) - Math.PI / 2;
    const sr = i % 2 === 0 ? outer : inner;
    ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 240, 150, 0.6)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath(); ctx.arc(-petR * 0.2, -petR * 0.08, petR * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(petR * 0.2, -petR * 0.08, petR * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-petR * 0.16, -petR * 0.12, petR * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(petR * 0.24, -petR * 0.12, petR * 0.035, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = Math.max(0.5, petR * 0.05);
  ctx.beginPath();
  ctx.arc(0, petR * 0.06, petR * 0.12, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.restore();
}

function drawPetStardust(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Cluster of tiny sparkles orbiting a center
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 2.5);
  glow.addColorStop(0, "rgba(200, 180, 255, 0.3)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 2.5, 0, Math.PI * 2); ctx.fill();

  for (let i = 0; i < 6; i++) {
    const a = t * 2.5 + (Math.PI * 2 * i) / 6;
    const d = petR * (0.5 + Math.sin(t * 3 + i) * 0.3);
    const sx = px + Math.cos(a) * d;
    const sy = py + Math.sin(a) * d;
    const size = petR * 0.15 + Math.sin(t * 4 + i * 1.5) * petR * 0.05;

    ctx.fillStyle = `rgba(200, 180, 255, ${0.6 + Math.sin(t * 3 + i) * 0.3})`;
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
  }

  // Center bright dot
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(px, py, petR * 0.2, 0, Math.PI * 2); ctx.fill();
}

function drawPetCosmo(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Miniature planet with ring
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 2.5);
  glow.addColorStop(0, "rgba(255, 200, 50, 0.3)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(px, py);

  // Planet body
  const pg = ctx.createRadialGradient(-petR * 0.2, -petR * 0.2, 0, 0, 0, petR * 0.7);
  pg.addColorStop(0, "#ffe88a");
  pg.addColorStop(0.6, "#f5a623");
  pg.addColorStop(1, "#c07000");
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(0, 0, petR * 0.7, 0, Math.PI * 2); ctx.fill();

  // Ring
  ctx.rotate(t * 0.8);
  ctx.strokeStyle = "rgba(255, 220, 100, 0.5)";
  ctx.lineWidth = Math.max(1, petR * 0.08);
  ctx.beginPath();
  ctx.ellipse(0, 0, petR * 1.2, petR * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawPetLuna(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Crescent moon
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 2.5);
  glow.addColorStop(0, "rgba(180, 200, 255, 0.3)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t * 0.3);

  // Moon body (circle)
  const mg = ctx.createRadialGradient(-petR * 0.15, -petR * 0.15, 0, 0, 0, petR * 0.8);
  mg.addColorStop(0, "#e8eeff");
  mg.addColorStop(0.5, "#c0d0f0");
  mg.addColorStop(1, "#8899cc");
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(0, 0, petR * 0.8, 0, Math.PI * 2); ctx.fill();

  // Dark circle to make crescent
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath(); ctx.arc(petR * 0.35, -petR * 0.1, petR * 0.65, 0, Math.PI * 2); ctx.fill();

  // Tiny stars around
  for (let i = 0; i < 3; i++) {
    const a = t * 1.5 + i * 2.1;
    const d = petR * 1.5;
    ctx.fillStyle = `rgba(200, 220, 255, ${0.4 + Math.sin(t * 3 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPetPulsar(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Pulsing energy core with beams
  const pulse = 0.5 + Math.sin(t * 6) * 0.5;
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * (2 + pulse));
  glow.addColorStop(0, `rgba(100, 200, 255, ${0.3 + pulse * 0.2})`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * (2 + pulse), 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t * 3);

  // Core
  ctx.fillStyle = "#88ddff";
  ctx.beginPath(); ctx.arc(0, 0, petR * 0.4, 0, Math.PI * 2); ctx.fill();

  // Beams
  for (let i = 0; i < 2; i++) {
    const a = (Math.PI * 2 * i) / 2;
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 + pulse * 0.3})`;
    ctx.lineWidth = Math.max(1, petR * 0.1);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * petR * 0.5, Math.sin(a) * petR * 0.5);
    ctx.lineTo(Math.cos(a) * petR * 1.8, Math.sin(a) * petR * 1.8);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPetNebula(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Swirling cloud of color
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 3);
  glow.addColorStop(0, "rgba(150, 80, 220, 0.35)");
  glow.addColorStop(0.5, "rgba(100, 40, 180, 0.1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 3, 0, Math.PI * 2); ctx.fill();

  for (let i = 0; i < 4; i++) {
    const a = t * 0.8 + i * 1.6;
    const d = petR * (0.3 + i * 0.2);
    const cx = px + Math.cos(a) * d;
    const cy = py + Math.sin(a) * d;
    const cloudG = ctx.createRadialGradient(cx, cy, 0, cx, cy, petR * 0.6);
    cloudG.addColorStop(0, `rgba(${150 + i * 25}, ${80 + i * 20}, 220, 0.3)`);
    cloudG.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = cloudG;
    ctx.beginPath(); ctx.arc(cx, cy, petR * 0.6, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPetStella(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Four-pointed diamond star
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 2.5);
  glow.addColorStop(0, "rgba(255, 180, 220, 0.3)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t * 1.5);

  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, petR);
  sg.addColorStop(0, "#fff");
  sg.addColorStop(0.3, "#ffb8d0");
  sg.addColorStop(0.7, "#ff6699");
  sg.addColorStop(1, "#cc3366");
  ctx.fillStyle = sg;

  // 4-pointed star
  ctx.beginPath();
  ctx.moveTo(0, -petR);
  ctx.lineTo(petR * 0.2, -petR * 0.2);
  ctx.lineTo(petR, 0);
  ctx.lineTo(petR * 0.2, petR * 0.2);
  ctx.lineTo(0, petR);
  ctx.lineTo(-petR * 0.2, petR * 0.2);
  ctx.lineTo(-petR, 0);
  ctx.lineTo(-petR * 0.2, -petR * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPetWisp(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Ghostly floating orb with trailing wisps
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 3);
  glow.addColorStop(0, "rgba(180, 255, 220, 0.3)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 3, 0, Math.PI * 2); ctx.fill();

  // Wispy trail follows orbit direction
  const trailDir = Math.cos(t * 1.2) > 0 ? -1 : 1;
  for (let i = 0; i < 4; i++) {
    const alpha = (1 - i / 4) * 0.2;
    const trailR = petR * (0.4 - i * 0.08);
    const trailX = px + trailDir * i * petR * 0.3;
    const trailY = py + Math.sin(t * 2 + i) * petR * 0.2;
    ctx.fillStyle = `rgba(180, 255, 220, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Body
  const bg = ctx.createRadialGradient(px, py, 0, px, py, petR * 0.7);
  bg.addColorStop(0, "rgba(220, 255, 240, 0.7)");
  bg.addColorStop(0.6, "rgba(150, 255, 200, 0.4)");
  bg.addColorStop(1, "rgba(100, 200, 150, 0)");
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(px, py, petR * 0.7, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = "rgba(0, 80, 40, 0.8)";
  ctx.beginPath(); ctx.arc(px - petR * 0.15, py - petR * 0.05, petR * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + petR * 0.15, py - petR * 0.05, petR * 0.07, 0, Math.PI * 2); ctx.fill();
}

function drawPetFlare(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Fiery burst pet
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 3);
  glow.addColorStop(0, "rgba(255, 120, 30, 0.35)");
  glow.addColorStop(0.5, "rgba(255, 60, 0, 0.1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 3, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(t * 2);

  // Flame body
  const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, petR * 0.8);
  fg.addColorStop(0, "#fff8e0");
  fg.addColorStop(0.3, "#ffaa33");
  fg.addColorStop(0.7, "#ff4400");
  fg.addColorStop(1, "rgba(200, 30, 0, 0)");
  ctx.fillStyle = fg;

  ctx.beginPath();
  ctx.moveTo(0, -petR);
  ctx.bezierCurveTo(petR * 0.6, -petR * 0.4, petR * 0.5, petR * 0.3, 0, petR * 0.6);
  ctx.bezierCurveTo(-petR * 0.5, petR * 0.3, -petR * 0.6, -petR * 0.4, 0, -petR);
  ctx.fill();

  ctx.restore();
}

function drawPetAurora(ctx: CanvasRenderingContext2D, px: number, py: number, petR: number, t: number) {
  // Flowing aurora ribbons
  const glow = ctx.createRadialGradient(px, py, 0, px, py, petR * 3);
  glow.addColorStop(0, "rgba(100, 255, 180, 0.25)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(px, py, petR * 3, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  const colors = ["rgba(80, 255, 160, 0.5)", "rgba(60, 180, 255, 0.4)", "rgba(160, 100, 255, 0.4)"];
  for (let c = 0; c < colors.length; c++) {
    ctx.strokeStyle = colors[c];
    ctx.lineWidth = Math.max(1.5, petR * 0.15);
    ctx.lineCap = "round";
    ctx.beginPath();
    const wave = Math.sin(t * 2 + c * 1.2) * petR * 0.6;
    const yOff = (c - 1) * petR * 0.5;
    ctx.moveTo(px - petR, py + yOff + wave);
    for (let x = -petR; x <= petR; x += 2) {
      const wx = Math.sin(x * 0.1 + t * 3 + c * 0.8) * petR * 0.3;
      ctx.lineTo(px + x, py + yOff + wx);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrbCircuitPattern(ctx: CanvasRenderingContext2D, orb: Orb, r: number, t: number) {
  const pattern = orb.customization.bodyPattern;
  if (pattern === "none") return;

  ctx.save();
  ctx.translate(orb.x, orb.y);

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.clip();

  const color = `rgba(255, 255, 255, 0.5)`;

  if (pattern === "circuit") {
    ctx.rotate(t * 0.3);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.04);

    const segments = 8;
    const innerR = r * 0.25;
    const outerR = r * 0.7;

    for (let i = 0; i < segments; i++) {
      const angle = (Math.PI * 2 * i) / segments;
      const nextAngle = (Math.PI * 2 * (i + 1)) / segments;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.lineTo(Math.cos(nextAngle) * outerR, Math.sin(nextAngle) * outerR);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.stroke();
  } else if (pattern === "stripes") {
    ctx.rotate(t * 0.15);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.08);
    const gap = r * 0.25;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gap, -r * 0.8);
      ctx.lineTo(i * gap, r * 0.8);
      ctx.stroke();
    }
  } else if (pattern === "dots") {
    ctx.rotate(t * 0.1);
    ctx.fillStyle = color;
    const gap = r * 0.28;
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        const px = x * gap;
        const py = y * gap;
        if (Math.sqrt(px * px + py * py) < r * 0.75) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, r * 0.05), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (pattern === "hex") {
    ctx.rotate(t * 0.08);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.04);
    const hexR = r * 0.18;
    const hexH = hexR * Math.sqrt(3);

    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const cx = col * hexR * 1.5;
        const cy = row * hexH + (col % 2 ? hexH / 2 : 0);
        if (Math.sqrt(cx * cx + cy * cy) > r * 0.75) continue;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = cx + Math.cos(a) * hexR;
          const py = cy + Math.sin(a) * hexR;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (pattern === "wave") {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.05);
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      for (let x = -r * 0.8; x <= r * 0.8; x += 2) {
        const py = i * r * 0.2 + Math.sin(x * 0.05 + t * 2) * r * 0.08;
        if (x === -r * 0.8) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  } else if (pattern === "swirl") {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.05);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 6; a += 0.05) {
      const sr = (a / (Math.PI * 6)) * r * 0.7;
      const sx = Math.cos(a + t * 0.5) * sr;
      const sy = Math.sin(a + t * 0.5) * sr;
      if (a === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawOrbitalRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number, color: string, width: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawMassPulse(ctx: CanvasRenderingContext2D, orb: Orb) {
  const progress = orb.massPulseRadius / 200;
  const alpha = (1 - progress) * 0.5;

  ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.massPulseRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(200, 100, 255, ${alpha * 0.6})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.massPulseRadius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCollectParticle(ctx: CanvasRenderingContext2D, p: CollectParticle) {
  const alpha = (p.life / p.maxLife) * 0.8;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawDeathParticle(ctx: CanvasRenderingContext2D, p: DeathParticle) {
  const alpha = p.life / p.maxLife;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;

  switch (p.type) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "spark":
      ctx.beginPath();
      ctx.moveTo(-p.radius * 2, 0);
      ctx.lineTo(0, -p.radius * 0.3);
      ctx.lineTo(p.radius * 2, 0);
      ctx.lineTo(0, p.radius * 0.3);
      ctx.closePath();
      ctx.fill();
      break;
    case "ring":
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "shard":
      ctx.beginPath();
      ctx.moveTo(0, -p.radius);
      ctx.lineTo(p.radius * 0.6, 0);
      ctx.lineTo(0, p.radius);
      ctx.lineTo(-p.radius * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBoundary(ctx: CanvasRenderingContext2D, state: GameState) {
  const w = state.mapWidth;
  const h = state.mapHeight;
  const t = state.gameTime;

  const auraColor = "100, 150, 255";
  const lineColor = "100, 150, 255";

  // Outer glow aura
  const auraSize = 120;
  const auraGrad = ctx.createLinearGradient(0, 0, auraSize, 0);
  auraGrad.addColorStop(0, `rgba(${auraColor}, 0.2)`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.fillRect(-auraSize, -auraSize, auraSize, h + auraSize * 2);

  const auraGrad2 = ctx.createLinearGradient(w, 0, w - auraSize, 0);
  auraGrad2.addColorStop(0, `rgba(${auraColor}, 0.2)`);
  auraGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad2;
  ctx.fillRect(w, -auraSize, auraSize, h + auraSize * 2);

  const auraGrad3 = ctx.createLinearGradient(0, 0, 0, auraSize);
  auraGrad3.addColorStop(0, `rgba(${auraColor}, 0.2)`);
  auraGrad3.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad3;
  ctx.fillRect(-auraSize, -auraSize, w + auraSize * 2, auraSize);

  const auraGrad4 = ctx.createLinearGradient(0, h, 0, h - auraSize);
  auraGrad4.addColorStop(0, `rgba(${auraColor}, 0.2)`);
  auraGrad4.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad4;
  ctx.fillRect(-auraSize, h, w + auraSize * 2, auraSize);

  // Force field lines (pulsing)
  const pulse = Math.sin(t * 0.003) * 0.5 + 0.5;

  // Top
  ctx.strokeStyle = `rgba(${lineColor}, ${0.18 + pulse * 0.12})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  // Bottom
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.stroke();

  // Left
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, h);
  ctx.stroke();

  // Right
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w, h);
  ctx.stroke();

  // Corner energy nodes
  const cornerSize = 100;
  const corners = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];

  for (const c of corners) {
    const nodeGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, cornerSize);
    nodeGlow.addColorStop(0, `rgba(${lineColor}, ${0.35 + pulse * 0.2})`);
    nodeGlow.addColorStop(0.5, `rgba(${lineColor}, 0.06)`);
    nodeGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nodeGlow;
    ctx.beginPath();
    ctx.arc(c.x, c.y, cornerSize, 0, Math.PI * 2);
    ctx.fill();

    // Rotating energy ring
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(t * 0.002);
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.35 + pulse * 0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  // Energy particles traveling along edges
  for (let i = 0; i < 12; i++) {
    const speed = 0.0002;
    const pos = (t * speed + i * (1 / 12)) % 1;
    let x: number, y: number;

    if (pos < 0.25) {
      x = pos * 4 * w;
      y = 0;
    } else if (pos < 0.5) {
      x = w;
      y = (pos - 0.25) * 4 * h;
    } else if (pos < 0.75) {
      x = (1 - (pos - 0.5) * 4) * w;
      y = h;
    } else {
      x = 0;
      y = (1 - (pos - 0.75) * 4) * h;
    }

    // Particle glow
    const pGlow = ctx.createRadialGradient(x, y, 0, x, y, 12);
    pGlow.addColorStop(0, `rgba(100, 180, 255, ${0.7 + Math.sin(t * 0.01 + i) * 0.3})`);
    pGlow.addColorStop(1, "rgba(100, 180, 255, 0)");
    ctx.fillStyle = pGlow;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(t * 0.01 + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lightning arcs along edges
  for (let edge = 0; edge < 4; edge++) {
    const arcPhase = Math.sin(t * 0.005 + edge * 2);
    if (arcPhase < 0.7) continue;

    const segments = 8;
    ctx.strokeStyle = `rgba(120, 180, 255, ${arcPhase * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let s = 0; s <= segments; s++) {
      const pct = s / segments;
      let x: number, y: number;

      if (edge === 0) { x = pct * w; y = (Math.random() - 0.5) * 6; }
      else if (edge === 1) { x = w + (Math.random() - 0.5) * 6; y = pct * h; }
      else if (edge === 2) { x = pct * w; y = h + (Math.random() - 0.5) * 6; }
      else { x = (Math.random() - 0.5) * 6; y = pct * h; }

      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
