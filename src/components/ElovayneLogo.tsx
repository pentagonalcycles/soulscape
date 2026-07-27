"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ElovayneLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo image — smoky halo, no heavy circle */}
      <motion.div
        className="relative w-36 h-36 md:w-44 md:h-44"
        animate={{
          filter: [
            "drop-shadow(0 0 20px rgba(180, 170, 210, 0.3)) drop-shadow(0 0 40px rgba(157, 124, 216, 0.15))",
            "drop-shadow(0 0 30px rgba(180, 170, 210, 0.5)) drop-shadow(0 0 60px rgba(157, 124, 216, 0.25))",
            "drop-shadow(0 0 20px rgba(180, 170, 210, 0.3)) drop-shadow(0 0 40px rgba(157, 124, 216, 0.15))",
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Smoky halo behind the symbol */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(157, 124, 216, 0.12) 0%, rgba(140, 130, 190, 0.06) 40%, transparent 70%)",
            filter: "blur(20px)",
            transform: "scale(1.6)",
          }}
        />
        <Image
          src="/logo.jpeg"
          alt="Elovayne"
          fill
          className="object-contain relative"
          style={{ mixBlendMode: "screen" }}
          priority
        />
      </motion.div>

      {/* Logo text with shimmer */}
      <motion.h1
        className="font-heading text-5xl md:text-7xl lg:text-8xl font-light tracking-wider text-elovayne-light glow-text-strong title-shimmer"
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.18em" }}
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
        where stardust whispers and souls remember
      </motion.p>
    </motion.div>
  );
}
