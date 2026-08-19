"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import ElovayneLogo from "@/components/ElovayneLogo";
import GlowingPortal from "@/components/GlowingPortal";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<"elyra" | "arcana" | "threads" | "campfire" | "mural">("elyra");
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Background floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Colour-shifting base layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0, 255, 136, 0.15) 0%, transparent 60%)," +
                "radial-gradient(ellipse 70% 55% at 80% 30%, rgba(57, 255, 20, 0.12) 0%, transparent 60%)," +
                "radial-gradient(ellipse 65% 60% at 70% 80%, rgba(0, 204, 106, 0.10) 0%, transparent 60%)," +
                "radial-gradient(ellipse 75% 60% at 25% 85%, rgba(74, 222, 128, 0.08) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
            animate={{
              background: [
                "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0, 255, 136, 0.15) 0%, transparent 60%), radial-gradient(ellipse 70% 55% at 80% 30%, rgba(57, 255, 20, 0.12) 0%, transparent 60%), radial-gradient(ellipse 65% 60% at 70% 80%, rgba(0, 204, 106, 0.10) 0%, transparent 60%), radial-gradient(ellipse 75% 60% at 25% 85%, rgba(74, 222, 128, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 80% 60% at 70% 70%, rgba(167, 139, 250, 0.15) 0%, transparent 60%), radial-gradient(ellipse 70% 55% at 20% 80%, rgba(244, 114, 182, 0.12) 0%, transparent 60%), radial-gradient(ellipse 65% 60% at 80% 20%, rgba(251, 191, 36, 0.10) 0%, transparent 60%), radial-gradient(ellipse 75% 60% at 30% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 60%), radial-gradient(ellipse 70% 55% at 30% 70%, rgba(0, 255, 136, 0.12) 0%, transparent 60%), radial-gradient(ellipse 65% 60% at 70% 30%, rgba(167, 139, 250, 0.10) 0%, transparent 60%), radial-gradient(ellipse 75% 60% at 80% 60%, rgba(244, 114, 182, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0, 255, 136, 0.15) 0%, transparent 60%), radial-gradient(ellipse 70% 55% at 80% 30%, rgba(57, 255, 20, 0.12) 0%, transparent 60%), radial-gradient(ellipse 65% 60% at 70% 80%, rgba(0, 204, 106, 0.10) 0%, transparent 60%), radial-gradient(ellipse 75% 60% at 25% 85%, rgba(74, 222, 128, 0.08) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary colour shift — violet/gold/rose cycle */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 60% 40%, rgba(167, 139, 250, 0.10) 0%, transparent 60%)," +
                "radial-gradient(ellipse 55% 45% at 30% 60%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)",
              filter: "blur(50px)",
              opacity: 0.7,
            }}
            animate={{
              background: [
                "radial-gradient(ellipse 60% 50% at 60% 40%, rgba(167, 139, 250, 0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 30% 60%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 60% 50% at 40% 70%, rgba(244, 114, 182, 0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 70% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 60% 50% at 70% 60%, rgba(251, 191, 36, 0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 40% 40%, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse 60% 50% at 60% 40%, rgba(167, 139, 250, 0.10) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 30% 60%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />

          {/* Aurora curtain effects - shimmering vertical gradients */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(0, 255, 136, 0.03) 30%, rgba(57, 255, 20, 0.02) 50%, rgba(0, 204, 106, 0.03) 70%, transparent 100%)",
              opacity: 0.6,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(167, 139, 250, 0.02) 25%, rgba(244, 114, 182, 0.015) 50%, rgba(251, 191, 36, 0.02) 75%, transparent 100%)",
              opacity: 0.5,
            }}
            animate={{
              backgroundPosition: ["0% 100%", "0% 0%", "0% 100%"],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />

          {/* Deep space layers - parallax depth */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 120% 80% at 50% 50%, rgba(0, 255, 136, 0.04) 0%, transparent 60%)",
              filter: "blur(80px)",
            }}
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ top: "10%", left: "10%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{ top: "60%", right: "15%", background: "radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -15, 10, 0], y: [0, 10, -20, 0], scale: [1, 0.95, 1.05, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ bottom: "20%", left: "30%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.07) 0%, transparent 70%)", filter: "blur(40px)" }}
            animate={{ x: [0, 10, -5, 0], y: [0, -10, 5, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full"
            style={{ top: "30%", right: "30%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.07) 0%, transparent 70%)", filter: "blur(45px)" }}
            animate={{ x: [0, -10, 15, 0], y: [0, 15, -10, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Blue/teal accent orbs */}
          <motion.div
            className="absolute w-56 h-56 rounded-full"
            style={{ top: "45%", left: "5%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, transparent 70%)", filter: "blur(55px)" }}
            animate={{ x: [0, 15, -8, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-44 h-44 rounded-full"
            style={{ top: "15%", right: "10%", background: "radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -12, 8, 0], y: [0, 10, -15, 0], scale: [1, 1.08, 0.92, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-36 h-36 rounded-full"
            style={{ bottom: "30%", right: "25%", background: "radial-gradient(circle, rgba(0, 180, 200, 0.12) 0%, transparent 70%)", filter: "blur(45px)" }}
            animate={{ x: [0, 8, -12, 0], y: [0, -8, 12, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-60 h-60 rounded-full"
            style={{ bottom: "10%", left: "15%", background: "radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, 10, -15, 0], y: [0, -10, 15, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Warm accent orbs — violet, gold, and rose */}
          <motion.div
            className="absolute w-72 h-72 rounded-full"
            style={{ top: "8%", right: "26%", background: "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)", filter: "blur(60px)" }}
            animate={{ x: [0, -14, 8, 0], y: [0, 12, -10, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-60 h-60 rounded-full"
            style={{ bottom: "24%", left: "6%", background: "radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)", filter: "blur(55px)" }}
            animate={{ x: [0, 12, -8, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-52 h-52 rounded-full"
            style={{ bottom: "10%", right: "10%", background: "radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%)", filter: "blur(50px)" }}
            animate={{ x: [0, -10, 12, 0], y: [0, 10, -14, 0], scale: [1, 0.94, 1.06, 1] }}
            transition={{ duration: 27, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Firefly-like sparkles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
                background: i % 3 === 0 ? "rgba(0, 255, 136, 0.8)" : i % 3 === 1 ? "rgba(167, 139, 250, 0.7)" : "rgba(251, 191, 36, 0.6)",
                boxShadow: i % 3 === 0 ? "0 0 8px rgba(0, 255, 136, 0.6)" : i % 3 === 1 ? "0 0 8px rgba(167, 139, 250, 0.5)" : "0 0 8px rgba(251, 191, 36, 0.4)",
              }}
              animate={{
                x: [0, (i % 2 === 0 ? 30 : -30), (i % 2 === 0 ? -20 : 20), 0],
                y: [0, (i % 3 === 0 ? -25 : 25), (i % 3 === 0 ? 15 : -15), 0],
                opacity: [0, 0.8, 0.4, 0],
                scale: [0.5, 1.2, 0.8, 0.5],
              }}
              transition={{
                duration: 6 + (i % 4) * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Breathing center glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, rgba(57, 255, 20, 0.03) 30%, transparent 60%)",
              filter: "blur(60px)",
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{
                fontWeight: 300,
                background: "linear-gradient(120deg, #8ee6c0 0%, #b9a6ff 30%, #f4b8d4 55%, #f8d795 80%, #8ee6c0 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "homeTaglineShift 18s ease-in-out infinite",
              }}
            >
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
            style={{ borderColor: "rgba(167, 139, 250, 0.35)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1.5 rounded-full"
              style={{ background: "linear-gradient(180deg, #a78bfa, #f472b6)" }}
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section className="relative z-10 py-24 px-6">
        {/* Aurora wash behind the about copy */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(167, 139, 250, 0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 45% at 18% 60%, rgba(251, 191, 36, 0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 85% 35%, rgba(244, 114, 182, 0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
        </div>

        <div className="max-w-2xl mx-auto relative">
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

          {/* Pricing info */}
          <motion.div
            className="text-center p-4 rounded-2xl mb-16"
            style={{ background: "rgba(0, 255, 136, 0.02)", border: "1px solid rgba(0, 255, 136, 0.06)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
              Everything on Elovayne is free. The only paid feature is{" "}
              <span style={{ color: "#00ff88" }}>Luna AI</span>
              {" "}— your personal AI companion — which costs a small one-time fee.
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
            <p className="text-xs leading-relaxed" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
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
      <div className="relative z-10">
        <div
          style={{
            height: 1,
            width: "min(520px, 70%)",
            margin: "0 auto 28px",
            background: "linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.45), rgba(244, 114, 182, 0.45), rgba(251, 191, 36, 0.45), rgba(6, 182, 212, 0.45), transparent)",
          }}
        />
      </div>
      <div className="section-divider data-stream" />

      {/* PLATFORM STATUS SECTION */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-2xl md:text-3xl mb-3" style={{ color: "var(--text-primary)", fontWeight: 300, letterSpacing: "0.02em" }}>
              Platform Status
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              What we&apos;re building next
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            {/* In Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: "rgba(251, 191, 36, 0.02)",
                border: "1px solid rgba(251, 191, 36, 0.08)",
                borderRadius: 16,
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#fbbf24",
                  boxShadow: "0 0 8px rgba(251, 191, 36, 0.5)",
                  animation: "pulse 2s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 11, color: "#fbbf24",
                  letterSpacing: "2px", textTransform: "uppercase",
                  fontFamily: "monospace", fontWeight: 600,
                }}>Coming Soon</span>
              </div>

              {/* Category Tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { id: "elyra" as const, label: "Elyra", icon: "✦" },
                  { id: "arcana" as const, label: "Arcana", icon: "☽" },
                  { id: "threads" as const, label: "Threads", icon: "🧶" },
                  { id: "campfire" as const, label: "Campfire", icon: "🔥" },
                  { id: "mural" as const, label: "Mural", icon: "🎨" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 10,
                      background: activeCategory === cat.id ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${activeCategory === cat.id ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                      color: activeCategory === cat.id ? "#00ff88" : "rgba(240, 255, 245, 0.5)",
                      fontSize: 12, fontFamily: "monospace", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.3s ease",
                    }}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Feature Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {getFeatures(activeCategory).map((feature, i) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 12,
                      padding: "16px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.15)";
                      e.currentTarget.style.background = "rgba(0, 255, 136, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                      e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "rgba(240, 255, 245, 0.9)", fontWeight: 500 }}>
                        {feature.name}
                      </span>
                      <span style={{
                        fontSize: 9, padding: "3px 8px", borderRadius: 6,
                        background: getStatusColor(feature.status).bg,
                        color: getStatusColor(feature.status).text,
                        border: `1px solid ${getStatusColor(feature.status).border}`,
                        fontFamily: "monospace", fontWeight: 600,
                        letterSpacing: "0.5px", textTransform: "uppercase",
                      }}>
                        {feature.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(240, 255, 245, 0.5)", lineHeight: 1.5, margin: 0 }}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div
          style={{
            height: 1,
            width: "min(520px, 70%)",
            margin: "0 auto 28px",
            background: "linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.45), rgba(244, 114, 182, 0.45), rgba(251, 191, 36, 0.45), rgba(6, 182, 212, 0.45), transparent)",
          }}
        />
      </div>
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

interface Feature {
  name: string;
  description: string;
  status: "CONCEPT" | "BUILDING" | "TESTING" | "NEARLY READY";
}

function getStatusColor(status: string) {
  switch (status) {
    case "BUILDING":
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
    case "TESTING":
      return { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
    case "NEARLY READY":
      return { bg: "rgba(0, 255, 136, 0.15)", text: "#00ff88", border: "rgba(0, 255, 136, 0.3)" };
    default:
      return { bg: "rgba(251, 191, 36, 0.15)", text: "#fbbf24", border: "rgba(251, 191, 36, 0.3)" };
  }
}

function getFeatures(category: "elyra" | "arcana" | "threads" | "campfire" | "mural"): Feature[] {
  const features: Record<string, Feature[]> = {
    elyra: [
      { name: "Elyra Projects", description: "Build something with Elyra and return to it later.", status: "BUILDING" },
      { name: "Elyra Preview", description: "See what you're building directly inside Elyra.", status: "CONCEPT" },
      { name: "Elyra Vision", description: "Show Elyra something and let her understand it.", status: "CONCEPT" },
      { name: "Elyra Build Mode", description: "Describe what you want. Elyra helps build it.", status: "CONCEPT" },
      { name: "Elyra Code Preview", description: "Write code. See the result. Improve it instantly.", status: "CONCEPT" },
      { name: "Elyra Project Memory", description: "Elyra remembers the important details of each project.", status: "CONCEPT" },
      { name: "Elyra Debugger", description: "Find the problem and help fix it.", status: "CONCEPT" },
      { name: "Elyra Design to Code", description: "Turn a visual idea into working frontend code.", status: "CONCEPT" },
      { name: "Elyra Website Inspector", description: "Let Elyra examine a website and explain what could be improved.", status: "CONCEPT" },
    ],
    arcana: [
      { name: "Elovayne Tarot Deck", description: "An original 78-card deck created specifically for Elovayne.", status: "BUILDING" },
      { name: "Tarot Reading Intelligence", description: "Deeper readings that understand the whole spread.", status: "CONCEPT" },
      { name: "Arcana Personal Decks", description: "Make Tarot feel more personal with different visual styles.", status: "CONCEPT" },
    ],
    threads: [
      { name: "Threads Pattern Studio", description: "Turn an idea into a personalised knitting or crochet pattern.", status: "BUILDING" },
      { name: "Threads Visual Guide", description: "See difficult stitches and pattern steps more clearly.", status: "CONCEPT" },
      { name: "Threads Pattern Scanner", description: "Turn a confusing pattern into clear steps.", status: "CONCEPT" },
      { name: "Threads Size Adapt", description: "Adapt a pattern to a different size.", status: "CONCEPT" },
      { name: "Threads Yarn Match", description: "Find what you can make with the yarn you already own.", status: "CONCEPT" },
      { name: "Threads Project Rescue", description: "Fix mistakes without starting over.", status: "CONCEPT" },
      { name: "Threads Pattern Visualiser", description: "See how a pattern should begin to take shape.", status: "CONCEPT" },
    ],
    campfire: [
      { name: "Campfire Topics", description: "Gentle shared questions or topics for people around the Campfire.", status: "CONCEPT" },
      { name: "Pass the Flame", description: "Leave a question, thought or short message for the next person who arrives.", status: "CONCEPT" },
      { name: "Quiet Mode", description: "Allow people to stay around the Campfire without needing to speak or participate.", status: "CONCEPT" },
      { name: "Campfire Prompts", description: "Subtle conversation starters when the Campfire becomes quiet.", status: "CONCEPT" },
      { name: "Campfire Stories", description: "Allow people to contribute short pieces to shared stories or conversations.", status: "CONCEPT" },
      { name: "Anonymous Campfire", description: "Explore safe anonymous participation while keeping moderation and reporting available.", status: "CONCEPT" },
      { name: "Elyra at the Campfire", description: "Use Elyra to optionally provide conversation prompts or help when requested.", status: "CONCEPT" },
      { name: "Campfire Archive", description: "Preserve selected shared Campfire moments or community stories.", status: "CONCEPT" },
    ],
    mural: [
      { name: "Collaborative Mural", description: "Allow multiple people to contribute to the same shared canvas.", status: "BUILDING" },
      { name: "Mural Layers", description: "Allow creative additions without permanently destroying previous artwork.", status: "CONCEPT" },
      { name: "Mural Time-Lapse", description: "Replay how a mural developed from beginning to completion.", status: "CONCEPT" },
      { name: "Anonymous Marks", description: "Allow people to leave a small drawing, word, colour or symbol without prominently showing their identity.", status: "CONCEPT" },
      { name: "Mural Themes", description: "Create occasional shared mural themes such as Hope, Chaos, Memory, Dreams, Connection, Change.", status: "CONCEPT" },
      { name: "Elyra Mural Prompt", description: "Use Elyra to optionally give someone a creative prompt when they do not know what to add.", status: "CONCEPT" },
      { name: "Mural Archive", description: "Preserve completed murals so new collaborative murals can begin without losing earlier artwork.", status: "CONCEPT" },
    ],
  };
  return features[category] || [];
}
