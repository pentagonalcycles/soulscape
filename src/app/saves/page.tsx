"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";
import Link from "next/link";

type ReactionType = "understanding" | "hope" | "company" | "less_alone" | "comfort";

interface SavedPost {
  id: string;
  content: string;
  contentType: "text" | "poem" | "story" | "art" | "voice";
  displayName?: string;
  isAnonymous: boolean;
  createdAt: string;
  roomId?: string;
  reactions: { type: ReactionType; count: number; userReacted?: boolean }[];
}

export default function SavesPage() {
  const { userId } = useAuth();
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const client = supabase();

    const { data: savesData } = await client
      .from("saves")
      .select("post_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!savesData || savesData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postIds = savesData.map((s) => s.post_id);

    const { data: postsData } = await client
      .from("posts")
      .select("*")
      .in("id", postIds);

    if (!postsData) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const postsWithReactions: SavedPost[] = await Promise.all(
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
          reactions: Object.entries(reactionCounts).map(([type, data]) => ({
            type: type as ReactionType,
            count: data.count,
            userReacted: data.userReacted,
          })),
        };
      })
    );

    setPosts(postsWithReactions);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

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
      await client.from("reactions").insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      });
    }
    fetchSavedPosts();
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
        <Navigation activePage="saved" />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                Saved Posts
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                Stories and words you chose to keep.
              </p>
            </motion.div>

            {loading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-elovayne-dim text-sm font-body">Loading your saved posts...</p>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-elovayne-dim text-sm font-body mb-4">
                  No saved posts yet.
                </p>
                <Link
                  href="/sanctuary"
                  className="text-elovayne-violet hover:text-elovayne-light transition-colors text-sm"
                >
                  Visit the Sanctuary to find something worth saving
                </Link>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {posts.map((post, index) => (
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
                      reactions={post.reactions}
                      onReact={handleReact}
                      onReport={handleReport}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
