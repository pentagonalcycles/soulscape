import {
  GameState,
  Orb,
  FoodParticle,
  DeathParticle,
  KillFeedEntry,
  GravityWell,
  Wormhole,
  CosmicRift,
  Storm,
  Singularity,
  CollectParticle,
  Notification,
  ActivePowerUp,
  GameSettings,
  PowerUp,
} from "./types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  FOOD_COUNT,
  FOOD_SPAWN_INTERVAL,
  FOOD_DESPAWN_TIME,
  FOOD_VALUE_MIN,
  FOOD_VALUE_MAX,
  POWERUP_COUNT,
  POWERUP_SPAWN_INTERVAL,
  POWERUP_DESPAWN_TIME,
  GRAVITY_WELL_COUNT,
  GRAVITY_WELL_RADIUS,
  GRAVITY_WELL_PULL_RADIUS,
  GRAVITY_WELL_STRENGTH,
  WORMHOLE_COUNT,
  WORMHOLE_RADIUS,
  WORMHOLE_COOLDOWN,
  COSMIC_RIFT_COUNT,
  COSMIC_RIFT_DAMAGE,
  STORM_COUNT,
  STORM_SPAWN_INTERVAL,
  STORM_MAX_LIFETIME,
  KILL_FOOD_DROP_COUNT,
  KILL_FOOD_VALUE,
  DEATH_PARTICLE_COUNT,
  DEATH_PARTICLE_SPEED,
  DEATH_PARTICLE_LIFE,
  ECLIPSE_KILLS_REQUIRED,
  ECLIPSE_DURATION,
  ECLIPSE_RADIUS_REGEN,
  MAGNET_RANGE,
  MAGNET_STRENGTH,
  SINGULARITY_INITIAL_RADIUS,
  SINGULARITY_GROWTH_RATE,
  SINGULARITY_MAX_RADIUS,
  SINGULARITY_PULL_RADIUS,
  SINGULARITY_PULL_STRENGTH,
  SINGULARITY_DAMAGE,
  ORB_BASE_RADIUS,
  ORB_FOOD_GROWTH,
  MASS_PULSE_RADIUS,
  MASS_PULSE_FORCE,
  MASS_PULSE_COOLDOWN,
  MASS_PULSE_COST,
  ORB_BOOST_SHRINK,
  ORB_BOOST_MIN,
  GROWTH_CHILL,
  GROWTH_NORMAL,
  GROWTH_INTENSE,
  FOOD_VALUE_CHILL,
  FOOD_VALUE_NORMAL,
  FOOD_VALUE_INTENSE,
  KILL_GROWTH_CHILL,
  KILL_GROWTH_NORMAL,
  KILL_GROWTH_INTENSE,
} from "./constants";
import { createOrb, updateOrb, growOrb, killOrb, getHeadPosition, getOrbRadius, hasPowerUp, isInvincible, isGhost, addPowerUp } from "./orb";
import { createFood, createKillFood, checkFoodCollision } from "./food";
import { createPowerUp, collectPowerUp, checkPowerUpCollision } from "./powerup";


import { DIFFICULTIES, MAP_SIZES } from "./types";

const AI_NAMES = [
  "Stardust", "Nebula", "Astral", "Cosmos", "Void",
  "Eclipse", "Lunar", "Pulsar", "Quasar", "Solaris",
  "Photon", "Nebulae", "Vortex", "Zenith", "Aphelion",
  "Perihelion", "Quasar", "Pulsate", "Nova", "Orbit",
  "Celestia", "Drift", "Ember", "Frost", "Glimmer",
  "Horizon", "Ion", "Jupiter", "Krypton", "Lumina",
  "Meteor", "Nebula", "Omega", "Plasma", "Quantum",
  "Radiance", "Supernova", "Titan", "Umbra", "Vortex",
  "Wraith", "Xenon", "Yonder", "Zenith", "Aurora",
  "Blaze", "Comet", "Dynamo", "Eclipse", "Flare",
];

function getGrowthMultiplier(difficulty: string): number {
  switch (difficulty) {
    case "chill": return GROWTH_CHILL;
    case "intense": return GROWTH_INTENSE;
    default: return GROWTH_NORMAL;
  }
}

function getFoodValueMultiplier(difficulty: string): number {
  switch (difficulty) {
    case "chill": return FOOD_VALUE_CHILL;
    case "intense": return FOOD_VALUE_INTENSE;
    default: return FOOD_VALUE_NORMAL;
  }
}

function getKillGrowthMultiplier(difficulty: string): number {
  switch (difficulty) {
    case "chill": return KILL_GROWTH_CHILL;
    case "intense": return KILL_GROWTH_INTENSE;
    default: return KILL_GROWTH_NORMAL;
  }
}

