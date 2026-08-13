"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  uniqueVisitors: number;
  todayVisitors: number;
  topPages: { page: string; count: number }[];
  newVisitors: number;
  returningVisitors: number;
}

interface RecentVisit {
  id: string;
  page: string;
  visitor_id: string;
  created_at: string;
}

interface VisitorDot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulse: number;
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
  "/reflection-room": "Reflection",
  "/dream-canvas": "Canvas",
  "/camera": "Camera",
  "/wish-lanterns": "Lanterns",
  "/soul-map": "Soul Map",
  "/nebula-orb": "Nebula Orb",
  "/human-weather": "Weather",
  "/human-signal": "Signal",
  "/unseen": "Unseen",
  "/nera": "Nera",
  "/settings": "Settings",
  "/login": "Login",
  "/support": "Support",
  "/faq": "FAQ",
  "/account": "Account",
  "/stats": "Stats",
};

const pageIcons: Record<string, string> = {
  "/": "🏠",
  "/campfire": "🔥",
  "/mural": "🎨",
  "/elyra": "✦",
  "/ideas": "💡",
  "/poetry": "📝",
  "/soul-echo": "◎",
  "/stargazing": "✧",
  "/reflection-room": "◈",
  "/dream-canvas": "△",
  "/camera": "📷",
  "/wish-lanterns": "🏮",
  "/soul-map": "◎",
  "/nebula-orb": "●",
  "/human-weather": "🌤️",
  "/human-signal": "📡",
  "/unseen": "◎",
  "/nera": "🪷",
  "/about": "ℹ️",
  "/support": "💙",
  "/faq": "❓",
  "/stats": "📊",
  "/settings": "⚙️",
  "/login": "🔑",
  "/account": "👤",
};

