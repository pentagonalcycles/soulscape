"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  KNITTING_STITCHES,
  CROCHET_STITCHES,
  ABBREVIATIONS,
  YARN_WEIGHTS,
  YARN_FIBERS,
  QUICK_PROJECTS,
  CROCHET_TERMS_UK_US,
  YARN_ESTIMATES,
} from "@/lib/threads/data";
import type { StitchTechnique, Abbreviation } from "@/lib/threads/data";

type ThreadsSection =
  | "home"
  | "new-project"
  | "my-projects"
  | "row-counter"
  | "stitch-library"
  | "abbreviations"
  | "yarn-calculator"
  | "gauge-calculator"
  | "learn"
  | "quick-projects"
  | "project-detail"
  | "stitch-detail"
  | "pattern-helper"
  | "fix-project"
  | "pattern-creator";

interface Project {
  id: string;
  name: string;
  craft: "knitting" | "crochet";
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

const glassStyle = {
  background: "rgba(31, 56, 40, 0.75)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0, 255, 136, 0.08)",
  borderRadius: 16,
  padding: 24,
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#00ff88",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  marginBottom: 16,
  fontFamily: "monospace",
};

export default function ThreadsPage() {
  const { userId, loading: authLoading } = useAuth();
  const [section, setSection] = useState<ThreadsSection>("home");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [craft, setCraft] = useState<"knitting" | "crochet">("knitting");
  const [termSystem, setTermSystem] = useState<"us" | "uk">("us");

  // Project form state
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [yarnType, setYarnType] = useState("");
  const [yarnWeight, setYarnWeight] = useState("");
  const [yarnColor, setYarnColor] = useState("");
  const [needleHook, setNeedleHook] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [notes, setNotes] = useState("");

  // Row counter state
  const [rowCount, setRowCount] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);

  // Pattern helper state
  const [patternInput, setPatternInput] = useState("");
  const [patternQuestion, setPatternQuestion] = useState("");

  // Fix project state
  const [fixDescription, setFixDescription] = useState("");

  // Yarn calculator state
  const [yarnCalcProject, setYarnCalcProject] = useState("scarf");
  const [yarnCalcWeight, setYarnCalcWeight] = useState("worsted");

  // Gauge calculator state
  const [gaugeStitches, setGaugeStitches] = useState("");
  const [gaugeRows, setGaugeRows] = useState("");
  const [gaugeWidth, setGaugeWidth] = useState("");
  const [gaugeHeight, setGaugeHeight] = useState("");
  const [targetStitches, setTargetStitches] = useState("");
  const [targetRows, setTargetRows] = useState("");

  // Abbreviation search
  const [abbrevSearch, setAbbrevSearch] = useState("");

  // Stitch filter
  const [stitchCraft, setStitchCraft] = useState<"all" | "knitting" | "crochet">("all");
  const [selectedStitch, setSelectedStitch] = useState<StitchTechnique | null>(null);

