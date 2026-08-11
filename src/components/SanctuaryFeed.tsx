"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import SanctuaryComposer from "./SanctuaryComposer";
import WhisperCard from "./WhisperCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { useIsPlus } from "@/lib/premium";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";
type FilterTab = "newest" | "resonant" | "following";

interface Reply {
  id: string;
  content: string;
  isAnonymous: boolean;
  displayName?: string;
  createdAt: string;
}

interface Whisper {
  id: string;
  content: string;
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  mood?: string | null;
  hasContentWarning?: boolean;
  userId: string;
  authorId: string;
  reactions: { type: ReactionType; count: number; userReacted?: boolean }[];
  replies: Reply[];
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "resonant", label: "Most Resonant" },
  { key: "following", label: "Following" },
];

interface SanctuaryFeedProps {
  roomId?: string;
  composerExpanded?: boolean;
  onComposerExpand?: () => void;
  onRequestComposer?: () => void;
}

export default function SanctuaryFeed({ roomId, composerExpanded, onComposerExpand, onRequestComposer }: SanctuaryFeedProps) {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("newest");
  const { userId, isAdmin } = useAuth();
  const isPlus = useIsPlus();

  const fetchWhispers = useCallback(async () => {
    const client = supabase();

    let query = client
      .from("posts")
      .select("*")
      .order("created_at", { ascending: activeFilter !== "newest" })
      .limit(50);

    if (roomId) {
      const { data: room } = await client
        .from("rooms")
        .select("id")
        .eq("slug", roomId)
        .single();
      if (room) {
        query = query.eq("room_id", room.id);
      }
    }

    if (activeFilter === "resonant") {
      query = client
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (roomId) {
        const { data: room } = await client
          .from("rooms")
          .select("id")
          .eq("slug", roomId)
          .single();
        if (room) {
          query = query.eq("room_id", room.id);
        }
      }
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError || !postsData) {
      console.error("Error fetching whispers:", postsError?.message);
      setLoading(false);
      return;
    }

    const whispersWithReactions: Whisper[] = await Promise.all(
      postsData.map(async (post: Record<string, unknown>) => {
        const { data: reactionsData } = await client
          .from("reactions")
          .select("reaction_type, user_id")
          .eq("post_id", post.id);

        const reactionCounts: Record<string, { count: number; userReacted: boolean }> = {};
        reactionsData?.forEach((r: Record<string, unknown>) => {
          const type = r.reaction_type as ReactionType;
          if (!reactionCounts[type]) {
            reactionCounts[type] = { count: 0, userReacted: false };
          }
          reactionCounts[type].count++;
          if (r.user_id === userId) {
            reactionCounts[type].userReacted = true;
          }
        });

            let repliesList: Reply[] = [];
        try {
          const { data: repliesData, error: repliesErr } = await client
            .from("replies")
            .select("*")
            .eq("post_id", post.id)
            .order("created_at", { ascending: true });
          if (!repliesErr && repliesData) {
            repliesList = (repliesData as Record<string, unknown>[]).map((r) => ({
              id: r.id as string,
              content: r.content as string,
              isAnonymous: r.is_anonymous as boolean,
              displayName: r.display_name as string | undefined,
              createdAt: r.created_at as string,
            }));
          }
        } catch {
          // replies table may not exist yet
        }

        return {
          id: post.id as string,
          content: post.content as string,
          displayName: post.is_anonymous ? undefined : (post.display_name as string | undefined),
          isAnonymous: post.is_anonymous as boolean,
          createdAt: post.created_at as string,
          mood: post.mood as string | null | undefined,
          hasContentWarning: (post.has_content_warning as boolean) || false,
          userId: post.user_id as string,
          authorId: post.user_id as string,
          reactions: Object.entries(reactionCounts).map(([type, data]) => ({
            type: type as ReactionType,
            count: data.count,
            userReacted: data.userReacted,
          })),
          replies: repliesList,
        };
      })
    );

    if (activeFilter === "resonant") {
      whispersWithReactions.sort(
        (a, b) =>
          b.reactions.reduce((s, r) => s + r.count, 0) -
          a.reactions.reduce((s, r) => s + r.count, 0)
      );
    }

    setWhispers(whispersWithReactions);
    setLoading(false);
  }, [roomId, activeFilter, userId]);

  useEffect(() => {
    fetchWhispers();
  }, [fetchWhispers]);

  const handleNewWhisper = async (whisper: {
    content: string;
    mood: string | null;
    isAnonymous: boolean;
    hasContentWarning: boolean;
  }) => {
    if (!userId) return;
    const client = supabase();

    const { error } = await client.from("posts").insert({
      user_id: userId,
      content: whisper.content,
      content_type: "text",
      is_anonymous: whisper.isAnonymous,
      mood: whisper.mood,
      has_content_warning: whisper.hasContentWarning,
    });

    if (error) {
      console.error("Error creating whisper:", error.message);
      return;
    }

    fetchWhispers();
  };

  const handleReact = async (postId: string, reactionType: ReactionType) => {
    if (!userId) return;
    const client = supabase();

    const { data: existing } = await client
      .from("reactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
      .single();

    if (existing) {
      await client.from("reactions").delete().eq("id", existing.id);
    } else {
      const { error } = await client.from("reactions").insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      });
      if (error) console.error("Error adding reaction:", error.message);
    }

    fetchWhispers();
  };

  const handleReply = async (postId: string, content: string, isAnonymous: boolean) => {
    if (!userId) return;
    const client = supabase();

    try {
      const { error } = await client.from("replies").insert({
        post_id: postId,
        user_id: userId,
        content,
        is_anonymous: isAnonymous,
      });
      if (error) console.error("Error adding reply:", error.message);
    } catch {
      console.error("Replies table may not exist yet. Run migration_sanctuary_enhancements.sql");
    }
    fetchWhispers();
  };

  const handleReport = async (postId: string, reason: string) => {
    if (!userId) return;
    const client = supabase();
    await client.from("reports").insert({
      reporter_id: userId,
      post_id: postId,
      reason,
    });
  };

  const handleHide = () => {};

  const handleDelete = async (postId: string) => {
    if (!userId) return;
    const client = supabase();
    await client.from("posts").delete().eq("id", postId);
    fetchWhispers();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Composer */}
      <SanctuaryComposer 
        onSubmit={handleNewWhisper} 
        externalExpand={composerExpanded}
        onExpandChange={(expanded) => {
          if (!expanded) onComposerExpand?.();
        }}
      />

      {/* Filter tabs */}
      <div>
        <h2 className="font-heading text-base sm:text-lg text-elovayne-light mb-3 sm:mb-4">
          Posts from the Sanctuary
        </h2>
        <div className="flex gap-1 p-1 rounded-xl bg-elovayne-void/30 w-fit flex-wrap" role="tablist">
          {filterTabs.map((tab) => {
            const isPlusTab = tab.key === "following";
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isPlusTab && !isPlus) return;
                  setActiveFilter(tab.key);
                  setLoading(true);
                }}
                className={`relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-body transition-all duration-300 ${
                  isPlusTab && !isPlus
                    ? "text-elovayne-dim/40 cursor-not-allowed"
                    : activeFilter === tab.key
                    ? "text-elovayne-light"
                    : "text-elovayne-dim hover:text-elovayne-muted"
                }`}
                role="tab"
                aria-selected={activeFilter === tab.key}
                title={isPlusTab && !isPlus ? "Upgrade to Plus to unlock" : ""}
              >
                {activeFilter === tab.key && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-elovayne-violet/15 border border-elovayne-violet/20"
                    layoutId="filterTab"
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                )}
                <span className="relative z-10">
                  {tab.label}
                  {isPlusTab && !isPlus && " 🔒"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Whisper feed */}
      {loading ? (
        <LoadingSkeleton />
      ) : whispers.length === 0 ? (
        <motion.div
          className="rounded-2xl sanctuary-glass-card p-8 sm:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-3xl block mb-4">🌌</span>
          <h3 className="font-heading text-lg text-elovayne-light mb-2">
            The Sanctuary is quiet for now.
          </h3>
          <p className="text-sm text-elovayne-dim font-body mb-6">
            Your voice could be the first light someone finds here.
          </p>
          <button
            onClick={() => onRequestComposer?.()}
            className="px-5 py-2.5 rounded-full font-body text-sm text-elovayne-light bg-elovayne-violet/30 hover:bg-elovayne-violet/40 transition-colors"
          >
            Share the first post
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {whispers.map((whisper, index) => (
            <motion.div
              key={whisper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <WhisperCard
                id={whisper.id}
                content={whisper.content}
                displayName={whisper.displayName}
                isAnonymous={whisper.isAnonymous}
                createdAt={whisper.createdAt}
                mood={whisper.mood}
                hasContentWarning={whisper.hasContentWarning}
                isAuthor={userId === whisper.authorId}
                userId={userId ?? undefined}
                authorId={whisper.authorId}
                reactions={whisper.reactions}
                replies={whisper.replies}
                onReact={handleReact}
                onReply={handleReply}
                onReport={handleReport}
                onHide={handleHide}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
