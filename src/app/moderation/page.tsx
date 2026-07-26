"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
  post?: {
    content: string;
    content_type: string;
    is_anonymous: boolean;
    display_name: string | null;
    created_at: string;
  };
}

const statusColors = {
  pending: "text-yellow-400",
  reviewed: "text-blue-400",
  resolved: "text-green-400",
  dismissed: "text-elovayne-dim",
};

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const fetchReports = useCallback(async () => {
    const client = supabase();

    let query = client
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data: reportsData } = await query;

    if (!reportsData) {
      setReports([]);
      setLoading(false);
      return;
    }

    const reportsWithPosts: Report[] = await Promise.all(
      reportsData.map(async (report: Record<string, unknown>) => {
        const { data: post } = await client
          .from("posts")
          .select("content, content_type, is_anonymous, display_name, created_at")
          .eq("id", report.post_id)
          .single();

        return {
          id: report.id as string,
          post_id: report.post_id as string,
          reporter_id: report.reporter_id as string,
          reason: report.reason as string,
          status: report.status as Report["status"],
          created_at: report.created_at as string,
          post: post || undefined,
        };
      })
    );

    setReports(reportsWithPosts);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateStatus = async (reportId: string, status: Report["status"]) => {
    const client = supabase();
    await client.from("reports").update({ status }).eq("id", reportId);
    fetchReports();
  };

  const removePost = async (postId: string, reportId: string) => {
    const client = supabase();
    await client.from("posts").delete().eq("id", postId);
    await client.from("reports").update({ status: "resolved" }).eq("id", reportId);
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

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nebula />
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                Moderation
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                Keep the sanctuary safe and welcoming.
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              className="flex gap-2 mb-6 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {["pending", "reviewed", "resolved", "dismissed", "all"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    filter === status
                      ? "bg-elovayne-nebula/30 text-elovayne-light border border-elovayne-violet/30"
                      : "bg-elovayne-deep/30 text-elovayne-muted hover:text-elovayne-light border border-transparent"
                  }`}
                >
                  {status}
                </button>
              ))}
            </motion.div>

            {/* Reports List */}
            {loading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-elovayne-dim text-sm font-body">Loading reports...</p>
              </motion.div>
            ) : reports.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-4xl block mb-4">✨</span>
                <p className="text-elovayne-dim text-sm font-body">
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
                          <span className={`text-xs uppercase tracking-wider ${statusColors[report.status]}`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-elovayne-dim">·</span>
                          <span className="text-xs text-elovayne-dim">
                            Reason: {report.reason}
                          </span>
                        </div>
                        <p className="text-xs text-elovayne-dim">
                          Reported {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>

                    {report.post ? (
                      <div className="bg-elovayne-deep/30 rounded-xl p-4 mb-4">
                        <p className="text-elovayne-light text-sm whitespace-pre-wrap">
                          {report.post.content}
                        </p>
                        <p className="text-xs text-elovayne-dim mt-2">
                          by {report.post.is_anonymous ? "Anonymous" : report.post.display_name || "Anonymous"} ·{" "}
                          {report.post.content_type} · {formatDate(report.post.created_at)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-elovayne-deep/30 rounded-xl p-4 mb-4">
                        <p className="text-elovayne-dim text-sm italic">
                          Post has been deleted
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(report.id, "reviewed")}
                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => removePost(report.post_id, report.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors"
                          >
                            Remove Post
                          </button>
                          <button
                            onClick={() => updateStatus(report.id, "dismissed")}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-deep/50 text-elovayne-muted hover:text-elovayne-light transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {report.status === "reviewed" && (
                        <>
                          <button
                            onClick={() => removePost(report.post_id, report.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors"
                          >
                            Remove Post
                          </button>
                          <button
                            onClick={() => updateStatus(report.id, "resolved")}
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
