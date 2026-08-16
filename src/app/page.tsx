"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 tech-grid">
        {/* Background floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ top: "10%", left: "10%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ top: "60%", right: "15%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -15, 10, 0], y: [0, 10, -20, 0], scale: [1, 0.95, 1.05, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ bottom: "20%", left: "30%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.05) 0%, transparent 70%)", filter: "blur(40px)" }}
            animate={{ x: [0, 10, -5, 0], y: [0, -10, 5, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full"
            style={{ top: "30%", right: "30%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.05) 0%, transparent 70%)", filter: "blur(45px)" }}
            animate={{ x: [0, -10, 15, 0], y: [0, 15, -10, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Blue/teal accent orbs */}
          <motion.div
            className="absolute w-56 h-56 rounded-full"
            style={{ top: "45%", left: "5%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)", filter: "blur(55px)" }}
            animate={{ x: [0, 15, -8, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-44 h-44 rounded-full"
            style={{ top: "15%", right: "10%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.10) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -12, 8, 0], y: [0, 10, -15, 0], scale: [1, 1.08, 0.92, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-36 h-36 rounded-full"
            style={{ bottom: "30%", right: "25%", background: "radial-gradient(circle, rgba(0, 180, 200, 0.10) 0%, transparent 70%)", filter: "blur(45px)" }}
            animate={{ x: [0, 8, -12, 0], y: [0, -8, 12, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-60 h-60 rounded-full"
            style={{ bottom: "10%", left: "15%", background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 10, -15, 0], y: [0, -10, 15, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex flex-col items-center relative z-10">
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

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
            style={{ borderColor: "rgba(0, 255, 136, 0.15)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1.5 rounded-full"
              style={{ background: "rgba(0, 255, 136, 0.4)" }}
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
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
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider data-stream" />

      {/* BOTTOM LINKS */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            className="flex justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
          </motion.div>
        </div>
      </section>
    </main>
  );
}
