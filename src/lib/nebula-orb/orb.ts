import {
  ORB_BASE_RADIUS,
  ORB_BASE_SPEED,
  ORB_BOOST_SPEED,
  ORB_BOOST_SHRINK,
  ORB_BOOST_MIN,
  ORB_MIN_RADIUS,
  ORB_FOOD_GROWTH,
  ORB_SPEED_ACCELERATION,
  ORB_SPEED_FRICTION,
  ORB_FRICTION,
  ORB_MAX_RADIUS,
  SKIN_DEFINITIONS,
  POWERUP_DURATION_SPEED,
  POWERUP_DURATION_SHIELD,
  POWERUP_DURATION_GHOST,
  POWERUP_DURATION_GLOW,
  POWERUP_DURATION_MAGNET,
  POWERUP_DURATION_SHRINK,
  SPAWN_INVINCIBILITY_DURATION,
  MAGNET_RANGE,
  SHRINK_RADIUS_RATIO,
  SHRINK_SPEED_MULTIPLIER,
  ECLIPSE_SPEED_MULTIPLIER,
  MASS_PULSE_COOLDOWN,
  TRAIL_DOT_COUNT,
  TRAIL_LIFETIME,
  ORB_COLORS,
} from "./constants";
import { Orb, ActivePowerUp, PowerUpType, TrailDot, OrbCustomization } from "./types";

const DEFAULT_CUSTOMIZATION: OrbCustomization = {
  petStyle: "nova",
  bodyPattern: "circuit",
  trailStyle: "dots",
};

let orbIdCounter = 0;

export function createOrb(
  name: string,
  colorIndex?: number,
  skinId?: string,
  customization?: OrbCustomization,
  mapWidth?: number,
  mapHeight?: number,
): Orb {
  const skin =
    SKIN_DEFINITIONS.find((s) => s.id === skinId) ||
    SKIN_DEFINITIONS[orbIdCounter % SKIN_DEFINITIONS.length];
  const ci = (colorIndex ?? orbIdCounter) % ORB_COLORS.length;
  const colors = ORB_COLORS[ci];
  const mw = mapWidth || 10000;
  const mh = mapHeight || 10000;
  orbIdCounter++;

  return {
    id: `orb-${Date.now()}-${orbIdCounter}`,
    name,
    x: Math.random() * (mw - 500) + 250,
    y: Math.random() * (mh - 500) + 250,
    vx: 0,
    vy: 0,
    radius: ORB_BASE_RADIUS,
    targetRadius: ORB_BASE_RADIUS,
    speed: ORB_BASE_SPEED,
    targetSpeed: ORB_BASE_SPEED,
    baseSpeed: ORB_BASE_SPEED,
    boostSpeed: ORB_BOOST_SPEED,
    isBoosting: false,
    score: 0,
    kills: 0,
    killStreak: 0,
    eclipseMode: false,
    eclipseTimer: 0,
    color: colors.body,
    glowColor: colors.glow,
    skin,
    alive: true,
    spawnTime: Date.now(),
    invincibleUntil: Date.now() + SPAWN_INVINCIBILITY_DURATION,
    activePowerUps: [],
    lastUpdate: Date.now(),
    pulseTimer: 0,
    massPulseActive: false,
    massPulseRadius: 0,
    trail: [],
    wobble: 0,
    targetAngle: 0,
    customization: customization || DEFAULT_CUSTOMIZATION,
  };
}