export function createInitialState(settings?: GameSettings): GameState {
  const diff = DIFFICULTIES.find((d) => d.id === (settings?.difficulty || "normal")) || DIFFICULTIES[1];
  const mapDef = MAP_SIZES.find((m) => m.id === (settings?.mapSize || "medium")) || MAP_SIZES[1];
  const mode = settings?.mode || "ffa";
  const mapW = mapDef.width;
  const mapH = mapDef.height;

  const orbs = new Map<string, Orb>();

  const botCount = mode === "zen" ? 0 : diff.botCount;
  for (let i = 0; i < botCount; i++) {
    const orb = createOrb(AI_NAMES[i % AI_NAMES.length], i, undefined, undefined, mapW, mapH);
    orb.radius = ORB_BASE_RADIUS + Math.random() * 20;
    orb.targetRadius = orb.radius;
    orb.score = Math.floor(Math.random() * 200);
    orb.baseSpeed *= diff.speedMult;
    orbs.set(orb.id, orb);
  }

  const foodScale = (mapW * mapH) / (10000 * 10000);
  const foodCount = Math.floor(FOOD_COUNT * foodScale);
  const food: FoodParticle[] = [];
  for (let i = 0; i < foodCount; i++) {
    food.push(createFood(mapW, mapH));
  }

  const hazardScale = mode === "zen" ? 0.3 : 1;
  const gwCount = mode === "zen" ? 2 : Math.floor(GRAVITY_WELL_COUNT * hazardScale);
  const whCount = mode === "zen" ? 2 : Math.floor(WORMHOLE_COUNT * hazardScale);
  const riftCount = mode === "zen" ? 0 : Math.floor(COSMIC_RIFT_COUNT * hazardScale);
  const stormCount = 0;

  const gravityWells: GravityWell[] = [];
  for (let i = 0; i < gwCount; i++) {
    gravityWells.push({
      id: `gw-${i}`,
      x: Math.random() * (mapW - 800) + 400,
      y: Math.random() * (mapH - 800) + 400,
      strength: GRAVITY_WELL_STRENGTH * (0.7 + Math.random() * 0.6),
      radius: GRAVITY_WELL_RADIUS * (0.8 + Math.random() * 0.4),
      pullRadius: GRAVITY_WELL_PULL_RADIUS * (0.8 + Math.random() * 0.4),
      rotation: 0,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  const wormholes: Wormhole[] = [];
  for (let i = 0; i < whCount; i++) {
    const x = Math.random() * (mapW - 1000) + 500;
    const y = Math.random() * (mapH - 1000) + 500;
    wormholes.push({
      id: `wh-${i}-a`,
      x,
      y,
      targetX: 0,
      targetY: 0,
      partnerId: `wh-${i}-b`,
      radius: WORMHOLE_RADIUS,
      rotation: 0,
      active: true,
      cooldown: 0,
    });
    const tx = Math.random() * (mapW - 1000) + 500;
    const ty = Math.random() * (mapH - 1000) + 500;
    wormholes.push({
      id: `wh-${i}-b`,
      x: tx,
      y: ty,
      targetX: x,
      targetY: y,
      partnerId: `wh-${i}-a`,
      radius: WORMHOLE_RADIUS,
      rotation: 0,
      active: true,
      cooldown: 0,
    });
  }

  for (const wh of wormholes) {
    const partner = wormholes.find((w) => w.id === wh.partnerId);
    if (partner) {
      wh.targetX = partner.x;
      wh.targetY = partner.y;
    }
  }

  const cosmicRifts: CosmicRift[] = [];
  for (let i = 0; i < riftCount; i++) {
    cosmicRifts.push({
      id: `rift-${i}`,
      x: Math.random() * (mapW - 1000) + 500,
      y: Math.random() * (mapH - 1000) + 500,
      width: 80 + Math.random() * 120,
      height: 30 + Math.random() * 50,
      angle: Math.random() * Math.PI * 2,
      damage: COSMIC_RIFT_DAMAGE,
      speed: 0.2 + Math.random() * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  const storms: Storm[] = [];
  for (let i = 0; i < stormCount; i++) {
    const type = (["electromagnetic", "void", "solar"] as const)[
      Math.floor(Math.random() * 3)
    ];
    storms.push({
      id: `storm-${i}`,
      x: Math.random() * mapW,
      y: Math.random() * mapH,
      radius: 120 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      intensity: 0.5 + Math.random() * 0.5,
      rotation: 0,
      lifetime: STORM_MAX_LIFETIME,
      color:
        type === "electromagnetic"
          ? "#60a5fa"
          : type === "void"
          ? "#8b5cf6"
          : "#f59e0b",
      type,
    });
  }

  const singularity: Singularity = {
    x: mapW / 2,
    y: mapH / 2,
    radius: SINGULARITY_INITIAL_RADIUS,
    growthRate: mode === "zen" ? 0 : SINGULARITY_GROWTH_RATE,
    pullStrength: mode === "zen" ? 0 : SINGULARITY_PULL_STRENGTH,
    pullRadius: SINGULARITY_PULL_RADIUS,
    maxRadius: SINGULARITY_MAX_RADIUS,
    phase: 0,
  };

  return {
    orbs,
    food,
    powerUps: [],
    gravityWells,
    wormholes,
    cosmicRifts,
    storms,
    singularity,
    mapWidth: mapW,
    mapHeight: mapH,
    gameTime: 0,
    lastFoodSpawn: Date.now(),
    lastPowerUpSpawn: Date.now(),
    lastStormSpawn: Date.now(),
    playerId: null,
    particles: [],
    collectParticles: [],
    killFeed: [],
    screenShake: 0,
    notifications: [],
    difficulty: settings?.difficulty || "normal",
  };
}

export function updateGame(state: GameState, dt: number): void {
  const now = Date.now();
  state.gameTime += dt;
  state.screenShake *= 0.9;

  updateGravityWells(state, dt);
  updateWormholes(state, dt);
  updateCosmicRifts(state, dt);
  updateStorms(state, dt);
  updateSingularity(state, dt);
  updateOrbs(state, dt);
  updateFoodDrift(state, dt);
  updateCollectParticles(state, dt);
  checkCollisions(state, dt);
  spawnEntities(state, now);
  cleanupEntities(state, now);
  state.killFeed = state.killFeed.filter((e) => now - e.time < 2000);
  state.notifications = state.notifications.filter((n) => now - n.time < n.duration);
  updateParticles(state, dt);
}

function updateGravityWells(state: GameState, dt: number): void {
  for (const well of state.gravityWells) {
    well.rotation += 0.01;
    well.pulsePhase += dt * 0.003;

    for (const orb of state.orbs.values()) {
      if (!orb.alive) continue;
      if (isGhost(orb)) continue;

      const dx = well.x - orb.x;
      const dy = well.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < well.pullRadius && dist > 10) {
        const force = well.strength * (1 - dist / well.pullRadius);
        const nx = dx / dist;
        const ny = dy / dist;
        orb.x += nx * force * dt;
        orb.y += ny * force * dt;
      }
    }
  }
}

function updateWormholes(state: GameState, dt: number): void {
  for (const wh of state.wormholes) {
    wh.rotation += 0.015;

    if (wh.cooldown > 0) {
      wh.cooldown -= dt;
      if (wh.cooldown <= 0) wh.active = true;
    }
  }
}

function updateCosmicRifts(state: GameState, dt: number): void {
  for (const rift of state.cosmicRifts) {
    rift.angle += rift.rotationSpeed * dt;
    rift.x += Math.cos(rift.angle) * rift.speed * dt;
    rift.y += Math.sin(rift.angle) * rift.speed * dt;
    rift.pulsePhase += dt * 0.004;

    rift.x = Math.max(0, Math.min(state.mapWidth, rift.x));
    rift.y = Math.max(0, Math.min(state.mapHeight, rift.y));
  }
}

function updateStorms(state: GameState, dt: number): void {
  for (const storm of state.storms) {
    storm.x += storm.vx * dt;
    storm.y += storm.vy * dt;
    storm.rotation += 0.008;
    storm.lifetime -= dt;

    if (storm.x < 0 || storm.x > state.mapWidth) storm.vx *= -1;
    if (storm.y < 0 || storm.y > state.mapHeight) storm.vy *= -1;

    for (const orb of state.orbs.values()) {
      if (!orb.alive) continue;
      if (orb.isRemote) continue;
      if (isGhost(orb)) continue;

      const dx = storm.x - orb.x;
      const dy = storm.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < storm.radius) {
        const intensity = (1 - dist / storm.radius) * storm.intensity;
        if (storm.type === "void") {
          orb.radius = Math.max(ORB_BASE_RADIUS, orb.radius - 0.01 * intensity * dt);
        } else if (storm.type === "solar") {
          orb.radius += 0.005 * intensity * dt;
        }
      }
    }
  }
}

function updateSingularity(state: GameState, dt: number): void {
  const sig = state.singularity;
  sig.radius += sig.growthRate * dt;
  sig.radius = Math.min(sig.maxRadius, sig.radius);
  sig.phase += dt * 0.002;

  for (const orb of state.orbs.values()) {
    if (!orb.alive) continue;
    if (isGhost(orb)) continue;

    const dx = sig.x - orb.x;
    const dy = sig.y - orb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < sig.pullRadius) {
      const force = sig.pullStrength * (1 - dist / sig.pullRadius);
      const nx = dx / dist;
      const ny = dy / dist;
      orb.x += nx * force * dt;
      orb.y += ny * force * dt;
    }

    if (dist < sig.radius) {
      if (!orb.isRemote) {
        orb.radius -= SINGULARITY_DAMAGE * dt;
        if (orb.radius < ORB_BASE_RADIUS * 0.5) {
          const wasPlayer = orb.id === state.playerId;
          killOrb(orb);
          state.killFeed.push({
            killer: "Singularity",
            victim: orb.name,
            time: Date.now(),
          });
          addNotification(state, `🌀 ${orb.name} was consumed by the Singularity`, "singularity");
          state.particles.push(...createDeathParticles(orb));
          if (!wasPlayer) {
            respawnAI(state, orb);
          }
        }
      }
    }
  }
}

function updateOrbs(state: GameState, dt: number): void {
  for (const orb of state.orbs.values()) {
    if (!orb.alive) continue;
    if (orb.isRemote) continue;

    // AI behavior for bots (not the player)
    if (orb.id !== state.playerId) {
      updateBotAI(orb, state, dt);
    }

    // Update orb position based on targetAngle
    updateOrb(orb, dt, orb.targetAngle, state.gameTime, state.mapWidth, state.mapHeight);

    if (isGhost(orb) && orb.radius > ORB_BASE_RADIUS) {
      orb.radius -= 0.01 * dt;
    }

    const now = Date.now();
    orb.activePowerUps = orb.activePowerUps.filter((p) => p.expiresAt > now);

    if (orb.eclipseMode) {
      orb.eclipseTimer -= dt;
      if (orb.eclipseTimer <= 0) {
        orb.eclipseMode = false;
      } else {
        orb.radius = Math.min(orb.radius + ECLIPSE_RADIUS_REGEN * dt, 120);
      }
    }

    if (orb.massPulseActive) {
      orb.massPulseRadius += dt * 2;
      if (orb.massPulseRadius >= MASS_PULSE_RADIUS) {
        orb.massPulseActive = false;
        orb.massPulseRadius = 0;
      }
    }
  }
}

function updateCollectParticles(state: GameState, dt: number): void {
  state.collectParticles = state.collectParticles
    .map((p) => ({
      ...p,
      x: p.x + ((p.targetX - p.x) * 8 * dt) / 16,
      y: p.y + ((p.targetY - p.y) * 8 * dt) / 16,
      life: p.life - dt,
      size: p.size * 0.97,
    }))
    .filter((p) => p.life > 0);
}

function updateParticles(state: GameState, dt: number): void {
  state.particles = state.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * 0.97,
      vy: p.vy * 0.97,
      life: p.life - dt,
      radius: p.radius * (p.life / p.maxLife),
      rotation: p.rotation + p.rotationSpeed * dt,
    }))
    .filter((p) => p.life > 0);
}

