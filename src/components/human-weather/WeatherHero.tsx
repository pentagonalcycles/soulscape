"use client";

import { motion } from "framer-motion";
import { EmotionStat, getEmotionById, getDominantEmotion } from "./emotions";

interface WeatherHeroProps {
  stats: EmotionStat[];
  locationLabel: string;
}

export default function WeatherHero({ stats, locationLabel }: WeatherHeroProps) {
  const dominant = getDominantEmotion(stats);
  const emotion = dominant ? getEmotionById(dominant.emotion) : null;

  if (!dominant || !emotion) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-6xl mb-6">🌤️</div>
        <h2
          className="text-2xl sm:text-3xl mb-3"
          style={{
            fontWeight: 300,
            letterSpacing: "0.02em",
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          No weather data yet
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
          Be the first to report the human weather.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-center py-8 sm:py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Location */}
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>
        {locationLabel}
      </p>
      <p className="text-[11px] mb-6" style={{ color: "var(--text-faint)" }}>
        Right Now
      </p>

      {/* Dominant emotion */}
      <motion.div
        key={dominant.emotion}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-4"
      >
        <motion.div
          className="text-7xl sm:text-8xl mb-4"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {emotion.emoji}
        </motion.div>
        <motion.div
          className="text-5xl sm:text-6xl font-light mb-2"
          style={{ color: emotion.color, letterSpacing: "0.02em" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {dominant.percentage}%
        </motion.div>
        <div
          className="text-lg sm:text-xl uppercase tracking-widest"
          style={{ color: "var(--text-secondary)", fontWeight: 300 }}
        >
          {emotion.label}
        </div>
      </motion.div>

      <motion.p
        className="text-sm mt-4"
        style={{ color: "var(--text-muted)", fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {getDominantDescription(dominant.emotion, dominant.percentage)}
      </motion.p>
    </motion.div>
  );
}

function getDominantDescription(emotion: string, percentage: number): string {
  const descriptions: Record<string, string[]> = {
    happy: [
      "Happiness is currently the strongest emotion here.",
      "Joy is flowing through this community right now.",
      "A warm wave of happiness is in the air.",
    ],
    calm: [
      "A peaceful calm has settled over this space.",
      "Tranquility is the prevailing feeling right now.",
      "There is a gentle stillness in the air.",
    ],
    hopeful: [
      "Hope is quietly rising in hearts here.",
      "A gentle brightness is emerging.",
      "Hope glimmers in this moment.",
    ],
    loved: [
      "Love is the warmest presence right now.",
      "Hearts are open and connected.",
      "A tender warmth fills this space.",
    ],
    excited: [
      "Excitement is buzzing through this moment.",
      "Energy and anticipation are in the air.",
      "Something wonderful feels close.",
    ],
    energised: [
      "A vibrant energy is flowing here.",
      "People feel alive and full of purpose.",
      "There is a powerful momentum building.",
    ],
    tired: [
      "Many are resting and recharging.",
      "A gentle weariness has settled in.",
      "It is okay to slow down right now.",
    ],
    sad: [
      "Hearts are heavy but not alone.",
      "There is a quiet sorrow being shared.",
      "Sadness is present, and that is okay.",
    ],
    lonely: [
      "Many are feeling the weight of solitude.",
      "You are not alone in feeling alone.",
      "Connection is what this moment needs.",
    ],
    anxious: [
      "Worry is moving through many minds.",
      "A restless energy is present.",
      "Breathe. This feeling will pass.",
    ],
    overwhelmed: [
      "Many are carrying more than they can hold.",
      "It is okay to pause and breathe.",
      "You do not have to hold everything at once.",
    ],
    angry: [
      "A fire is burning in hearts here.",
      "Strong feelings are moving through.",
      "It is okay to feel. Let it move through you.",
    ],
    lost: [
      "Many are searching for direction.",
      "A fog has settled, but it will lift.",
      "Being lost is sometimes the first step to being found.",
    ],
    numb: [
      "A stillness has settled over hearts.",
      "Sometimes feeling nothing is its own kind of feeling.",
      "This too shall pass.",
    ],
    unnamed: [
      "There are feelings here that words cannot capture.",
      "Something unnamed is moving through.",
      "Not everything needs a name to be real.",
    ],
  };

  const options = descriptions[emotion] || descriptions.happy;
  const idx = Math.floor(percentage / 15) % options.length;
  return options[Math.min(idx, options.length - 1)];
}