export function updateOrb(
  orb: Orb,
  dt: number,
  targetAngle: number,
  gameTime: number,
  mapWidth?: number,
  mapHeight?: number,
): void {
  if (!orb.alive) return;

  const now = Date.now();
  const mw = mapWidth || 10000;
  const mh = mapHeight || 10000;

  // Calculate speed with more natural acceleration
  let desiredSpeed = orb.baseSpeed;
  if (orb.isBoosting && orb.radius > ORB_BOOST_MIN) {
    desiredSpeed = orb.boostSpeed;
    orb.radius = Math.max(ORB_BOOST_MIN, orb.radius - ORB_BOOST_SHRINK * dt);
  }
  if (hasPowerUp(orb, "speed")) desiredSpeed *= 1.5;
  if (orb.eclipseMode) desiredSpeed *= ECLIPSE_SPEED_MULTIPLIER;
  if (hasPowerUp(orb, "shrink")) desiredSpeed *= SHRINK_SPEED_MULTIPLIER;

  // Smooth speed changes (lerp toward desired speed)
  orb.targetSpeed = desiredSpeed;
  const speedLerp = orb.isBoosting ? 0.12 : 0.08;
  orb.speed += (orb.targetSpeed - orb.speed) * speedLerp * dt * 0.06;

  // Calculate desired velocity from target angle
  const desiredVx = Math.cos(targetAngle) * orb.speed;
  const desiredVy = Math.sin(targetAngle) * orb.speed;

  // Smooth direction changes (momentum-based)
  const turnSpeed = orb.isBoosting ? 0.04 : 0.06;
  orb.vx += (desiredVx - orb.vx) * turnSpeed * dt * 0.06;
  orb.vy += (desiredVy - orb.vy) * turnSpeed * dt * 0.06;

  // Apply friction/drag (makes movement feel more natural)
  const friction = orb.isBoosting ? 0.98 : 0.96;
  orb.vx *= friction;
  orb.vy *= friction;

  // Apply velocity
  orb.x += orb.vx * dt * 0.06;
  orb.y += orb.vy * dt * 0.06;

  // Update targetAngle to match actual movement direction (for rendering)
  if (Math.abs(orb.vx) > 0.01 || Math.abs(orb.vy) > 0.01) {
    orb.targetAngle = Math.atan2(orb.vy, orb.vx);
  }

  // Clamp to map bounds
  orb.x = Math.max(orb.radius, Math.min(mw - orb.radius, orb.x));
  orb.y = Math.max(orb.radius, Math.min(mh - orb.radius, orb.y));

  // Glow power-up growth
  if (hasPowerUp(orb, "glow")) {
    orb.radius = Math.min(orb.radius + 0.005 * dt, ORB_MAX_RADIUS);
  }

  // Smooth radius interpolation
  orb.radius += (orb.targetRadius - orb.radius) * 0.1;
  orb.radius = Math.min(ORB_MAX_RADIUS, orb.radius);
  orb.radius = Math.max(ORB_MIN_RADIUS, orb.radius);
  orb.targetRadius = Math.max(ORB_MIN_RADIUS, orb.targetRadius);

  orb.wobble += dt * 0.003;

  updateTrail(orb, dt, gameTime);
}

export function growOrb(orb: Orb, value: number): void {
  orb.targetRadius += ORB_FOOD_GROWTH * value;
  orb.score += Math.round(value * 10);
}

export function killOrb(orb: Orb): void {
  orb.alive = false;
}

export function getHeadPosition(orb: Orb): { x: number; y: number } {
  return { x: orb.x, y: orb.y };
}

export function getOrbRadius(orb: Orb): number {
  return orb.radius;
}

export function addPowerUp(orb: Orb, type: PowerUpType): void {
  const now = Date.now();
  orb.activePowerUps = orb.activePowerUps.filter((p) => p.expiresAt > now);

  const existing = orb.activePowerUps.find((p) => p.type === type);
  if (existing) {
    existing.expiresAt += getPowerUpDuration(type);
  } else {
    orb.activePowerUps.push({
      type,
      expiresAt: now + getPowerUpDuration(type),
    });
  }
}

export function hasPowerUp(orb: Orb, type: PowerUpType): boolean {
  return orb.activePowerUps.some(
    (p) => p.type === type && p.expiresAt > Date.now()
  );
}

export function isInvincible(orb: Orb): boolean {
  return Date.now() < orb.invincibleUntil || hasPowerUp(orb, "shield");
}

export function isGhost(orb: Orb): boolean {
  return hasPowerUp(orb, "ghost");
}

function getPowerUpDuration(type: PowerUpType): number {
  switch (type) {
    case "speed":
      return POWERUP_DURATION_SPEED;
    case "shield":
      return POWERUP_DURATION_SHIELD;
    case "ghost":
      return POWERUP_DURATION_GHOST;
    case "glow":
      return POWERUP_DURATION_GLOW;
    case "magnet":
      return POWERUP_DURATION_MAGNET;
    case "shrink":
      return POWERUP_DURATION_SHRINK;
    case "freeze":
      return 5000;
    case "rage":
      return 6000;
    case "phase":
      return 4000;
    default:
      return 5000;
  }
}

function updateTrail(orb: Orb, dt: number, gameTime: number): void {
  if (orb.isBoosting) {
    for (let i = 0; i < TRAIL_DOT_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = orb.radius * (0.3 + Math.random() * 0.5);
      orb.trail.push({
        x: orb.x + Math.cos(angle) * dist,
        y: orb.y + Math.sin(angle) * dist,
        radius: 1 + Math.random() * 2,
        life: TRAIL_LIFETIME,
        maxLife: TRAIL_LIFETIME,
        color: orb.skin.glowColor,
      });
    }
  }

  orb.trail = orb.trail
    .map((t) => ({
      ...t,
      life: t.life - dt,
      y: t.y - dt * 0.03,
      radius: t.radius * 0.99,
    }))
    .filter((t) => t.life > 0);
}
