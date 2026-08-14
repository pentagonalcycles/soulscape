"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

const features = [
  { icon: "◎", label: "Soul Echo", desc: "Connect with a stranger who understands", href: "/soul-echo", color: "#00ff88" },
  { icon: "✦", label: "Elyra AI", desc: "A kind presence whenever you need one", href: "/elyra", color: "#00cc6a" },
  { icon: "◈", label: "Reflection", desc: "Daily prompts to explore your inner world", href: "/reflection-room", color: "#39ff14" },
  { icon: "△", label: "Dream Canvas", desc: "Paint and create with 32 brush types", href: "/dream-canvas", color: "#4ade80" },
  { icon: "◇", label: "Mural", desc: "Paint together with others in real-time", href: "/mural", color: "#00e676" },
  { icon: "◆", label: "Campfire", desc: "Anonymous group chat around a fire", href: "/campfire", color: "#22c55e" },
  { icon: "❋", label: "Poetry", desc: "Daily prompts inspire your words", href: "/poetry", color: "#a3e635" },
  { icon: "●", label: "Nebula Orb", desc: "A multiplayer cosmic arena", href: "/nebula-orb", color: "#00ff88" },
  { icon: "◈", label: "Wish Lanterns", desc: "Release your wishes into the sky", href: "/wish-lanterns", color: "#00cc6a" },
  { icon: "ธร", label: "NERA", desc: "Anonymous stories with atmospheric rooms", href: "/nera", color: "#39ff14" },
  { icon: "◎", label: "Soul Map", desc: "Build your inner mandala, one answer at a time", href: "/soul-map", color: "#4ade80" },
  { icon: "📡", label: "Human Signal", desc: "Find someone who feels what you feel", href: "/human-signal", color: "#00e676" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Background floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ top: "10%", left: "10%", background: "radial-gradient(circle, rgba(0, 255, 136, 0.04) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ top: "60%", right: "15%", background: "radial-gradient(circle, rgba(57, 255, 20, 0.03) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -15, 10, 0], y: [0, 10, -20, 0], scale: [1, 0.95, 1.05, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ bottom: "20%", left: "30%", background: "radial-gradient(circle, rgba(0, 204, 106, 0.03) 0%, transparent 70%)", filter: "blur(40px)" }}
            animate={{ x: [0, 10, -5, 0], y: [0, -10, 5, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
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
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* FEATURES SECTION */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl mb-4" style={{ color: "var(--text-primary)", fontWeight: 300, letterSpacing: "0.02em" }}>
              Explore every room
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)", fontWeight: 300 }}>
              Each space is designed for a different kind of moment. Find yours.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((f) => (
              <motion.div key={f.href} variants={itemVariants}>
                <Link href={f.href} style={{ textDecoration: "none" }}>
                  <div className="feature-card" style={{ "--card-accent": `${f.color}30` } as React.CSSProperties}>
                    <div className="icon-glow" style={{ borderColor: `${f.color}20`, background: `${f.color}08` }}>
                      <span style={{ color: f.color }}>{f.icon}</span>
                    </div>
                    <div className="mt-3 mb-1 text-sm font-medium" style={{ color: "rgba(224, 245, 232, 0.9)" }}>
                      {f.label}
                    </div>
                    <div className="text-[11px] leading-relaxed" style={{ color: "rgba(224, 245, 232, 0.35)" }}>
                      {f.desc}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

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