function checkCollisions(state: GameState, dt: number): void {
  const now = Date.now();
  const orbs = Array.from(state.orbs.values()).filter((o) => o.alive);

  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    if (!orb.alive) continue;
    if (orb.isRemote) continue;

    for (const food of [...state.food]) {
      if (checkFoodCollision(orb.x, orb.y, getOrbRadius(orb), food)) {
        // Apply difficulty-based food value multiplier
        const foodValueMult = getFoodValueMultiplier(state.difficulty);
        const growthMult = getGrowthMultiplier(state.difficulty);
        const adjustedValue = food.value * foodValueMult;
        orb.targetRadius += ORB_FOOD_GROWTH * adjustedValue * growthMult;
        orb.score += Math.round(adjustedValue * 10);
        state.food = state.food.filter((f) => f.id !== food.id);

        // Collection particles - more for special food types
        const particleCount = food.type === "normal" ? 4 : food.type === "plasma" ? 6 : 8;
        for (let j = 0; j < particleCount; j++) {
          const angle = (Math.PI * 2 * j) / particleCount;
          const dist = 5 + Math.random() * 10;
          state.collectParticles.push({
            x: food.x + Math.cos(angle) * dist,
            y: food.y + Math.sin(angle) * dist,
            targetX: orb.x,
            targetY: orb.y,
            life: 15 + Math.random() * 15,
            maxLife: 30,
            color: food.color,
            size: food.type === "normal" ? 2 + Math.random() * 2 : 3 + Math.random() * 3,
          });
        }

        // Score popup for special food
        if (food.type !== "normal") {
          state.screenShake = Math.max(state.screenShake, 2);
        }
      }
    }

    if (hasPowerUp(orb, "magnet")) {
      for (const food of state.food) {
        const dx = food.x - orb.x;
        const dy = food.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNET_RANGE && dist > 1) {
          const force = MAGNET_STRENGTH * (1 - dist / MAGNET_RANGE);
          food.x -= (dx / dist) * force * dt;
          food.y -= (dy / dist) * force * dt;
        }
      }
    }

    if (orb.massPulseActive) {
      for (const other of orbs) {
        if (other.id === orb.id || !other.alive) continue;
        const dx = other.x - orb.x;
        const dy = other.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < orb.massPulseRadius && dist > 1) {
          const force = MASS_PULSE_FORCE * (1 - dist / orb.massPulseRadius);
          other.x += (dx / dist) * force * dt;
          other.y += (dy / dist) * force * dt;
        }
      }
    }

    for (const pu of [...state.powerUps]) {
      if (checkPowerUpCollision(orb.x, orb.y, getOrbRadius(orb), pu)) {
        addPowerUp(orb, pu.type);
        state.powerUps = state.powerUps.filter((p) => p.id !== pu.id);

        // Power-up collection particles
        for (let j = 0; j < 12; j++) {
          const angle = (Math.PI * 2 * j) / 12;
          const speed = 2 + Math.random() * 3;
          state.collectParticles.push({
            x: pu.x + Math.cos(angle) * 10,
            y: pu.y + Math.sin(angle) * 10,
            targetX: orb.x,
            targetY: orb.y,
            life: 25 + Math.random() * 15,
            maxLife: 40,
            color: pu.type === "speed" ? "#60a5fa" : pu.type === "shield" ? "#f5d062" : pu.type === "ghost" ? "#c084fc" : "#fb923c",
            size: 3 + Math.random() * 2,
          });
        }

        // Notification for player
        if (orb.id === state.playerId) {
          const puNames: Record<string, string> = {
            speed: "SPEED BOOST",
            shield: "SHIELD",
            ghost: "GHOST MODE",
            glow: "GLOW",
            magnet: "MAGNET",
            shrink: "SHRINK",
            freeze: "FREEZE",
            rage: "RAGE MODE",
            phase: "PHASE SHIFT",
          };
          addNotification(state, `✨ ${puNames[pu.type] || pu.type.toUpperCase()} activated!`, "powerup");
        }
      }
    }

    for (const rift of state.cosmicRifts) {
      const dx = orb.x - rift.x;
      const dy = orb.y - rift.y;
      const cos = Math.cos(-rift.angle);
      const sin = Math.sin(-rift.angle);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;

      if (
        Math.abs(lx) < rift.width / 2 + getOrbRadius(orb) &&
        Math.abs(ly) < rift.height / 2 + getOrbRadius(orb)
      ) {
        if (!isInvincible(orb)) {
          orb.radius -= rift.damage * dt;
          if (orb.radius < ORB_BASE_RADIUS * 0.5) {
            const wasPlayer = orb.id === state.playerId;
            killOrb(orb);
            state.killFeed.push({
              killer: "Cosmic Rift",
              victim: orb.name,
              time: Date.now(),
            });
            addNotification(state, `⚡ ${orb.name} was torn apart by a rift`, "rift");
            state.particles.push(...createDeathParticles(orb));
            if (!wasPlayer) {
              respawnAI(state, orb);
            }
          }
        }
      }
    }

    for (const wh of state.wormholes) {
      if (!wh.active) continue;
      const dx = wh.x - orb.x;
      const dy = wh.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < wh.radius + getOrbRadius(orb)) {
        orb.x = wh.targetX;
        orb.y = wh.targetY;

        const partner = state.wormholes.find((w) => w.id === wh.partnerId);
        if (partner) {
          partner.cooldown = WORMHOLE_COOLDOWN;
          partner.active = false;
        }
        wh.cooldown = WORMHOLE_COOLDOWN;
        wh.active = false;
        break;
      }
    }

    for (let j = i + 1; j < orbs.length; j++) {
      const other = orbs[j];
      if (!other.alive) continue;
      if (isGhost(orb) || isGhost(other)) continue;

      const dx = other.x - orb.x;
      const dy = other.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = getOrbRadius(orb) + getOrbRadius(other);

      if (dist < minDist) {
        const r1 = getOrbRadius(orb);
        const r2 = getOrbRadius(other);

        if (r1 > r2 * 1.08 && !isInvincible(other)) {
          handleOrbKill(state, orb, other);
          other.alive = false;
          // Add momentum transfer on kill
          const killMomentum = 0.3;
          orb.vx += other.vx * killMomentum;
          orb.vy += other.vy * killMomentum;
        } else if (r2 > r1 * 1.08 && !isInvincible(orb)) {
          handleOrbKill(state, other, orb);
          orb.alive = false;
          break;
        } else {
          // Realistic bounce/collision physics
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          
          // Separate orbs based on relative size (bigger orbs push more)
          const totalRadius = r1 + r2;
          const ratio1 = r2 / totalRadius;
          const ratio2 = r1 / totalRadius;
          
          orb.x -= nx * overlap * ratio1 * 0.8;
          orb.y -= ny * overlap * ratio1 * 0.8;
          other.x += nx * overlap * ratio2 * 0.8;
          other.y += ny * overlap * ratio2 * 0.8;

          // Elastic collision - transfer velocity
          const relVx = orb.vx - other.vx;
          const relVy = orb.vy - other.vy;
          const relVn = relVx * nx + relVy * ny;
          
          if (relVn > 0) {
            const restitution = 0.7; // Bounciness
            const impulse = (1 + restitution) * relVn / (r1 + r2);
            
            orb.vx -= impulse * r2 * nx;
            orb.vy -= impulse * r2 * ny;
            other.vx += impulse * r1 * nx;
            other.vy += impulse * r1 * ny;
          }
          
          // Reduce speed on collision (energy loss)
          orb.vx *= 0.85;
          orb.vy *= 0.85;
          other.vx *= 0.85;
          other.vy *= 0.85;
        }
      }
    }
  }
}

