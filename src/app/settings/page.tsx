"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { CURSOR_COLORS } from "@/lib/mural/types";

const accentColors = [
  { name: "Teal", value: "#0d9488", icon: "◈" },
  { name: "Nebula", value: "#8b5cf6", icon: "✧" },
  { name: "Blue", value: "#3b82f6", icon: "◇" },
  { name: "Green", value: "#10b981", icon: "◎" },
  { name: "Pink", value: "#ec4899", icon: "⟡" },
  { name: "Red", value: "#ef4444", icon: "✦" },
  { name: "Orange", value: "#f97316", icon: "△" },
  { name: "Gold", value: "#eab308", icon: "☽" },
  { name: "Indigo", value: "#6366f1", icon: "◆" },
  { name: "Rose", value: "#f43f5e", icon: "❋" },
  { name: "Cyan", value: "#06b6d4", icon: "○" },
  { name: "Lime", value: "#84cc16", icon: "□" },
  { name: "Amber", value: "#d97706", icon: "◈" },
  { name: "Violet", value: "#7c3aed", icon: "✧" },
  { name: "Emerald", value: "#059669", icon: "◎" },
  { name: "Fuchsia", value: "#d946ef", icon: "⟡" },
];

const defaultPages = [
  { value: "/", label: "Home" },
  { value: "/soul-echo", label: "Soul Echo" },
  { value: "/stargazing", label: "Stargazing" },
  { value: "/reflection-room", label: "Reflection Room" },
  { value: "/elyra", label: "Elyra AI" },
  { value: "/mural", label: "Mural" },
  { value: "/soul-map", label: "Soul Map" },
];

const textSizes = [
  { value: "small", label: "Small", preview: "11px" },
  { value: "medium", label: "Medium", preview: "13px" },
  { value: "large", label: "Large", preview: "15px" },
];

const fontChoices = [
  { value: "default", label: "Default", family: "Inter, sans-serif" },
  { value: "serif", label: "Serif", family: "Georgia, serif" },
  { value: "mono", label: "Mono", family: "monospace" },
  { value: "caveat", label: "Handwritten", family: "Caveat, cursive" },
  { value: "dyslexia", label: "OpenDyslexic", family: "'OpenDyslexic', sans-serif" },
];

const elyraPersonalities = [
  { value: "friendly", label: "Friendly", icon: "😊" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "chill", label: "Chill", icon: "😌" },
  { value: "bubbly", label: "Bubbly", icon: "✨" },
  { value: "calm", label: "Calm", icon: "🌙" },
];

const elyraResponseLengths = [
  { value: "short", label: "Short", desc: "Brief, concise" },
  { value: "medium", label: "Medium", desc: "Balanced" },
  { value: "long", label: "Long", desc: "Detailed, thorough" },
];

const roomOptions = [
  { value: "soul-echo", label: "Soul Echo", icon: "◎" },
  { value: "stargazing", label: "Stargazing", icon: "✧" },
  { value: "reflection-room", label: "Reflection", icon: "◈" },
  { value: "dream-canvas", label: "Canvas", icon: "△" },
  { value: "mural", label: "Mural", icon: "◇" },
  { value: "campfire", label: "Campfire", icon: "◆" },
  { value: "poetry", label: "Poetry", icon: "❋" },
  { value: "soul-map", label: "Soul Map", icon: "◎" },
  { value: "wish-lanterns", label: "Lanterns", icon: "◈" },
];

const bgPresets = [
  // Solid Basics
  { name: "White", value: "#ffffff" },
  { name: "Snow", value: "#fafafa" },
  { name: "Ivory", value: "#fffff0" },
  { name: "Cream", value: "#fffdd0" },
  { name: "Linen", value: "#faf0e6" },
  { name: "Ghost White", value: "#f8f8ff" },
  { name: "Honeydew", value: "#f0fff0" },
  { name: "Mint", value: "#f5fffa" },
  { name: "Azure", value: "#f0ffff" },
  { name: "Alice Blue", value: "#f0f8ff" },
  { name: "Lavender", value: "#e6e6fa" },
  { name: "Mist", value: "#e8f0fe" },
  { name: "Sea Shell", value: "#fff5ee" },
  { name: "Peach", value: "#ffdab9" },
  { name: "Rose", value: "#ffe4e1" },
  { name: "Lilac", value: "#f3e5f5" },
  { name: "Soft Teal", value: "#f0fdf9" },
  { name: "Sage", value: "#f0f4f0" },
  { name: "Warm Gray", value: "#f5f5f0" },
  { name: "Light Gray", value: "#f2f2f2" },
  { name: "Silver", value: "#e8e8e8" },
  { name: "Charcoal", value: "#2d3436" },
  { name: "Dark", value: "#1a1a2e" },
  { name: "Midnight", value: "#0f0f23" },
];

