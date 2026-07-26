"use client";

import { motion } from "framer-motion";
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
      <div className="relative z-10 flex flex-col items-center gap-12 md:gap-16 px-6">
        {/* Logo */}
        <ElovayneLogo />

        {/* Portal */}
        <GlowingPortal />

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