function handleOrbKill(state: GameState, killer: Orb, victim: Orb): void {
  killer.kills++;
  killer.killStreak++;

  // Difficulty-based kill growth
  const killGrowthMult = getKillGrowthMultiplier(state.difficulty);
  killer.targetRadius = Math.min(120, killer.radius + victim.radius * killGrowthMult);

  // Kill streak bonuses
  const streakBonus = Math.min(killer.killStreak * 5, 50);
  killer.score += streakBonus;

  if (killer.killStreak >= ECLIPSE_KILLS_REQUIRED && !killer.eclipseMode) {
    killer.eclipseMode = true;
    killer.eclipseTimer = ECLIPSE_DURATION;
    killer.killStreak = 0;
    addNotification(state, `🌟 ${killer.name} entered ECLIPSE MODE!`, "eclipse");
  } else if (killer.killStreak === 2) {
    addNotification(state, `🔥 ${killer.name} is on a DOUBLE KILL!`, "kill");
  } else if (killer.killStreak === 3) {
    addNotification(state, `⚡ ${killer.name} is UNSTOPPABLE!`, "kill");
  } else if (killer.killStreak >= 5) {
    addNotification(state, `💀 ${killer.name} is GODLIKE! (${killer.killStreak} streak)`, "kill");
  }

  state.killFeed.push({
    killer: killer.name,
    victim: victim.name,
    time: Date.now(),
  });

  state.particles.push(...createDeathParticles(victim));

  // More dramatic kill food drop based on victim size
  const dropCount = Math.floor(KILL_FOOD_DROP_COUNT + victim.radius * 0.3);
  const killFood = createKillFood(
    victim.x,
    victim.y,
    dropCount,
    KILL_FOOD_VALUE
  );
  state.food.push(...killFood);

  state.screenShake = 15 + killer.killStreak * 2;

  // Always respawn the victim (whether killed by player or bot)
  if (!state.playerId || victim.id !== state.playerId) {
    respawnAI(state, victim);
  }
}

