"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <ElovayneLogo />

          <motion.div
            className="text-center max-w-lg mt-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
              A dreamlike escape where you can breathe, create, and connect — without judgment or noise.
            </p>
          </motion.div>

          <GlowingPortal />
        </div>

      </section>

      {/* ABOUT SECTION */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto">

          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-3xl md:text-4xl mb-6" style={{ color: "var(--text-primary)", fontWeight: 300, letterSpacing: "0.02em" }}>
              What is Elovayne?
            </h2>
            <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
              An artistic community for real expression. No pressure, no performance — just space to be you.
            </p>
            <p className="text-sm mt-3" style={{ color: "var(--text-dim)" }}>
              No followers. No likes. No algorithms. Just you.
            </p>
          </motion.div>

          {/* Free banner */}
          <motion.div
            className="text-center mb-8 p-5 rounded-2xl"
            style={{ background: "rgba(0, 255, 136, 0.02)", border: "1px solid rgba(0, 255, 136, 0.05)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
              <strong style={{ color: "#00ff88", fontWeight: 500 }}>Free for everyone</strong>. Always. No ads. No tracking.
            </p>
          </motion.div>

          {/* Crisis support */}
          <motion.div
            className="text-center p-4 rounded-2xl"
            style={{ background: "rgba(236, 72, 153, 0.02)", border: "1px solid rgba(236, 72, 153, 0.06)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(224, 245, 232, 0.35)" }}>
              In crisis? Reach out — you are not alone.{" "}
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: "#00ff88", textDecoration: "none", borderBottom: "1px solid rgba(0, 255, 136, 0.2)" }}>
                findahelpline.com
              </a>
              {" "} · US: 988 · UK: 116 123
            </p>
          </motion.div>

          {/* Bottom links */}
          <div className="flex justify-center gap-8 mt-14">
            {["About", "FAQ", "Support"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-xs tracking-wider uppercase hover:opacity-50 transition-opacity duration-300"
                style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "10px", letterSpacing: "0.1em" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
