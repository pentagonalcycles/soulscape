"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <Nebula />
      <Starfield />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.span
            className="text-7xl block mb-6"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🌌
          </motion.span>

          <h1 className="font-heading text-6xl md:text-7xl text-elovayne-light glow-text-strong mb-4">
            You&apos;ve wandered beyond the edge of the map
          </h1>

          <p className="font-accent text-xl text-elovayne-muted mb-10 max-w-md mx-auto">
            This corner of the cosmos hasn&apos;t been mapped yet.
            But there are infinite constellations waiting for you.
          </p>

          <Link href="/sanctuary">
            <motion.span
              className="inline-block px-8 py-4 rounded-full font-heading text-lg tracking-wider text-elovayne-light cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 63, 160, 0.8), rgba(157, 124, 216, 0.8))",
                boxShadow: "0 0 30px rgba(157, 124, 216, 0.3)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 50px rgba(157, 124, 216, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  "0 0 30px rgba(157, 124, 216, 0.3)",
                  "0 0 50px rgba(157, 124, 216, 0.5)",
                  "0 0 30px rgba(157, 124, 216, 0.3)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              Drift back to the Sanctuary
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
