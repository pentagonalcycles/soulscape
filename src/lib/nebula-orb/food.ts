import { FoodParticle, Orb } from "./types";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  FOOD_RADIUS_MIN,
  FOOD_RADIUS_MAX,
  FOOD_VALUE_MIN,
  FOOD_VALUE_MAX,
} from "./constants";

let foodIdCounter = 0;

export function createFood(mapWidth?: number, mapHeight?: number): FoodParticle {
  const mw = mapWidth || MAP_WIDTH;
  const mh = mapHeight || MAP_HEIGHT;
  const types: FoodParticle["type"][] = ["normal", "normal", "normal", "plasma", "void", "solar", "cosmic", "nebula"];
  const type = types[Math.floor(Math.random() * types.length)];
  let color: string, glowColor: string;

  switch (type) {
    case "plasma": color = "#ef4444"; glowColor = "rgba(239, 68, 68, 0.6)"; break;
    case "void": color = "#00ff88"; glowColor = "rgba(0, 255, 136, 0.6)"; break;
    case "solar": color = "#fbbf24"; glowColor = "rgba(251, 191, 36, 0.6)"; break;
    case "cosmic": color = "#22d3ee"; glowColor = "rgba(34, 211, 238, 0.6)"; break;
    case "nebula": color = "#00cc6a"; glowColor = "rgba(0, 204, 106, 0.6)"; break;
    default: color = "#5eead4"; glowColor = "rgba(94, 234, 212, 0.4)";
  }

  foodIdCounter++;
  return {
    id: `food-${Date.now()}-${foodIdCounter}`,
    x: Math.random() * mw,
    y: Math.random() * mh,
    radius: FOOD_RADIUS_MIN + Math.random() * (FOOD_RADIUS_MAX - FOOD_RADIUS_MIN),
    color,
    glowColor,
    value: FOOD_VALUE_MIN + Math.random() * (FOOD_VALUE_MAX - FOOD_VALUE_MIN),
    spawnTime: Date.now(),
    type,
    pulsePhase: Math.random() * Math.PI * 2,
  };
}

export function createKillFood(orbOrX: Orb | number, countOrY: number, count?: number, value?: number): FoodParticle[] {
  let x: number, y: number, cnt: number, val: number;
  if (typeof orbOrX === "number" && typeof countOrY === "number" && count !== undefined && value !== undefined) {
    x = orbOrX;
    y = countOrY;
    cnt = count;
    val = value;
  } else {
    const orb = orbOrX as Orb;
    x = orb.x;
    y = orb.y;
    cnt = countOrY;
    val = 3;
  }

  const foods: FoodParticle[] = [];
  for (let i = 0; i < cnt; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 30;
    foodIdCounter++;
    foods.push({
      id: `kf-${Date.now()}-${foodIdCounter}`,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      radius: 3 + Math.random() * 3,
      color: "#5eead4",
      glowColor: "rgba(94, 234, 212, 0.6)",
      value: val,
      spawnTime: Date.now(),
      type: "normal",
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }
  return foods;
}

export function checkFoodCollision(orbOrX: Orb | number, foodOrY: FoodParticle | number, radiusOrFood?: number | FoodParticle, food?: FoodParticle): boolean {
  let x: number, y: number, r: number, f: FoodParticle;
  if (typeof orbOrX === "number" && typeof foodOrY === "number" && typeof radiusOrFood === "number" && food) {
    x = orbOrX;
    y = foodOrY;
    r = radiusOrFood;
    f = food;
  } else {
    const orb = orbOrX as Orb;
    f = foodOrY as FoodParticle;
    x = orb.x;
    y = orb.y;
    r = orb.radius;
  }
  const dx = x - f.x;
  const dy = y - f.y;
  return Math.sqrt(dx * dx + dy * dy) < r + f.radius;
}