function respawnAI(state: GameState, victim: Orb): void {
  const orb = createOrb(victim.name, undefined, victim.skin.id, undefined, state.mapWidth, state.mapHeight);
  orb.score = Math.floor(Math.random() * 50);
  state.orbs.set(orb.id, orb);
}

function updateBotAI(bot: Orb, state: GameState, dt: number): void {
  if (!bot._ai) {
    // Initialize AI with personality traits
    bot._ai = {
      wanderAngle: Math.random() * Math.PI * 2,
      wanderTimer: 0,
      boostTimer: 0,
      targetX: bot.x,
      targetY: bot.y,
      aggression: 0.2 + Math.random() * 0.6,
      fearFactor: 0.2 + Math.random() * 0.6,
      lastKillTime: 0,
    };
  }

  const ai = bot._ai;
  ai.wanderTimer -= dt;

  // Scan environment
  let nearestThreat: Orb | null = null;
  let nearestThreatDist = Infinity;
  let nearestTarget: Orb | null = null;
  let nearestTargetDist = Infinity;
  let nearestFood: FoodParticle | null = null;
  let nearestFoodDist = Infinity;
  let nearestPowerUp: PowerUp | null = null;
  let nearestPowerUpDist = Infinity;
  let foodClusterX = 0, foodClusterY = 0, foodClusterCount = 0;
  let nearbyAllyCount = 0;

  const visionRange = 400 + bot.radius * 2;
  const now = Date.now();

  // Scan for threats, targets, and allies
  for (const other of state.orbs.values()) {
    if (!other.alive || other.id === bot.id) continue;
    const dx = other.x - bot.x;
    const dy = other.y - bot.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > visionRange) continue;

    const sizeRatio = other.radius / bot.radius;
    
    // Threat detection (bigger than us)
    if (sizeRatio > 1.12 && dist < nearestThreatDist) {
      nearestThreat = other;
      nearestThreatDist = dist;
    }
    
    // Target detection (smaller than us)
    if (sizeRatio < 0.88 && dist < nearestTargetDist) {
      nearestTarget = other;
      nearestTargetDist = dist;
    }
    
    // Ally detection (similar size, nearby)
    if (sizeRatio > 0.85 && sizeRatio < 1.15 && dist < 300) {
      nearbyAllyCount++;
    }
  }

  // Scan for food clusters
  for (const food of state.food) {
    const dx = food.x - bot.x;
    const dy = food.y - bot.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < visionRange * 0.5 && dist < nearestFoodDist) {
      nearestFood = food;
      nearestFoodDist = dist;
    }
    if (dist < 350) {
      foodClusterX += food.x;
      foodClusterY += food.y;
      foodClusterCount++;
    }
  }

  // Scan for power-ups
  for (const pu of state.powerUps) {
    const dx = pu.x - bot.x;
    const dy = pu.y - bot.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 250 && dist < nearestPowerUpDist) {
      nearestPowerUp = pu;
      nearestPowerUpDist = dist;
    }
  }

  // Calculate food cluster center
  if (foodClusterCount > 4) {
    foodClusterX /= foodClusterCount;
    foodClusterY /= foodClusterCount;
  }

  // Decision making with more natural behavior
  let targetAngle = ai.wanderAngle;
  let shouldBoost = false;
  const botSize = bot.radius;

  // Priority 1: Flee from threats (based on fearFactor and threat size)
  if (nearestThreat && nearestThreatDist < (200 + botSize * 2.5) * ai.fearFactor) {
    const threatSize = nearestThreat.radius / botSize;
    targetAngle = Math.atan2(bot.y - nearestThreat.y, bot.x - nearestThreat.x);
    // Add some randomness to flee direction (not perfectly away)
    targetAngle += (Math.random() - 0.5) * 0.4 * ai.fearFactor;
    // Boost if threat is much bigger or very close
    shouldBoost = nearestThreatDist < 100 + botSize || threatSize > 1.5;
  }
  // Priority 2: Hunt smaller orbs (based on aggression)
  else if (nearestTarget && nearestTargetDist < 300 * ai.aggression) {
    const targetSize = nearestTarget.radius;
    
    // Intercept course - predict where target is going
    if (nearestTargetDist < 250) {
      const predictTime = nearestTargetDist / (bot.speed * 60);
      const predictX = nearestTarget.x + nearestTarget.vx * predictTime * 0.6;
      const predictY = nearestTarget.y + nearestTarget.vy * predictTime * 0.6;
      targetAngle = Math.atan2(predictY - bot.y, predictX - bot.x);
    } else {
      targetAngle = Math.atan2(nearestTarget.y - bot.y, nearestTarget.x - bot.x);
    }
    
    // Only boost if close enough and we're significantly bigger
    shouldBoost = nearestTargetDist < 180 && botSize > targetSize * 1.35;
  }
  // Priority 3: Seek power-ups if small and power-up is close
  else if (nearestPowerUp && nearestPowerUpDist < 200 && botSize < 45) {
    targetAngle = Math.atan2(nearestPowerUp.y - bot.y, nearestPowerUp.x - bot.x);
    shouldBoost = nearestPowerUpDist < 120;
  }
  // Priority 4: Go to food clusters if available
  else if (foodClusterCount > 6) {
    targetAngle = Math.atan2(foodClusterY - bot.y, foodClusterX - bot.x);
  }
  // Priority 5: Go for nearest food
  else if (nearestFood && nearestFoodDist < 300) {
    targetAngle = Math.atan2(nearestFood.y - bot.y, nearestFood.x - bot.x);
  }
  // Priority 6: Wander with natural movement
  else {
    if (ai.wanderTimer <= 0) {
      // More natural direction changes
      ai.wanderAngle += (Math.random() - 0.5) * 1.0;
      ai.wanderTimer = 1.5 + Math.random() * 3;
    }
    targetAngle = ai.wanderAngle;
  }

  // Edge avoidance with smooth turning
  const edgeMargin = 280;
  let edgeForce = 0;
  if (bot.x < edgeMargin) {
    edgeForce = (edgeMargin - bot.x) / edgeMargin;
    targetAngle = targetAngle * (1 - edgeForce) + 0 * edgeForce;
  }
  if (bot.x > state.mapWidth - edgeMargin) {
    edgeForce = (bot.x - (state.mapWidth - edgeMargin)) / edgeMargin;
    targetAngle = targetAngle * (1 - edgeForce) + Math.PI * edgeForce;
  }
  if (bot.y < edgeMargin) {
    edgeForce = (edgeMargin - bot.y) / edgeMargin;
    targetAngle = targetAngle * (1 - edgeForce) + (Math.PI / 2) * edgeForce;
  }
  if (bot.y > state.mapHeight - edgeMargin) {
    edgeForce = (bot.y - (state.mapHeight - edgeMargin)) / edgeMargin;
    targetAngle = targetAngle * (1 - edgeForce) + (-Math.PI / 2) * edgeForce;
  }

  // Apply decisions
  bot.targetAngle = targetAngle;
  bot.isBoosting = shouldBoost && bot.radius > ORB_BOOST_MIN;
}

