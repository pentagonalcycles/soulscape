"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import SanctuaryFeed from "@/components/SanctuaryFeed";
import Navigation from "@/components/Navigation";

const dailyPrompts = [
  "What small warmth found you today, like sunlight through clouds?",
  "If your feelings had a color, what would they paint the sky right now?",
  "What would you whisper to someone feeling exactly what you feel?",
  "Describe a moment this week when the universe truly saw you.",
  "What's something you wish someone would ask you about?",
  "If you could send one message into the cosmos, what would it be?",
  "What does peace feel like in your body — where does it live?",
  "Write a letter to the version of you that exists tomorrow.",
  "What's a memory that always makes you feel warm, like holding sunlight?",
  "What would you create if you knew no one would judge it?",
  "What does 'home' mean to you today — is it a place or a feeling?",
  "What sound or song feels like a soft blanket for your soul?",
  "What's something you're holding onto that you could gently release?",
  "Describe the version of you that feels most free — what are they wearing?",
  "What do you need right now that you haven't asked the universe for?",
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
                  A gentle clearing in the cosmos where words find their way home
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
                Today&apos;s whisper from the void
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
