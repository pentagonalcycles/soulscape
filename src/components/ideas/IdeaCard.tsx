"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  improvement: { label: "Improvement", icon: "✦", color: "var(--elovayne-nebula)" },
  addition: { label: "Addition", icon: "◎", color: "#3b82f6" },
  change: { label: "Change", icon: "◇", color: "#8b5cf6" },
  bug: { label: "Bug", icon: "△", color: "#ef4444" },
  other: { label: "Other", icon: "◈", color: "#6b7280" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#94a3b8" },
  reviewed: { label: "Reviewed", color: "#3b82f6" },
  planned: { label: "Planned", color: "#f59e0b" },
  implemented: { label: "Done", color: "#10b981" },
  declined: { label: "Declined", color: "#ef4444" },
};

interface Comment {
  id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
  authorName?: string;
}

interface Idea {
  id: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  user_id: string;
  authorName?: string;
  voteCount: number;
  userVoted: boolean;
  commentCount: number;
}

interface IdeaCardProps {
  idea: Idea;
  userId: string | null;
  onVote: (ideaId: string) => void;
  onDelete?: (ideaId: string) => void;
  isAdmin?: boolean;
}

export default function IdeaCard({ idea, userId, onVote, onDelete, isAdmin }: IdeaCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cat = categoryConfig[idea.category] || categoryConfig.other;
  const status = statusConfig[idea.status];
  const showStatus = idea.status !== "pending";

  async function fetchComments() {
    if (!showComments) return;
    setLoadingComments(true);
    const client = supabase();
    const { data } = await client
      .from("idea_comments")
      .select("*")
      .eq("idea_id", idea.id)
      .order("created_at", { ascending: true });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (c) => {
          if (c.is_anonymous) return { ...c, authorName: "Anonymous" };
          const { data: user } = await client
            .from("users")
            .select("display_name")
            .eq("id", c.user_id)
            .maybeSingle();
          return { ...c, authorName: user?.display_name || "Anonymous" };
        })
      );
      setComments(enriched);
    }
    setLoadingComments(false);
  }

  useEffect(() => {
    if (showComments) fetchComments();
  }, [showComments]);

  async function submitComment() {
    if (!commentText.trim() || !userId || submittingComment) return;
    setSubmittingComment(true);
    const client = supabase();
    await client.from("idea_comments").insert({
      idea_id: idea.id,
      user_id: userId,
      content: commentText.trim(),
      is_anonymous: commentAnonymous,
    });
    setCommentText("");
    await fetchComments();
    setSubmittingComment(false);
  }

  function getTimeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{
        background: "var(--card-bg, rgba(0, 255, 136, 0.04))",
        border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.1))",
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="flex gap-4">
        {/* Vote button */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.button
            onClick={() => onVote(idea.id)}
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all"
            style={{
              background: idea.userVoted ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.04)",
              border: `1px solid ${idea.userVoted ? "rgba(0, 255, 136, 0.25)" : "rgba(0, 255, 136, 0.08)"}`,
              color: idea.userVoted ? "var(--elovayne-nebula)" : "var(--text-dim, #94a3b8)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          </motion.button>
          <span className="text-xs font-medium" style={{ color: idea.userVoted ? "var(--elovayne-nebula)" : "var(--text-dim, #94a3b8)" }}>
            {idea.voteCount}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-md text-[10px]"
              style={{ background: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}20` }}
            >
              {cat.icon} {cat.label}
            </span>
            {showStatus && (
              <span
                className="px-2 py-0.5 rounded-md text-[10px]"
                style={{ background: `${status.color}12`, color: status.color, border: `1px solid ${status.color}20` }}
              >
                {status.label}
              </span>
            )}
            <span className="text-[10px]" style={{ color: "var(--text-faint, rgba(240,255,245,0.6))" }}>
              {getTimeAgo(idea.created_at)}
            </span>
          </div>

          {/* Idea content */}
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary, #334155)" }}>
            {idea.content}
          </p>

          {/* Author */}
          <p className="text-[10px] mb-3" style={{ color: "var(--text-faint, rgba(240,255,245,0.6))" }}>
            {idea.is_anonymous ? "🌙 Anonymous" : `✦ ${idea.authorName || "Anonymous"}`}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: showComments ? "var(--elovayne-nebula)" : "var(--text-dim, #94a3b8)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {idea.commentCount} {idea.commentCount === 1 ? "comment" : "comments"}
            </button>
            {isAdmin && onDelete && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { onDelete(idea.id); setConfirmDelete(false); }} className="px-2 py-1 rounded text-xs bg-red-500 text-white">Delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 rounded text-xs" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="text-xs px-2 py-1 rounded" style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}>Delete</button>
                )}
              </>
            )}
          </div>

          {/* Comments section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle, rgba(0,255,136,0.08))" }}>
                  {/* Comment list */}
                  {loadingComments ? (
                    <p className="text-xs py-3 text-center" style={{ color: "var(--text-dim, #94a3b8)" }}>
                      Loading comments...
                    </p>
                  ) : comments.length === 0 ? (
                    <p className="text-xs py-3 text-center" style={{ color: "var(--text-faint, rgba(240,255,245,0.6))" }}>
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0, 255, 136, 0.08)" }}>
                            <span className="text-[10px]">{comment.is_anonymous ? "🌙" : "✦"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-medium" style={{ color: "var(--text-muted, #64748b)" }}>
                                {comment.authorName}
                              </span>
                              <span className="text-[10px]" style={{ color: "var(--text-faint, rgba(240,255,245,0.55))" }}>
                                {getTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary, #334155)" }}>
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment input */}
                  {userId ? (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                        style={{
                          background: "var(--input-bg, rgba(0,255,136,0.06))",
                          border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))",
                          color: "var(--text-primary, #0f172a)",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submitComment();
                          }
                        }}
                      />
                      <button
                        onClick={() => setCommentAnonymous(!commentAnonymous)}
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: commentAnonymous ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
                          border: `1px solid ${commentAnonymous ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.08)"}`,
                        }}
                        title={commentAnonymous ? "Commenting anonymously" : "Commenting as yourself"}
                      >
                        <span className="text-xs">{commentAnonymous ? "🌙" : "✦"}</span>
                      </button>
                      <button
                        onClick={submitComment}
                        disabled={!commentText.trim() || submittingComment}
                        className="btn btn-primary btn-sm disabled:opacity-40"
                      >
                        {submittingComment ? "..." : "Send"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] mt-2" style={{ color: "var(--text-faint, rgba(240,255,245,0.6))" }}>
                      Sign in to comment
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
