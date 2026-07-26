"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import SanctuaryFeed from "@/components/SanctuaryFeed";
import Navigation from "@/components/Navigation";

const dailyPrompts = [
  "What's one small thing that brought you comfort today?",
  "If your feelings had a color, what would they be right now?",
  "What would you say to someone feeling exactly what you feel?",
  "Describe a moment this week when you felt truly seen.",
  "What's something you wish someone would ask you about?",
  "If you could whisper one thing to the universe, what would it be?",
  "What does peace feel like in your body?",
  "Write a letter to your future self.",
  "What's a memory that always makes you feel warm?",
  "What would you create if you knew no one would judge it?",
  "What does 'home' mean to you today?",
  "What sound or song feels like comfort?",
  "What's something you're holding onto that you could let go?",
  "Describe the version of you that feels most free.",
  "What do you need right now that you haven't asked for?",
];

function getDailyPrompt() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyPrompts[dayOfYear % dailyPrompts.length];
}

export default function Sanctuary() {
  const [prompt] = useState(getDailyPrompt);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <Nebula />
      <Starfield />

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="sanctuary" />

        {/* Main content */}
        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            {/* Page title */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                The Sanctuary
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                A safe space for all expressions. Share your story, or simply listen.
              </p>
            </motion.div>

            {/* Daily prompt */}
            <motion.div
              className="glass rounded-2xl p-6 mb-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-elovayne-dim text-xs font-body uppercase tracking-wider mb-2">
                Today&apos;s gentle prompt
              </p>
              <p className="text-elovayne-muted font-accent text-lg">
                {prompt}
              </p>
            </motion.div>

            {/* Feed */}
            <SanctuaryFeed />
          </div>
        </div>
      </div>
    </main>
  );
}
