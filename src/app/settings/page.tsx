"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useBgTheme } from "@/lib/useBgTheme";
import { useAuth } from "@/components/AuthProvider";

const ACCENT_COLORS = [
  "var(--elovayne-nebula)", "var(--elovayne-violet)", "#22d3ee", "#3b82f6", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#f97316", "#eab308",
];

const TEXT_SIZES = [
  { id: "small" as const, label: "Small", desc: "Compact text" },
  { id: "medium" as const, label: "Medium", desc: "Default size" },
  { id: "large" as const, label: "Large", desc: "Easier to read" },
];

export default function SettingsPage() {
  const { darkBg, toggleBg } = useBgTheme();
  const { userPreferences, updatePreferences, userId } = useAuth();

  const [compactMode, setCompactMode] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [signalNotifications, setSignalNotifications] = useState(true);
  const [campfireSound, setCampfireSound] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(90);
  const [voiceSpeed, setVoiceSpeed] = useState(95);
  const [voiceMuteDefault, setVoiceMuteDefault] = useState(false);
  const [clearConfirm, setClearConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCompactMode(localStorage.getItem("compact_mode") === "true");
    setVisitorName(localStorage.getItem("elovayne-visitor-name") || "");
    setSignalNotifications(localStorage.getItem("signal_notifications_disabled") !== "true");
    setCampfireSound(localStorage.getItem("campfire_sound_off") !== "true");
    setVoiceVolume(parseInt(localStorage.getItem("elyra_voice_volume") || "90"));
    setVoiceSpeed(parseInt(localStorage.getItem("elyra_voice_speed") || "95"));
    setVoiceMuteDefault(localStorage.getItem("elyra_voice_mute") === "true");
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardStyle = {
    background: darkBg ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${darkBg ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 255, 136, 0.12)"}`,
    borderRadius: 16,
    padding: "24px",
  };

  const labelStyle = {
    fontSize: 10,
    color: darkBg ? "rgba(255, 255, 255, 0.4)" : "rgba(240, 255, 245, 0.5)",
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    marginBottom: 8,
    display: "block",
  };

  const toggleBtn = (active: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px", borderRadius: 8,
        background: active ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${active ? "rgba(0, 255, 136, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
        color: active ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.4)",
        fontSize: 11, cursor: "pointer", fontFamily: "monospace",
      }}
    >
      {label}
    </button>
  );

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
            <div className="text-3xl mb-4" style={{ opacity: 0.6 }}>&#9881;</div>
            <h1
              className="text-3xl sm:text-4xl mb-3"
              style={{
                background: "linear-gradient(135deg, var(--elovayne-nebula), var(--elovayne-violet))",
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
            {saved && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-2"
                style={{ color: "var(--elovayne-nebula)" }}
              >
                Saved
              </motion.p>
            )}
          </motion.div>

          <div className="space-y-4">
            {/* ========== BACKGROUND THEME ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={cardStyle}>
              <h2 className="text-base mb-3" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>
                Background Theme
              </h2>
              <p className="text-xs mb-4" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                Colour-shifting or dark backgrounds across the site
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { if (darkBg) toggleBg(); }}
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                  style={{
                    background: !darkBg ? "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,136,255,0.15), rgba(136,0,255,0.15))" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${!darkBg ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                  }}
                >
                  <div className="w-full h-8 rounded-lg" style={{ background: "linear-gradient(90deg, var(--elovayne-nebula), #0088ff, #8800ff)", animation: !darkBg ? "bg-hue-cycle 6s linear infinite" : "none", opacity: !darkBg ? 1 : 0.3 }} />
                  <span className="text-xs font-medium" style={{ color: !darkBg ? "var(--elovayne-nebula)" : "rgba(255,255,255,0.3)" }}>Colour</span>
                  {!darkBg && <span className="text-[10px]" style={{ color: "var(--elovayne-nebula)" }}>&#10003; Active</span>}
                </button>
                <button
                  onClick={() => { if (!darkBg) toggleBg(); }}
                  className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                  style={{
                    background: darkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.15)",
                    border: `1px solid ${darkBg ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)"}`,
                    cursor: "pointer",
                  }}
                >
                  <div className="w-full h-8 rounded-lg" style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.08)", opacity: darkBg ? 1 : 0.3 }} />
                  <span className="text-xs font-medium" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>Dark</span>
                  {darkBg && <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>&#10003; Active</span>}
                </button>
              </div>
            </motion.div>

            {/* ========== ACCENT COLOR ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={cardStyle}>
              <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Accent Color</h2>
              <p className="text-xs mb-4" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                Changes glows, highlights, and interactive elements
              </p>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { updatePreferences({ accent_color: c }); showSaved(); }}
                    className="w-9 h-9 rounded-full transition-all"
                    style={{
                      background: c,
                      border: userPreferences.accent_color === c ? "3px solid white" : "2px solid rgba(255,255,255,0.1)",
                      boxShadow: userPreferences.accent_color === c ? `0 0 12px ${c}60` : "none",
                      cursor: "pointer",
                      transform: userPreferences.accent_color === c ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* ========== TEXT SIZE ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={cardStyle}>
              <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Text Size</h2>
              <p className="text-xs mb-4" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                Adjust text size across the entire site
              </p>
              <div className="flex gap-2">
                {TEXT_SIZES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { updatePreferences({ text_size: s.id }); showSaved(); }}
                    className="flex-1 py-3 rounded-xl text-center transition-all"
                    style={{
                      background: userPreferences.text_size === s.id ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${userPreferences.text_size === s.id ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.06)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: userPreferences.text_size === s.id ? "var(--elovayne-nebula)" : "rgba(255,255,255,0.5)" }}>{s.label}</div>
                    <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ========== REDUCE MOTION ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Reduce Motion</h2>
                  <p className="text-xs" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                    Disable animations for accessibility or performance
                  </p>
                </div>
                {toggleBtn(userPreferences.reduce_motion, () => {
                  updatePreferences({ reduce_motion: !userPreferences.reduce_motion });
                  showSaved();
                }, userPreferences.reduce_motion ? "On" : "Off")}
              </div>
            </motion.div>

            {/* ========== COMPACT MODE ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Compact Mode</h2>
                  <p className="text-xs" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                    Reduce spacing and padding across the site
                  </p>
                </div>
                {toggleBtn(compactMode, () => {
                  const next = !compactMode;
                  setCompactMode(next);
                  localStorage.setItem("compact_mode", String(next));
                  if (next) {
                    document.body.classList.add("compact-mode");
                  } else {
                    document.body.classList.remove("compact-mode");
                  }
                  showSaved();
                }, compactMode ? "On" : "Off")}
              </div>
            </motion.div>

            {/* ========== VISITOR NAME ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} style={cardStyle}>
              <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Display Name</h2>
              <p className="text-xs mb-3" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                Your name shown in the presence map and stats
              </p>
              <div className="flex gap-2">
                <input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value.slice(0, 40))}
                  placeholder="Anonymous"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0",
                  }}
                />
                <button
                  onClick={() => { localStorage.setItem("elovayne-visitor-name", visitorName); showSaved(); }}
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid rgba(0,255,136,0.15)",
                    color: "var(--elovayne-nebula)",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </motion.div>

            {/* ========== LUNA VOICE ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} style={cardStyle}>
              <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Luna Voice</h2>
              <p className="text-xs mb-4" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                Control how Luna speaks to you
              </p>

              {/* Volume */}
              <div className="mb-4">
                <span style={labelStyle}>Volume ({voiceVolume}%)</span>
                <input
                  type="range" min="0" max="100" value={voiceVolume}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setVoiceVolume(v);
                    localStorage.setItem("elyra_voice_volume", String(v));
                  }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--elovayne-nebula)" }}
                />
              </div>

              {/* Speed */}
              <div className="mb-4">
                <span style={labelStyle}>Speed ({voiceSpeed}%)</span>
                <input
                  type="range" min="50" max="150" value={voiceSpeed}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setVoiceSpeed(v);
                    localStorage.setItem("elyra_voice_speed", String(v));
                  }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--elovayne-nebula)" }}
                />
              </div>

              {/* Mute default */}
              <div className="flex items-center justify-between">
                <span style={{ ...labelStyle, marginBottom: 0 }}>Mute by default</span>
                {toggleBtn(voiceMuteDefault, () => {
                  const next = !voiceMuteDefault;
                  setVoiceMuteDefault(next);
                  localStorage.setItem("elyra_voice_mute", String(next));
                  showSaved();
                }, voiceMuteDefault ? "On" : "Off")}
              </div>
            </motion.div>

            {/* ========== NOTIFICATIONS ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} style={cardStyle}>
              <h2 className="text-base mb-3" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Notifications</h2>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "#e8fff0" }}>Human Signal alerts</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Get notified when someone sends you a signal</div>
                </div>
                {toggleBtn(signalNotifications, () => {
                  const next = !signalNotifications;
                  setSignalNotifications(next);
                  localStorage.setItem("signal_notifications_disabled", String(!next));
                  showSaved();
                }, signalNotifications ? "On" : "Off")}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "#e8fff0" }}>Campfire sounds</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Ambient crackling sounds in campfire</div>
                </div>
                {toggleBtn(campfireSound, () => {
                  const next = !campfireSound;
                  setCampfireSound(next);
                  localStorage.setItem("campfire_sound_off", String(!next));
                  showSaved();
                }, campfireSound ? "On" : "Off")}
              </div>
            </motion.div>

            {/* ========== DEFAULT ANONYMOUS ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} style={cardStyle}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base mb-1" style={{ color: darkBg ? "rgba(255,255,255,0.85)" : "#e8fff0", fontWeight: 500 }}>Anonymous by Default</h2>
                  <p className="text-xs" style={{ color: darkBg ? "rgba(255,255,255,0.35)" : "rgba(240,255,245,0.55)" }}>
                    New posts are anonymous unless you change it
                  </p>
                </div>
                {toggleBtn(userPreferences.anonymous_default, () => {
                  updatePreferences({ anonymous_default: !userPreferences.anonymous_default });
                  showSaved();
                }, userPreferences.anonymous_default ? "On" : "Off")}
              </div>
            </motion.div>

            {/* ========== DANGER ZONE ========== */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
              <div style={{ ...cardStyle, borderColor: "rgba(255,80,80,0.1)" }}>
                <h2 className="text-base mb-3" style={{ color: "rgba(255,80,80,0.7)", fontWeight: 500 }}>Danger Zone</h2>

                {/* Clear Luna Memory */}
                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div className="text-sm" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "#e8fff0" }}>Clear Luna Memory</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Erase what Luna remembers about you</div>
                  </div>
                  <button
                    onClick={() => {
                      if (clearConfirm === "memory") {
                        localStorage.removeItem("elyra-memory-enabled");
                        localStorage.removeItem(`elyra-memory-${userId}`);
                        setClearConfirm(null);
                        showSaved();
                      } else {
                        setClearConfirm("memory");
                        setTimeout(() => setClearConfirm(null), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs"
                    style={{
                      background: clearConfirm === "memory" ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${clearConfirm === "memory" ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: clearConfirm === "memory" ? "#ff6666" : "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    {clearConfirm === "memory" ? "Confirm?" : "Clear"}
                  </button>
                </div>

                {/* Clear Luna Conversations */}
                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div className="text-sm" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "#e8fff0" }}>Clear Luna Conversations</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Delete all saved chat history</div>
                  </div>
                  <button
                    onClick={() => {
                      if (clearConfirm === "conversations") {
                        localStorage.removeItem(`elyra-conversations-${userId}`);
                        localStorage.removeItem("elyra-conversations");
                        setClearConfirm(null);
                        showSaved();
                      } else {
                        setClearConfirm("conversations");
                        setTimeout(() => setClearConfirm(null), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs"
                    style={{
                      background: clearConfirm === "conversations" ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${clearConfirm === "conversations" ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: clearConfirm === "conversations" ? "#ff6666" : "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    {clearConfirm === "conversations" ? "Confirm?" : "Clear"}
                  </button>
                </div>

                {/* Clear All Local Data */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm" style={{ color: darkBg ? "rgba(255,255,255,0.7)" : "#e8fff0" }}>Clear All Local Data</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Reset journals, tarot, dream canvas, reflections</div>
                  </div>
                  <button
                    onClick={() => {
                      if (clearConfirm === "all") {
                        const keep = ["elovayne-dark-bg", "elovayne-visitor-id", "elovayne-visitor-name"];
                        const keys = Object.keys(localStorage);
                        keys.forEach(k => { if (!keep.includes(k)) localStorage.removeItem(k); });
                        setClearConfirm(null);
                        showSaved();
                      } else {
                        setClearConfirm("all");
                        setTimeout(() => setClearConfirm(null), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs"
                    style={{
                      background: clearConfirm === "all" ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${clearConfirm === "all" ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.06)"}`,
                      color: clearConfirm === "all" ? "#ff6666" : "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      fontFamily: "monospace",
                    }}
                  >
                    {clearConfirm === "all" ? "Confirm?" : "Reset"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Back to home */}
            <motion.div className="text-center pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>
              <Link
                href="/"
                className="text-xs tracking-wider uppercase hover:opacity-50 transition-opacity"
                style={{ color: darkBg ? "rgba(255,255,255,0.3)" : "rgba(240,255,245,0.5)", textDecoration: "none", fontSize: "10px", letterSpacing: "0.1em" }}
              >
                &larr; Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
