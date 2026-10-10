"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  CROCHET_ONLY_STITCHES,
  CROCHET_ONLY_ABBREVIATIONS,
  YARN_WEIGHTS,
  YARN_FIBERS,
  YARN_ESTIMATES,
  CROCHET_TERMS_UK_US,
} from "@/lib/threads/data";
import type { StitchTechnique } from "@/lib/threads/data";

type Section =
  | "home"
  | "start"
  | "counter"
  | "projects"
  | "new-project"
  | "project"
  | "stitches"
  | "stitch"
  | "abbreviations"
  | "yarn-calculator"
  | "gauge"
  | "learn";

interface Project {
  id: string;
  name: string;
  craft: string;
  project_type: string;
  size: string;
  yarn_type: string;
  yarn_weight: string;
  yarn_color: string;
  needle_hook_size: string;
  difficulty: string;
  current_row: number;
  repeat_count: number;
  progress_percent: number;
  status: string;
  notes: string;
  pattern: string;
  created_at: string;
  updated_at: string;
}

/* ---------------------------------------------------------------- styles */

const card: React.CSSProperties = {
  background: "rgba(31, 56, 40, 0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(0, 255, 136, 0.10)",
  borderRadius: 18,
  padding: 20,
};

const accent = "var(--crochetworld-nebula)";
const dim = "rgba(0, 255, 136, 0.45)";
const text = "#e0f5e8";
const muted = "#90c8a8";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0, 255, 136, 0.05)",
  border: "1px solid rgba(0, 255, 136, 0.18)",
  borderRadius: 12,
  padding: "14px 16px",
  color: text,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  minHeight: 48,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: accent,
  marginBottom: 8,
};

const Heading: React.FC<{ children?: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 28 }}>
    <h2
      style={{
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: "4px",
        textTransform: "uppercase",
        color: text,
        margin: "0 0 6px",
      }}
    >
      {children}
    </h2>
    {sub && <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.6 }}>{sub}</p>}
  </div>
);

const BackButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = "Back" }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
      minHeight: 44,
      padding: "10px 18px",
      borderRadius: 999,
      background: "rgba(0, 255, 136, 0.06)",
      border: "1px solid rgba(0, 255, 136, 0.2)",
      color: accent,
      fontSize: 12,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      cursor: "pointer",
    }}
  >
    ← {label}
  </button>
);

const field: React.CSSProperties = {
  display: "block",
  marginBottom: 20,
};

/* ----------------------------------------------------------------- tools */

const TOOLS: { id: Section; icon: string; label: string; hint: string }[] = [
  { id: "start", icon: "🌱", label: "Start Crocheting", hint: "New here? Begin here" },
  { id: "counter", icon: "🧶", label: "Counter", hint: "Count rounds and repeats" },
  { id: "projects", icon: "📁", label: "My Projects", hint: "Everything you're making" },
  { id: "new-project", icon: "✧", label: "Start a Project", hint: "Add something new" },
  { id: "stitches", icon: "❋", label: "Stitch Library", hint: "Every crochet stitch, step by step" },
  { id: "abbreviations", icon: "🔤", label: "Abbreviations", hint: "What does dc mean?" },
  { id: "yarn-calculator", icon: "🧶", label: "Yarn Calculator", hint: "How much yarn do I need?" },
  { id: "gauge", icon: "📐", label: "Gauge Helper", hint: "Get the right hook size" },
  { id: "learn", icon: "📘", label: "Learn", hint: "Crochet basics, in order" },
];

const LESSONS = [
  "Choosing yarn and hooks",
  "The slip knot",
  "Chain stitch",
  "Working into the second chain",
  "Single crochet",
  "Turning and starting new rows",
  "Working in the round",
  "Increasing and decreasing",
  "Finishing and weaving in ends",
];

