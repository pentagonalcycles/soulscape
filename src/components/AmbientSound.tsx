"use client";

import { useEffect, useRef, useCallback } from "react";

interface AmbientSoundProps {
  roomSlug: string;
  enabled: boolean;
  volume?: number;
}

interface RoomMelody {
  pad: { note: number; type: OscillatorType; gain: number }[];
  melody: number[];
  scale: number[];
  tempo: number;
  waveform: OscillatorType;
  filterFreq: number;
}

function noteToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// Musical scales (MIDI note numbers)
const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  whole: [0, 2, 4, 6, 8, 10],
};

function buildMelodyFromScale(root: number, scaleType: keyof typeof SCALES, octaveRange: number): number[] {
  const scale = SCALES[scaleType];
  const notes: number[] = [];
  for (let oct = 0; oct < octaveRange; oct++) {
    for (const interval of scale) {
      notes.push(root + interval + oct * 12);
    }
  }
  return notes;
}

const roomMelodies: Record<string, RoomMelody> = {
  sanctuary: {
    pad: [
      { note: 60, type: "sine", gain: 0.12 },
      { note: 64, type: "sine", gain: 0.08 },
      { note: 67, type: "sine", gain: 0.08 },
    ],
    melody: [72, 74, 76, 72, 71, 72, 74, 76, 79, 76, 74, 72],
    scale: SCALES.pentatonic,
    tempo: 2.5,
    waveform: "sine",
    filterFreq: 1200,
  },
  healing: {
    pad: [
      { note: 57, type: "sine", gain: 0.1 },
      { note: 60, type: "sine", gain: 0.07 },
      { note: 64, type: "triangle", gain: 0.06 },
    ],
    melody: [69, 72, 76, 74, 72, 69, 72, 74, 76, 74, 72, 69],
    scale: SCALES.major,
    tempo: 3,
    waveform: "sine",
    filterFreq: 900,
  },
  hope: {
    pad: [
      { note: 62, type: "sine", gain: 0.1 },
      { note: 66, type: "sine", gain: 0.07 },
      { note: 69, type: "triangle", gain: 0.05 },
    ],
    melody: [74, 78, 81, 78, 74, 73, 74, 78, 81, 83, 81, 78],
    scale: SCALES.lydian,
    tempo: 2.8,
    waveform: "triangle",
    filterFreq: 1400,
  },
  loneliness: {
    pad: [
      { note: 55, type: "sine", gain: 0.1 },
      { note: 58, type: "sine", gain: 0.06 },
    ],
    melody: [67, 65, 62, 60, 62, 65, 67, 65, 62, 60, 58, 60],
    scale: SCALES.minor,
    tempo: 4,
    waveform: "sine",
    filterFreq: 600,
  },
  grief: {
    pad: [
      { note: 55, type: "sine", gain: 0.11 },
      { note: 58, type: "sine", gain: 0.07 },
      { note: 62, type: "sine", gain: 0.05 },
    ],
    melody: [67, 65, 62, 60, 58, 60, 62, 65, 62, 60, 58, 55],
    scale: SCALES.aeolian,
    tempo: 4.5,
    waveform: "sine",
    filterFreq: 700,
  },
  creativity: {
    pad: [
      { note: 60, type: "triangle", gain: 0.09 },
      { note: 64, type: "sine", gain: 0.07 },
      { note: 67, type: "triangle", gain: 0.06 },
    ],
    melody: [72, 76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 76],
    scale: SCALES.whole,
    tempo: 2,
    waveform: "triangle",
    filterFreq: 1600,
  },
  love: {
    pad: [
      { note: 60, type: "sine", gain: 0.1 },
      { note: 64, type: "sine", gain: 0.07 },
      { note: 67, type: "sine", gain: 0.06 },
      { note: 72, type: "sine", gain: 0.04 },
    ],
    melody: [72, 76, 79, 84, 79, 76, 72, 74, 76, 79, 76, 74],
    scale: SCALES.major,
    tempo: 3,
    waveform: "sine",
    filterFreq: 1000,
  },
  anxiety: {
    pad: [
      { note: 58, type: "sine", gain: 0.08 },
      { note: 61, type: "sine", gain: 0.06 },
    ],
    melody: [66, 64, 61, 58, 61, 64, 66, 68, 66, 64, 61, 58],
    scale: SCALES.minor,
    tempo: 2.2,
    waveform: "sine",
    filterFreq: 800,
  },
  "new-beginnings": {
    pad: [
      { note: 60, type: "triangle", gain: 0.1 },
      { note: 64, type: "sine", gain: 0.07 },
      { note: 67, type: "triangle", gain: 0.05 },
    ],
    melody: [72, 76, 79, 84, 86, 84, 79, 76, 72, 74, 76, 79],
    scale: SCALES.mixolydian,
    tempo: 2.8,
    waveform: "triangle",
    filterFreq: 1300,
  },
  "self-discovery": {
    pad: [
      { note: 58, type: "sine", gain: 0.09 },
      { note: 62, type: "sine", gain: 0.07 },
      { note: 65, type: "triangle", gain: 0.05 },
    ],
    melody: [70, 74, 77, 82, 77, 74, 70, 72, 74, 77, 74, 72],
    scale: SCALES.dorian,
    tempo: 3.2,
    waveform: "sine",
    filterFreq: 900,
  },
  "small-wins": {
    pad: [
      { note: 62, type: "triangle", gain: 0.1 },
      { note: 66, type: "sine", gain: 0.07 },
      { note: 69, type: "triangle", gain: 0.05 },
    ],
    melody: [74, 78, 81, 86, 81, 78, 74, 76, 78, 81, 78, 76],
    scale: SCALES.major,
    tempo: 2.2,
    waveform: "triangle",
    filterFreq: 1200,
  },
  dreams: {
    pad: [
      { note: 57, type: "sine", gain: 0.1 },
      { note: 60, type: "sine", gain: 0.07 },
      { note: 64, type: "sine", gain: 0.05 },
    ],
    melody: [69, 72, 76, 81, 76, 72, 69, 71, 72, 76, 72, 71],
    scale: SCALES.pentatonic,
    tempo: 3.5,
    waveform: "sine",
    filterFreq: 800,
  },
  gratitude: {
    pad: [
      { note: 60, type: "sine", gain: 0.1 },
      { note: 64, type: "sine", gain: 0.08 },
      { note: 67, type: "triangle", gain: 0.05 },
    ],
    melody: [72, 76, 79, 84, 79, 76, 72, 74, 76, 79, 76, 74],
    scale: SCALES.lydian,
    tempo: 3,
    waveform: "sine",
    filterFreq: 1100,
  },
  "art-poetry": {
    pad: [
      { note: 60, type: "triangle", gain: 0.08 },
      { note: 63, type: "sine", gain: 0.06 },
      { note: 67, type: "triangle", gain: 0.05 },
    ],
    melody: [72, 75, 79, 84, 79, 75, 72, 74, 75, 79, 75, 74],
    scale: SCALES.minor,
    tempo: 2.8,
    waveform: "triangle",
    filterFreq: 1300,
  },
  breathe: {
    pad: [
      { note: 55, type: "sine", gain: 0.1 },
      { note: 59, type: "sine", gain: 0.07 },
    ],
    melody: [67, 64, 62, 60, 62, 64, 67, 64, 62, 60, 59, 60],
    scale: SCALES.pentatonic,
    tempo: 5,
    waveform: "sine",
    filterFreq: 600,
  },
};

