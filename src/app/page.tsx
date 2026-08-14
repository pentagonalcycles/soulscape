"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

const features = [
  { icon: "✦", label: "Elyra AI", href: "/elyra", color: "#00ff88" },
  { icon: "◎", label: "Soul Echo", href: "/soul-echo", color: "#00cc6a" },
  { icon: "✧", label: "Stargazing", href: "/stargazing", color: "#57ff14" },
  { icon: "◈", label: "Reflection", href: "/reflection-room", color: "#74de9a" },
  { icon: "△", label: "Canvas", href: "/dream-canvas", color: "#4ade80" },
  { icon: "⊡", label: "Camera", href: "/camera", color: "#00e676" },
  { icon: "◇", label: "Mural", href: "/mural", color: "#00cc6a" },
  { icon: "●", label: "Nebula Orb", href: "/nebula-orb", color: "#26a65a" },
  { icon: "◈", label: "Wish Lanterns", href: "/wish-lanterns", color: "#52d398" },
  { icon: "◆", label: "Campfire", href: "/campfire", color: "#1a5c2e" },
  { icon: "❋", label: "Poetry", href: "/poetry", color: "#00ff88" },
  { icon: "◎", label: "Soul Map", href: "/soul-map", color: "#00cc6a" },
  { icon: "🌤️", label: "Human Weather", href: "/human-weather", color: "#57ff14" },
  { icon: "📡", label: "Human Signal", href: "/human-signal", color: "#74de9a" },
  { icon: "◎", label: "UNSEEN", href: "/unseen", color: "#4ade80" },
  { icon: "💡", label: "Ideas", href: "/ideas", color: "#00e676" },
];

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

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <a
              href="#explore"
              className="text-sm hover:opacity-70 transition-all duration-300 tracking-widest uppercase inline-flex items-center gap-2 group"
              style={{ color: "var(--text-dim)", fontSize: "11px" }}
            >
              explore everything
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </motion.div>
        </div>

      </section>

      {/* EXPLORE SECTION */}
      <section id="explore" className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Intro */}
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

          {/* Feature Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-16">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              >
                <Link
                  href={feature.href}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-sm active:scale-[0.97]"
                  style={{
                    background: `${feature.color}04`,
                    border: `1px solid ${feature.color}10`,
                    textDecoration: "none",
                  }}
                >
                  <span className="text-xl opacity-80" style={{ color: feature.color }}>{feature.icon}</span>
                  <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{feature.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

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
            {["About", "FAQ", "Support", "Settings"].map((label) => (
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
