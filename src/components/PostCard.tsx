"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
    label: "I understand",
    icon: "🤍",
    description: "I see you and I understand",
    color: "#9d7cd8",
  },
  {
    type: "hope",
    label: "This gave me hope",
    icon: "✨",
    description: "Your words brought light",
    color: "#f5d062",
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
    description: "You made me feel less alone",
    color: "#60a5fa",
  },
  {
    type: "comfort",
    label: "This comforted me",
    icon: "💫",
    description: "Your words brought comfort",
    color: "#e879a8",
  },
];

interface PostCardProps {
  id: string;
  content: string;
  contentType: "text" | "poem" | "story";
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  roomId?: string;
  reactions?: { type: ReactionType; count: number; userReacted?: boolean }[];
  onReact?: (postId: string, reactionType: ReactionType) => void;
  onReport?: (postId: string) => void;
}

export default function PostCard({
  id,
  content,
  contentType,
  displayName,
  isAnonymous,
  createdAt,
  reactions: postReactions = [],
  onReact,
  onReport,
}: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const getTimeAgo = (date: string) => {
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
  };

  const typeIcons = {
    text: "💭",
    poem: "📜",
    story: "📖",
  };

  return (
    <motion.article
      className="glass rounded-2xl p-6 relative group"
      style={{
        boxShadow: "0 0 30px rgba(157, 124, 216, 0.05)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        boxShadow: "0 0 40px rgba(157, 124, 216, 0.1)",
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
              {isAnonymous ? "Anonymous Soul" : displayName || "Anonymous Soul"}
            </p>
            <p className="text-elovayne-dim text-xs">
              {getTimeAgo(createdAt)}
              <span className="mx-2">·</span>
              <span className="capitalize">{contentType}</span>
            </p>
          </div>
        </div>

        {/* Report button */}
        <div className="relative">
          <button
            onClick={() => setShowReportMenu(!showReportMenu)}
            className="text-elovayne-dim hover:text-elovayne-muted transition-colors opacity-0 group-hover:opacity-100"
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
                <button
                  onClick={() => {
                    onReport?.(id);
                    setShowReportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-elovayne-muted hover:text-elovayne-cosmic-pink hover:bg-elovayne-nebula/10 rounded-lg transition-colors"
                >
                  Report this post
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className={`mb-4 ${contentStyles[contentType]}`}>
        {contentType === "poem" ? (
          <div className="whitespace-pre-wrap text-elovayne-light">{content}</div>
        ) : (
          <p className="text-elovayne-light">{content}</p>
        )}
      </div>

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
                onClick={() => onReact?.(id, reaction.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                  reaction.userReacted
                    ? "bg-elovayne-nebula/30 border border-elovayne-violet/30"
                    : "bg-elovayne-deep/30 border border-transparent hover:border-elovayne-nebula/20"
                }`}
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
                <p className="text-xs text-elovayne-dim mb-2">How did this make you feel?</p>
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