const PROJECT_TYPES = [
  "Amigurumi", "Beanie", "Scarf", "Blanket", "Bag",
  "Cardigan", "Sweater", "Coasters", "Bonnet", "Other",
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

/* ------------------------------------------------------------ components */

const Counter: React.FC<{
  rows: number;
  setRows: (n: number) => void;
  repeats: number;
  setRepeats: (n: number) => void;
  compact?: boolean;
}> = ({ rows, setRows, repeats, setRepeats, compact }) => (
  <div style={{ ...card, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
    <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: dim, marginBottom: 8 }}>
      Round
    </div>
    <div style={{ fontSize: compact ? 64 : 88, fontWeight: 200, color: text, lineHeight: 1, marginBottom: 24 }}>
      {rows}
    </div>

    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <button
        onClick={() => setRows(Math.max(0, rows - 1))}
        aria-label="Previous round"
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.2)",
          color: dim, fontSize: 26, cursor: "pointer", flexShrink: 0,
        }}
      >
        −
      </button>

      <button
        onClick={() => setRows(rows + 1)}
        style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "rgba(0, 255, 136, 0.12)", border: "2px solid rgba(0, 255, 136, 0.35)",
          color: accent, fontSize: 40, cursor: "pointer", flexShrink: 0,
          boxShadow: "0 0 30px rgba(0, 255, 136, 0.15)",
        }}
        aria-label="Next round"
      >
        +
      </button>
    </div>

    <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
      <button
        onClick={() => setRepeats(repeats + 1)}
        style={{
          flex: 1, minHeight: 48, borderRadius: 12,
          background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.2)",
          color: accent, fontSize: 13, cursor: "pointer",
        }}
      >
        Repeat {repeats + 1}
      </button>
      <button
        onClick={() => { setRows(0); setRepeats(0); }}
        style={{
          minHeight: 48, padding: "0 20px", borderRadius: 12,
          background: "transparent", border: "1px solid rgba(0, 255, 136, 0.15)",
          color: dim, fontSize: 12, cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  </div>
);

/* ------------------------------------------------------------------ page */

export default function ThreadsPage() {
  const { userId, loading: authLoading } = useAuth();

  const [section, setSection] = useState<Section>("home");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedStitch, setSelectedStitch] = useState<StitchTechnique | null>(null);

  // counter
  const [rows, setRows] = useState(0);
  const [repeats, setRepeats] = useState(0);

  // new project form
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [yarnType, setYarnType] = useState("");
  const [yarnWeight, setYarnWeight] = useState("");
  const [yarnColor, setYarnColor] = useState("");
  const [hook, setHook] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [notes, setNotes] = useState("");

  // yarn calculator
  const [calcType, setCalcType] = useState("blanket");
  const [calcWeight, setCalcWeight] = useState("worsted");

  // gauge
  const [swatchStitches, setSwatchStitches] = useState("");
  const [swatchInches, setSwatchInches] = useState("");
  const [targetSpi, setTargetSpi] = useState("");

  // abbreviations
  const [query, setQuery] = useState("");

  const loadProjects = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase()
      .from("threads_projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (data) setProjects(data as Project[]);
  }, [userId]);

  useEffect(() => {
    if (userId) loadProjects();
  }, [userId, loadProjects]);

  const saveProject = async () => {
    if (!userId || !name.trim()) return;
    const { data, error } = await supabase()
      .from("threads_projects")
      .insert({
        user_id: userId,
        name: name.trim(),
        craft: "crochet",
        project_type: type,
        size,
        yarn_type: yarnType,
        yarn_weight: yarnWeight,
        yarn_color: yarnColor,
        needle_hook_size: hook,
        difficulty,
        notes,
      })
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => [data as Project, ...prev]);
      setName(""); setType(""); setSize(""); setHook(""); setNotes("");
      setSection("projects");
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const patch = { ...updates, updated_at: new Date().toISOString() };
    await supabase().from("threads_projects").update(patch).eq("id", id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    setActiveProject((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
  };

  const removeProject = async (id: string) => {
    await supabase().from("threads_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setActiveProject(null);
    setSection("projects");
  };

  const openProject = (p: Project) => {
    setActiveProject(p);
    setRows(p.current_row ?? 0);
    setRepeats(p.repeat_count ?? 0);
    setNotes(p.notes ?? "");
    setSection("project");
  };

  // persist counter against the open project
  useEffect(() => {
    if (!activeProject) return;
    if (rows === activeProject.current_row && repeats === activeProject.repeat_count) return;
    const t = setTimeout(() => {
      updateProject(activeProject.id, { current_row: rows, repeat_count: repeats });
    }, 600);
    return () => clearTimeout(t);
  }, [rows, repeats, activeProject]);

  const abbrResults = query.trim()
    ? CROCHET_ONLY_ABBREVIATIONS.filter(
        (a) =>
          a.term.toLowerCase().includes(query.toLowerCase()) ||
          a.fullName.toLowerCase().includes(query.toLowerCase())
      )
    : CROCHET_ONLY_ABBREVIATIONS;

  const yarnNeeded = YARN_ESTIMATES[calcType]?.[calcWeight] ?? 0;

  const gauge = (() => {
    if (!swatchStitches || !swatchInches || !targetSpi) return null;
    const actual = parseFloat(swatchStitches) / parseFloat(swatchInches);
    const target = parseFloat(targetSpi);
    if (actual === target) return { head: "Perfect match", tip: "Use the hook size you already have." };
    const diff = ((actual - target) / target) * 100;
    if (diff < 0)
      return { head: `Your fabric is ${Math.abs(Math.round(diff))}% too loose`, tip: "Go down a hook size to tighten it up." };
    return { head: `Your fabric is ${Math.round(diff)}% too tight`, tip: "Go up a hook size for a softer drape." };
  })();

  const go = (next: Section) => {
    setSelectedStitch(null);
    setSection(next);
  };

  if (authLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: dim, fontSize: 12, letterSpacing: "3px", textTransform: "uppercase" }}>
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* soft ambient glow */}
      <div
        style={{
          position: "fixed", top: "-15%", right: "-10%", width: 520, height: 520,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.14) 0%, transparent 70%)",
          filter: "blur(90px)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed", bottom: "-10%", left: "-10%", width: 420, height: 420,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 255, 136, 0.10) 0%, transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 20px 80px", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section + (activeProject?.id ?? "") + (selectedStitch?.id ?? "")}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {/* ------------------------------------------------ HOME */}
            {section === "home" && (
              <>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <h1
                    style={{
                      fontSize: 34, fontWeight: 200, letterSpacing: "12px", textTransform: "uppercase",
                      background: "linear-gradient(135deg, var(--crochetworld-nebula), var(--crochetworld-violet))",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      margin: "0 0 10px",
                    }}
                  >
                    Threads
                  </h1>
                  <p style={{ fontSize: 14, color: muted, margin: "0 0 32px" }}>
                    Everything you need to crochet. One stitch at a time.
                  </p>

                  <button
                    onClick={() => go("start")}
                    style={{
                      minHeight: 56,
                      padding: "0 36px",
                      borderRadius: 999,
                      border: "none",
                      background: accent,
                      color: "#04160c",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                      boxShadow: "0 4px 30px rgba(0, 255, 136, 0.25)",
                    }}
                  >
                    Enter Threads
                  </button>
                </div>
              </>
            )}

            {/* ------------------------------------------ BACK */}
            {section !== "home" && (
              <BackButton
                onClick={() => go(section === "project" ? "projects" : section === "stitch" ? "stitches" : "home")}
                label={section === "project" ? "All projects" : section === "stitch" ? "Stitch library" : "Tools"}
              />
            )}

            {/* ------------------------------------------ START (beginner) */}
            {section === "start" && (
              <>
                <Heading sub="Never picked up a hook? This is where you begin." />

                <div style={{ ...card, marginBottom: 20 }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>🪝</div>
                  <h3 style={{ fontSize: 18, color: text, fontWeight: 500, margin: "0 0 8px" }}>
                    You need three things
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                    {[
                      { k: "A hook", v: "Start with a 5mm. Any yarn works for your first one." },
                      { k: "Some yarn", v: "A medium-weight cotton or acrylic is easiest to handle." },
                      { k: "Your hands", v: "That's genuinely it. Everything else you can learn as you go." },
                    ].map((x) => (
                      <div key={x.k} style={{ display: "flex", gap: 12 }}>
                        <span style={{ color: accent, fontSize: 18, lineHeight: 1.4 }}>·</span>
                        <span style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>
                          <strong style={{ color: text, fontWeight: 500 }}>{x.k}</strong> — {x.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...card, marginBottom: 20 }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>1️⃣</div>
                  <h3 style={{ fontSize: 18, color: text, fontWeight: 500, margin: "0 0 8px" }}>
                    Your first chain
                  </h3>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, margin: "0 0 16px" }}>
                    The chain is the foundation of everything in crochet. Master it and the rest follows.
                  </p>
                  {[
                    "Make a loop with your yarn, and pull a tail through to close it. This is your slip knot.",
                    "Hold the knot in your left hand. Pinch it tight.",
                    "With the hook in your right hand, loop the yarn over — from back to front.",
                    "Pull that loop through the slip knot. One chain done.",
                    "Keep going until your chain is as long as you like. Aim for 15 to start.",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                      <span style={{
                        flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                        background: "rgba(0, 255, 136, 0.12)", border: "1px solid rgba(0, 255, 136, 0.2)",
                        color: accent, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 15, color: text, lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 18 }}>
                    <button
                      onClick={() => go("stitches")}
                      style={{
                        minHeight: 48, padding: "0 24px", borderRadius: 999,
                        background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.25)",
                        color: accent, fontSize: 14, cursor: "pointer",
                      }}
                    >
                      See the full chain stitch guide
                    </button>
                  </div>
                </div>

                <div style={{ ...card, marginBottom: 20 }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>2️⃣</div>
                  <h3 style={{ fontSize: 18, color: text, fontWeight: 500, margin: "0 0 8px" }}>
                    Your first row
                  </h3>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, margin: "0 0 16px" }}>
                    Now work back along your chain with single crochet.
                  </p>
                  {[
                    "Yarn over, then push your hook into the second chain from your hook.",
                    "Pull the yarn through — you should have 2 loops on your hook.",
                    "Yarn over and pull through both loops. That's one single crochet.",
                    "Keep going across the whole chain.",
                    "Turn your work. Make one chain to rise, then work the next row the same way.",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                      <span style={{
                        flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                        background: "rgba(0, 255, 136, 0.12)", border: "1px solid rgba(0, 255, 136, 0.2)",
                        color: accent, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 15, color: text, lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 18 }}>
                    <button
                      onClick={() => go("counter")}
                      style={{
                        minHeight: 48, padding: "0 24px", borderRadius: 999,
                        background: accent, color: "#04160c", border: "none",
                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Start counting rows
                    </button>
                  </div>
                </div>

                <div style={card}>
                  <h3 style={{ fontSize: 18, color: text, fontWeight: 500, margin: "0 0 8px" }}>
                    Where to go next
                  </h3>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, margin: "0 0 20px" }}>
                    Once you&apos;ve got a few rows under your belt, these are the tools you&apos;ll reach for most.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {TOOLS.filter((t) => t.id !== "start").map((t) => (
                      <button
                        key={t.id}
                        onClick={() => go(t.id)}
                        style={{
                          ...card, cursor: "pointer", textAlign: "left", minHeight: 84, padding: 16,
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
                        <div style={{ fontSize: 14, color: text, fontWeight: 500, marginBottom: 4 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: muted, lineHeight: 1.45 }}>{t.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ------------------------------------------ COUNTER */}
            {section === "counter" && (
              <>
                <Heading sub="Tap the big button as you work. It saves automatically." />
                <Counter rows={rows} setRows={setRows} repeats={repeats} setRepeats={setRepeats} />
              </>
            )}

            {/* ------------------------------------------ PROJECTS */}
            {section === "projects" && (
              <>
                <Heading sub="Everything you're currently making." />

                {!userId ? (
                  <div style={{ ...card, textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: muted, margin: "0 0 16px" }}>Sign in to save your projects.</p>
                    <button onClick={() => go("new-project")} style={{ minHeight: 48, padding: "0 24px", borderRadius: 999, background: accent, color: "#04160c", fontWeight: 600, fontSize: 14, cursor: "pointer", border: "none" }}>
                      Start a project
                    </button>
                  </div>
                ) : projects.length === 0 ? (
                  <div style={{ ...card, textAlign: "center" }}>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>🧶</div>
                    <p style={{ fontSize: 14, color: muted, margin: "0 0 18px" }}>Nothing on the hook yet.</p>
                    <button onClick={() => go("new-project")} style={{ minHeight: 48, padding: "0 24px", borderRadius: 999, background: accent, color: "#04160c", fontWeight: 600, fontSize: 14, cursor: "pointer", border: "none" }}>
                      Start your first project
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openProject(p)}
                        style={{ ...card, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, minHeight: 76 }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 16, color: text, fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: muted }}>
                            {[p.project_type, p.size, p.yarn_weight].filter(Boolean).join(" · ") || "Crochet project"}
                          </div>
                        </div>
                        <div style={{
                          flexShrink: 0, padding: "6px 12px", borderRadius: 999, fontSize: 11,
                          background: p.status === "completed" ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.05)",
                          border: "1px solid rgba(0, 255, 136, 0.2)", color: accent,
                        }}>
                          {p.status === "completed" ? "Done" : `Round ${p.current_row ?? 0}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ------------------------------------- NEW PROJECT */}
            {section === "new-project" && (
              <>
                <Heading sub="Tell us what you're making." />
                <div style={{ ...card, maxWidth: 520, margin: "0 auto" }}>
                  <div style={field}>
                    <label style={label}>Project name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Amigurumi bunny" style={inputStyle} />
                  </div>

                  <div style={field}>
                    <label style={label}>What are you making?</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {PROJECT_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          style={{
                            minHeight: 44, padding: "0 16px", borderRadius: 999,
                            background: type === t ? "rgba(0, 255, 136, 0.12)" : "transparent",
                            border: `1px solid ${type === t ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.12)"}`,
                            color: type === t ? accent : dim, fontSize: 13, cursor: "pointer",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="Something else…"
                      style={{ ...inputStyle, marginTop: 10 }}
                    />
                  </div>

                  <div style={{ ...field, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={label}>Hook size</label>
                      <input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="5mm" style={inputStyle} />
                    </div>
                    <div>
                      <label style={label}>Size</label>
                      <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Medium" style={inputStyle} />
                    </div>
                  </div>

                  <div style={field}>
                    <label style={label}>Yarn weight</label>
                    <select value={yarnWeight} onChange={(e) => setYarnWeight(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                      <option value="" style={{ background: "#244232" }}>Not sure yet</option>
                      {YARN_WEIGHTS.map((w) => (
                        <option key={w.id} value={w.id} style={{ background: "#244232" }}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...field, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={label}>Yarn</label>
                      <input value={yarnType} onChange={(e) => setYarnType(e.target.value)} placeholder="Cotton" style={inputStyle} />
                    </div>
                    <div>
                      <label style={label}>Colour</label>
                      <input value={yarnColor} onChange={(e) => setYarnColor(e.target.value)} placeholder="Blush" style={inputStyle} />
                    </div>
                  </div>

                  <div style={field}>
                    <label style={label}>Difficulty</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          style={{
                            flex: 1, minHeight: 44, borderRadius: 12,
                            background: difficulty === d ? "rgba(0, 255, 136, 0.12)" : "transparent",
                            border: `1px solid ${difficulty === d ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.12)"}`,
                            color: difficulty === d ? accent : dim, fontSize: 13, textTransform: "capitalize", cursor: "pointer",
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={field}>
                    <label style={label}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything you want to remember…"
                      style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <button
                    onClick={saveProject}
                    disabled={!userId || !name.trim()}
                    style={{
                      width: "100%", minHeight: 54, borderRadius: 999, border: "none",
                      background: !userId || !name.trim() ? "rgba(0, 255, 136, 0.15)" : accent,
                      color: !userId || !name.trim() ? dim : "#04160c",
                      fontSize: 16, fontWeight: 600, cursor: !userId || !name.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {userId ? "Save project" : "Sign in to save"}
                  </button>
                </div>
              </>
            )}

            {/* ------------------------------------- PROJECT DETAIL */}
            {section === "project" && activeProject && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 500, color: text, margin: "0 0 4px" }}>{activeProject.name}</h2>
                    <p style={{ fontSize: 13, color: muted, margin: 0 }}>
                      {[activeProject.project_type, activeProject.size].filter(Boolean).join(" · ") || "Crochet project"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => updateProject(activeProject.id, { status: activeProject.status === "completed" ? "in-progress" : "completed" })}
                      style={{
                        minHeight: 44, padding: "0 16px", borderRadius: 999,
                        background: activeProject.status === "completed" ? "rgba(0, 255, 136, 0.12)" : "transparent",
                        border: "1px solid rgba(0, 255, 136, 0.25)", color: accent, fontSize: 12, cursor: "pointer",
                      }}
                    >
                      {activeProject.status === "completed" ? "✓ Finished" : "Mark finished"}
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this project?")) removeProject(activeProject.id); }}
                      style={{
                        minHeight: 44, padding: "0 16px", borderRadius: 999,
                        background: "rgba(255, 90, 90, 0.08)", border: "1px solid rgba(255, 90, 90, 0.22)",
                        color: "rgba(255, 140, 140, 0.8)", fontSize: 12, cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Counter rows={rows} setRows={setRows} repeats={repeats} setRepeats={setRepeats} compact />
                </div>

                <div style={{ ...card, marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 18 }}>
                    {[
                      { k: "Hook", v: activeProject.needle_hook_size },
                      { k: "Yarn", v: activeProject.yarn_weight },
                      { k: "Colour", v: activeProject.yarn_color },
                      { k: "Size", v: activeProject.size },
                      { k: "Level", v: activeProject.difficulty },
                    ]
                      .filter((x) => x.v)
                      .map((x) => (
                        <div key={x.k}>
                          <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: dim, marginBottom: 4 }}>{x.k}</div>
                          <div style={{ fontSize: 15, color: text, textTransform: x.k === "Level" ? "capitalize" : "none" }}>{x.v}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <div style={card}>
                  <label style={label}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => updateProject(activeProject.id, { notes })}
                    placeholder="Add notes…"
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
              </>
            )}

            {/* ------------------------------------- STITCHES */}
            {section === "stitches" && (
              <>
                <Heading sub={`${CROCHET_ONLY_STITCHES.length} crochet stitches, with the steps for each.`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                  {CROCHET_ONLY_STITCHES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedStitch(s); setSection("stitch"); }}
                      style={{ ...card, cursor: "pointer", textAlign: "left", minHeight: 104 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 16, color: text, fontWeight: 500 }}>{s.name}</span>
                        <span style={{
                          padding: "4px 10px", borderRadius: 999, fontSize: 11, flexShrink: 0,
                          background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.15)", color: accent,
                        }}>
                          {s.abbreviation}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: dim, textTransform: "capitalize", marginBottom: 6 }}>{s.difficulty}</div>
                      <p style={{ fontSize: 12, color: muted, margin: 0, lineHeight: 1.55 }}>{s.explanation}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ------------------------------------- STITCH DETAIL */}
            {section === "stitch" && selectedStitch && (
              <>
                <BackButton onClick={() => go("stitches")} label="Stitch library" />
                <div style={{ ...card, maxWidth: 620, margin: "0 auto" }}>
                  <h2 style={{ fontSize: 24, fontWeight: 500, color: text, margin: "0 0 12px" }}>{selectedStitch.name}</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.15)", color: accent }}>{selectedStitch.abbreviation}</span>
                    <span style={{ padding: "5px 12px", borderRadius: 999, fontSize: 12, background: "transparent", border: "1px solid rgba(0, 255, 136, 0.12)", color: dim, textTransform: "capitalize" }}>{selectedStitch.difficulty}</span>
                  </div>

                  <p style={{ fontSize: 15, color: muted, lineHeight: 1.75, margin: "0 0 28px" }}>{selectedStitch.explanation}</p>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ ...label, marginBottom: 12 }}>Steps</div>
                    {selectedStitch.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                        <span style={{
                          flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                          background: "rgba(0, 255, 136, 0.12)", border: "1px solid rgba(0, 255, 136, 0.2)",
                          color: accent, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 15, color: text, lineHeight: 1.6 }}>{step}</span>
                      </div>
                    ))}
                  </div>

                  {selectedStitch.tips && selectedStitch.tips.length > 0 && (
                    <div style={{ padding: 18, borderRadius: 14, background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.12)" }}>
                      <div style={{ ...label, marginBottom: 10 }}>Tips</div>
                      {selectedStitch.tips.map((tip, i) => (
                        <p key={i} style={{ fontSize: 14, color: muted, margin: "0 0 8px", lineHeight: 1.6 }}>· {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ------------------------------------- ABBREVIATIONS */}
            {section === "abbreviations" && (
              <>
                <Heading sub="Crochet terms, translated." />
                <div style={{ maxWidth: 520, margin: "0 auto 24px" }}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search… (dc, hdc, mr)"
                    style={inputStyle}
                  />
                </div>
                <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {abbrResults.length === 0 ? (
                    <p style={{ textAlign: "center", color: muted, fontSize: 14 }}>Nothing found.</p>
                  ) : (
                    abbrResults.map((a) => (
                      <div key={a.term} style={card}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 18, fontWeight: 600, color: accent, fontFamily: "monospace" }}>{a.term}</span>
                          <span style={{ fontSize: 15, color: text }}>{a.fullName}</span>
                        </div>
                        <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.6 }}>{a.explanation}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ------------------------------------- YARN CALCULATOR */}
            {section === "yarn-calculator" && (
              <>
                <Heading sub="A rough guess is better than running out halfway." />
                <div style={{ ...card, maxWidth: 480, margin: "0 auto" }}>
                  <div style={field}>
                    <label style={label}>Making</label>
                    <select value={calcType} onChange={(e) => setCalcType(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                      {["scarf", "beanie", "sweater", "blanket", "socks", "hat", "bag", "cardigan"].map((t) => (
                        <option key={t} value={t} style={{ background: "#244232" }}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...field, marginBottom: 24 }}>
                    <label style={label}>Yarn weight</label>
                    <select value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                      {YARN_WEIGHTS.map((w) => (
                        <option key={w.id} value={w.id} style={{ background: "#244232" }}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ textAlign: "center", padding: 24, borderRadius: 16, background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.12)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: dim, marginBottom: 10 }}>
                      You&apos;ll need about
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 300, color: text, lineHeight: 1 }}>{yarnNeeded}</div>
                    <div style={{ fontSize: 14, color: accent, marginTop: 6 }}>metres</div>
                    <div style={{ fontSize: 12, color: dim, marginTop: 4 }}>
                      ≈ {Math.round(yarnNeeded * 1.094)} yards
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: dim, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                    An estimate only — your tension and stitch choice will change this.
                  </p>
                </div>
              </>
            )}

            {/* ------------------------------------- GAUGE */}
            {section === "gauge" && (
              <>
                <Heading sub="Swatch it, then we'll tell you which hook to use." />
                <div style={{ ...card, maxWidth: 480, margin: "0 auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    <div>
                      <label style={label}>Stitches in swatch</label>
                      <input value={swatchStitches} onChange={(e) => setSwatchStitches(e.target.value)} type="number" placeholder="20" style={inputStyle} />
                    </div>
                    <div>
                      <label style={label}>Width (inches)</label>
                      <input value={swatchInches} onChange={(e) => setSwatchInches(e.target.value)} type="number" placeholder="4" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ ...field, marginBottom: 24 }}>
                    <label style={label}>Pattern wants (per inch)</label>
                    <input value={targetSpi} onChange={(e) => setTargetSpi(e.target.value)} type="number" placeholder="5" style={inputStyle} />
                  </div>

                  {gauge ? (
                    <div style={{ padding: 20, borderRadius: 16, background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.12)" }}>
                      <div style={{ fontSize: 16, color: text, marginBottom: 8 }}>{gauge.head}</div>
                      <div style={{ fontSize: 14, color: accent }}>{gauge.tip}</div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: muted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                      Fill in all three and your hook size will appear here.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ------------------------------------- LEARN */}
            {section === "learn" && (
              <>
                <Heading sub="The order to learn them in." />
                <div style={{ ...card, maxWidth: 480, margin: "0 auto" }}>
                  {LESSONS.map((l, i) => (
                    <div key={l} style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: i < LESSONS.length - 1 ? "1px solid rgba(0, 255, 136, 0.07)" : "none" }}>
                      <span style={{
                        flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                        background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.18)",
                        color: accent, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 15, color: text }}>{l}</span>
                    </div>
                  ))}
                </div>

                <div style={{ ...card, maxWidth: 480, margin: "20px auto 0" }}>
                  <div style={{ ...label, marginBottom: 14 }}>Yarn fibres</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                    {YARN_FIBERS.map((f) => (
                      <div key={f.id} style={{ padding: 14, borderRadius: 12, background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)" }}>
                        <div style={{ fontSize: 14, color: text, fontWeight: 500, marginBottom: 4 }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{f.properties[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...card, maxWidth: 480, margin: "20px auto 0" }}>
                  <div style={{ ...label, marginBottom: 14 }}>UK / US terms</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13 }}>
                    {CROCHET_TERMS_UK_US.map((t, i) => (
                      <React.Fragment key={i}>
                        <span style={{ color: muted }}>{t.uk}</span>
                        <span style={{ color: text }}>{t.us}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}