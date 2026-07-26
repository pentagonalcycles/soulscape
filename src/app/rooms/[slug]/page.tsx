"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";
import Starfield from "@/components/Starfield";
import SanctuaryFeed from "@/components/SanctuaryFeed";
import Navigation from "@/components/Navigation";
import AmbientSound from "@/components/AmbientSound";
import { useAuth } from "@/components/AuthProvider";

const rooms: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
    colors: { primary: string; secondary: string; glow: string; bg: string };
  }
> = {
  sanctuary: {
    name: "Sanctuary",
    description: "Where whispers gather and find their way home",
    icon: "🌌",
    colors: { primary: "#6b3fa0", secondary: "#9d7cd8", glow: "#e879a8", bg: "#0a0a2e" },
  },
  healing: {
    name: "Healing",
    description: "Where broken pieces learn to glow again",
    icon: "💚",
    colors: { primary: "#2dd4a8", secondary: "#5eead4", glow: "#99f6e4", bg: "#0a1a2e" },
  },
  hope: {
    name: "Hope",
    description: "A lantern lit in the darkest hour",
    icon: "✨",
    colors: { primary: "#f5d062", secondary: "#fbbf24", glow: "#fde68a", bg: "#1a1a2e" },
  },
  loneliness: {
    name: "Loneliness",
    description: "Even in the vast silence, you are not alone",
    icon: "🌙",
    colors: { primary: "#60a5fa", secondary: "#93c5fd", glow: "#bfdbfe", bg: "#0a0a2e" },
  },
  grief: {
    name: "Grief",
    description: "A soft place to sit with loss and find gentle company",
    icon: "🩶",
    colors: { primary: "#a78bfa", secondary: "#c4b5fd", glow: "#ddd6fe", bg: "#0f0f2e" },
  },
  creativity: {
    name: "Creativity",
    description: "Let your imagination bloom like stardust in motion",
    icon: "🎨",
    colors: { primary: "#f472b6", secondary: "#fb7185", glow: "#fda4af", bg: "#1a0a2e" },
  },
  love: {
    name: "Love",
    description: "Every form of love finds a home here",
    icon: "💗",
    colors: { primary: "#fb7185", secondary: "#fda4af", glow: "#fecdd3", bg: "#1a0a1e" },
  },
  anxiety: {
    name: "Anxiety",
    description: "Breathe. The stars are patient with you",
    icon: "🌊",
    colors: { primary: "#818cf8", secondary: "#a5b4fc", glow: "#c7d2fe", bg: "#0a0a2e" },
  },
  "new-beginnings": {
    name: "New Beginnings",
    description: "Every ending seeds a new constellation",
    icon: "🌅",
    colors: { primary: "#fb923c", secondary: "#fdba74", glow: "#fed7aa", bg: "#1a1a1e" },
  },
  "self-discovery": {
    name: "Self-Discovery",
    description: "Drift deeper into the galaxy of who you are",
    icon: "🔮",
    colors: { primary: "#c084fc", secondary: "#e879f6", glow: "#f0abfc", bg: "#1a0a2e" },
  },
  "small-wins": {
    name: "Small Wins",
    description: "Every glimmer of light deserves to be celebrated",
    icon: "🎉",
    colors: { primary: "#fbbf24", secondary: "#f59e0b", glow: "#fde68a", bg: "#1a1a0e" },
  },
  dreams: {
    name: "Dreams",
    description: "Share the visions that live behind your closed eyes",
    icon: "🌙",
    colors: { primary: "#818cf8", secondary: "#6366f1", glow: "#c7d2fe", bg: "#0a0a2e" },
  },
  gratitude: {
    name: "Gratitude",
    description: "The light that glows even in the deepest darkness",
    icon: "🙏",
    colors: { primary: "#f5d062", secondary: "#eab308", glow: "#fef3c7", bg: "#1a1a0e" },
  },
  "art-poetry": {
    name: "Art & Poetry",
    description: "Where words, colors, and sounds become the soul's language",
    icon: "🎭",
    colors: { primary: "#f472b6", secondary: "#ec4899", glow: "#fbcfe8", bg: "#1a0a1e" },
  },
  breathe: {
    name: "A Place to Breathe",
    description: "A quiet space where nothing needs to be proven",
    icon: "🫧",
    colors: { primary: "#5eead4", secondary: "#2dd4bf", glow: "#99f6e4", bg: "#0a1a1e" },
  },
};

export default function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const room = rooms[slug];
  const { userPreferences } = useAuth();

  if (!room) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-elovayne-light mb-4">
            This constellation does not exist yet
          </h1>
          <Link href="/rooms" className="text-elovayne-violet hover:underline">
            Return to the rooms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Room-specific nebula with tinted colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${room.colors.primary}99 0%, ${room.colors.secondary}4d 40%, transparent 70%)`,
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${room.colors.glow}80 0%, ${room.colors.primary}4d 40%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Starfield />

      <AmbientSound
        roomSlug={slug}
        enabled={userPreferences.ambient_sound}
        volume={userPreferences.sound_volume}
      />

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
        <Navigation activePage="rooms" />

        {/* Main content */}
        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            {/* Room title */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-5xl mb-4 block">{room.icon}</span>
              <h1
                className="font-heading text-3xl md:text-4xl mb-4"
                style={{
                  color: room.colors.primary,
                  textShadow: `0 0 20px ${room.colors.glow}66, 0 0 40px ${room.colors.primary}33`,
                }}
              >
                {room.name}
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                {room.description}
              </p>
            </motion.div>

            {/* Feed */}
            <SanctuaryFeed roomId={slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
