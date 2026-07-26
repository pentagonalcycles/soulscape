"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ElovayneLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo image — mask fades edges, screen blend removes black */}
      <motion.div
        className="relative w-40 h-40 md:w-52 md:h-52"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 70%)",
        }}
        animate={{
          filter: [
            "drop-shadow(0 0 15px rgba(157, 124, 216, 0.4))",
            "drop-shadow(0 0 30px rgba(157, 124, 216, 0.7))",
            "drop-shadow(0 0 15px rgba(157, 124, 216, 0.4))",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/logo.jpeg"
          alt="Elovayne"
          fill
          className="object-contain"
          style={{ mixBlendMode: "screen" }}
          priority
        />
      </motion.div>

      {/* Logo text */}
      <motion.h1
        className="font-heading text-4xl md:text-6xl lg:text-7xl font-light tracking-wider text-elovayne-light glow-text-strong"
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.15em" }}
        transition={{ duration: 2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        Elovayne
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="font-accent text-xl md:text-2xl text-elovayne-muted tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      >
        beyond reality
      </motion.p>
    </motion.div>
  );
}
