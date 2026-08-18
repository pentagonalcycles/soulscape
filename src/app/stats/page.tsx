"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAllPresence } from "@/hooks/usePagePresence";

interface StatsData {
  totals: {
    totalVisits: number;
    todayVisits: number;
    visitsLast7: number;
    visitsLast30: number;
    uniqueVisitors: number;
    signedInVisitors: number;
    activeNow: number;
    avgPerVisitor: number;
    returningVisitors: number;
    newVisitors: number;
    repeatRate: number;
    directVisits: number;
    referralVisits: number;
  };
  last14Days: { date: string; visits: number }[];
  hourly: { hour: number; visits: number }[];
  weekday: { day: string; visits: number }[];
  topPaths: { path: string; visits: number }[];
  topReferrers: { referrer: string; visits: number }[];
  recentVisitors: { path: string; created_at: string; name: string | null }[];
}

const fmt = (n: number) => n.toLocaleString("en-US");

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PALETTE = ["#00ff88", "#22d3ee", "#a78bfa", "#f472b6", "#ffd700", "#fb923c", "#34d399", "#60a5fa"];

const cardThemes = [
  { color: "#00ff88", glow: "rgba(0, 255, 136, 0.5)", icon: "🌌", border: "rgba(0, 255, 136, 0.25)" },
  { color: "#22d3ee", glow: "rgba(34, 211, 238, 0.5)", icon: "🪐", border: "rgba(34, 211, 238, 0.25)" },
  { color: "#ffd700", glow: "rgba(255, 215, 0, 0.5)", icon: "✨", border: "rgba(255, 215, 0, 0.25)" },
  { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.5)", icon: "🔮", border: "rgba(167, 139, 250, 0.25)" },
  { color: "#f472b6", glow: "rgba(244, 114, 182, 0.5)", icon: "🌸", border: "rgba(244, 114, 182, 0.25)" },
  { color: "#fb923c", glow: "rgba(251, 146, 60, 0.5)", icon: "🌅", border: "rgba(251, 146, 60, 0.25)" },
];