export default function AmbientSound({ roomSlug, enabled, volume = 0.5 }: AmbientSoundProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    padOscs: OscillatorNode[];
    padGains: GainNode[];
    masterGain: GainNode;
    filter: BiquadFilterNode;
    melodyInterval: ReturnType<typeof setInterval> | null;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (nodesRef.current) {
      if (nodesRef.current.melodyInterval) {
        clearInterval(nodesRef.current.melodyInterval);
      }
      nodesRef.current.padOscs.forEach((osc) => {
        try { osc.stop(); } catch {}
      });
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

    const config = roomMelodies[roomSlug];
    if (!config) return;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = volume * 0.4;
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = config.filterFreq;
    filter.Q.value = 1;
    filter.connect(masterGain);

    // Create soft pad layer
    const padOscs: OscillatorNode[] = [];
    const padGains: GainNode[] = [];

    config.pad.forEach((p) => {
      const osc = audioCtx.createOscillator();
      osc.type = p.type;
      osc.frequency.value = noteToFreq(p.note);

      const gain = audioCtx.createGain();
      gain.gain.value = p.gain;

      osc.connect(gain);
      gain.connect(filter);
      osc.start();

      padOscs.push(osc);
      padGains.push(gain);
    });

    // Create reverb-like delay for depth
    const delay = audioCtx.createDelay(1);
    delay.delayTime.value = 0.4;
    const delayGain = audioCtx.createGain();
    delayGain.gain.value = 0.3;
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);

    // Melodic sequence player
    let melodyIndex = 0;
    const melodyOsc = audioCtx.createOscillator();
    melodyOsc.type = config.waveform;
    melodyOsc.frequency.value = noteToFreq(config.melody[0]);

    const melodyGain = audioCtx.createGain();
    melodyGain.gain.value = 0;

    const melodyFilter = audioCtx.createBiquadFilter();
    melodyFilter.type = "lowpass";
    melodyFilter.frequency.value = config.filterFreq * 0.8;
    melodyFilter.Q.value = 0.5;

    melodyOsc.connect(melodyGain);
    melodyGain.connect(melodyFilter);
    melodyFilter.connect(filter);
    melodyOsc.start();

    const playNote = () => {
      const now = audioCtx.currentTime;
      const noteTime = config.tempo;
      const fadeTime = noteTime * 0.3;

      const freq = noteToFreq(config.melody[melodyIndex]);
      melodyOsc.frequency.setValueAtTime(freq, now);

      // Soft attack
      melodyGain.gain.cancelScheduledValues(now);
      melodyGain.gain.setValueAtTime(0, now);
      melodyGain.gain.linearRampToValueAtTime(0.08, now + fadeTime);
      melodyGain.gain.linearRampToValueAtTime(0, now + noteTime);

      melodyIndex = (melodyIndex + 1) % config.melody.length;
    };

    playNote();
    const melodyInterval = setInterval(playNote, config.tempo * 1000);

    nodesRef.current = { padOscs, padGains, masterGain, filter, melodyInterval };

    return () => {
      cleanup();
    };
  }, [roomSlug, enabled, volume, cleanup]);

  useEffect(() => {
    if (nodesRef.current?.masterGain) {
      nodesRef.current.masterGain.gain.value = volume * 0.4;
    }
  }, [volume]);

  return null;
}
