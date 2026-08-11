import { PowerUp, PowerUpType, Orb } from "./types";
import { POWERUP_RADIUS } from "./constants";

let powerUpIdCounter = 0;

export function createPowerUp(mapWidth: number, mapHeight: number): PowerUp {
  const types: PowerUpType[] = ["speed", "shield", "ghost", "glow", "magnet", "shrink", "freeze", "rage", "phase"];
  const type = types[Math.floor(Math.random() * types.length)];

  powerUpIdCounter++;
  return {
    id: `pu-${Date.now()}-${powerUpIdCounter}`,
    type,
    x: Math.random() * mapWidth,
    y: Math.random() * mapHeight,
    radius: POWERUP_RADIUS,
    spawnTime: Date.now(),
    pulsePhase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
  };
}

export function collectPowerUp(orb: Orb, powerUp: PowerUp): void {
  const { addPowerUp } = require("./orb");
  addPowerUp(orb, powerUp.type);
}

export function checkPowerUpCollision(orbOrX: Orb | number, puOrY: PowerUp | number, radiusOrPu?: number | PowerUp, pu?: PowerUp): boolean {
  let x: number, y: number, r: number, p: PowerUp;
  if (typeof orbOrX === "number" && typeof puOrY === "number" && typeof radiusOrPu === "number" && pu) {
    x = orbOrX;
    y = puOrY;
    r = radiusOrPu;
    p = pu;
  } else {
    const orb = orbOrX as Orb;
    p = puOrY as PowerUp;
    x = orb.x;
    y = orb.y;
    r = orb.radius;
  }
  const dx = x - p.x;
  const dy = y - p.y;
  return Math.sqrt(dx * dx + dy * dy) < r + p.radius;
}
