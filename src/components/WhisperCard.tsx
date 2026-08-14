"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";

interface ReactionConfig {
  type: ReactionType;
  label: string;
  icon: string;
  color: string;
}

const reactionConfigs: ReactionConfig[] = [
  { type: "understanding", label: "I feel this", icon: "🤍", color: "#00ff88" },
  { type: "hope", label: "This gave me hope", icon: "✨", color: "#10b981" },
  { type: "company", label: "You are not alone", icon: "🫂", color: "#2dd4a8" },
  { type: "less_alone", label: "Less alone", icon: "🌌", color: "#60a5fa" },
  { type: "comfort", label: "Send warmth", icon: "💫", color: "#00cc6a" },
];

interface Reply {
  id: string;
  content: string;
  isAnonymous: boolean;
  displayName?: string;
  createdAt: string;
}

interface WhisperCardProps {
  id: string;
  content: string;
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  mood?: string | null;
  hasContentWarning?: boolean;
  isAuthor?: boolean;
  reactions: { type: ReactionType; count: number; userReacted?: boolean }[];
  replies?: Reply[];
  onReact: (postId: string, reactionType: ReactionType) => void;
  onReply: (postId: string, content: string, isAnonymous: boolean) => void;
  onReport: (postId: string, reason: string) => void;
  onBlock?: (userId: string) => void;
  onHide?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  authorId?: string;
  userId?: string;
  isAdmin?: boolean;
}

function getTimeAgo(date: string, mounted: boolean) {
  if (!mounted) return "";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return then.toLocaleDateString();
}

