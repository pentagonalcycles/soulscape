"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

export default function Home() {
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

      {/* Hero section — centered viewport */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <ElovayneLogo />

          {/* Description — tight group with logo */}
          <motion.div
            className="text-center max-w-md mt-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="font-body text-base md:text-lg text-elovayne-muted leading-relaxed">
              A quiet sanctuary for those who feel alone, unseen, or far from home.
            </p>
          </motion.div>

          {/* Portal */}
          <GlowingPortal />

          {/* Secondary action — more breathing room below portal */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <a
              href="#introduction"
              className="font-body text-sm text-elovayne-dim hover:text-elovayne-muted transition-all duration-300 tracking-wide inline-flex items-center gap-1.5 group"
            >
              drift deeper
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom text */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        >
          <p className="font-body text-sm text-elovayne-dim tracking-wide">
            for drifting souls who still believe in stardust
          </p>
        </motion.div>
      </section>

      {/* Introduction section — scrolled to by "Drift deeper" */}
      <section
        id="introduction"
        className="relative z-10 py-24 px-6"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-6">
              What is Elovayne?
            </h2>
            <p className="font-body text-lg text-elovayne-muted leading-relaxed mb-8">
              Elovayne is a quiet constellation where drifting souls gather to share
              feelings, stories, and creative whispers. It is a place to be heard
              without judgment, to connect through empathy, and to find comfort in
              knowing the stars above hold space for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="font-body text-base text-elovayne-dim leading-relaxed mb-10">
              No followers. No likes. No algorithms. Just stardust, silence, and the
              kind of connection that makes you feel less alone in the universe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/sanctuary"
              className="inline-block px-8 py-3 rounded-full font-heading text-sm tracking-wider text-elovayne-light transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(107, 63, 160, 0.6), rgba(157, 124, 216, 0.6))",
                boxShadow: "0 0 20px rgba(157, 124, 216, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 40px rgba(157, 124, 216, 0.4)";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(157, 124, 216, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Enter the Sanctuary
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