function updateFoodDrift(state: GameState, dt: number): void {
  // Natural food drift with subtle currents
  for (const food of state.food) {
    food.pulsePhase += dt * 0.001;
    
    // Multiple overlapping drift patterns for natural movement
    const drift1X = Math.sin(food.pulsePhase * 0.7 + food.x * 0.005) * 0.12;
    const drift1Y = Math.cos(food.pulsePhase * 0.5 + food.y * 0.005) * 0.12;
    const drift2X = Math.sin(food.pulsePhase * 1.3 + food.y * 0.003) * 0.06;
    const drift2Y = Math.cos(food.pulsePhase * 1.1 + food.x * 0.003) * 0.06;
    
    food.x += (drift1X + drift2X) * dt * 0.01;
    food.y += (drift1Y + drift2Y) * dt * 0.01;
    
    // Keep food in bounds with soft padding
    food.x = Math.max(15, Math.min(state.mapWidth - 15, food.x));
    food.y = Math.max(15, Math.min(state.mapHeight - 15, food.y));
  }

  // Food clustering - nearby food gently attracts each other (creates natural clusters)
  for (let i = 0; i < state.food.length; i++) {
    const f1 = state.food[i];
    for (let j = i + 1; j < Math.min(i + 15, state.food.length); j++) {
      const f2 = state.food[j];
      const dx = f2.x - f1.x;
      const dy = f2.y - f1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 60 && dist > 8) {
        const force = 0.00008 / dist;
        f1.x += dx * force * dt;
        f1.y += dy * force * dt;
        f2.x -= dx * force * dt;
        f2.y -= dy * force * dt;
      }
    }
  }
}

