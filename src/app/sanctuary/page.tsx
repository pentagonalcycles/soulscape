"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import SanctuaryFeed from "@/components/SanctuaryFeed";
import Navigation from "@/components/Navigation";

const dailyPrompts = [
  "Describe the version of you that feels most free. Who are they becoming?",
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
        <div className="flex-1 pt-28 pb-16 px-4 sm:px-6">
          <div className="sanctuary-content mx-auto">
            {/* Darker overlay behind content for readability */}
            <div className="relative">
              <div
                className="absolute inset-0 -mx-4 sm:-mx-8 -my-8 rounded-3xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(5, 5, 16, 0.3) 0%, transparent 70%)",
                }}
              />

              {/* Page title */}
              <motion.div
                className="text-center mb-10 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <h1 className="font-heading text-4xl md:text-5xl text-elovayne-light sanctuary-title-glow mb-4">
                  The Sanctuary
                </h1>
                <p className="font-body text-base sm:text-lg text-elovayne-muted max-w-lg mx-auto leading-relaxed">
                  A gentle clearing in the cosmos where every voice may exist without judgement.
                </p>
              </motion.div>

              {/* Daily prompt card */}
              <motion.div
                className="rounded-2xl sanctuary-glass-card p-5 sm:p-6 mb-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Subtle shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-elovayne-violet/5 to-transparent pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-elovayne-violet/10 flex items-center justify-center">
                    <span className="text-lg">✧</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-body uppercase tracking-[0.15em] text-elovayne-gold/70 mb-1.5">
                      Today&apos;s Whisper
                    </p>
                    <p className="font-body text-sm sm:text-base text-elovayne-muted leading-relaxed italic">
                      {prompt}
                    </p>
                  </div>
                  <motion.button
                    className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-body text-elovayne-light border border-elovayne-violet/20 hover:border-elovayne-violet/40 hover:bg-elovayne-violet/10 transition-all duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const el = document.querySelector("[aria-label='Open whisper composer']") as HTMLElement;
                      el?.click();
                    }}
                    aria-label="Answer this whisper"
                  >
                    Answer this whisper
                  </motion.button>
                </div>
              </motion.div>

              {/* Feed */}
              <SanctuaryFeed />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
