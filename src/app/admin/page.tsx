"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface VisitRecord {
  id: string;
  user_id: string | null;
  page_path: string;
  page_title: string | null;
  visitor_ip: string;
  user_agent: string;
  visited_at: string;
  users?: { display_name: string | null; identity_type: string; avatar_url: string | null } | null;
}

function parseDevice(ua: string): { type: string; browser: string; os: string; icon: string } {
  const lower = ua.toLowerCase();
  
  let type = "Desktop";
  let icon = "💻";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    type = "Mobile";
    icon = "📱";
  } else if (lower.includes("tablet") || lower.includes("ipad")) {
    type = "Tablet";
    icon = "📱";
  }

  let browser = "Unknown";
  if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("edg")) browser = "Edge";
  else if (lower.includes("opera") || lower.includes("opr")) browser = "Opera";

  let os = "Unknown";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macos")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios")) os = "iOS";

  return { type, browser, os, icon };
}

export default function AdminPage() {
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [pageFilter, setPageFilter] = useState("");
  const [pageStats, setPageStats] = useState<Record<string, number>>({});

  const checkAdmin = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase()
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);

  const fetchVisits = useCallback(async () => {
    try {
      setVisitsLoading(true);
      const { data: { session } } = await supabase().auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const params = new URLSearchParams();
      if (pageFilter) params.set("page", pageFilter);
      params.set("limit", "200");
      const res = await fetch(`/api/admin/visitors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVisits(Array.isArray(data.visits) ? data.visits : []);
        setPageStats(data.pageStats || {});
      }
    } catch {
      // page_visits table may not exist
    } finally {
      setVisitsLoading(false);
    }
  }, [pageFilter]);

  useEffect(() => {
    if (isAdmin) fetchVisits();
  }, [isAdmin, fetchVisits]);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(fetchVisits, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, fetchVisits]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const uniquePages = Object.keys(pageStats).sort((a, b) => pageStats[b] - pageStats[a]);

  const totalVisits = Object.values(pageStats).reduce((a, b) => a + b, 0);
  const uniqueVisitors = new Set(visits.map(v => v.visitor_ip)).size;
  const loggedInVisits = visits.filter(v => v.user_id).length;

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center py-20">
              <div className="text-elovayne-dim text-sm">Checking access...</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-3xl mb-4">◈</div>
              <h1 className="text-2xl font-heading text-elovayne-light mb-2">Access Denied</h1>
              <p className="text-elovayne-dim text-sm">This area is restricted to authorised administrators.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading mb-2" style={{ color: "#ffffff" }}>Visitor Tracker</h1>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>See who visits each page · Auto-refreshes every 30s</p>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="text-2xl font-heading mb-1" style={{ color: "#ffffff" }}>{totalVisits}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Total Visits</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="text-2xl font-heading mb-1" style={{ color: "#ffffff" }}>{uniqueVisitors}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Unique IPs</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="text-2xl font-heading mb-1" style={{ color: "#ffffff" }}>{loggedInVisits}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Logged In</div>
                </div>
              </div>

              {/* Page filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
                <button
                  onClick={() => setPageFilter("")}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: pageFilter === "" ? "rgba(255,255,255,0.1)" : "transparent",
                    color: pageFilter === "" ? "#ffffff" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${pageFilter === "" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  All Pages
                </button>
                {uniquePages.slice(0, 15).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPageFilter(pageFilter === page ? "" : page)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: pageFilter === page ? "rgba(255,255,255,0.1)" : "transparent",
                      color: pageFilter === page ? "#ffffff" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${pageFilter === page ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {page} ({pageStats[page]})
                  </button>
                ))}
              </div>

              {/* Visits table */}
              {visitsLoading ? (
                <div className="text-center py-12">
                  <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading visitors...</div>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-3xl block mb-3">👁</span>
                  <p style={{ color: "rgba(255,255,255,0.5)" }}>No visits recorded yet.</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 text-[10px] uppercase tracking-wider" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                    <div className="col-span-3">Page</div>
                    <div className="col-span-2">Visitor</div>
                    <div className="col-span-2">Device</div>
                    <div className="col-span-2">IP Address</div>
                    <div className="col-span-3 text-right">Time</div>
                  </div>

                  {/* Table rows */}
                  {visits.map((visit, i) => {
                    const device = parseDevice(visit.user_agent || "");
                    return (
                      <motion.div
                        key={visit.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-12 gap-3 px-4 py-3 items-center transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Page */}
                        <div className="col-span-3 min-w-0">
                          <div className="text-sm truncate" style={{ color: "#ffffff" }}>{visit.page_path}</div>
                          {visit.page_title && visit.page_title !== visit.page_path && (
                            <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{visit.page_title}</div>
                          )}
                        </div>

                        {/* Visitor type */}
                        <div className="col-span-2">
                          {visit.user_id ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] mb-1" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd" }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#a78bfa" }}></span>
                                {visit.users?.display_name || "User"}
                              </span>
                              <div className="text-[9px] capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>{visit.users?.identity_type || "user"}</div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }}></span>
                              Anonymous
                            </span>
                          )}
                        </div>

                        {/* Device */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{device.icon}</span>
                            <div>
                              <div className="text-[11px]" style={{ color: "#ffffff" }}>{device.type}</div>
                              <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{device.browser} · {device.os}</div>
                            </div>
                          </div>
                        </div>

                        {/* IP */}
                        <div className="col-span-2">
                          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{visit.visitor_ip}</span>
                        </div>

                        {/* Time */}
                        <div className="col-span-3 text-right">
                          <div className="text-xs" style={{ color: "#ffffff" }}>{getTimeAgo(visit.visited_at)}</div>
                          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{formatTime(visit.visited_at)}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Refresh button */}
              <div className="text-center mt-6">
                <button onClick={fetchVisits} className="btn btn-ghost text-xs">
                  ↻ Refresh
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
