"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import IdeaCreator from "./IdeaCreator";
import IdeaCard from "./IdeaCard";

const filterTabs = [
  { key: "all", label: "All" },
  { key: "improvement", label: "Improvements", icon: "✦" },
  { key: "addition", label: "Additions", icon: "◎" },
  { key: "change", label: "Changes", icon: "◇" },
  { key: "bug", label: "Bugs", icon: "△" },
  { key: "other", label: "Other", icon: "◈" },
];

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

export default function IdeasFeed() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    const client = supabase();

    let uid: string | null = null;
    try {
      const { data: { session } } = await client.auth.getSession();
      uid = session?.user?.id || null;
    } catch {
      // auth not available
    }
    setUserId(uid);

    let query = client.from("ideas").select("*");
    if (activeFilter !== "all") {
      query = query.eq("category", activeFilter);
    }

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    }

    const { data: ideasData, error } = await query;

    if (error || !ideasData) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      ideasData.map(async (idea) => {
        const { count: voteCount } = await client
          .from("idea_votes")
          .select("*", { count: "exact", head: true })
          .eq("idea_id", idea.id);

        const { count: commentCount } = await client
          .from("idea_comments")
          .select("*", { count: "exact", head: true })
          .eq("idea_id", idea.id);

        let userVoted = false;
        if (uid) {
          const { data: existingVote } = await client
            .from("idea_votes")
            .select("id")
            .eq("idea_id", idea.id)
            .eq("user_id", uid)
            .maybeSingle();
          userVoted = !!existingVote;
        }

        let authorName = "Anonymous";
        if (!idea.is_anonymous) {
          const { data: user } = await client
            .from("users")
            .select("display_name")
            .eq("id", idea.user_id)
            .maybeSingle();
          authorName = user?.display_name || "Anonymous";
        }

        return {
          ...idea,
          authorName,
          voteCount: voteCount || 0,
          userVoted,
          commentCount: commentCount || 0,
        };
      })
    );

    if (sortBy === "popular") {
      enriched.sort((a, b) => b.voteCount - a.voteCount);
    }

    setIdeas(enriched);
    setLoading(false);
  }, [activeFilter, sortBy]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  async function handleSubmit(data: { content: string; category: string; isAnonymous: boolean }) {
    const client = supabase();

    let uid = userId;
    if (!uid) {
      try {
        const { data: authData } = await client.auth.signInAnonymously();
        uid = authData?.user?.id || null;
        if (uid) setUserId(uid);
      } catch {
        // auth not available, use null
      }
    }

    const insertData: { content: string; category: string; is_anonymous: boolean; user_id?: string } = {
      content: data.content,
      category: data.category,
      is_anonymous: data.isAnonymous,
    };
    if (uid) insertData.user_id = uid;

    await client.from("ideas").insert(insertData);
    fetchIdeas();
  }

  async function handleVote(ideaId: string) {
    const client = supabase();

    let uid = userId;
    if (!uid) {
      try {
        const { data: authData } = await client.auth.signInAnonymously();
        uid = authData?.user?.id || null;
        if (uid) setUserId(uid);
      } catch {
        return;
      }
    }
    if (!uid) return;

    const { data: existingVote } = await client
      .from("idea_votes")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("user_id", uid)
      .maybeSingle();

    if (existingVote) {
      await client.from("idea_votes").delete().eq("id", existingVote.id);
    } else {
      await client.from("idea_votes").insert({
        idea_id: ideaId,
        user_id: uid,
      });
    }

    fetchIdeas();
  }

  return (
    <div>
      {/* Creator */}
      <IdeaCreator onSubmit={handleSubmit} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "rgba(0, 255, 136, 0.03)" }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className="relative px-3 py-1.5 rounded-lg text-[11px] transition-all"
              style={{
                background: activeFilter === tab.key ? "rgba(0, 255, 136, 0.1)" : "transparent",
                color: activeFilter === tab.key ? "#00ff88" : "var(--text-dim, #94a3b8)",
              }}
            >
              {activeFilter === tab.key && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.15)" }}
                  layoutId="ideaFilterTab"
                  transition={{ duration: 0.25 }}
                />
              )}
              <span className="relative z-10">
                {tab.icon && <span className="mr-1">{tab.icon}</span>}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(0, 255, 136, 0.03)" }}>
          <button
            onClick={() => setSortBy("popular")}
            className="px-3 py-1.5 rounded-md text-[11px] transition-all"
            style={{
              background: sortBy === "popular" ? "rgba(0, 255, 136, 0.1)" : "transparent",
              color: sortBy === "popular" ? "#00ff88" : "var(--text-dim, #94a3b8)",
            }}
          >
            Popular
          </button>
          <button
            onClick={() => setSortBy("newest")}
            className="px-3 py-1.5 rounded-md text-[11px] transition-all"
            style={{
              background: sortBy === "newest" ? "rgba(0, 255, 136, 0.1)" : "transparent",
              color: sortBy === "newest" ? "#00ff88" : "var(--text-dim, #94a3b8)",
            }}
          >
            Newest
          </button>
        </div>
      </div>

      {/* Ideas list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--card-bg, rgba(0,255,136,0.04))", height: "120px" }} />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <motion.div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--card-bg, rgba(0, 255, 136, 0.04))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.1))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-3xl block mb-3">💡</span>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary, #334155)" }}>
            No ideas yet
          </p>
          <p className="text-xs" style={{ color: "var(--text-dim, #94a3b8)" }}>
            Be the first to share an idea for Elovayne
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              userId={userId}
              onVote={handleVote}
              isAdmin={isAdmin}
              onDelete={isAdmin ? async (id: string) => {
                await fetch("/api/admin/content", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "ideas", id }),
                });
                setIdeas((prev) => prev.filter((i) => i.id !== id));
              } : undefined}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && ideas.length > 0 && (
        <p className="text-center text-[10px] mt-6" style={{ color: "var(--text-faint, rgba(224,245,232,0.3))" }}>
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} · {ideas.reduce((sum, i) => sum + i.voteCount, 0)} votes
        </p>
      )}
    </div>
  );
}
