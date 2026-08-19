"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useBgTheme } from "@/lib/useBgTheme";

export default function SettingsPage() {
  const { darkBg, toggleBg } = useBgTheme();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-3xl mb-4" style={{ opacity: 0.6 }}>⚙</div>
            <h1
              className="text-3xl sm:text-4xl mb-3"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              Settings
            </h1>
            <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
              Personalise your Elovayne experience
            </p>
          </motion.div>

          {/* Settings cards */}
          <div className="space-y-4">
            {/* Background Theme */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                background: darkBg ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid ${darkBg ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 255, 136, 0.12)"}`,
                borderRadius: 16,
                padding: "24px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2
                    className="text-base mb-1"
                    style={{
                      color: darkBg ? "rgba(255, 255, 255, 0.85)" : "#e8fff0",
                      fontWeight: 500,
                    }}
                  >
                    Background Theme
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: darkBg ? "rgba(255, 255, 255, 0.35)" : "rgba(240, 255, 245, 0.55)" }}
                  >
                    Choose between colour-shifting or dark backgrounds across the site
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {/* Colour option */}
                <button
                  onClick={() => { if (darkBg) toggleBg(); }}
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300"
                  style={{
                    background: !darkBg
                      ? "linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 136, 255, 0.15), rgba(136, 0, 255, 0.15))"
                      : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${!darkBg ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="w-full h-8 rounded-lg"
                    style={{
                      background: "linear-gradient(90deg, #00ff88, #0088ff, #8800ff)",
                      animation: !darkBg ? "bg-hue-cycle 6s linear infinite" : "none",
                      opacity: !darkBg ? 1 : 0.3,
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: !darkBg ? "#00ff88" : "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Colour
                  </span>
                  {!darkBg && (
                    <span className="text-[10px]" style={{ color: "#00ff88" }}>✓ Active</span>
                  )}
                </button>

                {/* Dark option */}
                <button
                  onClick={() => { if (!darkBg) toggleBg(); }}
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300"
                  style={{
                    background: darkBg
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0, 0, 0, 0.15)",
                    border: `1px solid ${darkBg ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.04)"}`,
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="w-full h-8 rounded-lg"
                    style={{
                      background: "#000000",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      opacity: darkBg ? 1 : 0.3,
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: darkBg ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Dark
                  </span>
                  {darkBg && (
                    <span className="text-[10px]" style={{ color: "rgba(255, 255, 255, 0.5)" }}>✓ Active</span>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Back to home */}
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/"
                className="text-xs tracking-wider uppercase hover:opacity-50 transition-opacity duration-300"
                style={{
                  color: darkBg ? "rgba(255, 255, 255, 0.3)" : "rgba(240, 255, 245, 0.5)",
                  textDecoration: "none",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                }}
              >
                ← Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
