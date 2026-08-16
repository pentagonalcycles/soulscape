"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<{ id: string; user_id: string | null; page_path: string; page_title: string | null; visitor_ip: string; visited_at: string }[]>([]);
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
              <h1 className="text-3xl md:text-4xl font-heading glow-text-strong mb-2">Visitor Tracker</h1>
              <p className="text-elovayne-dim text-sm mb-8">See who visits each page · Auto-refreshes every 30s</p>

              {/* Page filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
                <button
                  onClick={() => setPageFilter("")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pageFilter === ""
                      ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                      : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                  }`}
                >
                  All Pages
                </button>
                {uniquePages.slice(0, 12).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPageFilter(pageFilter === page ? "" : page)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      pageFilter === page
                        ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                        : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                    }`}
                  >
                    {page} ({pageStats[page]})
                  </button>
                ))}
              </div>

              {/* Visits list */}
              {visitsLoading ? (
                <p className="text-elovayne-dim text-sm text-center py-8">Loading visitors...</p>
              ) : visits.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-3xl block mb-3">👁</span>
                  <p className="text-elovayne-dim text-sm">No visits recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visits.map((visit) => (
                    <motion.div
                      key={visit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sanctuary-glass-card rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-elovayne-light">
                              {visit.page_path}
                            </span>
                            {visit.user_id ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-elovayne-violet/20 text-elovayne-violet">
                                Logged in
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-elovayne-deep/50 text-elovayne-muted">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-elovayne-dim">
                            <span>{visit.visitor_ip}</span>
                            <span>·</span>
                            <span>{getTimeAgo(visit.visited_at)}</span>
                            <span>·</span>
                            <span>{formatTime(visit.visited_at)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
