"use client";

import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <motion.div
        className="text-center z-10 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✦
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-heading text-elovayne-light mb-4 glow-text-strong">
          Something went wrong
        </h1>

        <p className="text-elovayne-muted/60 text-sm mb-8 max-w-md mx-auto">
          Something went wrong. Your journey continues shortly.
        </p>

        <button
          onClick={reset}
          className="px-8 py-3 rounded-xl font-medium text-sm tracking-wider uppercase
            bg-gradient-to-r from-elovayne-nebula to-elovayne-violet
            text-white border border-elovayne-violet/30
            hover:shadow-[0_0_30px_rgba(157,124,216,0.3)]
            transition-all duration-300"
        >
          Try again
        </button>
      </motion.div>
    </div>
  );
}
