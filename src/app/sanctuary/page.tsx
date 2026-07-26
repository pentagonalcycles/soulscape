"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import SanctuaryFeed from "@/components/SanctuaryFeed";

export default function Sanctuary() {
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
              <Link href="/sanctuary" className="text-soulscape-light glow-text">
                Sanctuary
              </Link>
              <Link href="/rooms" className="text-soulscape-muted hover:text-soulscape-light transition-colors">
                Rooms
              </Link>
              <Link href="/journal" className="text-soulscape-muted hover:text-soulscape-light transition-colors">
                Journal
              </Link>
            </nav>
          </div>
        </motion.header>

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
              <h1 className="font-heading text-3xl md:text-4xl text-soulscape-light glow-text-strong mb-4">
                The Sanctuary
              </h1>
              <p className="font-accent text-xl text-soulscape-muted">
                A safe space for all expressions. Share your story, or simply listen.
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
