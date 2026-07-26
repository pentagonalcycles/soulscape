"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";

const accentColors = [
  { name: "Violet", value: "#9d7cd8" },
  { name: "Cosmic Pink", value: "#e879a8" },
  { name: "Gold", value: "#f5d062" },
  { name: "Teal", value: "#2dd4a8" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Lavender", value: "#c084fc" },
  { name: "Rose", value: "#f472b6" },
  { name: "Amber", value: "#fb923c" },
];

const nebulaIntensities = [
  { value: "off", label: "Off", description: "No nebula background" },
  { value: "subtle", label: "Subtle", description: "Gentle, barely there" },
  { value: "normal", label: "Normal", description: "The default dream" },
  { value: "vivid", label: "Vivid", description: "Rich and immersive" },
];

const animationSpeeds = [
  { value: "minimal", label: "Minimal", description: "Reduced motion" },
  { value: "normal", label: "Normal", description: "Full dreamlike motion" },
];

export default function SettingsPage() {
  const { userPreferences, updatePreferences } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nebula />
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="settings" />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                Personalize Your Space
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                Make Elovayne feel like yours.
              </p>
            </motion.div>

            <div className="space-y-6">
              {/* Accent Color */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Accent Color</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  Changes the glow, nebula, and highlight colors throughout the site.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updatePreferences({ accent_color: color.value })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                        userPreferences.accent_color === color.value
                          ? "bg-elovayne-deep/80 ring-2"
                          : "bg-elovayne-deep/30 hover:bg-elovayne-deep/50"
                      }`}
                      style={{
                        boxShadow: userPreferences.accent_color === color.value
                          ? `0 0 20px ${color.value}40, inset 0 0 0 2px ${color.value}80`
                          : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{
                          background: color.value,
                          boxShadow: `0 0 12px ${color.value}60`,
                        }}
                      />
                      <span className="text-xs text-elovayne-muted">{color.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Starfield */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Starfield</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  The floating particles that drift across the background.
                </p>
                <button
                  onClick={() => updatePreferences({ show_starfield: !userPreferences.show_starfield })}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    userPreferences.show_starfield
                      ? "bg-elovayne-nebula/60"
                      : "bg-elovayne-deep/60"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-elovayne-light transition-transform ${
                      userPreferences.show_starfield ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </motion.div>

              {/* Nebula Intensity */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Nebula Background</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  The soft, drifting gradient blobs behind everything.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {nebulaIntensities.map((intensity) => (
                    <button
                      key={intensity.value}
                      onClick={() => updatePreferences({ nebula_intensity: intensity.value as "off" | "subtle" | "normal" | "vivid" })}
                      className={`p-4 rounded-xl text-left transition-all ${
                        userPreferences.nebula_intensity === intensity.value
                          ? "bg-elovayne-nebula/30 border border-elovayne-violet/50"
                          : "bg-elovayne-deep/30 border border-transparent hover:bg-elovayne-deep/50"
                      }`}
                    >
                      <div className="text-sm text-elovayne-light">{intensity.label}</div>
                      <div className="text-xs text-elovayne-dim mt-1">{intensity.description}</div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Animation Speed */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Animation Speed</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  Control how much motion you see across the site.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {animationSpeeds.map((speed) => (
                    <button
                      key={speed.value}
                      onClick={() => updatePreferences({ animation_speed: speed.value as "minimal" | "normal" })}
                      className={`p-4 rounded-xl text-left transition-all ${
                        userPreferences.animation_speed === speed.value
                          ? "bg-elovayne-nebula/30 border border-elovayne-violet/50"
                          : "bg-elovayne-deep/30 border border-transparent hover:bg-elovayne-deep/50"
                      }`}
                    >
                      <div className="text-sm text-elovayne-light">{speed.label}</div>
                      <div className="text-xs text-elovayne-dim mt-1">{speed.description}</div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Compact Mode */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Compact Mode</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  Reduce spacing for a denser, more compact layout.
                </p>
                <button
                  onClick={() => updatePreferences({ compact_mode: !userPreferences.compact_mode })}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    userPreferences.compact_mode
                      ? "bg-elovayne-nebula/60"
                      : "bg-elovayne-deep/60"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-elovayne-light transition-transform ${
                      userPreferences.compact_mode ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </motion.div>

              {/* Ambient Sound */}
              <motion.div
                className="glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Ambient Sound</h2>
                <p className="text-xs text-elovayne-dim mb-4">
                  Soft background tones that match each room&apos;s atmosphere.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-elovayne-muted">Enable sounds</span>
                    <button
                      onClick={() => updatePreferences({ ambient_sound: !userPreferences.ambient_sound })}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        userPreferences.ambient_sound
                          ? "bg-elovayne-nebula/60"
                          : "bg-elovayne-deep/60"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-elovayne-light transition-transform ${
                          userPreferences.ambient_sound ? "translate-x-7" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {userPreferences.ambient_sound && (
                    <div>
                      <label className="text-xs text-elovayne-dim uppercase tracking-wider mb-2 block">
                        Volume
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={userPreferences.sound_volume}
                        onChange={(e) => updatePreferences({ sound_volume: parseFloat(e.target.value) })}
                        className="w-full accent-elovayne-violet"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