function StatCard({ label, value, theme }: { label: string; value: string; theme: (typeof cardThemes)[number] }) {
  return (
    <motion.div
      className="rounded-2xl p-5 text-center"
      style={{
        background: "rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 24px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-xl mb-1">{theme.icon}</div>
      <div
        className="text-3xl md:text-4xl font-heading mb-1"
        style={{
          color: theme.color,
          textShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}`,
        }}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider" style={{ color: theme.color, opacity: 0.75 }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const presenceCounts = useAllPresence();
  const realtimeOnline = Object.values(presenceCounts).reduce((a, b) => a + b, 0);
  const [nameInput, setNameInput] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("elovayne-visitor-name") || "";
    } catch {
      return "";
    }
  });
  const [nameStatus, setNameStatus] = useState<"" | "saved" | "saving" | "error">("");

  const getVisitorId = () => {
    if (typeof window === "undefined") return null;
    try {
      let id = localStorage.getItem("elovayne-visitor-id");
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("elovayne-visitor-id", id);
      }
      return id;
    } catch {
      return null;
    }
  };

  const saveName = async () => {
    const name = nameInput.trim().slice(0, 40);
    const visitorId = getVisitorId();
    if (!name || !visitorId) return;
    setNameStatus("saving");
    try {
      const res = await fetch("/api/stats/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: visitorId, name }),
      });
      if (!res.ok) throw new Error("Failed");
      localStorage.setItem("elovayne-visitor-name", name);
      setNameStatus("saved");
      setTimeout(() => setNameStatus(""), 2500);
    } catch {
      setNameStatus("error");
      setTimeout(() => setNameStatus(""), 2500);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed");
        if (cancelled) return;
        const json = await res.json();
        setData(json);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const maxDay = data ? Math.max(1, ...data.last14Days.map((d) => d.visits)) : 1;
  const maxPath = data ? Math.max(1, ...data.topPaths.map((p) => p.visits)) : 1;
  const maxHour = data ? Math.max(1, ...data.hourly.map((h) => h.visits)) : 1;
  const maxWeekday = data ? Math.max(1, ...data.weekday.map((d) => d.visits)) : 1;

  const glowed = {
    background: "rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
  } as const;

  const border = (c: string) => ({ border: `1px solid ${c}` });

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Full-page colour-shifting background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #00ff88 0%, #0088ff 50%, #8800ff 100%)",
          animation: "bg-hue-cycle 30s linear infinite",
          zIndex: 0,
        }}
      />
      {/* Colourful ambient glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 20%, rgba(167, 139, 250, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 30%, rgba(34, 211, 238, 0.1) 0%, transparent 45%),
            radial-gradient(ellipse at 60% 85%, rgba(244, 114, 182, 0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 35% 60%, rgba(255, 215, 0, 0.05) 0%, transparent 40%)
          `,
          zIndex: 2,
        }}
      />
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="font-heading text-3xl md:text-5xl mb-3"
                style={{
                  background: "linear-gradient(120deg, #00ff88, #22d3ee, #a78bfa, #f472b6, #ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% 100%",
                  animation: "stats-gradient 6s ease-in-out infinite",
                }}
              >
                Elovayne Statistics
              </h1>
              <p className="text-sm md:text-base" style={{ color: "rgba(240, 255, 245, 0.75)" }}>
                Who comes, and how many — a window into the community.
              </p>
              <p
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider"
                style={{ background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.2)", color: "#00ff88" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-elovayne-nebula animate-pulse" style={{ boxShadow: "0 0 8px #00ff88" }} />
                Live · refreshes every 15s
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-24">
                <p className="text-elovayne-dim text-sm">Gathering the light…</p>
              </div>
            ) : error || !data ? (
              <div className="text-center py-24">
                <span className="text-4xl block mb-4">◈</span>
                <p className="text-elovayne-dim text-sm">
                  Stats are still warming up. Please check back shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Totals */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Total visits", value: data.totals.totalVisits },
                    { label: "Unique visitors", value: data.totals.uniqueVisitors },
                    { label: "Today", value: data.totals.todayVisits },
                    { label: "Signed-in visitors", value: data.totals.signedInVisitors },
                  ].map((card, i) => (
                    <StatCard key={card.label} label={card.label} value={fmt(card.value)} theme={cardThemes[i % cardThemes.length]} />
                  ))}
                </div>

                {/* Live + engagement */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
                  <StatCard label="Online now" value={fmt(realtimeOnline)} theme={cardThemes[5]} />
                  <StatCard label="Returning visitors" value={fmt(data.totals.returningVisitors)} theme={cardThemes[3]} />
                  <StatCard label="New visitors" value={fmt(data.totals.newVisitors)} theme={cardThemes[1]} />
                  <StatCard label="Repeat rate" value={`${data.totals.repeatRate}%`} theme={cardThemes[0]} />
                </div>

                {/* Visits per day */}
                <motion.div
                  className="rounded-2xl p-6 mb-6"
                  style={{ ...glowed, ...border("rgba(0, 255, 136, 0.12)") }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-heading text-lg text-elovayne-light mb-5">Visits per day · last 14 days</h2>
                  <div className="flex items-end gap-1.5 h-40">
                    {data.last14Days.map((d, i) => {
                      const color = PALETTE[i % PALETTE.length];
                      const isToday = i === data.last14Days.length - 1;
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5" title={`${d.date}: ${d.visits}`}>
                          <span className="text-[9px]" style={{ color }}>
                            {d.visits > 0 ? d.visits : ""}
                          </span>
                          <motion.div
                            className="w-full rounded-t-md"
                            style={{
                              background: isToday
                                ? `linear-gradient(180deg, #ffffff, ${color})`
                                : `linear-gradient(180deg, ${color}, rgba(0, 0, 0, 0.1))`,
                              boxShadow: `0 0 16px ${color}`,
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(4, (d.visits / maxDay) * 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.03 }}
                          />
                          <span className="text-[8px] leading-none" style={{ color, opacity: 0.6 }}>
                            {d.date.slice(5).replace("-", "/")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Busiest hours */}
                  <motion.div
                    className="rounded-2xl p-6"
                    style={{ ...glowed, ...border("rgba(251, 146, 60, 0.15)") }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                  >
                    <h2 className="font-heading text-lg mb-5" style={{ color: "#fb923c", textShadow: "0 0 20px rgba(251, 146, 60, 0.4)" }}>
                      Busiest hours · last 30 days
                    </h2>
                    <div className="flex items-end gap-1 h-32">
                      {data.hourly.map((h) => {
                        const color = h.hour >= 6 && h.hour < 12 ? "#ffd700" : h.hour >= 12 && h.hour < 18 ? "#fb923c" : h.hour >= 18 && h.hour < 23 ? "#f472b6" : "#22d3ee";
                        return (
                          <div key={h.hour} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" title={`${h.hour}:00 — ${h.visits} visit(s)`}>
                            <span className="text-[8px]" style={{ color }}>{h.visits > 0 ? h.visits : ""}</span>
                            <motion.div
                              className="w-full rounded-t-sm"
                              style={{ background: `linear-gradient(180deg, ${color}, rgba(0,0,0,0.15))`, boxShadow: `0 0 10px ${color}` }}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(3, (h.visits / maxHour) * 100)}%` }}
                              transition={{ duration: 0.5, delay: h.hour * 0.01 }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] text-elovayne-muted">
                      <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                    </div>
                  </motion.div>

                  {/* Day of week */}
                  <motion.div
                    className="rounded-2xl p-6"
                    style={{ ...glowed, ...border("rgba(34, 211, 238, 0.15)") }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h2 className="font-heading text-lg mb-5" style={{ color: "#22d3ee", textShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}>
                      Busiest days · last 30 days
                    </h2>
                    <div className="flex items-end gap-2 h-32">
                      {data.weekday.map((d, i) => {
                        const color = PALETTE[i % PALETTE.length];
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px]" style={{ color }}>{d.visits > 0 ? d.visits : ""}</span>
                            <motion.div
                              className="w-full rounded-t-md"
                              style={{ background: `linear-gradient(180deg, ${color}, rgba(0,0,0,0.15))`, boxShadow: `0 0 10px ${color}` }}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(4, (d.visits / maxWeekday) * 100)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                            <span className="text-[9px] text-elovayne-muted">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Top pages */}
                  <motion.div
                    className="rounded-2xl p-6"
                    style={{ ...glowed, ...border("rgba(34, 211, 238, 0.15)") }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h2 className="font-heading text-lg mb-5" style={{ color: "#22d3ee", textShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}>
                      Most visited places · last 30 days
                    </h2>
                    <div className="space-y-3">
                      {data.topPaths.length === 0 ? (
                        <p className="text-elovayne-dim text-xs text-center py-6">No visits recorded yet.</p>
                      ) : data.topPaths.map((p, i) => {
                        const color = PALETTE[i % PALETTE.length];
                        return (
                          <div key={p.path} className="flex items-center gap-3">
                            <span className="w-5 text-right text-[10px]" style={{ color }}>{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-elovayne-light truncate">{p.path}</span>
                                <span className="ml-2" style={{ color }}>{fmt(p.visits)}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{
                                    background: `linear-gradient(90deg, ${color}, ${color}33)`,
                                    boxShadow: `0 0 10px ${color}`,
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(p.visits / maxPath) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.2 }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Referrers */}
                  <motion.div
                    className="rounded-2xl p-6"
                    style={{ ...glowed, ...border("rgba(167, 139, 250, 0.15)") }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  >
                    <h2 className="font-heading text-lg mb-5" style={{ color: "#a78bfa", textShadow: "0 0 20px rgba(167, 139, 250, 0.4)" }}>
                      Where they come from · last 30 days
                    </h2>
                    {data.topReferrers.length === 0 ? (
                      <p className="text-elovayne-dim text-xs text-center py-6">Most visitors arrive directly.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.topReferrers.map((r, i) => {
                          const color = PALETTE[i % PALETTE.length];
                          return (
                            <div key={r.referrer} className="flex items-center justify-between text-xs py-2 rounded-lg px-2" style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                              <span className="flex items-center gap-2 text-elovayne-light truncate">
                                <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                                {r.referrer}
                              </span>
                              <span style={{ color }}>{fmt(r.visits)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Who came */}
                <motion.div
                  className="rounded-2xl p-6"
                  style={{ ...glowed, ...border("rgba(244, 114, 182, 0.15)") }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-heading text-lg" style={{ color: "#f472b6", textShadow: "0 0 20px rgba(244, 114, 182, 0.4)" }}>
                      Who came
                    </h2>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(240, 255, 245, 0.5)" }}>Latest visitors</span>
                  </div>
                  <p className="text-xs mb-5" style={{ color: "rgba(240, 255, 245, 0.55)" }}>
                    Choose a name below and it will appear here — otherwise you show up as Anonymous.
                  </p>

                  {/* Name picker */}
                  <div className="flex items-center gap-2 mb-6">
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value.slice(0, 40))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                      }}
                      placeholder="Choose your name…"
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm"
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(244, 114, 182, 0.3)",
                        color: "#f0fff5",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={saveName}
                      disabled={nameStatus === "saving"}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium shrink-0"
                      style={{
                        background: "linear-gradient(120deg, #f472b6, #a78bfa)",
                        color: "#0b0b12",
                        boxShadow: "0 0 16px rgba(244, 114, 182, 0.4)",
                        opacity: nameStatus === "saving" ? 0.6 : 1,
                      }}
                    >
                      {nameStatus === "saving" ? "Saving…" : "Set name"}
                    </button>
                    {nameStatus === "saved" && (
                      <span className="text-xs shrink-0" style={{ color: "#00ff88", textShadow: "0 0 10px rgba(0, 255, 136, 0.5)" }}>
                        ✓ Saved
                      </span>
                    )}
                    {nameStatus === "error" && (
                      <span className="text-xs shrink-0" style={{ color: "#f87171" }}>
                        Couldn&apos;t save
                      </span>
                    )}
                  </div>
                  {data.recentVisitors.length === 0 ? (
                    <p className="text-elovayne-dim text-xs text-center py-6">No visitors recorded yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.recentVisitors.map((v, i) => {
                        const color = PALETTE[i % PALETTE.length];
                        return (
                          <motion.div
                            key={i}
                            className="rounded-xl p-4"
                            style={{
                              background: `linear-gradient(135deg, ${color}14, rgba(0, 0, 0, 0.1))`,
                              border: `1px solid ${color}40`,
                              boxShadow: `0 0 16px ${color}22`,
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.04 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                              <span className="text-sm truncate" style={{ color }}>{v.name || "Anonymous"}</span>
                            </div>
                            <div className="text-[11px] text-elovayne-muted truncate mb-1">{v.path}</div>
                            <div className="text-[10px]" style={{ color: "rgba(240, 255, 245, 0.5)" }}>{formatDate(v.created_at)}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stats-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </main>
  );
}