  const loadProjects = useCallback(async () => {
    if (!userId) return;
    const client = supabase();
    const { data } = await client
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
    if (!userId || !projectName) return;
    const client = supabase();
    const project = {
      user_id: userId,
      name: projectName,
      craft,
      project_type: projectType,
      size: projectSize,
      yarn_type: yarnType,
      yarn_weight: yarnWeight,
      yarn_color: yarnColor,
      needle_hook_size: needleHook,
      difficulty,
      notes,
    };
    const { data, error } = await client.from("threads_projects").insert(project).select().single();
    if (!error && data) {
      setProjects(prev => [data as Project, ...prev]);
      setProjectName("");
      setProjectType("");
      setProjectSize("");
      setNotes("");
      setSection("my-projects");
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const client = supabase();
    await client.from("threads_projects").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (activeProject?.id === id) setActiveProject(prev => prev ? { ...prev, ...updates } : null);
  };

  const deleteProject = async (id: string) => {
    const client = supabase();
    await client.from("threads_projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(null);
      setSection("my-projects");
    }
  };

  const loadProject = (project: Project) => {
    setActiveProject(project);
    setRowCount(project.current_row);
    setRepeatCount(project.repeat_count);
    setNotes(project.notes);
    setSection("project-detail");
  };

  // Row counter persistence
  useEffect(() => {
    if (activeProject && rowCount !== activeProject.current_row) {
      const timer = setTimeout(() => {
        updateProject(activeProject.id, { current_row: rowCount, repeat_count: repeatCount });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [rowCount, repeatCount, activeProject]);

  const filteredAbbreviations = abbrevSearch
    ? ABBREVIATIONS.filter(a =>
        a.term.toLowerCase().includes(abbrevSearch.toLowerCase()) ||
        a.fullName.toLowerCase().includes(abbrevSearch.toLowerCase())
      )
    : ABBREVIATIONS;

  const filteredStitches = stitchCraft === "all"
    ? [...KNITTING_STITCHES, ...CROCHET_STITCHES]
    : stitchCraft === "knitting"
      ? KNITTING_STITCHES
      : CROCHET_STITCHES;

  const yarnEstimate = YARN_ESTIMATES[yarnCalcProject]?.[yarnCalcWeight] || 0;

  // Gauge calculation
  const gaugeResult = (() => {
    if (!gaugeStitches || !gaugeWidth || !targetStitches) return null;
    const actualGauge = parseFloat(gaugeStitches) / parseFloat(gaugeWidth);
    const target = parseFloat(targetStitches);
    const diff = target - actualGauge;
    if (Math.abs(diff) < 0.5) return { message: "Your gauge is close to target!", action: "You're good to go." };
    if (diff > 0) return { message: `You need more stitches per inch.`, action: "Try a smaller needle/hook." };
    return { message: `You have too many stitches per inch.`, action: "Try a larger needle/hook." };
  })();

  if (authLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(0, 255, 136, 0.5)", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "monospace" }}>
          Loading Threads...
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1f3828 0%, #244232 50%, #1f3828 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.04) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* HOME */}
        {section === "home" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{
              fontSize: 36, fontWeight: 100, letterSpacing: "16px", textTransform: "uppercase",
              background: "linear-gradient(135deg, #00ff88, #00cc6a, #00d4aa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: "0 0 12px", textAlign: "center",
            }}>
              THREADS
            </h1>
            <p style={{ fontSize: 13, color: "rgba(240, 255, 245, 0.65)", textAlign: "center", margin: "0 0 48px", lineHeight: 1.6 }}>
              Make something, one stitch at a time.
            </p>

            {/* Craft toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
              {(["knitting", "crochet"] as const).map(c => (
                <button key={c} onClick={() => setCraft(c)} style={{
                  padding: "8px 20px", borderRadius: 6,
                  border: `1px solid ${craft === c ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.1)"}`,
                  background: craft === c ? "rgba(0, 255, 136, 0.08)" : "transparent",
                  color: craft === c ? "#00ff88" : "rgba(0, 255, 136, 0.4)",
                  fontSize: 11, cursor: "pointer", fontFamily: "monospace",
                  letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.2s",
                }}>
                  {c === "knitting" ? "🧶 Knitting" : "🪝 Crochet"}
                </button>
              ))}
            </div>

            {/* UK/US toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
              {(["us", "uk"] as const).map(t => (
                <button key={t} onClick={() => setTermSystem(t)} style={{
                  padding: "6px 14px", borderRadius: 4,
                  border: `1px solid ${termSystem === t ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                  background: termSystem === t ? "rgba(0, 255, 136, 0.06)" : "transparent",
                  color: termSystem === t ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                  fontSize: 10, cursor: "pointer", fontFamily: "monospace",
                  letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.2s",
                }}>
                  {t === "us" ? "US Terms" : "UK Terms"}
                </button>
              ))}
            </div>

            {/* Main tools */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { id: "new-project" as ThreadsSection, icon: "✧", label: "Start a Project" },
                { id: "my-projects" as ThreadsSection, icon: "◇", label: "My Projects" },
                { id: "row-counter" as ThreadsSection, icon: "◎", label: "Row Counter" },
                { id: "pattern-creator" as ThreadsSection, icon: "✦", label: "Pattern Creator" },
                { id: "stitch-library" as ThreadsSection, icon: "◈", label: "Stitch Library" },
                { id: "abbreviations" as ThreadsSection, icon: "📖", label: "Abbreviations" },
                { id: "yarn-calculator" as ThreadsSection, icon: "◎", label: "Yarn Calculator" },
                { id: "gauge-calculator" as ThreadsSection, icon: "△", label: "Gauge Calculator" },
                { id: "pattern-helper" as ThreadsSection, icon: "💬", label: "Pattern Helper" },
                { id: "fix-project" as ThreadsSection, icon: "🔧", label: "Fix My Project" },
                { id: "learn" as ThreadsSection, icon: "📘", label: "Learn" },
                { id: "quick-projects" as ThreadsSection, icon: "⚡", label: "Quick Projects" },
              ].map(opt => (
                <motion.button
                  key={opt.id}
                  onClick={() => setSection(opt.id)}
                  style={{ ...glassStyle, cursor: "pointer", textAlign: "center", padding: "20px 12px" }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(0, 255, 136, 0.25)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{opt.icon}</div>
                  <div style={{ fontSize: 11, color: "#e0f5e8", fontWeight: 500, letterSpacing: "0.5px" }}>{opt.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* BACK BUTTON (for all sub-sections) */}
        {section !== "home" && (
          <button onClick={() => { setSection("home"); setActiveProject(null); }} style={{
            fontSize: 10, color: "rgba(0, 255, 136, 0.5)", background: "none", border: "none",
            cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
          }}>← Back</button>
        )}

        {/* NEW PROJECT */}
        {section === "new-project" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Start a Project</h2>

            <div style={{ ...glassStyle, maxWidth: 500, margin: "0 auto" }}>
              {/* Craft toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {(["knitting", "crochet"] as const).map(c => (
                  <button key={c} onClick={() => setCraft(c)} style={{
                    flex: 1, padding: "10px", borderRadius: 6,
                    border: `1px solid ${craft === c ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.1)"}`,
                    background: craft === c ? "rgba(0, 255, 136, 0.08)" : "transparent",
                    color: craft === c ? "#00ff88" : "rgba(0, 255, 136, 0.4)",
                    fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                  }}>
                    {c === "knitting" ? "🧶 Knitting" : "🪝 Crochet"}
                  </button>
                ))}
              </div>

              {/* Project name */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Project Name</label>
              <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My project" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box",
              }} />

              {/* Project type */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>What are you making?</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {["Sweater", "Beanie", "Scarf", "Blanket", "Bag", "Cardigan", "Socks", "Top"].map(t => (
                  <button key={t} onClick={() => setProjectType(t)} style={{
                    padding: "6px 12px", borderRadius: 4,
                    border: `1px solid ${projectType === t ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.08)"}`,
                    background: projectType === t ? "rgba(0, 255, 136, 0.06)" : "transparent",
                    color: projectType === t ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                    fontSize: 10, cursor: "pointer", transition: "all 0.2s",
                  }}>{t}</button>
                ))}
                <input value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="Other..." style={{
                  flex: 1, minWidth: 80, background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  borderRadius: 4, padding: "6px 10px", color: "#e0f5e8", fontSize: 10, outline: "none",
                }} />
              </div>

              {/* Size */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Size</label>
              <input value={projectSize} onChange={e => setProjectSize(e.target.value)} placeholder="Medium / 40 inch / Custom" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box",
              }} />

              {/* Yarn weight */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Yarn Weight</label>
              <select value={yarnWeight} onChange={e => setYarnWeight(e.target.value)} style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 16,
              }}>
                <option value="">Select yarn weight</option>
                {YARN_WEIGHTS.map(yw => (
                  <option key={yw.id} value={yw.id} style={{ background: "#244232" }}>{yw.name} (Category {yw.category})</option>
                ))}
              </select>

              {/* Needle/hook size */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                {craft === "knitting" ? "Needle Size" : "Hook Size"}
              </label>
              <input value={needleHook} onChange={e => setNeedleHook(e.target.value)} placeholder="5mm / US 8" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box",
              }} />

              {/* Difficulty */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Difficulty</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {["beginner", "intermediate", "advanced"].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    flex: 1, padding: "8px", borderRadius: 4,
                    border: `1px solid ${difficulty === d ? "rgba(0, 255, 136, 0.4)" : "rgba(0, 255, 136, 0.08)"}`,
                    background: difficulty === d ? "rgba(0, 255, 136, 0.06)" : "transparent",
                    color: difficulty === d ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                    fontSize: 10, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s",
                  }}>{d}</button>
                ))}
              </div>

              {/* Notes */}
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about your project..." style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none",
                resize: "vertical", minHeight: 80, marginBottom: 20, boxSizing: "border-box",
              }} />

              <button onClick={saveProject} disabled={!projectName} style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: projectName ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                border: `1px solid ${projectName ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                color: projectName ? "#00ff88" : "rgba(0, 255, 136, 0.2)",
                fontSize: 12, cursor: projectName ? "pointer" : "default", fontFamily: "monospace",
                letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.2s",
              }}>
                Save Project
              </button>
            </div>
          </motion.div>
        )}

        {/* MY PROJECTS */}
        {section === "my-projects" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>My Projects</h2>

            {!userId ? (
              <div style={{ ...glassStyle, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <p style={{ fontSize: 13, color: "#90c8a0", margin: 0 }}>Sign in to save and view your projects.</p>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ ...glassStyle, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <p style={{ fontSize: 13, color: "#90c8a0", margin: "0 0 16px" }}>No projects yet.</p>
                <button onClick={() => setSection("new-project")} style={{
                  padding: "8px 20px", borderRadius: 6,
                  background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.3)",
                  color: "#00ff88", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
                  letterSpacing: "1px", textTransform: "uppercase",
                }}>Start a Project</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => loadProject(p)} style={{
                    ...glassStyle, cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, color: "#e0f5e8", fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(0, 255, 136, 0.5)" }}>
                          {p.craft === "knitting" ? "🧶" : "🪝"} {p.project_type || "Project"} {p.size ? `· ${p.size}` : ""}
                        </div>
                      </div>
                      <div style={{
                        padding: "4px 8px", borderRadius: 4, fontSize: 9,
                        background: p.status === "completed" ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
                        border: `1px solid ${p.status === "completed" ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                        color: p.status === "completed" ? "#00ff88" : "rgba(0, 255, 136, 0.4)",
                        textTransform: "uppercase", letterSpacing: "1px", fontFamily: "monospace",
                      }}>
                        {p.status === "completed" ? "✓ Done" : `Row ${p.current_row}`}
                      </div>
                    </div>
                    {p.yarn_weight && (
                      <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.3)" }}>
                        {p.yarn_weight} {p.needle_hook_size ? `· ${p.needle_hook_size}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECT DETAIL */}
        {section === "project-detail" && activeProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 500, color: "#e0f5e8", marginBottom: 4 }}>{activeProject.name}</h2>
                <div style={{ fontSize: 12, color: "rgba(0, 255, 136, 0.5)" }}>
                  {activeProject.craft === "knitting" ? "🧶 Knitting" : "🪝 Crochet"} {activeProject.project_type ? `· ${activeProject.project_type}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => updateProject(activeProject.id, { status: activeProject.status === "completed" ? "in-progress" : "completed" })} style={{
                  padding: "6px 12px", borderRadius: 4, fontSize: 10,
                  background: activeProject.status === "completed" ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
                  border: `1px solid ${activeProject.status === "completed" ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.1)"}`,
                  color: activeProject.status === "completed" ? "#00ff88" : "rgba(0, 255, 136, 0.5)",
                  cursor: "pointer", fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
                }}>
                  {activeProject.status === "completed" ? "✓ Complete" : "Mark Complete"}
                </button>
                <button onClick={() => { if (confirm("Delete this project?")) deleteProject(activeProject.id); }} style={{
                  padding: "6px 12px", borderRadius: 4, fontSize: 10,
                  background: "rgba(255, 80, 80, 0.08)", border: "1px solid rgba(255, 80, 80, 0.2)",
                  color: "rgba(255, 120, 120, 0.7)", cursor: "pointer", fontFamily: "monospace",
                }}>Delete</button>
              </div>
            </div>

            {/* Row Counter inline */}
            <div style={{ ...glassStyle, textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Current Row</div>
              <div style={{ fontSize: 48, fontWeight: 100, color: "#e0f5e8", marginBottom: 16 }}>{rowCount}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <button onClick={() => setRowCount(Math.max(0, rowCount - 1))} style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "rgba(0, 255, 136, 0.6)", fontSize: 20, cursor: "pointer",
                }}>−</button>
                <button onClick={() => setRowCount(rowCount + 1)} style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(0, 255, 136, 0.08)", border: "2px solid rgba(0, 255, 136, 0.3)",
                  color: "#00ff88", fontSize: 24, cursor: "pointer",
                }}>+</button>
                <button onClick={() => setRepeatCount(repeatCount + 1)} style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "rgba(0, 255, 136, 0.6)", fontSize: 12, cursor: "pointer",
                  fontFamily: "monospace",
                }}>R{repeatCount + 1}</button>
              </div>
            </div>

            {/* Project info */}
            <div style={{ ...glassStyle, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {activeProject.size && <div><div style={{ fontSize: 9, color: "rgba(0, 255, 136, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Size</div><div style={{ fontSize: 13, color: "#cce8d8" }}>{activeProject.size}</div></div>}
                {activeProject.yarn_weight && <div><div style={{ fontSize: 9, color: "rgba(0, 255, 136, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Yarn</div><div style={{ fontSize: 13, color: "#cce8d8" }}>{activeProject.yarn_weight}</div></div>}
                {activeProject.needle_hook_size && <div><div style={{ fontSize: 9, color: "rgba(0, 255, 136, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>{activeProject.craft === "knitting" ? "Needles" : "Hook"}</div><div style={{ fontSize: 13, color: "#cce8d8" }}>{activeProject.needle_hook_size}</div></div>}
                {activeProject.difficulty && <div><div style={{ fontSize: 9, color: "rgba(0, 255, 136, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Difficulty</div><div style={{ fontSize: 13, color: "#cce8d8", textTransform: "capitalize" }}>{activeProject.difficulty}</div></div>}
              </div>
            </div>

            {/* Notes */}
            <div style={{ ...glassStyle }}>
              <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Notes</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => updateProject(activeProject.id, { notes })} placeholder="Add notes..." style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 12, outline: "none",
                resize: "vertical", minHeight: 80, boxSizing: "border-box",
              }} />
            </div>
          </motion.div>
        )}

        {/* ROW COUNTER (standalone) */}
        {section === "row-counter" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Row Counter</h2>

            <div style={{ ...glassStyle, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
              <div style={{ fontSize: 72, fontWeight: 100, color: "#e0f5e8", marginBottom: 24 }}>{rowCount}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                <button onClick={() => setRowCount(Math.max(0, rowCount - 1))} style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "rgba(0, 255, 136, 0.6)", fontSize: 24, cursor: "pointer",
                }}>−</button>
                <button onClick={() => setRowCount(rowCount + 1)} style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(0, 255, 136, 0.08)", border: "2px solid rgba(0, 255, 136, 0.3)",
                  color: "#00ff88", fontSize: 28, cursor: "pointer",
                }}>+</button>
              </div>
              <button onClick={() => setRowCount(0)} style={{
                padding: "8px 20px", borderRadius: 6,
                background: "transparent", border: "1px solid rgba(0, 255, 136, 0.15)",
                color: "rgba(0, 255, 136, 0.4)", fontSize: 10, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
              }}>Reset</button>
            </div>
          </motion.div>
        )}

        {/* STITCH LIBRARY */}
        {section === "stitch-library" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Stitch Library</h2>

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              {(["all", "knitting", "crochet"] as const).map(c => (
                <button key={c} onClick={() => setStitchCraft(c)} style={{
                  padding: "6px 14px", borderRadius: 4,
                  border: `1px solid ${stitchCraft === c ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                  background: stitchCraft === c ? "rgba(0, 255, 136, 0.06)" : "transparent",
                  color: stitchCraft === c ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                  fontSize: 10, cursor: "pointer", fontFamily: "monospace",
                  letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.2s",
                }}>{c === "all" ? "All" : c === "knitting" ? "🧶 Knitting" : "🪝 Crochet"}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {filteredStitches.map(stitch => (
                <div key={stitch.id} onClick={() => setSelectedStitch(stitch)} style={{ ...glassStyle, cursor: "pointer", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: "#e0f5e8", fontWeight: 500 }}>{stitch.name}</div>
                    <span style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 9,
                      background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.1)",
                      color: "rgba(0, 255, 136, 0.5)", fontFamily: "monospace",
                    }}>{stitch.abbreviation}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(0, 255, 136, 0.4)", marginBottom: 4 }}>
                    {stitch.craft === "knitting" ? "🧶" : "🪝"} {stitch.difficulty}
                  </div>
                  <p style={{ fontSize: 11, color: "#90c8a0", margin: 0, lineHeight: 1.5 }}>{stitch.explanation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STITCH DETAIL */}
        {section === "stitch-detail" && selectedStitch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ ...glassStyle, maxWidth: 600, margin: "0 auto" }}>
              <h3 style={{ fontSize: 18, color: "#e0f5e8", fontWeight: 500, marginBottom: 4 }}>{selectedStitch.name}</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.1)", color: "rgba(0, 255, 136, 0.6)", fontFamily: "monospace" }}>{selectedStitch.abbreviation}</span>
                <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.1)", color: "rgba(0, 255, 136, 0.4)" }}>{selectedStitch.craft}</span>
                <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.1)", color: "rgba(0, 255, 136, 0.4)", textTransform: "capitalize" }}>{selectedStitch.difficulty}</span>
              </div>
              <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.7, marginBottom: 20 }}>{selectedStitch.explanation}</p>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Steps</div>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {selectedStitch.steps.map((step, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#cce8d8", marginBottom: 6, lineHeight: 1.6 }}>{step}</li>
                  ))}
                </ol>
              </div>
              {selectedStitch.tips && (
                <div>
                  <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Tips</div>
                  {selectedStitch.tips.map((tip, i) => (
                    <p key={i} style={{ fontSize: 12, color: "#90c8a0", margin: "0 0 6px", lineHeight: 1.5 }}>• {tip}</p>
                  ))}
                </div>
              )}
              <button onClick={() => { setSelectedStitch(null); setSection("stitch-library"); }} style={{
                marginTop: 20, padding: "8px 20px", borderRadius: 6,
                background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                color: "rgba(0, 255, 136, 0.5)", fontSize: 10, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
              }}>← Back to Library</button>
            </div>
          </motion.div>
        )}

        {/* ABBREVIATIONS */}
        {section === "abbreviations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Abbreviation Translator</h2>

            <div style={{ maxWidth: 500, margin: "0 auto 24px" }}>
              <input value={abbrevSearch} onChange={e => setAbbrevSearch(e.target.value)} placeholder="Search abbreviations... (k2tog, dc, yo)" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 16px", color: "#e0f5e8", fontSize: 13, outline: "none", boxSizing: "border-box",
              }} />
            </div>

            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              {filteredAbbreviations.map(abbr => (
                <div key={abbr.term} style={{ ...glassStyle, marginBottom: 8, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e0f5e8", fontFamily: "monospace" }}>{abbr.term}</span>
                    <span style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.4)" }}>{abbr.craft}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#00ff88", marginBottom: 4 }}>{abbr.fullName}</div>
                  <div style={{ fontSize: 11, color: "#90c8a0" }}>{abbr.explanation}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* YARN CALCULATOR */}
        {section === "yarn-calculator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Yarn Calculator</h2>

            <div style={{ ...glassStyle, maxWidth: 500, margin: "0 auto" }}>
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Project Type</label>
              <select value={yarnCalcProject} onChange={e => setYarnCalcProject(e.target.value)} style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 16,
              }}>
                {["scarf", "beanie", "sweater", "blanket", "socks", "hat", "bag", "cardigan"].map(p => (
                  <option key={p} value={p} style={{ background: "#244232" }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>

              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Yarn Weight</label>
              <select value={yarnCalcWeight} onChange={e => setYarnCalcWeight(e.target.value)} style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 24,
              }}>
                {YARN_WEIGHTS.map(yw => (
                  <option key={yw.id} value={yw.id} style={{ background: "#244232" }}>{yw.name}</option>
                ))}
              </select>

              {yarnEstimate > 0 && (
                <div style={{ textAlign: "center", padding: "16px", borderRadius: 8, background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.1)" }}>
                  <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.5)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Estimated Yarn</div>
                  <div style={{ fontSize: 24, fontWeight: 300, color: "#e0f5e8", marginBottom: 4 }}>{yarnEstimate} metres</div>
                  <div style={{ fontSize: 11, color: "rgba(0, 255, 136, 0.4)" }}>≈ {Math.round(yarnEstimate * 1.094)} yards</div>
                  <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.3)", marginTop: 8 }}>This is an estimate — actual usage may vary.</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GAUGE CALCULATOR */}
        {section === "gauge-calculator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Gauge Calculator</h2>

            <div style={{ ...glassStyle, maxWidth: 500, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Stitches</label>
                  <input value={gaugeStitches} onChange={e => setGaugeStitches(e.target.value)} type="number" placeholder="20" style={{
                    width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                    borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", boxSizing: "border-box",
                  }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Width (inches)</label>
                  <input value={gaugeWidth} onChange={e => setGaugeWidth(e.target.value)} type="number" placeholder="4" style={{
                    width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                    borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", boxSizing: "border-box",
                  }} />
                </div>
              </div>

              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Stitches per Inch</label>
              <input value={targetStitches} onChange={e => setTargetStitches(e.target.value)} type="number" placeholder="5" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 24, boxSizing: "border-box",
              }} />

              {gaugeResult && (
                <div style={{ padding: "16px", borderRadius: 8, background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.1)" }}>
                  <div style={{ fontSize: 13, color: "#e0f5e8", marginBottom: 4 }}>{gaugeResult.message}</div>
                  <div style={{ fontSize: 12, color: "#00ff88" }}>{gaugeResult.action}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PATTERN HELPER */}
        {section === "pattern-helper" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Pattern Helper</h2>

            <div style={{ ...glassStyle, maxWidth: 600, margin: "0 auto" }}>
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Paste your pattern</label>
              <textarea value={patternInput} onChange={e => setPatternInput(e.target.value)} placeholder="Paste your knitting or crochet pattern here..." style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "12px 16px", color: "#e0f5e8", fontSize: 13, outline: "none",
                resize: "vertical", minHeight: 150, marginBottom: 16, boxSizing: "border-box", fontFamily: "inherit",
              }} />

              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>What do you need help with?</label>
              <input value={patternQuestion} onChange={e => setPatternQuestion(e.target.value)} placeholder="e.g. What does k2tog mean? Where do I increase?" style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "10px 14px", color: "#e0f5e8", fontSize: 13, outline: "none", marginBottom: 20, boxSizing: "border-box",
              }} />

              <button onClick={() => {
                if (patternInput) {
                  window.open(`/elyra?context=${encodeURIComponent(`I need help with this ${craft} pattern:\n\n${patternInput}\n\nQuestion: ${patternQuestion || "Explain this pattern simply."}`)}`, "_blank");
                }
              }} disabled={!patternInput} style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: patternInput ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                border: `1px solid ${patternInput ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                color: patternInput ? "#00ff88" : "rgba(0, 255, 136, 0.2)",
                fontSize: 12, cursor: patternInput ? "pointer" : "default", fontFamily: "monospace",
                letterSpacing: "1px", textTransform: "uppercase",
              }}>
                Ask Luna
              </button>
            </div>
          </motion.div>
        )}

        {/* FIX PROJECT */}
        {section === "fix-project" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Fix My Project</h2>

            <div style={{ ...glassStyle, maxWidth: 600, margin: "0 auto" }}>
              <label style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Describe your problem</label>
              <textarea value={fixDescription} onChange={e => setFixDescription(e.target.value)} placeholder="e.g. My edges are curling, I have holes appearing, my stitch count is wrong..." style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "12px 16px", color: "#e0f5e8", fontSize: 13, outline: "none",
                resize: "vertical", minHeight: 120, marginBottom: 16, boxSizing: "border-box",
              }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {["Edges curling", "Holes appearing", "Uneven tension", "Dropped stitch", "Wrong count", "Too wide", "Too narrow"].map(problem => (
                  <button key={problem} onClick={() => setFixDescription(problem)} style={{
                    padding: "6px 10px", borderRadius: 4, fontSize: 10,
                    background: fixDescription === problem ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                    border: `1px solid ${fixDescription === problem ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                    color: fixDescription === problem ? "#00ff88" : "rgba(0, 255, 136, 0.3)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{problem}</button>
                ))}
              </div>

              <button onClick={() => {
                if (fixDescription) {
                  window.open(`/elyra?context=${encodeURIComponent(`I'm having a problem with my ${craft} project.\n\nProblem: ${fixDescription}\n\nPlease help me understand what went wrong and how to fix it.`)}`, "_blank");
                }
              }} disabled={!fixDescription} style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: fixDescription ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                border: `1px solid ${fixDescription ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                color: fixDescription ? "#00ff88" : "rgba(0, 255, 136, 0.2)",
                fontSize: 12, cursor: fixDescription ? "pointer" : "default", fontFamily: "monospace",
                letterSpacing: "1px", textTransform: "uppercase",
              }}>
                Ask Luna
              </button>
            </div>
          </motion.div>
        )}

        {/* PATTERN CREATOR */}
        {section === "pattern-creator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Pattern Creator</h2>

            <div style={{ ...glassStyle, maxWidth: 600, margin: "0 auto" }}>
              <p style={{ fontSize: 12, color: "#90c8a0", marginBottom: 16, lineHeight: 1.6 }}>
                Describe what you want to make and Luna will help generate a starting pattern.
              </p>

              <textarea value={patternInput} onChange={e => setPatternInput(e.target.value)} placeholder="e.g. Create a medium oversized knitted sweater with loose sleeves using worsted yarn..." style={{
                width: "100%", background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                borderRadius: 8, padding: "12px 16px", color: "#e0f5e8", fontSize: 13, outline: "none",
                resize: "vertical", minHeight: 120, marginBottom: 20, boxSizing: "border-box",
              }} />

              <button onClick={() => {
                if (patternInput) {
                  window.open(`/elyra?context=${encodeURIComponent(`Create a ${craft} pattern based on this description:\n\n${patternInput}\n\nPlease provide a complete pattern with materials, gauge, abbreviations, and step-by-step instructions. Include yarn amount estimates where possible. Remind me that gauge should be checked before starting.`)}`, "_blank");
                }
              }} disabled={!patternInput} style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: patternInput ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                border: `1px solid ${patternInput ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                color: patternInput ? "#00ff88" : "rgba(0, 255, 136, 0.2)",
                fontSize: 12, cursor: patternInput ? "pointer" : "default", fontFamily: "monospace",
                letterSpacing: "1px", textTransform: "uppercase",
              }}>
                Create Pattern with Luna
              </button>
            </div>
          </motion.div>
        )}

        {/* LEARN */}
        {section === "learn" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Learn</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 700, margin: "0 auto" }}>
              {/* Learn Knitting */}
              <div style={{ ...glassStyle }}>
                <h3 style={{ fontSize: 14, color: "#e0f5e8", fontWeight: 500, marginBottom: 16 }}>🧶 Learn Knitting</h3>
                {["Yarn and needles", "How to hold the needles", "Casting on", "Knit stitch", "Purl stitch", "Basic patterns", "Increasing/decreasing", "Finishing"].map((lesson, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(0, 255, 136, 0.04)" }}>
                    <span style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.3)", fontFamily: "monospace", width: 20 }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, color: "#cce8d8" }}>{lesson}</span>
                  </div>
                ))}
                <button onClick={() => setCraft("knitting")} style={{
                  marginTop: 16, width: "100%", padding: "10px", borderRadius: 6,
                  background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "rgba(0, 255, 136, 0.5)", fontSize: 11, cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
                }}>Start Learning</button>
              </div>

              {/* Learn Crochet */}
              <div style={{ ...glassStyle }}>
                <h3 style={{ fontSize: 14, color: "#e0f5e8", fontWeight: 500, marginBottom: 16 }}>🪝 Learn Crochet</h3>
                {["Yarn and hooks", "Slip knot", "Chain stitch", "Basic stitches", "Turning rows", "Working in the round", "Increasing/decreasing", "Finishing"].map((lesson, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(0, 255, 136, 0.04)" }}>
                    <span style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.3)", fontFamily: "monospace", width: 20 }}>{i + 1}.</span>
                    <span style={{ fontSize: 12, color: "#cce8d8" }}>{lesson}</span>
                  </div>
                ))}
                <button onClick={() => setCraft("crochet")} style={{
                  marginTop: 16, width: "100%", padding: "10px", borderRadius: 6,
                  background: "rgba(0, 255, 136, 0.04)", border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "rgba(0, 255, 136, 0.5)", fontSize: 11, cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
                }}>Start Learning</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUICK PROJECTS */}
        {section === "quick-projects" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18 }}>Quick Projects</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, maxWidth: 700, margin: "0 auto" }}>
              {QUICK_PROJECTS.filter(p => p.craft === craft).map(project => (
                <div key={project.id} style={{ ...glassStyle, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: "#e0f5e8", fontWeight: 500 }}>{project.name}</div>
                    <span style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 9,
                      background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.1)",
                      color: "rgba(0, 255, 136, 0.4)", textTransform: "capitalize",
                    }}>{project.difficulty}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#90c8a0", margin: "0 0 12px", lineHeight: 1.5 }}>{project.description}</p>
                  <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.4)", marginBottom: 8 }}>
                    Materials: {project.materials.slice(0, 3).join(", ")}
                  </div>
                  <details style={{ fontSize: 11, color: "#cce8d8" }}>
                    <summary style={{ cursor: "pointer", color: "rgba(0, 255, 136, 0.5)", marginBottom: 8 }}>View Steps</summary>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                      {project.steps.map((step, i) => (
                        <li key={i} style={{ marginBottom: 4, lineHeight: 1.5 }}>{step}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* YARN INFO (accessible from home) */}
        {section === "home" && (
          <div style={{ ...glassStyle, marginTop: 40 }}>
            <h3 style={{ fontSize: 12, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 16 }}>Yarn Weights</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {YARN_WEIGHTS.map(yw => (
                <div key={yw.id} style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(0, 255, 136, 0.02)", border: "1px solid rgba(0, 255, 136, 0.06)" }}>
                  <div style={{ fontSize: 11, color: "#e0f5e8", fontWeight: 500, marginBottom: 2 }}>{yw.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(0, 255, 136, 0.4)" }}>Category {yw.category} · {yw.gaugeRange}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 12, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 16, marginTop: 24 }}>UK/US Crochet Terms</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 11 }}>
              <div style={{ color: "rgba(0, 255, 136, 0.5)", padding: "4px 8px", fontWeight: 600 }}>UK</div>
              <div style={{ color: "rgba(0, 255, 136, 0.5)", padding: "4px 8px", fontWeight: 600 }}>US</div>
              {CROCHET_TERMS_UK_US.map((t, i) => (
                <React.Fragment key={i}>
                  <div style={{ color: "#cce8d8", padding: "4px 8px", borderBottom: "1px solid rgba(0, 255, 136, 0.04)" }}>{t.uk}</div>
                  <div style={{ color: "#cce8d8", padding: "4px 8px", borderBottom: "1px solid rgba(0, 255, 136, 0.04)" }}>{t.us}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
