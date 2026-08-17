"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface StatsData {
  totals: {
    totalVisits: number;
    todayVisits: number;
    visitsLast7: number;
    visitsLast30: number;
    uniqueVisitors: number;
    signedInVisitors: number;
  };
  last14Days: { date: string; visits: number }[];
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="text-3xl md:text-4xl font-heading mb-1"
        style={{ color: accent || "var(--text-primary)", textShadow: accent ? `0 0 20px ${accent}` : "0 0 20px rgba(0, 255, 136, 0.25)" }}
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-elovayne-muted">{label}</div>
    </motion.div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed");
        setData(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxDay = data ? Math.max(1, ...data.last14Days.map((d) => d.visits)) : 1;
  const maxPath = data ? Math.max(1, ...data.topPaths.map((p) => p.visits)) : 1;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 255, 136, 0.03) 100%)",
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
              <h1 className="font-heading text-3xl md:text-5xl text-elovayne-light glow-text-strong mb-3">
                Sanctuary Statistics
              </h1>
              <p className="text-elovayne-dim text-sm md:text-base">
                Who comes, and how many — a window into the community.
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
                  <StatCard label="Total visits" value={fmt(data.totals.totalVisits)} />
                  <StatCard label="Unique visitors" value={fmt(data.totals.uniqueVisitors)} accent="rgba(0, 232, 176, 0.5)" />
                  <StatCard label="Today" value={fmt(data.totals.todayVisits)} accent="rgba(255, 215, 0, 0.5)" />
                  <StatCard label="Last 7 days" value={fmt(data.totals.visitsLast7)} />
                  <StatCard label="Last 30 days" value={fmt(data.totals.visitsLast30)} />
                  <StatCard label="Signed-in visitors" value={fmt(data.totals.signedInVisitors)} accent="rgba(0, 180, 255, 0.5)" />
                </div>

                {/* Visits per day */}
                <motion.div
                  className="glass rounded-2xl p-6 mb-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-heading text-lg text-elovayne-light mb-5">Visits per day · last 14 days</h2>
                  <div className="flex items-end gap-1.5 h-40">
                    {data.last14Days.map((d, i) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5" title={`${d.date}: ${d.visits}`}>
                        <span className="text-[9px] text-elovayne-muted">{d.visits > 0 ? d.visits : ""}</span>
                        <motion.div
                          className="w-full rounded-t-md"
                          style={{
                            background: i === data.last14Days.length - 1
                              ? "linear-gradient(180deg, #ffd700, rgba(255, 215, 0, 0.2))"
                              : "linear-gradient(180deg, #00ff88, rgba(0, 255, 136, 0.15))",
                            boxShadow: i === data.last14Days.length - 1
                              ? "0 0 16px rgba(255, 215, 0, 0.35)"
                              : "0 0 16px rgba(0, 255, 136, 0.15)",
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(4, (d.visits / maxDay) * 100)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.03 }}
                        />
                        <span className="text-[8px] text-elovayne-muted leading-none">
                          {d.date.slice(5).replace("-", "/")}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Top pages */}
                  <motion.div
                    className="glass rounded-2xl p-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h2 className="font-heading text-lg text-elovayne-light mb-5">Most visited places · last 30 days</h2>
                    <div className="space-y-3">
                      {data.topPaths.length === 0 ? (
                        <p className="text-elovayne-dim text-xs text-center py-6">No visits recorded yet.</p>
                      ) : data.topPaths.map((p, i) => (
                        <div key={p.path} className="flex items-center gap-3">
                          <span className="w-5 text-right text-[10px] text-elovayne-muted">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-elovayne-light truncate">{p.path}</span>
                              <span className="text-elovayne-muted ml-2">{fmt(p.visits)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-elovayne-deep/40 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, #00cc6a, #00ff88)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.visits / maxPath) * 100}%` }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Referrers */}
                  <motion.div
                    className="glass rounded-2xl p-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  >
                    <h2 className="font-heading text-lg text-elovayne-light mb-5">Where they come from · last 30 days</h2>
                    {data.topReferrers.length === 0 ? (
                      <p className="text-elovayne-dim text-xs text-center py-6">Most visitors arrive directly.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.topReferrers.map((r) => (
                          <div key={r.referrer} className="flex items-center justify-between text-xs py-1.5 border-b border-elovayne-deep/30 last:border-0">
                            <span className="text-elovayne-light truncate">{r.referrer}</span>
                            <span className="text-elovayne-muted ml-2">{fmt(r.visits)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Who came */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-heading text-lg text-elovayne-light">Who came</h2>
                    <span className="text-[10px] uppercase tracking-wider text-elovayne-muted">Latest visitors</span>
                  </div>
                  <p className="text-xs text-elovayne-dim mb-5">
                    Names appear when a visitor has chosen one — everyone else is shown as Anonymous.
                  </p>
                  {data.recentVisitors.length === 0 ? (
                    <p className="text-elovayne-dim text-xs text-center py-6">No visitors recorded yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.recentVisitors.map((v, i) => (
                        <motion.div
                          key={i}
                          className="rounded-xl p-4"
                          style={{
                            background: "rgba(0, 255, 136, 0.04)",
                            border: "1px solid rgba(0, 255, 136, 0.1)",
                          }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.04 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-elovayne-nebula animate-pulse" />
                            <span className="text-sm text-elovayne-light truncate">
                              {v.name || "Anonymous"}
                            </span>
                          </div>
                          <div className="text-[11px] text-elovayne-muted truncate mb-1">{v.path}</div>
                          <div className="text-[10px] text-elovayne-dim">{formatDate(v.created_at)}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
