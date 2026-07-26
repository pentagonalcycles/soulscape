"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";

const rooms = [
  {
    name: "Sanctuary",
    slug: "sanctuary",
    description: "A safe space for all expressions",
    icon: "🌌",
    colors: { primary: "#6b3fa0", secondary: "#9d7cd8", glow: "#e879a8" },
  },
  {
    name: "Healing",
    slug: "healing",
    description: "A room for those on the path to healing",
    icon: "💚",
    colors: { primary: "#2dd4a8", secondary: "#5eead4", glow: "#99f6e4" },
  },
  {
    name: "Hope",
    slug: "hope",
    description: "A room for those seeking and sharing hope",
    icon: "✨",
    colors: { primary: "#f5d062", secondary: "#fbbf24", glow: "#fde68a" },
  },
  {
    name: "Loneliness",
    slug: "loneliness",
    description: "You are not alone here",
    icon: "🌙",
    colors: { primary: "#60a5fa", secondary: "#93c5fd", glow: "#bfdbfe" },
  },
  {
    name: "Grief",
    slug: "grief",
    description: "A space to sit with loss and find gentle company",
    icon: "🩶",
    colors: { primary: "#a78bfa", secondary: "#c4b5fd", glow: "#ddd6fe" },
  },
  {
    name: "Creativity",
    slug: "creativity",
    description: "Let your imagination flow freely",
    icon: "🎨",
    colors: { primary: "#f472b6", secondary: "#fb7185", glow: "#fda4af" },
  },
  {
    name: "Love",
    slug: "love",
    description: "A room for all forms of love",
    icon: "💗",
    colors: { primary: "#fb7185", secondary: "#fda4af", glow: "#fecdd3" },
  },
  {
    name: "Anxiety",
    slug: "anxiety",
    description: "Breathe. You are safe here",
    icon: "🌊",
    colors: { primary: "#818cf8", secondary: "#a5b4fc", glow: "#c7d2fe" },
  },
  {
    name: "New Beginnings",
    slug: "new-beginnings",
    description: "Every ending is a new beginning",
    icon: "🌅",
    colors: { primary: "#fb923c", secondary: "#fdba74", glow: "#fed7aa" },
  },
  {
    name: "Self-Discovery",
    slug: "self-discovery",
    description: "Explore the depths of who you are",
    icon: "🔮",
    colors: { primary: "#c084fc", secondary: "#e879f6", glow: "#f0abfc" },
  },
];

export default function Rooms() {
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
        {/* Header */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 glass"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-heading text-2xl text-soulscape-light glow-text">
              Soulscape
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/sanctuary" className="text-soulscape-muted hover:text-soulscape-light transition-colors">
                Sanctuary
              </Link>
              <span className="text-soulscape-light glow-text">
                Rooms
              </span>
              <Link href="/journal" className="text-soulscape-muted hover:text-soulscape-light transition-colors">
                Journal
              </Link>
            </nav>
          </div>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-3xl md:text-4xl text-soulscape-light glow-text-strong mb-4">
                Emotional Rooms
              </h2>
              <p className="font-accent text-xl text-soulscape-muted">
                Each room is a world of its own. Enter where your heart leads.
              </p>
            </motion.div>

            {/* Room grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="block glass rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                    style={{
                      boxShadow: `0 0 20px ${room.colors.glow}20`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{room.icon}</span>
                      <div>
                        <h3
                          className="font-heading text-xl text-soulscape-light mb-1 group-hover:glow-text transition-all"
                          style={{
                            color: room.colors.primary,
                          }}
                        >
                          {room.name}
                        </h3>
                        <p className="text-soulscape-muted text-sm">
                          {room.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
