// Dream World — Animal AI System
// State machine, flocking, pathfinding for dream creatures

import type { Vec3 } from "./types";

export type AnimalState = "idle" | "wander" | "flee" | "sleep" | "approach" | "hunt" | "flock";

export interface AnimalAI {
  id: string;
  type: string;
  position: Vec3;
  velocity: Vec3;
  rotation: number;
  state: AnimalState;
  stateTimer: number;
  targetPosition: Vec3 | null;
  basePosition: Vec3;
  wanderRadius: number;
  speed: number;
  fleeDistance: number;
  sleepTime: [number, number]; // hour range for sleeping
  flockId: string | null;
  health: number;
  animPhase: number;
}

// Animal type configs
const ANIMAL_CONFIGS: Record<string, {
  speed: number;
  wanderRadius: number;
  fleeDistance: number;
  sleepTime: [number, number];
  isFlocking: boolean;
  isPredator: boolean;
  preyType?: string;
}> = {
  dream_fox: { speed: 2.5, wanderRadius: 20, fleeDistance: 8, sleepTime: [0, 6], isFlocking: false, isPredator: true, preyType: "star_bunny" },
  star_bunny: { speed: 3.5, wanderRadius: 15, fleeDistance: 12, sleepTime: [1, 5], isFlocking: false, isPredator: false },
  crystal_deer: { speed: 2, wanderRadius: 30, fleeDistance: 10, sleepTime: [0, 4], isFlocking: false, isPredator: false },
  glow_butterfly: { speed: 1.5, wanderRadius: 25, fleeDistance: 5, sleepTime: [0, 5], isFlocking: true, isPredator: false },
  void_cat: { speed: 3, wanderRadius: 20, fleeDistance: 6, sleepTime: [10, 16], isFlocking: false, isPredator: true, preyType: "glow_butterfly" },
  nebula_bird: { speed: 4, wanderRadius: 40, fleeDistance: 15, sleepTime: [0, 5], isFlocking: true, isPredator: false },
  moon_wolf: { speed: 3, wanderRadius: 35, fleeDistance: 5, sleepTime: [11, 15], isFlocking: false, isPredator: true, preyType: "crystal_deer" },
  star_dust_moth: { speed: 2, wanderRadius: 20, fleeDistance: 4, sleepTime: [6, 18], isFlocking: true, isPredator: false },
  aurora_bear: { speed: 1.5, wanderRadius: 25, fleeDistance: 4, sleepTime: [0, 8], isFlocking: false, isPredator: false },
  cosmic_rabbit: { speed: 4, wanderRadius: 12, fleeDistance: 14, sleepTime: [11, 15], isFlocking: false, isPredator: false },
};

export class AnimalAISystem {
  private animals: Map<string, AnimalAI> = new Map();
  private timeOfDay: number = 0.5; // 0-1

  setTimeOfDay(time: number) {
    this.timeOfDay = time;
  }

  addAnimal(id: string, type: string, position: Vec3): void {
    const config = ANIMAL_CONFIGS[type] || ANIMAL_CONFIGS.dream_fox;
    this.animals.set(id, {
      id,
      type,
      position: { ...position },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: Math.random() * Math.PI * 2,
      state: "idle",
      stateTimer: 2 + Math.random() * 4,
      targetPosition: null,
      basePosition: { ...position },
      wanderRadius: config.wanderRadius,
      speed: config.speed,
      fleeDistance: config.fleeDistance,
      sleepTime: config.sleepTime,
      flockId: config.isFlocking ? `flock_${type}` : null,
      health: 100,
      animPhase: Math.random() * Math.PI * 2,
    });
  }

