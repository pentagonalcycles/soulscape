"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

interface PageVisit {
  id: string;
  user_id: string | null;
  page_path: string;
  page_title: string | null;
  visitor_ip: string;
  user_agent: string;
  referrer: string | null;
  visited_at: string;
  user_display_name?: string;
}

export default function VisitorsPage() {
  const { userId, session, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<PageVisit[]>([]);
  const [pageFilter, setPageFilter] = useState<string>("");
  const [pageStats, setPageStats] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(false);
  }, []);

  const fetchVisits = useCallback(async () => {
    if (!session?.access_token) return;
    
    const params = new URLSearchParams();
    if (pageFilter) params.set("page", pageFilter);
    params.set("limit", "200");

    const res = await fetch(`/api/admin/visitors?${params}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setVisits(data.visits || []);
      setPageStats(data.pageStats || {});
    }
  }, [session, pageFilter]);

  useEffect(() => {
    if (isAdmin) fetchVisits();
  }, [isAdmin, fetchVisits]);

  // Auto-refresh every 30 seconds
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get unique pages for filter
  const uniquePages = Object.keys(pageStats).sort((a, b) => pageStats[b] - pageStats[a]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(0, 255, 136, 0.5)", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "monospace" }}>
          Checking access...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.3 }}>◈</div>
          <h1 style={{ fontSize: 20, fontWeight: 300, color: "#e0f5e8", marginBottom: 8 }}>Access Denied</h1>
          <p style={{ fontSize: 12, color: "rgba(224, 245, 232, 0.4)" }}>This area is restricted to administrators.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #15261d 0%, #1a2e23 50%, #15261d 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 212, 170, 0.04) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 20px 60px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 300, letterSpacing: "8px", textTransform: "uppercase",
            background: "linear-gradient(135deg, #00ff88, #00cc6a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 8px",
          }}>
            Visitor Tracker
          </h1>
          <p style={{ fontSize: 11, color: "rgba(224, 245, 232, 0.35)", margin: "0 0 32px", fontFamily: "monospace" }}>
            See who visits each page · Auto-refreshes every 30s
          </p>

          {/* Page stats summary */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}>
            {uniquePages.slice(0, 12).map(page => (
              <button
                key={page}
                onClick={() => setPageFilter(pageFilter === page ? "" : page)}
                style={{
                  background: pageFilter === page ? "rgba(0, 255, 136, 0.1)" : "rgba(21, 38, 29, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${pageFilter === page ? "rgba(0, 255, 136, 0.3)" : "rgba(0, 255, 136, 0.08)"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 10, color: "rgba(0, 255, 136, 0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>
                  {page}
                </div>
                <div style={{ fontSize: 18, fontWeight: 300, color: "#e0f5e8" }}>
                  {pageStats[page]}
                </div>
                <div style={{ fontSize: 9, color: "rgba(224, 245, 232, 0.3)", marginTop: 2 }}>visits today</div>
              </button>
            ))}
          </div>

          {/* Filter indicator */}
          {pageFilter && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.1)",
            }}>
              <span style={{ fontSize: 11, color: "rgba(0, 255, 136, 0.6)" }}>
                Filtering: {pageFilter}
              </span>
              <button onClick={() => setPageFilter("")} style={{
                fontSize: 10, color: "rgba(0, 255, 136, 0.4)",
                background: "none", border: "none", cursor: "pointer",
              }}>✕ Clear</button>
            </div>
          )}

          {/* Visits list */}
          <div style={{
            background: "rgba(21, 38, 29, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 255, 136, 0.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 100px 150px",
              gap: 16,
              padding: "12px 20px",
              borderBottom: "1px solid rgba(0, 255, 136, 0.06)",
              fontSize: 10,
              color: "rgba(0, 255, 136, 0.5)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}>
              <div>Page</div>
              <div>Visitor</div>
              <div>Time</div>
              <div>Device</div>
            </div>

            {/* Visit rows */}
            {visits.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "rgba(224, 245, 232, 0.3)" }}>No visits recorded yet</p>
              </div>
            ) : (
              visits.map((visit, i) => (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 100px 150px",
                    gap: 16,
                    padding: "10px 20px",
                    borderBottom: "1px solid rgba(0, 255, 136, 0.04)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0, 255, 136, 0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Page */}
                  <div>
                    <div style={{ fontSize: 12, color: "#e0f5e8", marginBottom: 2 }}>
                      {visit.page_path}
                    </div>
                    {visit.page_title && visit.page_title !== visit.page_path && (
                      <div style={{ fontSize: 10, color: "rgba(224, 245, 232, 0.3)" }}>
                        {visit.page_title}
                      </div>
                    )}
                  </div>

                  {/* Visitor */}
                  <div>
                    <div style={{ fontSize: 11, color: visit.user_id ? "#00ff88" : "rgba(224, 245, 232, 0.4)" }}>
                      {visit.user_id ? "Logged in" : "Anonymous"}
                    </div>
                    {visit.visitor_ip !== "unknown" && (
                      <div style={{ fontSize: 9, color: "rgba(224, 245, 232, 0.2)", fontFamily: "monospace" }}>
                        {visit.visitor_ip}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <div style={{ fontSize: 11, color: "#e0f5e8" }}>
                      {getTimeAgo(visit.visited_at)}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(224, 245, 232, 0.3)" }}>
                      {formatTime(visit.visited_at)}
                    </div>
                  </div>

                  {/* Device */}
                  <div style={{ fontSize: 9, color: "rgba(224, 245, 232, 0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {visit.user_agent ? visit.user_agent.slice(0, 50) + "..." : "Unknown"}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Refresh button */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={fetchVisits} style={{
              padding: "8px 20px", borderRadius: 8,
              background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              color: "rgba(0, 255, 136, 0.5)",
              fontSize: 10, cursor: "pointer",
              fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase",
            }}>↻ Refresh</button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
