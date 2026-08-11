"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import SaveButton from "./SaveButton";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";

interface Reaction {
  type: ReactionType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const reactions: Reaction[] = [
  {
    type: "understanding",
    label: "I see you in the dark",
    icon: "🤍",
    description: "I see you and I understand",
    color: "#0d9488",
  },
  {
    type: "hope",
    label: "Your words became light",
    icon: "✨",
    description: "Your words brought light",
    color: "#10b981",
  },
  {
    type: "company",
    label: "I'm here with you",
    icon: "🫂",
    description: "You're not alone in this",
    color: "#2dd4a8",
  },
  {
    type: "less_alone",
    label: "Less alone",
    icon: "🌌",
    description: "This post helped you feel less alone",
    color: "#60a5fa",
  },
  {
    type: "comfort",
    label: "This comforted me",
    icon: "💫",
    description: "Your words wrapped around me like warmth",
    color: "#06b6d4",
  },
];

interface PostCardProps {
  id: string;
  content: string;
  contentType: "text" | "poem" | "story" | "art" | "voice";
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  roomId?: string;
  userId?: string;
  authorId?: string;
  hasContentWarning?: boolean;
  reactions?: { type: ReactionType; count: number; userReacted?: boolean }[];
  onReact?: (postId: string, reactionType: ReactionType) => void;
  onReport?: (postId: string, reason: string) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({
  id,
  content,
  contentType,
  displayName,
  isAnonymous,
  createdAt,
  userId,
  authorId,
  hasContentWarning = false,
  reactions: postReactions = [],
  onReact,
  onReport,
  onDelete,
}: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReportReason, setShowReportReason] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reactedType, setReactedType] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const isAuthor = userId && authorId && userId === authorId;

  const getTimeAgo = (date: string) => {
    if (!mounted) return "";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const contentStyles = {
    text: "font-body text-base leading-relaxed",
    poem: "font-accent text-lg leading-relaxed italic",
    story: "font-body text-base leading-relaxed",
    art: "font-body text-base leading-relaxed",
    voice: "font-body text-base leading-relaxed italic",
  };

  const typeIcons = {
    text: "💭",
    poem: "📜",
    story: "📖",
    art: "🎨",
    voice: "🎙️",
  };

  return (
    <motion.article
      className="glass rounded-2xl p-6 relative group"
      style={{
        boxShadow: "0 0 30px rgba(0, 230, 138, 0.05)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        boxShadow: "0 0 40px rgba(0, 230, 138, 0.1)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-elovayne-nebula/20 flex items-center justify-center">
            <span className="text-lg">
              {isAnonymous ? "🌙" : typeIcons[contentType]}
            </span>
          </div>

          <div>
            <p className="text-elovayne-light text-sm font-body">
              {isAnonymous ? "Anonymous" : displayName || "Someone"}
            </p>
            <p className="text-elovayne-dim text-xs">
              {getTimeAgo(createdAt)}
              <span className="mx-2">·</span>
              <span className="capitalize">{contentType}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <SaveButton postId={id} />
          <div className="relative">
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className="text-elovayne-dim hover:text-elovayne-muted transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
            >
              ···
            </button>
            <AnimatePresence>
              {showReportMenu && (
                <motion.div
                  className="absolute right-0 top-8 glass rounded-xl p-2 min-w-[150px] z-20"
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                >
                  {isAuthor && (
                    <>
                      {confirmDelete ? (
                        <div className="px-3 py-2">
                           <p className="text-xs text-elovayne-muted mb-2">Delete this post?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onDelete?.(id);
                                setShowReportMenu(false);
                                setConfirmDelete(false);
                              }}
                              className="flex-1 px-2 py-1 text-xs rounded bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="flex-1 px-2 py-1 text-xs rounded bg-elovayne-deep/50 text-elovayne-muted hover:text-elovayne-light transition-colors"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-cosmic-pink hover:bg-elovayne-nebula/10 rounded-lg transition-colors"
                        >
                           Delete this post
                        </button>
                      )}
                    </>
                  )}
                  {showReportReason ? (
                    <div className="px-3 py-2 space-y-2">
                       <p className="text-xs text-elovayne-muted">Why does this post need attention?</p>
                      {["Spam", "Inappropriate", "Harmful", "Other"].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => {
                            onReport?.(id, reason);
                            setShowReportMenu(false);
                            setShowReportReason(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-elovayne-muted hover:text-elovayne-light hover:bg-elovayne-nebula/10 rounded-lg transition-colors"
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
                          className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-cosmic-pink hover:bg-elovayne-nebula/10 rounded-lg transition-colors"
                        >
                           Report this post
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      {hasContentWarning && !revealed ? (
        <div className="relative mb-4">
          <div className={`blur-[6px] pointer-events-none select-none opacity-40 ${contentStyles[contentType]}`}>
            {contentType === "poem" ? (
              <div className="whitespace-pre-wrap text-elovayne-light">{content}</div>
            ) : (
              <p className="text-elovayne-light">{content}</p>
            )}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-elovayne-void/60 backdrop-blur-sm rounded-xl">
            <p className="text-elovayne-muted/60 text-xs mb-2">This post may contain sensitive content</p>
            <button
              onClick={() => setRevealed(true)}
              className="text-elovayne-violet/70 hover:text-elovayne-violet text-xs underline transition-colors"
            >
              Reveal post
            </button>
          </div>
        </div>
      ) : (
        <div className={`mb-4 ${contentStyles[contentType]}`}>
          {contentType === "poem" ? (
            <div className="whitespace-pre-wrap text-elovayne-light">{content}</div>
          ) : (
            <p className="text-elovayne-light">{content}</p>
          )}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Existing reactions */}
        {postReactions
          .filter((r) => r.count > 0)
          .map((reaction) => {
            const reactionConfig = reactions.find((r) => r.type === reaction.type);
            if (!reactionConfig) return null;
            return (
              <motion.button
                key={reaction.type}
                onClick={() => {
                  setReactedType(reaction.type);
                  onReact?.(id, reaction.type);
                  setTimeout(() => setReactedType(null), 400);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                  reaction.userReacted
                    ? "bg-elovayne-nebula/30 border border-elovayne-violet/30"
                    : "bg-elovayne-deep/30 border border-transparent hover:border-elovayne-nebula/20"
                }`}
                animate={
                  reactedType === reaction.type
                    ? { scale: [1, 1.2, 1], transition: { duration: 0.4 } }
                    : {}
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{reactionConfig.icon}</span>
                <span className="text-elovayne-muted">{reaction.count}</span>
              </motion.button>
            );
          })}

        {/* Add reaction button */}
        <div className="relative">
          <motion.button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-elovayne-deep/30 border border-transparent hover:border-elovayne-nebula/20 text-elovayne-dim hover:text-elovayne-muted transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✦</span>
            <span>React</span>
          </motion.button>

          {/* Reaction picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 glass rounded-xl p-3 min-w-[280px] z-20"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
              >
                <p className="text-xs text-elovayne-dim mb-2">How did this post make you feel?</p>
                <div className="grid grid-cols-1 gap-1">
                  {reactions.map((reaction) => (
                    <motion.button
                      key={reaction.type}
                      onClick={() => {
                        onReact?.(id, reaction.type);
                        setShowReactions(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-elovayne-nebula/10 transition-colors group/reaction"
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-lg">{reaction.icon}</span>
                      <div>
                        <p className="text-sm text-elovayne-light group-hover/reaction:text-elovayne-light">
                          {reaction.label}
                        </p>
                        <p className="text-xs text-elovayne-dim">
                          {reaction.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
