"use client";

import { useEffect, useRef, useCallback } from "react";

interface AmbientSoundProps {
  roomSlug: string;
  enabled: boolean;
  volume?: number;
}

interface SoundConfig {
  frequencies: number[];
  type: OscillatorType;
  gain: number;
  lfoRate: number;
  lfoDepth: number;
  filterFreq: number;
  filterQ: number;
}

const roomSounds: Record<string, SoundConfig> = {
  sanctuary: {
    frequencies: [110, 165, 220],
    type: "sine",
    gain: 0.08,
    lfoRate: 0.1,
    lfoDepth: 0.03,
    filterFreq: 800,
    filterQ: 1,
  },
  healing: {
    frequencies: [130.81, 196, 261.63],
    type: "sine",
    gain: 0.07,
    lfoRate: 0.08,
    lfoDepth: 0.04,
    filterFreq: 600,
    filterQ: 2,
  },
  hope: {
    frequencies: [146.83, 220, 293.66],
    type: "triangle",
    gain: 0.06,
    lfoRate: 0.12,
    lfoDepth: 0.02,
    filterFreq: 1000,
    filterQ: 1,
  },
  loneliness: {
    frequencies: [82.41, 110, 146.83],
    type: "sine",
    gain: 0.05,
    lfoRate: 0.05,
    lfoDepth: 0.02,
    filterFreq: 400,
    filterQ: 3,
  },
  grief: {
    frequencies: [98, 146.83, 196],
    type: "sine",
    gain: 0.06,
    lfoRate: 0.07,
    lfoDepth: 0.03,
    filterFreq: 500,
    filterQ: 2,
  },
  creativity: {
    frequencies: [164.81, 246.94, 329.63],
    type: "triangle",
    gain: 0.05,
    lfoRate: 0.15,
    lfoDepth: 0.03,
    filterFreq: 1200,
    filterQ: 1,
  },
  love: {
    frequencies: [130.81, 196, 261.63, 329.63],
    type: "sine",
    gain: 0.06,
    lfoRate: 0.09,
    lfoDepth: 0.025,
    filterFreq: 700,
    filterQ: 1.5,
  },
  anxiety: {
    frequencies: [110, 138.59, 164.81],
    type: "sawtooth",
    gain: 0.03,
    lfoRate: 0.2,
    lfoDepth: 0.02,
    filterFreq: 600,
    filterQ: 4,
  },
  "new-beginnings": {
    frequencies: [146.83, 220, 329.63],
    type: "triangle",
    gain: 0.06,
    lfoRate: 0.1,
    lfoDepth: 0.03,
    filterFreq: 900,
    filterQ: 1,
  },
  "self-discovery": {
    frequencies: [123.47, 185, 246.94, 311.13],
    type: "sine",
    gain: 0.05,
    lfoRate: 0.13,
    lfoDepth: 0.035,
    filterFreq: 750,
    filterQ: 2,
  },
};

export default function AmbientSound({ roomSlug, enabled, volume = 0.5 }: AmbientSoundProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ oscillators: OscillatorNode[]; gains: GainNode[]; lfo?: OscillatorNode; lfoGain?: GainNode; filter?: BiquadFilterNode; masterGain?: GainNode } | null>(null);

  const cleanup = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.oscillators.forEach((osc) => {
        try { osc.stop(); } catch {}
      });
      if (nodesRef.current.lfo) {
        try { nodesRef.current.lfo.stop(); } catch {}
      }
      nodesRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !roomSlug) {
      cleanup();
      return;
    }

    const config = roomSounds[roomSlug];
    if (!config) return;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = volume * config.gain;
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = config.filterFreq;
    filter.Q.value = config.filterQ;
    filter.connect(masterGain);

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    config.frequencies.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      osc.type = config.type;
      osc.frequency.value = freq;

      const oscGain = audioCtx.createGain();
      oscGain.gain.value = 0.5;

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();

      oscillators.push(osc);
      gains.push(oscGain);
    });

    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = config.lfoRate;

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = config.lfoDepth;

    lfo.connect(lfoGain);
    gains.forEach((g) => lfoGain.connect(g.gain));
    lfo.start();

    nodesRef.current = { oscillators, gains, lfo, lfoGain, filter, masterGain };

    return () => {
      cleanup();
    };
  }, [roomSlug, enabled, volume, cleanup]);

  useEffect(() => {
    if (nodesRef.current?.masterGain) {
      const config = roomSounds[roomSlug];
      if (config) {
        nodesRef.current.masterGain.gain.value = volume * config.gain;
      }
    }
  }, [volume, roomSlug]);

  return null;
}