function spawnEntities(state: GameState, now: number): void {
  const maxFood = Math.floor(FOOD_COUNT * (state.mapWidth * state.mapHeight) / (10000 * 10000) * 1.5);
  
  // Spawn food in natural clusters
  if (now - state.lastFoodSpawn > FOOD_SPAWN_INTERVAL && state.food.length < maxFood) {
    // 70% chance to spawn in a cluster, 30% chance to spawn alone
    if (Math.random() < 0.7 && state.food.length < maxFood - 5) {
      // Spawn a cluster of 3-6 food particles
      const clusterSize = 3 + Math.floor(Math.random() * 4);
      const clusterX = Math.random() * state.mapWidth;
      const clusterY = Math.random() * state.mapHeight;
      const clusterRadius = 100 + Math.random() * 200;
      
      for (let i = 0; i < clusterSize && state.food.length < maxFood; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * clusterRadius;
        const food = createFood(state.mapWidth, state.mapHeight);
        food.x = clusterX + Math.cos(angle) * dist;
        food.y = clusterY + Math.sin(angle) * dist;
        food.x = Math.max(20, Math.min(state.mapWidth - 20, food.x));
        food.y = Math.max(20, Math.min(state.mapHeight - 20, food.y));
        state.food.push(food);
      }
    } else {
      // Spawn single food particle
      state.food.push(createFood(state.mapWidth, state.mapHeight));
    }
    state.lastFoodSpawn = now;
  }

  const maxPowerUps = Math.floor(POWERUP_COUNT * (state.mapWidth * state.mapHeight) / (10000 * 10000) * 1.5);
  if (now - state.lastPowerUpSpawn > POWERUP_SPAWN_INTERVAL && state.powerUps.length < maxPowerUps) {
    state.powerUps.push(createPowerUp(state.mapWidth, state.mapHeight));
    state.lastPowerUpSpawn = now;
  }

  // Refill dead bots to keep the map populated
  const aliveOrbs = Array.from(state.orbs.values()).filter((o) => o.alive && !o.isRemote);
  const diff = DIFFICULTIES.find((d) => d.id === state.difficulty) || DIFFICULTIES[1];
  const targetBotCount = diff.botCount;
  if (aliveOrbs.length < targetBotCount) {
    const deadBots = Array.from(state.orbs.values()).filter((o) => !o.alive && !o.isRemote && o.id !== state.playerId);
    for (const bot of deadBots) {
      respawnAI(state, bot);
      if (aliveOrbs.length + 1 >= targetBotCount) break;
    }
    // If still short, spawn fresh bots with random sizes
    const stillShort = Array.from(state.orbs.values()).filter((o) => o.alive && !o.isRemote).length;
    for (let i = stillShort; i < targetBotCount; i++) {
      const name = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
      const orb = createOrb(name, undefined, undefined, undefined, state.mapWidth, state.mapHeight);
      // Give new bots varied starting sizes
      orb.radius = ORB_BASE_RADIUS + Math.random() * 25;
      orb.targetRadius = orb.radius;
      orb.score = Math.floor(Math.random() * 150);
      orb.baseSpeed *= diff.speedMult;
      state.orbs.set(orb.id, orb);
    }
  }
}