// Gradient presets — layered radial gradients, using color-matched transparent (not CSS transparent) to avoid edge lines
const gradientPresets = [
  { name: "Opal", value: "radial-gradient(ellipse at 20% 50%, rgba(253,248,255,0.8), rgba(253,248,255,0) 70%), radial-gradient(ellipse at 80% 50%, rgba(240,248,255,0.8), rgba(240,248,255,0) 70%), radial-gradient(ellipse at 50% 80%, rgba(248,255,250,0.6), rgba(248,255,250,0) 60%), linear-gradient(135deg, #f8f4ff, #f0f8ff)" },
  { name: "Aurora", value: "radial-gradient(ellipse at 25% 30%, rgba(208,251,232,0.7), rgba(208,251,232,0) 60%), radial-gradient(ellipse at 75% 70%, rgba(200,232,255,0.6), rgba(200,232,255,0) 60%), radial-gradient(ellipse at 50% 50%, rgba(248,232,248,0.4), rgba(248,232,248,0) 50%), linear-gradient(160deg, #e8fff4, #f0f0ff)" },
  { name: "Northern Lights", value: "radial-gradient(ellipse at 30% 20%, rgba(184,248,216,0.6), rgba(184,248,216,0) 55%), radial-gradient(ellipse at 70% 80%, rgba(160,232,255,0.5), rgba(160,232,255,0) 55%), radial-gradient(ellipse at 50% 50%, rgba(208,208,255,0.3), rgba(208,208,255,0) 50%), linear-gradient(145deg, #d8f8e8, #e0e0ff)" },
  { name: "Golden Hour", value: "radial-gradient(ellipse at 60% 30%, rgba(255,248,232,0.8), rgba(255,248,232,0) 60%), radial-gradient(ellipse at 30% 70%, rgba(255,224,192,0.6), rgba(255,224,192,0) 55%), radial-gradient(ellipse at 80% 60%, rgba(255,216,184,0.4), rgba(255,216,184,0) 50%), linear-gradient(160deg, #fffae8, #ffd8b8)" },
  { name: "Sunset Blush", value: "radial-gradient(ellipse at 40% 40%, rgba(255,240,244,0.8), rgba(255,240,244,0) 60%), radial-gradient(ellipse at 70% 60%, rgba(255,216,228,0.6), rgba(255,216,228,0) 55%), radial-gradient(ellipse at 30% 80%, rgba(255,240,244,0.4), rgba(255,240,244,0) 50%), linear-gradient(150deg, #fff0f4, #ffe0ec)" },
  { name: "Ocean Mist", value: "radial-gradient(ellipse at 50% 30%, rgba(232,244,255,0.8), rgba(232,244,255,0) 60%), radial-gradient(ellipse at 20% 70%, rgba(208,232,255,0.6), rgba(208,232,255,0) 55%), radial-gradient(ellipse at 80% 50%, rgba(228,244,255,0.4), rgba(228,244,255,0) 50%), linear-gradient(160deg, #e8f4ff, #d4ecff)" },
  { name: "Sea Glass", value: "radial-gradient(ellipse at 60% 40%, rgba(224,255,248,0.8), rgba(224,255,248,0) 60%), radial-gradient(ellipse at 30% 60%, rgba(200,240,240,0.6), rgba(200,240,240,0) 55%), radial-gradient(ellipse at 70% 80%, rgba(224,255,244,0.4), rgba(224,255,244,0) 50%), linear-gradient(145deg, #e0fff8, #c8f0f0)" },
  { name: "Forest Floor", value: "radial-gradient(ellipse at 40% 30%, rgba(232,244,224,0.8), rgba(232,244,224,0) 60%), radial-gradient(ellipse at 70% 70%, rgba(216,236,208,0.6), rgba(216,236,208,0) 55%), radial-gradient(ellipse at 20% 60%, rgba(232,244,228,0.4), rgba(232,244,228,0) 50%), linear-gradient(160deg, #e8f4e0, #d4ecd0)" },
  { name: "Lavender Field", value: "radial-gradient(ellipse at 50% 40%, rgba(240,228,255,0.8), rgba(240,228,255,0) 60%), radial-gradient(ellipse at 20% 60%, rgba(224,212,248,0.6), rgba(224,212,248,0) 55%), radial-gradient(ellipse at 80% 70%, rgba(236,228,255,0.4), rgba(236,228,255,0) 50%), linear-gradient(150deg, #f0e4ff, #dcd0f8)" },
  { name: "Rose Petal", value: "radial-gradient(ellipse at 55% 35%, rgba(255,240,244,0.8), rgba(255,240,244,0) 60%), radial-gradient(ellipse at 30% 70%, rgba(255,216,228,0.6), rgba(255,216,228,0) 55%), radial-gradient(ellipse at 70% 60%, rgba(255,240,248,0.4), rgba(255,240,248,0) 50%), linear-gradient(160deg, #fff0f4, #ffdce4)" },
  { name: "Sand Dune", value: "radial-gradient(ellipse at 45% 45%, rgba(250,244,232,0.8), rgba(250,244,232,0) 60%), radial-gradient(ellipse at 20% 60%, rgba(240,232,212,0.6), rgba(240,232,212,0) 55%), radial-gradient(ellipse at 80% 40%, rgba(248,244,232,0.4), rgba(248,244,232,0) 50%), linear-gradient(145deg, #faf4e8, #ece0cc)" },
  { name: "Steel Horizon", value: "radial-gradient(ellipse at 40% 30%, rgba(221,228,236,0.8), rgba(221,228,236,0) 60%), radial-gradient(ellipse at 70% 70%, rgba(208,216,228,0.6), rgba(208,216,228,0) 55%), radial-gradient(ellipse at 30% 60%, rgba(220,228,236,0.4), rgba(220,228,236,0) 50%), linear-gradient(160deg, #dde4ec, #ccd4e0)" },
  { name: "Deep Space", value: "radial-gradient(ellipse at 35% 25%, rgba(24,16,42,0.9), rgba(24,16,42,0) 65%), radial-gradient(ellipse at 70% 75%, rgba(12,10,22,0.7), rgba(12,10,22,0) 60%), radial-gradient(ellipse at 50% 50%, rgba(8,8,16,0.5), rgba(8,8,16,0) 50%), linear-gradient(160deg, #0c0a16, #060608)" },
  { name: "Midnight Ocean", value: "radial-gradient(ellipse at 65% 25%, rgba(14,26,44,0.9), rgba(14,26,44,0) 65%), radial-gradient(ellipse at 30% 75%, rgba(10,14,26,0.7), rgba(10,14,26,0) 60%), radial-gradient(ellipse at 50% 50%, rgba(8,12,20,0.5), rgba(8,12,20,0) 50%), linear-gradient(160deg, #0a0e1a, #060810)" },
  { name: "Indigo Abyss", value: "radial-gradient(ellipse at 50% 30%, rgba(22,8,42,0.9), rgba(22,8,42,0) 65%), radial-gradient(ellipse at 30% 70%, rgba(14,10,26,0.7), rgba(14,10,26,0) 60%), radial-gradient(ellipse at 70% 50%, rgba(10,10,20,0.5), rgba(10,10,20,0) 50%), linear-gradient(160deg, #0e0a1a, #060610)" },
  { name: "Cosmos", value: "radial-gradient(ellipse at 40% 35%, rgba(22,18,36,0.9), rgba(22,18,36,0) 65%), radial-gradient(ellipse at 65% 70%, rgba(10,10,22,0.7), rgba(10,10,22,0) 60%), radial-gradient(ellipse at 50% 50%, rgba(8,8,14,0.5), rgba(8,8,14,0) 50%), linear-gradient(160deg, #0a0a16, #060610)" },
  { name: "Celestial Bloom", value: "radial-gradient(ellipse at 25% 30%, rgba(240,228,255,0.7), rgba(240,228,255,0) 55%), radial-gradient(ellipse at 75% 40%, rgba(224,240,255,0.6), rgba(224,240,255,0) 55%), radial-gradient(ellipse at 50% 75%, rgba(232,255,240,0.5), rgba(232,255,240,0) 50%), linear-gradient(150deg, #f0e4ff, #e0f0ff)" },
  { name: "Ethereal", value: "radial-gradient(ellipse at 30% 40%, rgba(240,236,255,0.8), rgba(240,236,255,0) 60%), radial-gradient(ellipse at 70% 60%, rgba(232,244,255,0.6), rgba(232,244,255,0) 55%), radial-gradient(ellipse at 50% 80%, rgba(248,240,255,0.4), rgba(248,240,255,0) 50%), linear-gradient(160deg, #f0ecff, #e8f4ff)" },
  { name: "Mystic Teal", value: "radial-gradient(ellipse at 40% 30%, rgba(216,255,240,0.8), rgba(216,255,240,0) 60%), radial-gradient(ellipse at 70% 70%, rgba(192,240,240,0.6), rgba(192,240,240,0) 55%), radial-gradient(ellipse at 20% 60%, rgba(216,248,255,0.4), rgba(216,248,255,0) 50%), linear-gradient(145deg, #d8fff0, #c0f0f0)" },
  { name: "Warm Ember", value: "radial-gradient(ellipse at 55% 35%, rgba(255,248,232,0.8), rgba(255,248,232,0) 60%), radial-gradient(ellipse at 30% 65%, rgba(255,232,200,0.6), rgba(255,232,200,0) 55%), radial-gradient(ellipse at 75% 55%, rgba(255,224,176,0.4), rgba(255,224,176,0) 50%), radial-gradient(ellipse at 50% 50%, rgba(255,216,160,0.3), rgba(255,216,160,0) 40%)" },
  { name: "Frost", value: "radial-gradient(ellipse at 45% 35%, rgba(240,248,255,0.8), rgba(240,248,255,0) 60%), radial-gradient(ellipse at 20% 65%, rgba(228,240,255,0.6), rgba(228,240,255,0) 55%), radial-gradient(ellipse at 80% 50%, rgba(240,248,255,0.4), rgba(240,248,255,0) 50%), linear-gradient(160deg, #f0f8ff, #e4f0ff)" },
  { name: "Twilight Mist", value: "radial-gradient(ellipse at 35% 30%, rgba(236,224,248,0.8), rgba(236,224,248,0) 60%), radial-gradient(ellipse at 65% 70%, rgba(224,232,255,0.6), rgba(224,232,255,0) 55%), radial-gradient(ellipse at 50% 50%, rgba(240,228,255,0.4), rgba(240,228,255,0) 50%), linear-gradient(150deg, #ece0f8, #e0e8ff)" },
];

