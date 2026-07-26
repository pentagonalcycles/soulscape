"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import PostCreator from "./PostCreator";
import PostCard from "./PostCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";

interface Post {
  id: string;
  content: string;
  contentType: "text" | "poem" | "story" | "art" | "voice";
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  roomId?: string;
  userId: string;
  reactions: { type: ReactionType; count: number; userReacted?: boolean }[];
}

interface SanctuaryFeedProps {
  roomId?: string;
}

export default function SanctuaryFeed({ roomId }: SanctuaryFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, reactions: 0 });
  const { userId } = useAuth();

  const fetchPosts = useCallback(async () => {
    const client = supabase();

    let query = client
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

    const { data: postsData, error: postsError } = await query;

    if (postsError || !postsData) {
      console.error("Error fetching posts:", postsError?.message);
      setLoading(false);
      return;
    }

    const postsWithReactions: Post[] = await Promise.all(
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

        return {
          id: post.id as string,
          content: post.content as string,
          contentType: post.content_type as "text" | "poem" | "story" | "art" | "voice",
          displayName: post.is_anonymous ? undefined : (post.display_name as string | undefined),
          isAnonymous: post.is_anonymous as boolean,
          createdAt: post.created_at as string,
          roomId: post.room_id as string | undefined,
          userId: post.user_id as string,
          reactions: Object.entries(reactionCounts).map(([type, data]) => ({
            type: type as ReactionType,
            count: data.count,
            userReacted: data.userReacted,
          })),
        };
      })
    );

    setPosts(postsWithReactions);

    // Fetch stats
    const { count: postCount } = await client
      .from("posts")
      .select("*", { count: "exact", head: true });
    const { count: reactionCount } = await client
      .from("reactions")
      .select("*", { count: "exact", head: true });

    setStats({
      posts: postCount ?? 0,
      reactions: reactionCount ?? 0,
    });

    setLoading(false);
  }, [roomId, userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleNewPost = async (newPost: {
    content: string;
    contentType: "text" | "poem" | "story" | "art" | "voice";
    identityType: "anonymous" | "alias" | "real";
    displayName?: string;
    isAnonymous: boolean;
    roomId?: string;
  }) => {
    if (!userId) return;

    const client = supabase();

    let resolvedRoomId = null;
    const postRoomSlug = newPost.roomId || roomId;
    if (postRoomSlug) {
      const { data: room } = await client
        .from("rooms")
        .select("id")
        .eq("slug", postRoomSlug)
        .single();
      resolvedRoomId = room?.id ?? null;
    }

    const { error } = await client.from("posts").insert({
      user_id: userId,
      content: newPost.content,
      content_type: newPost.contentType,
      is_anonymous: newPost.isAnonymous,
      room_id: resolvedRoomId,
    });

    if (error) {
      console.error("Error creating post:", error.message);
      return;
    }

    fetchPosts();
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

      if (error) {
        console.error("Error adding reaction:", error.message);
        return;
      }
    }

    fetchPosts();
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

  const handleDelete = async (postId: string) => {
    if (!userId) return;
    const client = supabase();
    await client.from("posts").delete().eq("id", postId);
    fetchPosts();
  };

  return (
    <div className="flex flex-col gap-6">
      <PostCreator onSubmit={handleNewPost} roomId={roomId} />

      {/* Community stats */}
      {(stats.posts > 0 || stats.reactions > 0) && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-elovayne-dim text-xs font-body">
            {stats.posts.toLocaleString()} stories shared · {stats.reactions.toLocaleString()} moments of connection
          </p>
        </motion.div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-elovayne-dim text-sm font-body">
                No stories yet. Be the first to share.
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostCard
                  id={post.id}
                  content={post.content}
                  contentType={post.contentType}
                  displayName={post.displayName}
                  isAnonymous={post.isAnonymous}
                  createdAt={post.createdAt}
                  roomId={post.roomId}
                  userId={userId ?? undefined}
                  authorId={post.userId}
                  reactions={post.reactions}
                  onReact={handleReact}
                  onReport={handleReport}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-elovayne-dim text-sm font-body">
          The universe holds more stories...
        </p>
      </motion.div>
    </div>
  );
}