function cleanupEntities(state: GameState, now: number): void {
  state.food = state.food.filter((f) => now - f.spawnTime < FOOD_DESPAWN_TIME);
  state.powerUps = state.powerUps.filter((p) => now - p.spawnTime < POWERUP_DESPAWN_TIME);
  state.storms = state.storms.filter((s) => s.lifetime > 0);
}

function addNotification(state: GameState, text: string, type: Notification["type"]): void {
  state.notifications.push({
    id: `notif-${Date.now()}-${Math.random()}`,
    text,
    type,
    time: Date.now(),
    duration: 3000,
  });
  if (state.notifications.length > 5) {
    state.notifications = state.notifications.slice(-5);
  }
}

export function createDeathParticles(orb: Orb): DeathParticle[] {
  const particles: DeathParticle[] = [];
  const colors = [orb.skin.bodyColor, orb.skin.glowColor, orb.skin.accentColor, "#ffffff", "#ffffff"];
  const particleCount = DEATH_PARTICLE_COUNT + Math.floor(orb.radius * 0.5);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = DEATH_PARTICLE_SPEED * (0.5 + Math.random() * 1.5);
    const type = (["circle", "spark", "ring", "shard"] as const)[
      Math.floor(Math.random() * 4)
    ];
    const size = type === "shard" ? 3 + Math.random() * 5 : 4 + Math.random() * 6;

    particles.push({
      x: orb.x + (Math.random() - 0.5) * orb.radius * 0.5,
      y: orb.y + (Math.random() - 0.5) * orb.radius * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: size,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: DEATH_PARTICLE_LIFE * (0.8 + Math.random() * 0.4),
      maxLife: DEATH_PARTICLE_LIFE,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      type,
    });
  }

  // Add a shockwave ring
  particles.push({
    x: orb.x,
    y: orb.y,
    vx: 0,
    vy: 0,
    radius: orb.radius * 2,
    color: orb.skin.bodyColor,
    life: 30,
    maxLife: 30,
    rotation: 0,
    rotationSpeed: 0,
    type: "ring",
  });

  return particles;
}

export function getLeaderboard(state: GameState): { id: string; name: string; score: number; radius: number; kills: number }[] {
  return Array.from(state.orbs.values())
    .filter((o) => o.alive)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      name: o.name,
      score: o.score,
      radius: o.radius,
      kills: o.kills,
    }));
}
