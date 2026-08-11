// Dream World — Weather Engine
// Manages dynamic weather states and provides configs for rendering

import type { WeatherType } from "./types";

export interface WeatherState {
  type: WeatherType;
  intensity: number;       // 0-1
  timeRemaining: number;   // seconds
  transitionProgress: number; // 0-1 for fade in/out
}

export interface WeatherParticleConfig {
  count: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  spread: number;       // horizontal spread
  gravity: number;      // vertical pull
  glow: boolean;
  trail: boolean;
}

const WEATHER_DURATIONS: Record<WeatherType, [number, number]> = {
  clear: [120, 300],
  stardust_rain: [60, 120],
  aurora: [90, 180],
  nebula_fog: [60, 150],
  meteor_shower: [30, 60],
};

const WEATHER_PARTICLES: Record<WeatherType, WeatherParticleConfig> = {
  clear: { count: 0, speed: 0, size: 0, color: "#ffffff", opacity: 0, spread: 0, gravity: 0, glow: false, trail: false },
  stardust_rain: { count: 300, speed: 3, size: 0.15, color: "#f5d062", opacity: 0.7, spread: 80, gravity: 4, glow: true, trail: true },
  aurora: { count: 0, speed: 0, size: 0, color: "#2dd4a8", opacity: 0, spread: 0, gravity: 0, glow: false, trail: false },
  nebula_fog: { count: 0, speed: 0, size: 0, color: "#9d7cd8", opacity: 0, spread: 0, gravity: 0, glow: false, trail: false },
  meteor_shower: { count: 12, speed: 40, size: 0.3, color: "#f5d062", opacity: 0.9, spread: 200, gravity: -2, glow: true, trail: true },
};

const WEATHER_SEQUENCE: WeatherType[] = ["clear", "stardust_rain", "clear", "aurora", "clear", "nebula_fog", "clear", "meteor_shower"];

export class WeatherEngine {
  private current: WeatherState;
  private sequenceIndex: number;
  private transitionSpeed: number = 0.5; // intensity per second

  constructor() {
    this.sequenceIndex = 0;
    this.current = {
      type: "clear",
      intensity: 0,
      timeRemaining: 180,
      transitionProgress: 1,
    };
  }

  update(dt: number): WeatherState {
    this.current.timeRemaining -= dt;

    // Transition in
    if (this.current.transitionProgress < 1) {
      this.current.transitionProgress = Math.min(1, this.current.transitionProgress + this.transitionSpeed * dt);
      this.current.intensity = this.current.transitionProgress;
    }

    // Transition out when time is nearly up
    if (this.current.timeRemaining <= 5 && this.current.transitionProgress > 0) {
      this.current.transitionProgress = Math.max(0, this.current.transitionProgress - this.transitionSpeed * dt * 2);
      this.current.intensity = this.current.transitionProgress;
    }

    // Switch to next weather
    if (this.current.timeRemaining <= 0) {
      this.sequenceIndex = (this.sequenceIndex + 1) % WEATHER_SEQUENCE.length;
      const nextType = WEATHER_SEQUENCE[this.sequenceIndex];
      const [minDur, maxDur] = WEATHER_DURATIONS[nextType];
      this.current = {
        type: nextType,
        intensity: 0,
        timeRemaining: minDur + Math.random() * (maxDur - minDur),
        transitionProgress: 0,
      };
    }

    return { ...this.current };
  }

  getParticleConfig(): WeatherParticleConfig {
    return WEATHER_PARTICLES[this.current.type];
  }

  getFogMultiplier(): number {
    switch (this.current.type) {
      case "nebula_fog": return 0.5 + this.current.intensity * 0.5;
      case "stardust_rain": return 0.8;
      default: return 1;
    }
  }

  getFogTint(): string | null {
    switch (this.current.type) {
      case "nebula_fog": return "#9d7cd8";
      case "stardust_rain": return "#f5d062";
      default: return null;
    }
  }

  getAmbientIntensity(): number {
    switch (this.current.type) {
      case "nebula_fog": return 0.3;
      case "stardust_rain": return 0.6;
      case "aurora": return 0.7;
      default: return 1;
    }
  }
}