  update(dt: number, playerPosition: Vec3): Map<string, AnimalAI> {
    const hour = this.timeOfDay * 24;

    for (const animal of this.animals.values()) {
      animal.animPhase += dt * 3;
      animal.stateTimer -= dt;

      const config = ANIMAL_CONFIGS[animal.type] || ANIMAL_CONFIGS.dream_fox;
      const distToPlayer = this.distance(animal.position, playerPosition);
      const isSleepHour = hour >= animal.sleepTime[0] && hour < animal.sleepTime[1];

      // State transitions
      if (animal.state !== "sleep" && isSleepHour && distToPlayer > animal.fleeDistance) {
        animal.state = "sleep";
        animal.stateTimer = 10 + Math.random() * 20;
        animal.velocity = { x: 0, y: 0, z: 0 };
        continue;
      }

      if (animal.state === "sleep" && !isSleepHour) {
        animal.state = "idle";
        animal.stateTimer = 1 + Math.random() * 2;
      }

      if (animal.state === "sleep") {
        animal.velocity = { x: 0, y: 0, z: 0 };
        continue;
      }

      // Flee from player
      if (distToPlayer < animal.fleeDistance && animal.state !== "flee") {
        animal.state = "flee";
        animal.stateTimer = 3 + Math.random() * 2;
        const dx = animal.position.x - playerPosition.x;
        const dz = animal.position.z - playerPosition.z;
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        animal.velocity = { x: (dx / len) * animal.speed * 2, y: 0, z: (dz / len) * animal.speed * 2 };
      }

      // Predator hunts prey
      if (config.isPredator && animal.state === "idle" && Math.random() < 0.01) {
        animal.state = "hunt";
        animal.stateTimer = 8;
      }

      // State behavior
      switch (animal.state) {
        case "idle":
          animal.velocity = { x: 0, y: 0, z: 0 };
          if (animal.stateTimer <= 0) {
            animal.state = "wander";
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * animal.wanderRadius;
            animal.targetPosition = {
              x: animal.basePosition.x + Math.cos(angle) * dist,
              y: animal.basePosition.y,
              z: animal.basePosition.z + Math.sin(angle) * dist,
            };
            animal.stateTimer = 5 + Math.random() * 10;
          }
          break;

        case "wander":
          if (animal.targetPosition) {
            const dx = animal.targetPosition.x - animal.position.x;
            const dz = animal.targetPosition.z - animal.position.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            if (len < 1 || animal.stateTimer <= 0) {
              animal.state = "idle";
              animal.stateTimer = 2 + Math.random() * 5;
              animal.velocity = { x: 0, y: 0, z: 0 };
            } else {
              animal.velocity = { x: (dx / len) * animal.speed, y: 0, z: (dz / len) * animal.speed };
              animal.rotation = Math.atan2(dx, dz);
            }
          }
          break;

        case "flee":
          if (animal.stateTimer <= 0 || distToPlayer > animal.fleeDistance * 2) {
            animal.state = "idle";
            animal.stateTimer = 3;
            animal.velocity = { x: 0, y: 0, z: 0 };
          }
          break;

        case "hunt":
          // Move toward random direction looking for prey
          if (animal.stateTimer <= 0) {
            animal.state = "idle";
            animal.stateTimer = 5;
          } else {
            const angle = animal.rotation + (Math.random() - 0.5) * 0.5;
            animal.velocity = { x: Math.sin(angle) * animal.speed * 1.5, y: 0, z: Math.cos(angle) * animal.speed * 1.5 };
            animal.rotation = angle;
          }
          break;

        case "approach":
          if (distToPlayer > animal.fleeDistance * 3) {
            animal.state = "idle";
            animal.stateTimer = 2;
          }
          break;
      }

      // Apply velocity
      animal.position.x += animal.velocity.x * dt;
      animal.position.y += animal.velocity.y * dt;
      animal.position.z += animal.velocity.z * dt;

      // Keep within wander radius of base
      const distFromBase = this.distance(animal.position, animal.basePosition);
      if (distFromBase > animal.wanderRadius * 1.5 && animal.state === "wander") {
        // Turn back toward base
        const dx = animal.basePosition.x - animal.position.x;
        const dz = animal.basePosition.z - animal.position.z;
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        animal.targetPosition = { ...animal.basePosition };
        animal.rotation = Math.atan2(dx, dz);
      }
    }

    return this.animals;
  }

  private distance(a: Vec3, b: Vec3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  getAnimals(): Map<string, AnimalAI> {
    return this.animals;
  }
}