const dotColors = ["#0d9488", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

// Visitor name/avatar generation
const adjectives = ["Starry", "Quiet", "Gentle", "Cosmic", "Dreamy", "Silent", "Soft", "Wild", "Calm", "Bright", "Mystic", "Lunar", "Solar", "Astral", "Crystal"];
const nouns = ["Gazer", "Dreamer", "Wanderer", "Seeker", "Explorer", "Soul", "Spirit", "Light", "Shadow", "Wave", "Star", "Moon", "Cloud", "Breeze", "Flame"];
const avatarEmojis = ["🌙", "✨", "🎨", "💫", "🌊", "🔮", "🌸", "🦋", "🌿", "💎", "⭐", "🎭", "🪷", "🌻", "🦜", "🕊️", "🌈", "🍃", "💜", "🔥"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getVisitorName(visitorId: string): string {
  const h = hashString(visitorId);
  const adj = adjectives[h % adjectives.length];
  const noun = nouns[(h >> 8) % nouns.length];
  const num = (h % 100).toString().padStart(2, "0");
  return `${adj}${noun}${num}`;
}

function getVisitorAvatar(visitorId: string): string {
  const h = hashString(visitorId);
  return avatarEmojis[h % avatarEmojis.length];
}

function isOnline(lastVisit: string): boolean {
  const minutesAgo = (Date.now() - new Date(lastVisit).getTime()) / 60000;
  return minutesAgo < 5;
}

// Animated counter component
function AnimatedCounter({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, displayValue]);

  const digits = displayValue.toString().split("");

  return (
    <span className={className} style={{ ...style, display: "inline-flex", overflow: "hidden" }}>
      {digits.map((digit, i) => (
        <span
          key={`${i}-${digit}`}
          style={{
            display: "inline-block",
            transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
          }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

interface VisitorEntry {
  visitorId: string;
  name: string;
  avatar: string;
  lastPage: string;
  lastVisit: string;
  online: boolean;
  visitCount: number;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("elovayne-visitor-id");
  if (!id) {
    id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("elovayne-visitor-id", id);
  }
  return id;
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Visitor Dots Canvas
function VisitorDotsCanvas({ count }: { count: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<VisitorDot[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    // Generate dots based on count
    const targetCount = Math.min(count, 20);
    while (dotsRef.current.length < targetCount) {
      dotsRef.current.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvas.offsetWidth || 300),
        y: Math.random() * (canvas.offsetHeight || 200),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 3 + Math.random() * 4,
        color: dotColors[Math.floor(Math.random() * dotColors.length)],
        alpha: 0.4 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      const w = canvas.offsetWidth || 300;
      const h = canvas.offsetHeight || 200;
      ctx.clearRect(0, 0, w, h);

      dotsRef.current.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += 0.03;

        // Bounce off edges
        if (dot.x < 0 || dot.x > w) dot.vx *= -1;
        if (dot.y < 0 || dot.y > h) dot.vy *= -1;
        dot.x = Math.max(0, Math.min(w, dot.x));
        dot.y = Math.max(0, Math.min(h, dot.y));

        const pulseSize = dot.size * (0.8 + 0.2 * Math.sin(dot.pulse));

        // Glow
        const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, pulseSize * 3);
        grad.addColorStop(0, `${dot.color}${Math.floor(dot.alpha * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `${dot.color}${Math.floor(dot.alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [onlineNow, setOnlineNow] = useState(0);
  const [visitorEntries, setVisitorEntries] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const trackedRef = useRef(false);

  const fetchStats = async () => {
    const client = supabase();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

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

    // All visitor data for unique count and new vs returning
    const { data: allVisitors } = await client
      .from("site_stats")
      .select("visitor_id");

    const visitorCounts: Record<string, number> = {};
    allVisitors?.forEach((v) => {
      visitorCounts[v.visitor_id] = (visitorCounts[v.visitor_id] || 0) + 1;
    });
    const uniqueVisitors = Object.keys(visitorCounts).length;
    const newVisitors = Object.values(visitorCounts).filter((c) => c === 1).length;
    const returningVisitors = Object.values(visitorCounts).filter((c) => c > 1).length;

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

    // Recent visits
    const { data: recent } = await client
      .from("site_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Online now
    const { data: onlineData } = await client
      .from("site_stats")
      .select("visitor_id")
      .gte("created_at", fiveMinAgo.toISOString());
    const onlineCount = new Set(onlineData?.map((v) => v.visitor_id) || []).size;

    // Visitor entries (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: visitorData } = await client
      .from("site_stats")
      .select("visitor_id, page, created_at")
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false });

    // Group by visitor and get their last activity
    const visitorMap = new Map<string, { lastPage: string; lastVisit: string; visitCount: number }>();
    visitorData?.forEach((v) => {
      const existing = visitorMap.get(v.visitor_id);
      if (!existing) {
        visitorMap.set(v.visitor_id, { lastPage: v.page, lastVisit: v.created_at, visitCount: 1 });
      } else {
        existing.visitCount++;
      }
    });

    const entries: VisitorEntry[] = Array.from(visitorMap.entries())
      .map(([visitorId, data]) => ({
        visitorId,
        name: getVisitorName(visitorId),
        avatar: getVisitorAvatar(visitorId),
        lastPage: data.lastPage,
        lastVisit: data.lastVisit,
        online: isOnline(data.lastVisit),
        visitCount: data.visitCount,
      }))
      .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
      .slice(0, 20);

    setStats({
      totalViews: totalViews || 0,
      todayViews: todayViews || 0,
      weekViews: weekViews || 0,
      uniqueVisitors,
      todayVisitors,
      topPages,
      newVisitors,
      returningVisitors,
    });
    setRecentVisits(recent || []);
    setOnlineNow(onlineCount);
    setVisitorEntries(entries);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      const client = supabase();
      const visitorId = getVisitorId();
      client.from("site_stats").insert({ page: "/stats", visitor_id: visitorId }).then(() => {});
    }

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate glow intensity based on today's activity
  const glowIntensity = stats ? Math.min(stats.todayViews / 50, 1) : 0;
  const glowColor = `rgba(13, 148, 136, ${0.05 + glowIntensity * 0.15})`;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Live visitor dots background */}
      {onlineNow > 0 && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <VisitorDotsCanvas count={onlineNow} />
        </div>
      )}

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
              {/* Online now banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-5 mb-6 flex items-center justify-center gap-4"
                style={{
                  background: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                }}
              >
                <div className="relative">
                  <div className="w-4 h-4 rounded-full" style={{ background: "#10b981" }} />
                  <div className="absolute inset-0 w-4 h-4 rounded-full animate-ping" style={{ background: "#10b981", opacity: 0.4 }} />
                </div>
                <div className="flex items-baseline gap-2">
                  <AnimatedCounter
                    value={onlineNow}
                    style={{
                      fontSize: "28px",
                      fontWeight: 300,
                      color: "#10b981",
                      letterSpacing: "-0.02em",
                    }}
                  />
                  <span className="text-sm" style={{ color: "rgba(16, 185, 129, 0.7)" }}>
                    {onlineNow === 1 ? "soul" : "souls"} finding peace
                  </span>
                </div>
              </motion.div>

              {/* Main stats grid - with glow */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Views", value: stats.totalViews, icon: "👁️", color: "#0d9488", glow: true },
                  { label: "Unique Visitors", value: stats.uniqueVisitors, icon: "👤", color: "#3b82f6", glow: true },
                  { label: "Views Today", value: stats.todayViews, icon: "📅", color: "#f59e0b", glow: stats.todayViews > 0 },
                  { label: "Visitors Today", value: stats.todayVisitors, icon: "🌟", color: "#8b5cf6", glow: stats.todayVisitors > 0 },
                  { label: "Views This Week", value: stats.weekViews, icon: "📈", color: "#10b981", glow: false },
                  { label: "Pages Tracked", value: stats.topPages.length, icon: "📄", color: "#ec4899", glow: false },
                ].map((stat, i) => {
                  const intensity = stat.glow ? Math.min(stat.value / 20, 1) : 0;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="rounded-2xl p-5 text-center relative overflow-hidden"
                      style={{
                        background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                        border: `1px solid ${stat.glow && intensity > 0.3 ? `${stat.color}30` : "var(--border-subtle, rgba(13,148,136,0.1))"}`,
                        boxShadow: stat.glow && intensity > 0.3
                          ? `0 0 ${20 + intensity * 30}px ${stat.color}${Math.floor(intensity * 40).toString(16).padStart(2, "0")}, inset 0 0 ${10 + intensity * 15}px ${stat.color}${Math.floor(intensity * 15).toString(16).padStart(2, "0")}`
                          : "none",
                        transition: "box-shadow 0.5s ease, border-color 0.5s ease",
                      }}
                    >
                      {/* Breathing glow background */}
                      {stat.glow && intensity > 0.3 && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at center, ${stat.color}${Math.floor(intensity * 20).toString(16).padStart(2, "0")}, transparent 70%)`,
                          }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <span className="text-2xl block mb-2 relative z-10">{stat.icon}</span>
                      <p className="text-2xl font-light mb-1 relative z-10" style={{ color: stat.color }}>
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-[11px] relative z-10" style={{ color: "var(--text-dim, #94a3b8)" }}>
                        {stat.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* New vs Returning visitors */}
              {(stats.newVisitors > 0 || stats.returningVisitors > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-5 mb-6"
                  style={{
                    background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                    border: "1px solid var(--border-subtle, rgba(13,148,136,0.1))",
                  }}
                >
                  <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary, #334155)" }}>
                    Visitor Types
                  </h2>
                  <div className="flex items-center gap-4">
                    {/* Visual bar */}
                    <div className="flex-1">
                      <div className="h-4 rounded-full overflow-hidden flex" style={{ background: "rgba(13,148,136,0.08)" }}>
                        {stats.newVisitors > 0 && (
                          <motion.div
                            className="h-full"
                            style={{ background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.newVisitors / (stats.newVisitors + stats.returningVisitors)) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          />
                        )}
                        {stats.returningVisitors > 0 && (
                          <motion.div
                            className="h-full"
                            style={{ background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats.returningVisitors / (stats.newVisitors + stats.returningVisitors)) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                          />
                        )}
                      </div>
                    </div>
                    {/* Labels */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: "#3b82f6" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary, #334155)" }}>
                          {stats.newVisitors} new
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: "#8b5cf6" }} />
                        <span className="text-xs" style={{ color: "var(--text-secondary, #334155)" }}>
                          {stats.returningVisitors} returning
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Visitor Ticker */}
              {visitorEntries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                    border: "1px solid var(--border-subtle, rgba(13,148,136,0.1))",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium" style={{ color: "var(--text-secondary, #334155)" }}>
                      Who's Been Here
                    </h2>
                    <span className="text-[10px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                      Last 24 hours
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                    <AnimatePresence mode="popLayout">
                      {visitorEntries.map((visitor, i) => (
                        <motion.div
                          key={visitor.visitorId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          className="flex items-center gap-3 py-2 px-3 rounded-lg"
                          style={{
                            background: visitor.online ? "rgba(16, 185, 129, 0.04)" : "transparent",
                          }}
                        >
                          {/* Avatar */}
                          <span className="text-lg flex-shrink-0">{visitor.avatar}</span>
                          
                          {/* Name and activity */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium" style={{ color: "var(--text-secondary, #334155)" }}>
                                {visitor.name}
                              </span>
                              {visitor.online && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                                  <span className="text-[9px]" style={{ color: "#10b981" }}>online</span>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px]" style={{ color: "var(--text-faint, rgba(15,23,42,0.3))" }}>
                              {visitor.online ? "exploring" : "visited"} {pageNames[visitor.lastPage] || visitor.lastPage} · {getTimeAgo(visitor.lastVisit)}
                            </p>
                          </div>

                          {/* Visit count */}
                          {visitor.visitCount > 1 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ 
                              background: "rgba(13, 148, 136, 0.08)", 
                              color: "var(--text-dim, #94a3b8)" 
                            }}>
                              {visitor.visitCount} pages
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Live Activity Feed */}
              {recentVisits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
                    border: "1px solid var(--border-subtle, rgba(13,148,136,0.1))",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium" style={{ color: "var(--text-secondary, #334155)" }}>
                      Live Activity
                    </h2>
                    <span className="text-[9px] px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                      LIVE
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {recentVisits.map((visit, i) => (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, x: -10, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          className="flex items-center gap-3 py-2 px-3 rounded-lg"
                          style={{
                            background: i === 0 ? "rgba(13, 148, 136, 0.04)" : "transparent",
                          }}
                        >
                          <span className="text-sm flex-shrink-0">
                            {pageIcons[visit.page] || "📄"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs" style={{ color: "var(--text-secondary, #334155)" }}>
                              {pageNames[visit.page] || visit.page}
                            </span>
                          </div>
                          <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-faint, rgba(15,23,42,0.3))" }}>
                            {getTimeAgo(visit.created_at)}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

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
                          <span className="text-sm w-6 text-center flex-shrink-0">
                            {pageIcons[page.page] || "📄"}
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

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-6"
              >
                <p className="text-[10px]" style={{ color: "var(--text-faint, rgba(15,23,42,0.3))" }}>
                  Auto-refreshes every 15 seconds · Last updated {lastUpdated.toLocaleTimeString()}
                </p>
              </motion.div>
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
