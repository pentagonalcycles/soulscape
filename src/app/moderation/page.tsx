"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Report {
  id: string;
  source_type: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
  content_id: string;
  content_preview: string;
  author_name: string;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  reviewed: "text-blue-400",
  resolved: "text-green-400",
  dismissed: "text-elovayne-dim",
};

export default function ModerationPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    setReports(await res.json());
    setLoading(false);
  }, [filter, typeFilter]);

  useEffect(() => {
    if (isAdmin) fetchReports();
  }, [isAdmin, fetchReports]);

  const updateStatus = async (id: string, status: string, sourceType: string) => {
    await fetch("/api/admin/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, source_type: sourceType }),
    });
    fetchReports();
  };

  const removeContent = async (contentId: string, sourceType: string) => {
    const typeMap: Record<string, string> = { post: "posts" };
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeMap[sourceType] || "posts", id: contentId }),
    });
    fetchReports();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
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
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-2">
                Moderation
              </h1>
              <p className="text-elovayne-dim text-sm">
                Review reports from the community.
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              className="flex flex-wrap gap-2 mb-6 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex gap-1">
                {["pending", "reviewed", "resolved", "dismissed", "all"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                      filter === s
                        ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                        : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {["all", "post"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                      typeFilter === t
                        ? "bg-elovayne-cosmic-pink/20 text-elovayne-light border border-elovayne-cosmic-pink/30"
                        : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                    }`}
                  >
                    {t === "all" ? "All" : "Posts"}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Reports List */}
            {loading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-elovayne-dim text-sm">Loading reports...</p>
              </motion.div>
            ) : reports.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-4xl block mb-4">✨</span>
                <p className="text-elovayne-dim text-sm">
                  No {filter === "all" ? "" : filter} reports. The sanctuary is peaceful.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    className="glass rounded-2xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs uppercase tracking-wider ${statusColors[report.status] || "text-elovayne-dim"}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-elovayne-dim">·</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-elovayne-deep/50 text-elovayne-muted capitalize">
                            {report.source_type === "post" ? "Post" : report.source_type}
                          </span>
                          <span className="text-xs text-elovayne-dim">· Reason: {report.reason}</span>
                        </div>
                        <p className="text-xs text-elovayne-dim">
                          Reported {formatDate(report.created_at)} by {report.author_name}
                        </p>
                      </div>
                    </div>

                    <div className="bg-elovayne-deep/30 rounded-xl p-4 mb-4">
                      <p className="text-elovayne-light text-sm whitespace-pre-wrap">
                        {report.content_preview}
                      </p>
                    </div>

                    {report.details && (
                      <p className="text-xs text-elovayne-muted mb-3 italic">&quot;{report.details}&quot;</p>
                    )}

                    <div className="flex gap-2">
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(report.id, "reviewed", report.source_type)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => { if (report.content_id) removeContent(report.content_id, report.source_type); updateStatus(report.id, "resolved", report.source_type); }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors"
                          >
                            Remove Content
                          </button>
                          <button
                            onClick={() => updateStatus(report.id, "dismissed", report.source_type)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-deep/50 text-elovayne-muted hover:text-elovayne-light transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {report.status === "reviewed" && (
                        <>
                          <button
                            onClick={() => { if (report.content_id) removeContent(report.content_id, report.source_type); updateStatus(report.id, "resolved", report.source_type); }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors"
                          >
                            Remove Content
                          </button>
                          <button
                            onClick={() => updateStatus(report.id, "resolved", report.source_type)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
