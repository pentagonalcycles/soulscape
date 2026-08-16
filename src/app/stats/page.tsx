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
  "/reflection-room": "Reflection",
  "/dream-canvas": "Canvas",
  "/camera": "Camera",
  "/wish-lanterns": "Lanterns",
  "/soul-map": "Soul Map",
  "/nebula-orb": "Nebula Orb",
  "/human-signal": "Signal",
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
  "/reflection-room": "◈",
  "/dream-canvas": "△",
  "/camera": "📷",
  "/wish-lanterns": "🏮",
  "/soul-map": "◎",
  "/nebula-orb": "●",
  "/human-signal": "📡",
  "/about": "ℹ️",
  "/support": "💙",
  "/faq": "❓",
  "/stats": "📊",
  "/account": "👤",
};

const dotColors = ["#00ff88", "#00cc6a", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

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

function AnimatedCounter({ value, color, className, style }: { value: number; color?: string; className?: string; style?: React.CSSProperties }) {
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

// Constellation-connected visitor dots canvas
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

      // Draw connection lines between nearby dots
      dotsRef.current.forEach((dot, i) => {
        dotsRef.current.forEach((other, j) => {
          if (j <= i) return;
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      dotsRef.current.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += 0.03;

        if (dot.x < 0 || dot.x > w) dot.vx *= -1;
        if (dot.y < 0 || dot.y > h) dot.vy *= -1;
        dot.x = Math.max(0, Math.min(w, dot.x));
        dot.y = Math.max(0, Math.min(h, dot.y));

        const pulseSize = dot.size * (0.8 + 0.2 * Math.sin(dot.pulse));

        const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, pulseSize * 3);
        grad.addColorStop(0, `${dot.color}${Math.floor(dot.alpha * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const trackedRef = useRef(false);

  const fetchStats = async () => {
    const client = supabase();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const { count: totalViews } = await client
      .from("site_stats")
      .select("*", { count: "exact", head: true });

    const { count: todayViews } = await client
      .from("site_stats")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    const { count: weekViews } = await client
      .from("site_stats")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString());

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

    const { data: todayVisitorsData } = await client
      .from("site_stats")
      .select("visitor_id")
      .gte("created_at", todayStart.toISOString());
    const todayVisitors = new Set(todayVisitorsData?.map((v) => v.visitor_id) || []).size;

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

    const { data: recent } = await client
      .from("site_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: onlineData } = await client
      .from("site_stats")
      .select("visitor_id")
      .gte("created_at", fiveMinAgo.toISOString());
    const onlineCount = new Set(onlineData?.map((v) => v.visitor_id) || []).size;

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: visitorData } = await client
      .from("site_stats")
      .select("visitor_id, page, created_at")
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false });

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

  const totalVisitorTypes = stats ? stats.newVisitors + stats.returningVisitors : 1;
  const newPct = stats ? (stats.newVisitors / totalVisitorTypes) * 100 : 0;
  const returnPct = stats ? (stats.returningVisitors / totalVisitorTypes) * 100 : 0;

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-color, #1f3828)" }}>
      {/* Tech grid background */}
      <div className="fixed inset-0 pointer-events-none tech-grid" style={{ opacity: 0.4 }} />

      {/* Vignette overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,10,8,0.6) 100%)",
        zIndex: 1,
      }} />

      {/* Live visitor constellation */}
      {onlineNow > 0 && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <VisitorDotsCanvas count={onlineNow} />
        </div>
      )}

      <div className="relative z-10 pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* ═══ HEADER — Cosmic Observatory ═══ */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Orbital ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px dashed rgba(0, 255, 136, 0.15)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{ border: "1px dashed rgba(0, 212, 170, 0.1)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-3xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  📊
                </motion.span>
              </div>
              {/* Orbital dot */}
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: "#00ff88", boxShadow: "0 0 6px rgba(0, 255, 136, 0.6)", top: "50%", left: "-3px", transformOrigin: "calc(50% + 3px) 0" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <h1
              className="text-2xl sm:text-3xl mb-3 title-shimmer"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00d4aa, #ffd700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 300,
                letterSpacing: "0.04em",
              }}
            >
              Community Stats
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted, #60b890)", fontWeight: 300 }}>
              See how the Elovayne community is growing. Every view, every visitor, every connection.
            </p>
          </motion.div>

          {/* ═══ DATA STREAM DIVIDER ═══ */}
          <div className="data-stream mb-8" />

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: "rgba(0,255,136,0.04)", height: "100px" }} />
              ))}
            </div>
          ) : stats ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* ═══ ONLINE NOW — Pulsing Signal ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-5 mb-8 flex items-center justify-center gap-5 relative overflow-hidden scanlines"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 60%, transparent 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                }}
              >
                {/* Pulsing rings */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1px solid rgba(16, 185, 129, 0.2)" }}
                    animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)" }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <AnimatedCounter
                    value={onlineNow}
                    color="#10b981"
                    style={{
                      fontSize: "28px",
                      fontWeight: 300,
                      color: "#10b981",
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
                    }}
                  />
                  <span className="text-sm" style={{ color: "rgba(16, 185, 129, 0.7)" }}>
                    {onlineNow === 1 ? "soul" : "souls"} finding peace
                  </span>
                </div>
              </motion.div>

              {/* ═══ STAT CARDS — Holographic Grid ═══ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {[
                  { id: "total", label: "Total Views", value: stats.totalViews, icon: "👁️", color: "#00ff88", glow: true },
                  { id: "visitors", label: "Unique Visitors", value: stats.uniqueVisitors, icon: "👤", color: "#3b82f6", glow: true },
                  { id: "today", label: "Views Today", value: stats.todayViews, icon: "📅", color: "#f59e0b", glow: stats.todayViews > 0 },
                  { id: "todayVisitors", label: "Visitors Today", value: stats.todayVisitors, icon: "🌟", color: "#8b5cf6", glow: stats.todayVisitors > 0 },
                  { id: "week", label: "This Week", value: stats.weekViews, icon: "📈", color: "#10b981", glow: false },
                  { id: "pages", label: "Pages Tracked", value: stats.topPages.length, icon: "📄", color: "#ec4899", glow: false },
                ].map((stat, i) => {
                  const intensity = stat.glow ? Math.min(stat.value / 20, 1) : 0;
                  const isExpanded = expandedCard === stat.id;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => setExpandedCard(isExpanded ? null : stat.id)}
                      className="glass-futuristic corner-accents neon-border rounded-2xl p-4 text-center relative overflow-hidden card-hover"
                      style={{
                        borderColor: stat.glow && intensity > 0.3 ? `${stat.color}25` : undefined,
                        cursor: "pointer",
                        gridColumn: isExpanded ? "1 / -1" : undefined,
                      }}
                    >
                      {/* Color-coded breathing glow */}
                      {stat.glow && intensity > 0.3 && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at center, ${stat.color}${Math.floor(intensity * 15).toString(16).padStart(2, "0")}, transparent 70%)`,
                          }}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <span className="text-xl block mb-1.5 relative z-10">{stat.icon}</span>
                      <p className="text-xl font-light mb-0.5 relative z-10" style={{
                        color: stat.color,
                        textShadow: stat.glow && intensity > 0.3 ? `0 0 15px ${stat.color}40` : "none",
                      }}>
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-[10px] relative z-10" style={{ color: "var(--text-dim, #40a070)" }}>
                        {stat.label}
                      </p>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative z-10 mt-4 pt-4 text-left overflow-hidden"
                            style={{ borderTop: `1px solid ${stat.color}20` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {stat.id === "total" && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>All time views</span><span style={{ color: stat.color }}>{stats.totalViews.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>This week</span><span style={{ color: stat.color }}>{stats.weekViews.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Today</span><span style={{ color: stat.color }}>{stats.todayViews.toLocaleString()}</span></div>
                              </div>
                            )}
                            {stat.id === "visitors" && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>New visitors</span><span style={{ color: "#3b82f6" }}>{stats.newVisitors}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Returning visitors</span><span style={{ color: "#8b5cf6" }}>{stats.returningVisitors}</span></div>
                                <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "rgba(59,130,246,0.1)" }}>
                                  <div className="h-full rounded-full" style={{ background: "#3b82f6", width: `${newPct}%` }} />
                                </div>
                              </div>
                            )}
                            {stat.id === "today" && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Today's views</span><span style={{ color: stat.color }}>{stats.todayViews.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Today's visitors</span><span style={{ color: "#8b5cf6" }}>{stats.todayVisitors}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Views per visitor</span><span style={{ color: stat.color }}>{stats.todayVisitors > 0 ? (stats.todayViews / stats.todayVisitors).toFixed(1) : "0"}</span></div>
                              </div>
                            )}
                            {stat.id === "todayVisitors" && (
                              <div className="space-y-2">
                                {visitorEntries.slice(0, 5).map((v) => (
                                  <div key={v.visitorId} className="flex items-center gap-2">
                                    <span className="text-sm">{v.avatar}</span>
                                    <span className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>{v.name}</span>
                                    <span className="text-[10px]" style={{ color: v.online ? "#10b981" : "var(--text-dim)" }}>{v.online ? "online" : getTimeAgo(v.lastVisit)}</span>
                                  </div>
                                ))}
                                {visitorEntries.length === 0 && <p className="text-xs" style={{ color: "var(--text-dim)" }}>No recent visitors</p>}
                              </div>
                            )}
                            {stat.id === "week" && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>This week's views</span><span style={{ color: stat.color }}>{stats.weekViews.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Daily average</span><span style={{ color: stat.color }}>{(stats.weekViews / 7).toFixed(1)}</span></div>
                                <div className="flex justify-between text-xs"><span style={{ color: "var(--text-muted)" }}>Unique visitors this week</span><span style={{ color: "#3b82f6" }}>{stats.uniqueVisitors}</span></div>
                              </div>
                            )}
                            {stat.id === "pages" && (
                              <div className="space-y-1.5">
                                {stats.topPages.slice(0, 5).map((p, i) => (
                                  <div key={p.page} className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono w-4" style={{ color: "var(--text-dim)" }}>#{i + 1}</span>
                                    <span className="text-sm">{pageIcons[p.page] || "📄"}</span>
                                    <span className="text-xs flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{pageNames[p.page] || p.page}</span>
                                    <span className="text-[10px] font-mono" style={{ color: stat.color }}>{p.count}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* ═══ VISITOR TYPES — Donut Chart ═══ */}
              {(stats.newVisitors > 0 || stats.returningVisitors > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-futuristic corner-accents neon-border rounded-2xl p-6 mb-8"
                >
                  <h2 className="text-xs font-medium mb-5 uppercase tracking-wider" style={{ color: "var(--text-muted, #60b890)" }}>
                    Visitor Types
                  </h2>
                  <div className="flex items-center gap-6">
                    {/* Donut chart */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                        {/* Background ring */}
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,255,136,0.06)" strokeWidth="4" />
                        {/* New visitors ring */}
                        <motion.circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${newPct * 0.88} ${100 - newPct * 0.88}`}
                          initial={{ strokeDashoffset: 88 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                        {/* Returning visitors ring */}
                        <motion.circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${returnPct * 0.88} ${100 - returnPct * 0.88}`}
                          strokeDashoffset={-newPct * 0.88}
                          initial={{ strokeDashoffset: 88 - newPct * 0.88 }}
                          animate={{ strokeDashoffset: -newPct * 0.88 }}
                          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-light" style={{ color: "var(--text-primary, #e0f5e8)" }}>
                          {totalVisitorTypes}
                        </span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.4)" }} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: "var(--text-secondary, #e2e8f0)" }}>New visitors</span>
                            <span className="text-xs font-mono" style={{ color: "#3b82f6" }}>{stats.newVisitors}</span>
                          </div>
                          <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(59,130,246,0.1)" }}>
                            <motion.div className="h-full rounded-full" style={{ background: "#3b82f6" }}
                              initial={{ width: 0 }} animate={{ width: `${newPct}%` }}
                              transition={{ duration: 0.8, delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 8px rgba(139,92,246,0.4)" }} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: "var(--text-secondary, #e2e8f0)" }}>Returning</span>
                            <span className="text-xs font-mono" style={{ color: "#8b5cf6" }}>{stats.returningVisitors}</span>
                          </div>
                          <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: "rgba(139,92,246,0.1)" }}>
                            <motion.div className="h-full rounded-full" style={{ background: "#8b5cf6" }}
                              initial={{ width: 0 }} animate={{ width: `${returnPct}%` }}
                              transition={{ duration: 0.8, delay: 0.7 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ DATA STREAM DIVIDER ═══ */}
              <div className="data-stream mb-8" />

              {/* ═══ FOOTER ═══ */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-6"
              >
                <p className="text-[10px] font-mono" style={{ color: "var(--text-faint, rgba(224,245,232,0.3))" }}>
                  Auto-refreshes every 15s · Last updated {lastUpdated.toLocaleTimeString()}
                </p>
              </motion.div>
            </motion.div>
          ) : null}

          {/* ═══ BOTTOM LINK ═══ */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="/"
              className="text-xs hover:opacity-50 transition-opacity"
              style={{ color: "var(--text-faint, rgba(224, 245, 232, 0.3))", textDecoration: "none", fontSize: "11px", letterSpacing: "0.05em" }}
            >
              ← Return home
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