function Toggle({ value, onChange, color }: { value: boolean; onChange: () => void; color: string }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full cursor-pointer transition-all"
      style={{
        background: value ? color : "rgba(13, 148, 136, 0.15)",
        border: "none",
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          transform: value ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      className="rounded-2xl p-6 mb-5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function Collapsible({ icon, title, children, defaultOpen = false, delay = 0 }: { icon: string; title: string; children: React.ReactNode; defaultOpen?: boolean; delay?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Section delay={delay}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{ background: "none", border: "none" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: "#0d9488" }}>{icon}</span>
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {title}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs"
          style={{ color: "var(--text-faint)" }}
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

export default function SettingsPage() {
  const { updatePreferences } = useAuth();
  const [accent, setAccent] = useState("#0d9488");
  const [textSize, setTextSize] = useState("medium");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [defaultPage, setDefaultPage] = useState("/");
  const [anonymousDefault, setAnonymousDefault] = useState(true);
  const [fontChoice, setFontChoice] = useState("default");
  const [compactMode, setCompactMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [campfireName, setCampfireName] = useState("");
  const [poetryPenName, setPoetryPenName] = useState("");
  const [cursorColor, setCursorColor] = useState("#0d9488");
  const [elyraPersonality, setElyraPersonality] = useState("friendly");
  const [elyraResponseLength, setElyraResponseLength] = useState("medium");
  const [showElyraButton, setShowElyraButton] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Advanced settings

  const [messageDensity, setMessageDensity] = useState("normal");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [focusIndicators, setFocusIndicators] = useState(false);
  const [reducedTransparency, setReducedTransparency] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [favoriteRoom, setFavoriteRoom] = useState("");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");

  const [starDensity, setStarDensity] = useState("normal");
  const [canvasGridSnap, setCanvasGridSnap] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");

  const [activeTab, setActiveTab] = useState("profile");
  const tabs = [
    { id: "profile", label: "Profile", icon: "✦" },
    { id: "appearance", label: "Appearance", icon: "◇" },
    { id: "chat", label: "Chat & AI", icon: "✧" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "rooms", label: "Rooms", icon: "🏠" },
    { id: "data", label: "Data", icon: "🛡" },
  ];

  useEffect(() => {
    const init = async () => {
      const client = supabase();
      const { data: { session } } = await client.auth.getSession();
      if (session) {
        setIsAnonymous(session.user.is_anonymous || false);
        setUserId(session.user.id);

        const { data: prefs } = await client
          .from("user_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (prefs) {
          if (prefs.accent_color) setAccent(prefs.accent_color);
          if (prefs.text_size) setTextSize(prefs.text_size);
          if (prefs.reduce_motion !== undefined) {
            setReduceMotion(prefs.reduce_motion);
            // Apply reduce motion on load
            if (prefs.reduce_motion) {
              document.documentElement.style.setProperty("--anim-duration-multiplier", "0.01");
              document.body.classList.add("reduce-motion");
            }
          }
          if (prefs.default_page) setDefaultPage(prefs.default_page);
          if (prefs.anonymous_default !== undefined) setAnonymousDefault(prefs.anonymous_default);
          if (prefs.compact_mode !== undefined) {
            setCompactMode(prefs.compact_mode);
            // Apply compact mode on load
            if (prefs.compact_mode) {
              document.documentElement.style.setProperty("--compact-multiplier", "0.75");
              document.body.classList.add("compact-mode");
            }
          }
        }

        const { data: profile } = await client
          .from("users")
          .select("display_name")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.display_name) setDisplayName(profile.display_name);
      }

      // Load localStorage settings
      const stored: [string, (v: string) => void][] = [
        ["mural-cursor-color", setCursorColor],
        ["elyra-personality", setElyraPersonality],
        ["elyra-response-length", setElyraResponseLength],
        ["campfire-name", setCampfireName],
        ["poetry-pen-name", setPoetryPenName],
        ["favorite-room", setFavoriteRoom],
        ["star-density", setStarDensity],
        ["message-density", setMessageDensity],
        ["profile-visibility", setProfileVisibility],
      ];
      stored.forEach(([key, setter]) => {
        const val = localStorage.getItem(key);
        if (val) setter(val);
      });

      const boolSettings: [string, (v: boolean) => void][] = [
        ["hide-elyra-button", (v) => setShowElyraButton(!v)],
        ["auto-scroll", setAutoScroll],
        ["show-timestamps", setShowTimestamps],
        ["high-contrast", setHighContrast],
        ["focus-indicators", setFocusIndicators],
        ["reduced-transparency", setReducedTransparency],
        ["dyslexia-font", setDyslexiaFont],
        ["show-online-status", setShowOnlineStatus],
        ["read-receipts", setReadReceipts],
        ["canvas-grid-snap", setCanvasGridSnap],
      ];
      boolSettings.forEach(([key, setter]) => {
        const val = localStorage.getItem(key);
        if (val !== null) setter(val === "true");
      });

      const storedBg = localStorage.getItem("bg-color");
      if (storedBg) {
        setBgColor(storedBg);
        document.documentElement.style.setProperty("--bg-color", storedBg);
        document.body.style.background = storedBg;
        setAdaptiveTextColors(storedBg);
      }
    };
    init();
  }, []);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function saveLocal(key: string, value: unknown) {
    localStorage.setItem(key, String(value));
    showSaved();
  }

  async function savePref(key: string, value: unknown) {
    if (!userId) return;
    const client = supabase();
    await client
      .from("user_preferences")
      .upsert({ user_id: userId, [key]: value, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    showSaved();
  }

  function updateAccent(c: string) {
    setAccent(c);
    document.documentElement.style.setProperty("--elovayne-nebula", c);
    savePref("accent_color", c);
    updatePreferences({ accent_color: c });
  }

  function updateTextSize(s: string) {
    setTextSize(s);
    const size = s === "small" ? "14px" : s === "large" ? "18px" : "16px";
    document.documentElement.style.setProperty("--font-size-base", size);
    savePref("text_size", s);
  }

  async function updateDisplayName() {
    if (!userId || !displayName.trim()) return;
    const client = supabase();
    await client
      .from("users")
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);
    showSaved();
  }

  function updateCursorColor(c: string) {
    setCursorColor(c);
    localStorage.setItem("mural-cursor-color", c);
    showSaved();
  }

  function setAdaptiveTextColors(colorValue: string) {
    let isLight = true; // default to light

    if (colorValue.startsWith("#") && colorValue.length >= 7) {
      // Hex color
      const r = parseInt(colorValue.slice(1, 3), 16) / 255;
      const g = parseInt(colorValue.slice(3, 5), 16) / 255;
      const b = parseInt(colorValue.slice(5, 7), 16) / 255;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      isLight = luminance > 0.5;
    } else if (colorValue.startsWith("linear-gradient") || colorValue.startsWith("radial-gradient")) {
      // Gradient - extract first color to determine lightness
      const hexMatch = colorValue.match(/#[0-9a-fA-F]{6}/);
      if (hexMatch) {
        const hex = hexMatch[0];
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        isLight = luminance > 0.5;
      }
    }

    const root = document.documentElement.style;
    if (isLight) {
      root.setProperty("--text-primary", "#0f172a");
      root.setProperty("--text-secondary", "#334155");
      root.setProperty("--text-muted", "#64748b");
      root.setProperty("--text-dim", "#94a3b8");
      root.setProperty("--text-faint", "rgba(15, 23, 42, 0.4)");
      root.setProperty("--border-subtle", "rgba(13, 148, 136, 0.12)");
      root.setProperty("--card-bg", "rgba(13, 148, 136, 0.04)");
      root.setProperty("--input-bg", "rgba(13,148,136,0.06)");
      // Brighter animations on light backgrounds
      root.setProperty("--nebula-opacity", "0.25");
      root.setProperty("--particle-opacity", "0.9");
      root.setProperty("--constellation-opacity", "0.35");
      root.setProperty("--glow-opacity", "0.1");
      root.setProperty("--orb-opacity", "0.2");
    } else {
      root.setProperty("--text-primary", "#f1f5f9");
      root.setProperty("--text-secondary", "#e2e8f0");
      root.setProperty("--text-muted", "#94a3b8");
      root.setProperty("--text-dim", "#64748b");
      root.setProperty("--text-faint", "rgba(241, 245, 249, 0.4)");
      root.setProperty("--border-subtle", "rgba(13, 148, 136, 0.2)");
      root.setProperty("--card-bg", "rgba(13, 148, 136, 0.08)");
      root.setProperty("--input-bg", "rgba(13,148,136,0.12)");
      // Subtle animations on dark backgrounds
      root.setProperty("--nebula-opacity", "0.15");
      root.setProperty("--particle-opacity", "0.7");
      root.setProperty("--constellation-opacity", "0.25");
      root.setProperty("--glow-opacity", "0.06");
      root.setProperty("--orb-opacity", "0.12");
    }
  }

  function updateBgColor(c: string) {
    setBgColor(c);
    localStorage.setItem("bg-color", c);
    document.documentElement.style.setProperty("--bg-color", c);
    document.body.style.background = c;
    setAdaptiveTextColors(c);
    showSaved();
  }

  function updateCampfireName(n: string) {
    setCampfireName(n);
    localStorage.setItem("campfire-name", n);
    showSaved();
  }

  function updatePoetryPenName(n: string) {
    setPoetryPenName(n);
    localStorage.setItem("poetry-pen-name", n);
    showSaved();
  }

  function updateElyraPersonality(p: string) {
    setElyraPersonality(p);
    localStorage.setItem("elyra-personality", p);
    showSaved();
  }

  function updateElyraResponseLength(l: string) {
    setElyraResponseLength(l);
    localStorage.setItem("elyra-response-length", l);
    showSaved();
  }

  function toggleElyraButton() {
    const next = !showElyraButton;
    setShowElyraButton(next);
    localStorage.setItem("hide-elyra-button", String(!next));
    showSaved();
  }

  async function handleEmailSignIn() {
    if (!email.trim()) return;
    const client = supabase();
    const { error } = await client.auth.signInWithOtp({ email: email.trim() });
    if (!error) setEmailSent(true);
  }

  async function handleSignOut() {
    const client = supabase();
    await client.auth.signOut();
    window.location.href = "/";
  }

  function clearLocalData() {
    localStorage.clear();
    sessionStorage.clear();
    showSaved();
  }

  function exportSoulMap() {
    try {
      const raw = localStorage.getItem("soul-map-answers");
      if (!raw) return;
      const answers = JSON.parse(raw);
      const lines = answers.map((a: { question: string; answer: string; category: string }) =>
        `[${a.category}] ${a.question}\n${a.answer}\n`
      );
      const blob = new Blob([`Soul Map Export\n${"=".repeat(40)}\n\n${lines.join("\n")}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soul-map-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showSaved();
    } catch { /* silent */ }
  }

  function exportReflections() {
    try {
      const raw = localStorage.getItem("reflection_room_entries");
      if (!raw) return;
      const entries = JSON.parse(raw);
      const lines = entries.map((e: { prompt: string; text: string; created_at: string }) =>
        `[${new Date(e.created_at).toLocaleDateString()}] ${e.prompt}\n${e.text}\n`
      );
      const blob = new Blob([`Reflections Export\n${"=".repeat(40)}\n\n${lines.join("\n")}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflections-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showSaved();
    } catch { /* silent */ }
  }

  function exportAllSettings() {
    const settings: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) settings[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elovayne-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaved();
  }

  function importSettings(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const settings = JSON.parse(ev.target?.result as string);
        Object.entries(settings).forEach(([key, value]) => {
          if (typeof value === "string") localStorage.setItem(key, value);
        });
        showSaved();
        window.location.reload();
      } catch { /* silent */ }
    };
    reader.readAsText(file);
  }

  function resetPreferences() {
    setAccent("#0d9488");
    setTextSize("medium");
    setReduceMotion(false);
    setDefaultPage("/");
    setAnonymousDefault(true);
    setFontChoice("default");
    setCompactMode(false);
    setHighContrast(false);
    setFocusIndicators(false);
    setReducedTransparency(false);
    setDyslexiaFont(false);
    document.documentElement.style.setProperty("--elovayne-nebula", "#0d9488");
    document.documentElement.style.setProperty("--font-size-base", "16px");
    document.body.style.fontFamily = "Inter, sans-serif";
    if (userId) {
      const client = supabase();
      client.from("user_preferences").upsert({
        user_id: userId,
        accent_color: "#0d9488",
        text_size: "medium",
        reduce_motion: false,
        default_page: "/",
        anonymous_default: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
    showSaved();
  }

  async function deleteAccount() {
    if (!userId) return;
    const client = supabase();
    await client.from("user_preferences").delete().eq("user_id", userId);
    await client.from("saves").delete().eq("user_id", userId);
    await client.from("reactions").delete().eq("user_id", userId);
    await client.from("posts").delete().eq("user_id", userId);
    await client.from("users").delete().eq("id", userId);
    await client.auth.signOut();
    localStorage.clear();
    window.location.href = "/";
  }

  function reShowWelcome() {
    localStorage.removeItem("elovayne-welcome-seen");
    showSaved();
  }

  const inputStyle = { background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" };
  const accentBg = `${accent}15`;
  const accentBorder = `${accent}30`;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 pt-20 sm:pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="text-4xl mb-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                ⚙
              </motion.div>
              <h1
                className="text-2xl sm:text-3xl mb-2"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                }}
              >
                Settings
              </h1>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                Shape your corner of Elovayne
              </p>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs mt-2"
                  style={{ color: "#10b981" }}
                >
                  ✓ Saved
                </motion.p>
              )}
            </motion.div>

            {/* Tab Bar */}
            <div className="mb-8">
              <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    style={{
                      color: activeTab === tab.id ? accent : "var(--text-muted)",
                      background: "none",
                      border: "none",
                    }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="settingsTab"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10 hidden sm:inline">{tab.icon}</span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>✦</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Identity</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Display Name</div>
                    <div className="flex gap-2">
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name..." maxLength={24} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && updateDisplayName()} />
                      <button onClick={updateDisplayName} className="btn btn-primary btn-sm">Save</button>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>Shown in Mural and other features</p>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Mural Cursor Color</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {CURSOR_COLORS.map((c) => (
                        <button key={c} onClick={() => updateCursorColor(c)} className="w-7 h-7 rounded-full cursor-pointer transition-transform" style={{ background: c, boxShadow: cursorColor === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none", transform: cursorColor === c ? "scale(1.15)" : "scale(1)" }} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Campfire Display Name</div>
                    <div className="flex gap-2">
                      <input type="text" value={campfireName} onChange={(e) => setCampfireName(e.target.value)} placeholder="Anonymous" maxLength={20} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && updateCampfireName(campfireName)} />
                      <button onClick={() => updateCampfireName(campfireName)} className="btn btn-primary btn-sm">Save</button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Poetry Pen Name</div>
                    <div className="flex gap-2">
                      <input type="text" value={poetryPenName} onChange={(e) => setPoetryPenName(e.target.value)} placeholder="Anonymous" maxLength={30} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && updatePoetryPenName(poetryPenName)} />
                      <button onClick={() => updatePoetryPenName(poetryPenName)} className="btn btn-primary btn-sm">Save</button>
                    </div>
                  </div>
                </Section>

                <Section delay={0.1}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>✦</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Account</span>
                  </div>

                  <div className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
                    {isAnonymous ? "You are browsing anonymously" : "Signed in with email"}
                    {userId && <span className="block mt-1 text-[10px]" style={{ color: "rgba(15,23,42,0.25)" }}>ID: {userId.slice(0, 8)}...</span>}
                  </div>

                  {isAnonymous && (
                    <div className="mb-4">
                      <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Save your account with email</div>
                      {emailSent ? (
                        <p className="text-xs py-3 text-center rounded-lg" style={{ background: "rgba(16,185,129,0.06)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }}>Check your email for the sign-in link</p>
                      ) : (
                        <div className="flex gap-2">
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()} />
                          <button onClick={handleEmailSignIn} disabled={!email.trim()} className="btn btn-primary btn-sm disabled:opacity-40">Link</button>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={handleSignOut} className="w-full py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01]" style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)", color: "rgba(239, 68, 68, 0.7)" }}>Sign Out</button>
                </Section>
              </motion.div>
            )}

            {/* Tab: Appearance */}
            {activeTab === "appearance" && (
              <motion.div key="appearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>✧</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Accent Color</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {accentColors.map(color => (
                      <button key={color.value} onClick={() => updateAccent(color.value)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all" style={{ background: accent === color.value ? `${color.value}10` : "rgba(13, 148, 136, 0.03)", border: `1px solid ${accent === color.value ? `${color.value}30` : "rgba(13, 148, 136, 0.08)"}` }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${color.value}15`, color: color.value, border: `2px solid ${accent === color.value ? color.value : "transparent"}` }}>{color.icon}</div>
                        <span className="text-[10px]" style={{ color: accent === color.value ? color.value : "rgba(15, 23, 42, 0.4)" }}>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section delay={0.1}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>◫</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Background</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Custom Color</div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={bgColor} onChange={(e) => updateBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" style={{ background: "none" }} />
                      <input type="text" value={bgColor} onChange={(e) => { const val = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateBgColor(val); }} maxLength={7} className="flex-1 px-3 py-2 rounded-lg text-xs outline-none font-mono" style={{ background: "var(--input-bg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} placeholder="#ffffff" />
                      <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: bgColor, border: "1px solid var(--border-subtle)" }} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Solid Colors</div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                      {bgPresets.map((preset) => (
                        <button key={preset.value} onClick={() => updateBgColor(preset.value)} className="w-full aspect-square rounded-lg cursor-pointer transition-all" title={preset.name} style={{ background: preset.value, border: bgColor === preset.value ? `2px solid ${accent}` : "1px solid rgba(13,148,136,0.12)", transform: bgColor === preset.value ? "scale(1.1)" : "scale(1)" }} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Gradients & Atmospheres</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {gradientPresets.map((preset) => (
                        <button key={preset.name} onClick={() => updateBgColor(preset.value)} className="relative flex items-end p-2.5 rounded-xl cursor-pointer transition-all overflow-hidden" title={preset.name} style={{ background: preset.value, border: bgColor === preset.value ? `2px solid ${accent}` : "1px solid rgba(13,148,136,0.1)", transform: bgColor === preset.value ? "scale(1.02)" : "scale(1)", minHeight: "64px", aspectRatio: "16/10", boxShadow: bgColor === preset.value ? `0 4px 20px ${accent}30` : "0 2px 8px rgba(0,0,0,0.04)" }}>
                          <span className="text-[9px] px-2 py-1 rounded-md transition-all" style={{ background: preset.name.includes("Deep") || preset.name.includes("Midnight") || preset.name.includes("Indigo") || preset.name.includes("Cosmos") ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.8)", color: preset.name.includes("Deep") || preset.name.includes("Midnight") || preset.name.includes("Indigo") || preset.name.includes("Cosmos") ? "rgba(255,255,255,0.7)" : "#555", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", fontWeight: 500, letterSpacing: "0.03em" }}>{preset.name}</span>
                          {bgColor === preset.value && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[8px]" style={{ background: accent, color: "white" }}>✓</motion.span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => updateBgColor("#ffffff")} className="btn btn-ghost btn-sm">Reset to white</button>
                </Section>

                <Section delay={0.15}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>◇</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Text & Layout</span>
                  </div>

                  <div className="mb-5">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Text Size</div>
                    <div className="flex gap-2">
                      {textSizes.map((size) => (
                        <button key={size.value} onClick={() => updateTextSize(size.value)} className="flex-1 py-2 rounded-lg transition-all" style={{ background: textSize === size.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${textSize === size.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: textSize === size.value ? accent : "rgba(15, 23, 42, 0.4)", fontSize: size.preview }}>{size.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Font Style</div>
                    <div className="flex gap-2 flex-wrap">
                      {fontChoices.map((f) => (
                        <button key={f.value} onClick={() => { setFontChoice(f.value); document.body.style.fontFamily = f.family; savePref("font_choice", f.value); }} className="flex-1 py-2 rounded-lg text-xs transition-all" style={{ background: fontChoice === f.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${fontChoice === f.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: fontChoice === f.value ? accent : "rgba(15, 23, 42, 0.4)", fontFamily: f.family }}>{f.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Compact Mode</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Smaller gaps and padding</div></div>
                      <Toggle value={compactMode} onChange={() => { const next = !compactMode; setCompactMode(next); savePref("compact_mode", next); localStorage.setItem("compact_mode", String(next)); if (next) { document.documentElement.style.setProperty("--compact-multiplier", "0.75"); document.body.classList.add("compact-mode"); } else { document.documentElement.style.setProperty("--compact-multiplier", "1"); document.body.classList.remove("compact-mode"); } }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Reduce Motion</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Minimize animations</div></div>
                      <Toggle value={reduceMotion} onChange={() => { const next = !reduceMotion; setReduceMotion(next); savePref("reduce_motion", next); if (next) { document.documentElement.style.setProperty("--anim-duration-multiplier", "0.01"); document.body.classList.add("reduce-motion"); } else { document.documentElement.style.setProperty("--anim-duration-multiplier", "1"); document.body.classList.remove("reduce-motion"); } }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Show Timestamps</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Display message times</div></div>
                      <Toggle value={showTimestamps} onChange={() => { setShowTimestamps(!showTimestamps); saveLocal("show-timestamps", !showTimestamps); }} color={accent} />
                    </div>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* Tab: Chat & AI */}
            {activeTab === "chat" && (
              <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>✦</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Elyra AI</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Default Personality</div>
                    <div className="flex gap-2 flex-wrap">
                      {elyraPersonalities.map((p) => (
                        <button key={p.value} onClick={() => updateElyraPersonality(p.value)} className="px-3 py-2 rounded-lg text-[10px] transition-all" style={{ background: elyraPersonality === p.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${elyraPersonality === p.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: elyraPersonality === p.value ? accent : "rgba(15, 23, 42, 0.4)" }}>{p.icon} {p.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Response Length</div>
                    <div className="flex gap-2">
                      {elyraResponseLengths.map((l) => (
                        <button key={l.value} onClick={() => updateElyraResponseLength(l.value)} className="flex-1 py-2 rounded-lg text-xs transition-all" style={{ background: elyraResponseLength === l.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${elyraResponseLength === l.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: elyraResponseLength === l.value ? accent : "rgba(15, 23, 42, 0.4)" }}>{l.label}</button>
                      ))}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>{elyraResponseLengths.find(l => l.value === elyraResponseLength)?.desc}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Show Floating Button</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Quick access on all pages</div></div>
                    <Toggle value={showElyraButton} onChange={toggleElyraButton} color={accent} />
                  </div>
                </Section>

                <Section delay={0.1}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>💬</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Chat & Messages</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Message Density</div>
                    <div className="flex gap-2">
                      {["compact", "normal", "spacious"].map((d) => (
                        <button key={d} onClick={() => { setMessageDensity(d); saveLocal("message-density", d); }} className="flex-1 py-2 rounded-lg text-xs capitalize transition-all" style={{ background: messageDensity === d ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${messageDensity === d ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: messageDensity === d ? accent : "rgba(15, 23, 42, 0.4)" }}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Auto-scroll</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Scroll to new messages automatically</div></div>
                    <Toggle value={autoScroll} onChange={() => { setAutoScroll(!autoScroll); saveLocal("auto-scroll", !autoScroll); }} color={accent} />
                  </div>
                </Section>
              </motion.div>
            )}

            {/* Tab: Privacy */}
            {activeTab === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>🔒</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Privacy & Visibility</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Profile Visibility</div>
                    <div className="flex gap-2">
                      {[{ value: "public", label: "Public" }, { value: "anonymous", label: "Anonymous" }].map((v) => (
                        <button key={v.value} onClick={() => { setProfileVisibility(v.value); saveLocal("profile-visibility", v.value); }} className="flex-1 py-2 rounded-lg text-xs transition-all" style={{ background: profileVisibility === v.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${profileVisibility === v.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: profileVisibility === v.value ? accent : "rgba(15, 23, 42, 0.4)" }}>{v.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Show Online Status</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Let others see when you&apos;re active</div></div>
                      <Toggle value={showOnlineStatus} onChange={() => { setShowOnlineStatus(!showOnlineStatus); saveLocal("show-online-status", !showOnlineStatus); }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Read Receipts</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Show when messages are read</div></div>
                      <Toggle value={readReceipts} onChange={() => { setReadReceipts(!readReceipts); saveLocal("read-receipts", !readReceipts); }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Post Anonymously by Default</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Always share as anonymous</div></div>
                      <Toggle value={anonymousDefault} onChange={() => { setAnonymousDefault(!anonymousDefault); savePref("anonymous_default", !anonymousDefault); }} color={accent} />
                    </div>
                  </div>
                </Section>

                <Section delay={0.1}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>♿</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Accessibility</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>High Contrast</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Increase contrast for better visibility</div></div>
                      <Toggle value={highContrast} onChange={() => { setHighContrast(!highContrast); saveLocal("high-contrast", !highContrast); }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Focus Indicators</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Visible outlines on focused elements</div></div>
                      <Toggle value={focusIndicators} onChange={() => { setFocusIndicators(!focusIndicators); saveLocal("focus-indicators", !focusIndicators); }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Reduced Transparency</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Replace glass effects with solid backgrounds</div></div>
                      <Toggle value={reducedTransparency} onChange={() => { setReducedTransparency(!reducedTransparency); saveLocal("reduced-transparency", !reducedTransparency); }} color={accent} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Dyslexia-friendly Font</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Use OpenDyslexic typeface</div></div>
                      <Toggle value={dyslexiaFont} onChange={() => { setDyslexiaFont(!dyslexiaFont); saveLocal("dyslexia-font", !dyslexiaFont); if (!dyslexiaFont) { setFontChoice("dyslexia"); document.body.style.fontFamily = "'OpenDyslexic', sans-serif"; } else { setFontChoice("default"); document.body.style.fontFamily = "Inter, sans-serif"; } }} color={accent} />
                    </div>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* Tab: Rooms */}
            {activeTab === "rooms" && (
              <motion.div key="rooms" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>🏠</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Room Preferences</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Favorite Room</div>
                    <div className="flex gap-2 flex-wrap">
                      {roomOptions.map((r) => (
                        <button key={r.value} onClick={() => { setFavoriteRoom(r.value); saveLocal("favorite-room", r.value); }} className="px-3 py-2 rounded-lg text-[10px] transition-all" style={{ background: favoriteRoom === r.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${favoriteRoom === r.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: favoriteRoom === r.value ? accent : "rgba(15, 23, 42, 0.4)" }}>{r.icon} {r.label}</button>
                      ))}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>Quick access from the Elyra button</p>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Default Page</div>
                    <div className="flex gap-2 flex-wrap">
                      {defaultPages.map((page) => (
                        <button key={page.value} onClick={() => { setDefaultPage(page.value); savePref("default_page", page.value); }} className="px-3 py-2 rounded-lg text-[10px] transition-all" style={{ background: defaultPage === page.value ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${defaultPage === page.value ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: defaultPage === page.value ? accent : "rgba(15, 23, 42, 0.4)" }}>{page.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>Stargazing Star Density</div>
                    <div className="flex gap-2">
                      {["sparse", "normal", "dense"].map((d) => (
                        <button key={d} onClick={() => { setStarDensity(d); saveLocal("star-density", d); }} className="flex-1 py-2 rounded-lg text-xs capitalize transition-all" style={{ background: starDensity === d ? accentBg : "rgba(13, 148, 136, 0.04)", border: `1px solid ${starDensity === d ? accentBorder : "rgba(13, 148, 136, 0.08)"}`, color: starDensity === d ? accent : "rgba(15, 23, 42, 0.4)" }}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Canvas Grid Snap</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Snap brushes to grid</div></div>
                    <Toggle value={canvasGridSnap} onChange={() => { setCanvasGridSnap(!canvasGridSnap); saveLocal("canvas-grid-snap", !canvasGridSnap); }} color={accent} />
                  </div>
                </Section>
              </motion.div>
            )}

            {/* Tab: Data */}
            {activeTab === "data" && (
              <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Section delay={0.05}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: accent }}>🛡</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Data & Privacy</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Export Soul Map", desc: "Download your soul map answers", action: exportSoulMap, btn: "Export" },
                      { label: "Export Reflections", desc: "Download your reflection entries", action: exportReflections, btn: "Export" },
                      { label: "Export All Settings", desc: "Backup your complete configuration", action: exportAllSettings, btn: "Export" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.label}</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>{item.desc}</div></div>
                        <button onClick={item.action} className="btn btn-ghost btn-sm">{item.btn}</button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Import Settings</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Restore from a backup file</div></div>
                      <label className="btn btn-ghost btn-sm cursor-pointer">
                        Import
                        <input type="file" accept=".json" onChange={importSettings} className="hidden" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Clear Local Data</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Remove cached data from this device</div></div>
                      <button onClick={clearLocalData} className="btn btn-ghost btn-sm">Clear</button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Reset All Preferences</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Restore default settings</div></div>
                      <button onClick={resetPreferences} className="px-3 py-1.5 rounded-lg text-[10px] cursor-pointer" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", color: "#f97316" }}>Reset</button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div><div className="text-xs" style={{ color: "var(--text-secondary)" }}>Anonymous Posts</div><div className="text-[10px]" style={{ color: "var(--text-dim)" }}>Cannot be traced back to you</div></div>
                      <span className="text-[10px]" style={{ color: "#10b981" }}>Private</span>
                    </div>
                  </div>
                </Section>

                <Section delay={0.1}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm" style={{ color: "#ef4444" }}>⚠</span>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Danger Zone</span>
                  </div>

                  {showDeleteConfirm ? (
                    <div className="p-4 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <p className="text-xs mb-3" style={{ color: "rgba(15,23,42,0.6)" }}>This will permanently delete your account, posts, reactions, and saves. This cannot be undone.</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={deleteAccount} className="px-4 py-2 rounded-lg text-xs text-white cursor-pointer" style={{ background: "#ef4444" }}>Delete Everything</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-2.5 rounded-xl text-xs transition-all hover:scale-[1.01]" style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.12)", color: "rgba(239, 68, 68, 0.6)" }}>Delete Account</button>
                  )}
                </Section>
              </motion.div>
            )}

            {/* Links */}
            <div className="flex justify-center gap-8 mt-10">
              {["About", "FAQ", "Support"].map((label) => (
                <a key={label} href={`/${label.toLowerCase()}`} className="text-xs tracking-wider uppercase hover:opacity-50 transition-opacity" style={{ color: "var(--text-faint)", textDecoration: "none", fontSize: "10px", letterSpacing: "0.1em" }}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
