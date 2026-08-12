"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  uniqueVisitors: number;
  todayVisitors: number;
  topPages: { page: string; count: number }[];
}

const pageNames: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/campfire": "Campfire",
  "/mural": "Mural",
  "/elyra": "Elyra AI",
  "/ideas": "Ideas",
  "/poetry": "Poetry",
  "/soul-echo": "Soul Echo",
  "/stargazing": "Stargazing",
  "/reflection-room": "Reflection Room",
  "/dream-canvas": "Dream Canvas",
  "/camera": "Camera",
  "/wish-lanterns": "Wish Lanterns",
  "/soul-map": "Soul Map",
  "/nebula-orb": "Nebula Orb",
  "/human-weather": "Human Weather",
  "/human-signal": "Human Signal",
  "/unseen": "Unseen",
  "/nera": "Nera",
  "/settings": "Settings",
  "/login": "Login",
  "/support": "Support",
  "/faq": "FAQ",
  "/account": "Account",
};

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("elovayne-visitor-id");
  if (!id) {
    id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("elovayne-visitor-id", id);
  }
  return id;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trackAndFetch = async () => {
      const client = supabase();
      const visitorId = getVisitorId();

      // Track this page view
      await client.from("site_stats").insert({
        page: "/stats",
        visitor_id: visitorId,
      });

      // Fetch stats
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      // Total views
      const { count: totalViews } = await client
        .from("site_stats")
        .select("*", { count: "exact", head: true });

      // Today views
      const { count: todayViews } = await client
        .from("site_stats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      // Week views
      const { count: weekViews } = await client
        .from("site_stats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekStart.toISOString());

      // Unique visitors (all time)
      const { data: allVisitors } = await client
        .from("site_stats")
        .select("visitor_id");
      const uniqueVisitors = new Set(allVisitors?.map((v) => v.visitor_id) || []).size;

      // Today unique visitors
      const { data: todayVisitorsData } = await client
        .from("site_stats")
        .select("visitor_id")
        .gte("created_at", todayStart.toISOString());
      const todayVisitors = new Set(todayVisitorsData?.map((v) => v.visitor_id) || []).size;

      // Top pages
      const { data: pageData } = await client
        .from("site_stats")
        .select("page");

      const pageCount: Record<string, number> = {};
      pageData?.forEach((p) => {
        pageCount[p.page] = (pageCount[p.page] || 0) + 1;
      });
      const topPages = Object.entries(pageCount)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalViews: totalViews || 0,
        todayViews: todayViews || 0,
        weekViews: weekViews || 0,
        uniqueVisitors,
        todayVisitors,
        topPages,
      });
      setLoading(false);
    };

    trackAndFetch();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-3xl mb-4"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              📊
            </motion.div>
            <h1
              className="text-2xl sm:text-3xl mb-3"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              Community Stats
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted, #64748b)", fontWeight: 300 }}>
              See how the Elovayne community is growing. Every view, every visitor, every connection.
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(13,148,136,0.04)", height: "100px" }} />
              ))}
            </div>
          ) : stats ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Main stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Total Views", value: stats.totalViews, icon: "👁️", color: "#0d9488" },
                  { label: "Unique Visitors", value: stats.uniqueVisitors, icon: "👤", color: "#3b82f6" },
                  { label: "Views Today", value: stats.todayViews, icon: "📅", color: "#f59e0b" },
                  { label: "Visitors Today", value: stats.todayVisitors, icon: "🌟", color: "#8b5cf6" },
                  { label: "Views This Week", value: stats.weekViews, icon: "📈", color: "#10b981" },
                  { label: "Pages Tracked", value: stats.topPages.length, icon: "📄", color: "#ec4899" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                      border: "1px solid var(--border-subtle, rgba(13,148,136,0.1))",
                    }}
                  >
                    <span className="text-2xl block mb-2">{stat.icon}</span>
                    <p className="text-2xl font-light mb-1" style={{ color: stat.color }}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Top pages */}
              {stats.topPages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                    border: "1px solid var(--border-subtle, rgba(13,148,136,0.1))",
                  }}
                >
                  <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary, #334155)" }}>
                    Most Visited Pages
                  </h2>
                  <div className="space-y-3">
                    {stats.topPages.map((page, i) => {
                      const maxCount = stats.topPages[0]?.count || 1;
                      const percentage = (page.count / maxCount) * 100;
                      return (
                        <div key={page.page} className="flex items-center gap-3">
                          <span className="text-[10px] w-5 text-center" style={{ color: "var(--text-faint, rgba(15,23,42,0.3))" }}>
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs" style={{ color: "var(--text-secondary, #334155)" }}>
                                {pageNames[page.page] || page.page}
                              </span>
                              <span className="text-[10px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                                {page.count.toLocaleString()} views
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(13,148,136,0.08)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, #0d9488, #06b6d4)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Footer note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-[10px] mt-8"
                style={{ color: "var(--text-faint, rgba(15,23,42,0.3))" }}
              >
                Stats update in real-time. Each page visit is counted once.
              </motion.p>
            </motion.div>
          ) : null}

          {/* Bottom link */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="/"
              className="text-xs hover:opacity-50 transition-opacity"
              style={{ color: "var(--text-faint, rgba(15, 23, 42, 0.3))", textDecoration: "none", fontSize: "11px", letterSpacing: "0.05em" }}
            >
              ← Return home
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
