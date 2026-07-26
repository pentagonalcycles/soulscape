"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
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
      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 px-6">
        {/* Logo */}
        <ElovayneLogo />

        {/* Description */}
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="font-body text-lg md:text-xl text-elovayne-muted leading-relaxed">
            A quiet community for sharing feelings, stories and creative expressions
            with people who understand.
          </p>
        </motion.div>

        {/* Portal */}
        <GlowingPortal />

        {/* Secondary action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Link
            href="/about"
            className="font-body text-sm text-elovayne-dim hover:text-elovayne-muted transition-colors tracking-wide"
          >
            How Elovayne works →
          </Link>
        </motion.div>

        {/* Bottom text */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        >
          <p className="font-body text-sm text-elovayne-dim tracking-wide">
            An artistic community for those who seek something more
          </p>
        </motion.div>
      </div>
    </main>
  );
}