export default function WhisperCard({
  id,
  content,
  displayName,
  isAnonymous,
  createdAt,
  mood,
  hasContentWarning = false,
  isAuthor = false,
  reactions = [],
  replies = [],
  onReact,
  onReply,
  onReport,
  onHide,
  onDelete,
  isAdmin = false,
}: WhisperCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportReason, setShowReportReason] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isHidden, setIsHidden] = useState(hasContentWarning);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true) }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowReportReason(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    await onReply(id, replyContent.trim(), replyAnonymous);
    setReplyContent("");
    setIsSubmittingReply(false);
  };

  const authorName = isAnonymous ? "A wandering soul" : displayName || "A wandering soul";

  return (
    <motion.article
      className="rounded-2xl sanctuary-glass-card p-4 sm:p-6 relative group"
      style={{
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        boxShadow: "0 0 30px rgba(0, 230, 138, 0.08)",
      }}
    >
      {/* Content warning overlay */}
      {hasContentWarning && isHidden && (
        <div className="absolute inset-0 rounded-2xl bg-elovayne-void/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-2xl mb-3">⚠️</span>
          <p className="text-sm text-elovayne-muted font-body mb-3">
            This post may contain sensitive content
          </p>
          <button
            onClick={() => setIsHidden(false)}
            className="px-4 py-2 rounded-full text-sm font-body text-elovayne-light border border-elovayne-violet/30 hover:bg-elovayne-violet/10 transition-colors"
          >
            Reveal post
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-elovayne-violet/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm">{isAnonymous ? "🌙" : "✦"}</span>
          </div>
          <div>
            <p className="text-elovayne-light text-xs sm:text-sm font-body">
              {authorName}
            </p>
            <p className="text-elovayne-dim/60 text-[10px] sm:text-xs font-body">
              {getTimeAgo(createdAt, mounted)}
              {mood && (
                <>
                  <span className="mx-1 sm:mx-1.5">·</span>
                  <span>{mood}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-elovayne-dim/40 hover:text-elovayne-muted transition-colors opacity-0 group-hover:opacity-100 p-1"
            aria-label="Post options"
          >
            ⋯
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute right-0 top-8 rounded-xl p-2 min-w-[160px] z-20 sanctuary-glass-card"
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {(isAuthor || isAdmin) && onDelete && (
                  <>
                    {confirmDelete ? (
                      <div className="px-3 py-2">
                        <p className="text-xs text-elovayne-muted mb-2 font-body">Delete this post?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { onDelete(id); setShowMenu(false); setConfirmDelete(false); }}
                            className="flex-1 px-2 py-1 text-xs rounded bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors font-body"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 px-2 py-1 text-xs rounded bg-elovayne-void/50 text-elovayne-muted hover:text-elovayne-light transition-colors font-body"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-cosmic-pink hover:bg-elovayne-violet/10 rounded-lg transition-colors font-body"
                      >
                        Delete this post
                      </button>
                    )}
                  </>
                )}
                {showReportReason ? (
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-xs text-elovayne-dim mb-2 font-body">Why?</p>
                    {["Spam", "Inappropriate", "Harmful", "Other"].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => { onReport(id, reason); setShowMenu(false); setShowReportReason(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-elovayne-muted hover:text-elovayne-light hover:bg-elovayne-violet/10 rounded-lg transition-colors font-body"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    {!isAuthor && (
                      <button
                        onClick={() => setShowReportReason(true)}
                        className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-cosmic-pink hover:bg-elovayne-violet/10 rounded-lg transition-colors font-body"
                      >
                        Report
                      </button>
                    )}
                    {onHide && (
                      <button
                        onClick={() => { onHide(id); setShowMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-light hover:bg-elovayne-violet/10 rounded-lg transition-colors font-body"
                      >
                        Hide this post
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`${window.location.origin}/#${id}`);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-light hover:bg-elovayne-violet/10 rounded-lg transition-colors font-body"
                    >
                      Copy link
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3 sm:mb-4 pl-9 sm:pl-11">
        <p className="text-elovayne-light font-body text-xs sm:text-sm leading-relaxed italic">
          &ldquo;{content}&rdquo;
        </p>
      </div>

      {/* Reactions + Reply toggle */}
      <div className="pl-9 sm:pl-11 flex items-center gap-1 sm:gap-1.5 flex-wrap">
        {reactions
          .filter((r) => r.count > 0)
          .map((reaction) => {
            const config = reactionConfigs.find((c) => c.type === reaction.type);
            if (!config) return null;
            return (
              <motion.button
                key={reaction.type}
                onClick={() => onReact(id, reaction.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all duration-300 ${
                  reaction.userReacted
                    ? "bg-elovayne-violet/20 border border-elovayne-violet/30 text-elovayne-light"
                    : "bg-elovayne-void/30 border border-transparent text-elovayne-dim hover:text-elovayne-muted hover:border-elovayne-violet/10"
                }`}
                style={{ transition: "all 0.3s ease" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`${config.label}: ${reaction.count}`}
              >
                <span>{config.icon}</span>
                <span className="opacity-70">{reaction.count}</span>
              </motion.button>
            );
          })}

        <div className="relative">
          <motion.button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body bg-elovayne-void/30 border border-transparent text-elovayne-dim hover:text-elovayne-muted hover:border-elovayne-violet/10 transition-all duration-300"
            style={{ transition: "all 0.3s ease" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add reaction"
          >
            <span>✦</span>
            <span>React</span>
          </motion.button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 rounded-xl p-2 min-w-[220px] z-20 sanctuary-glass-card"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {reactionConfigs.map((rc) => (
                  <button
                    key={rc.type}
                    onClick={() => { onReact(id, rc.type); setShowReactions(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-elovayne-violet/10 transition-colors font-body"
                    style={{ transition: "all 0.3s ease" }}
                  >
                    <span>{rc.icon}</span>
                    <span className="text-sm text-elovayne-muted hover:text-elovayne-light">
                      {rc.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body bg-elovayne-void/30 border border-transparent text-elovayne-dim hover:text-elovayne-muted hover:border-elovayne-violet/10 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`${replies.length} replies. Click to ${showReplies ? "hide" : "show"} replies`}
        >
          <span>💬</span>
          <span>{replies.length > 0 ? replies.length : ""} Reply</span>
        </motion.button>
      </div>

      {/* Replies section */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="mt-3 sm:mt-4 pl-9 sm:pl-11 space-y-2 sm:space-y-3 border-l border-elovayne-violet/10 ml-3 sm:ml-4">
              {replies.map((reply) => (
                <div key={reply.id} className="pl-3 sm:pl-4 py-1.5 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs">{reply.isAnonymous ? "🌙" : "✦"}</span>
                    <p className="text-[10px] sm:text-xs text-elovayne-light font-body">
                      {reply.isAnonymous ? "Anonymous" : reply.displayName || "Someone"}
                    </p>
                    <span className="text-[10px] sm:text-xs text-elovayne-dim/50 font-body">
                      {getTimeAgo(reply.createdAt, mounted)}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-elovayne-muted font-body leading-relaxed pl-4 sm:pl-5">
                    {reply.content}
                  </p>
                </div>
              ))}

              {/* Reply input */}
              <div className="pl-3 sm:pl-4 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-elovayne-dim/50 font-body mb-1.5 sm:mb-2 italic">
                  Respond with kindness. There is a person behind every post.
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Leave a gentle response…"
                    className="flex-1 bg-elovayne-void/30 border border-elovayne-violet/15 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-elovayne-light placeholder-elovayne-dim/50 focus:outline-none focus:border-elovayne-violet/30 transition-colors font-body"
                    aria-label="Reply content"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setReplyAnonymous(!replyAnonymous)}
                      className={`text-[10px] sm:text-xs font-body px-1.5 sm:px-2 py-1 rounded transition-colors ${
                        replyAnonymous
                          ? "text-elovayne-violet"
                          : "text-elovayne-dim hover:text-elovayne-muted"
                      }`}
                      title={replyAnonymous ? "Replying anonymously" : "Replying with name"}
                      aria-label={`Reply as ${replyAnonymous ? "anonymous" : "named"}`}
                    >
                      {replyAnonymous ? "🌙" : "✦"}
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || isSubmittingReply}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-body text-elovayne-light bg-elovayne-violet/30 hover:bg-elovayne-violet/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Send reply"
                    >
                      {isSubmittingReply ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
