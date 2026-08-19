"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { getDailyPrompt } from "@/lib/poetry/prompts";
import PoetryTitle from "./PoetryTitle";
import PoemWriter from "./PoemWriter";
import PoemReader from "./PoemReader";
import { useBgTheme } from "@/lib/useBgTheme";

interface Poem {
  id: string;
  pen_name: string;
  prompt: string;
  content: string;
  created_at: string;
  reactions?: Record<string, number>;
  userReactions?: string[];
}

type View = "title" | "write" | "read";

export default function PoetryPage() {
  const { isAdmin, userId } = useAuth();
  const { darkBg } = useBgTheme();
  const [view, setView] = useState<View>("title");
  const [poems, setPoems] = useState<Poem[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const prompt = getDailyPrompt();

  // Initialize auth and load poems
  useEffect(() => {
    const init = async () => {
      const client = supabase();

      // Load poems with reactions
      const { data: poemsData } = await client
        .from("poems")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (poemsData) {
        // Load reactions for each poem
        const poemIds = poemsData.map((p: { id: string }) => p.id);
        const { data: reactionsData } = await client
          .from("poem_reactions")
          .select("poem_id, reaction_type, user_id")
          .in("poem_id", poemIds);

        const poemsWithReactions = poemsData.map((poem) => {
          const reactions: Record<string, number> = {};
          const userReactions: string[] = [];

          (reactionsData || []).forEach((r: { poem_id: string; reaction_type: string; user_id: string }) => {
            if (r.poem_id === (poem as { id: string }).id) {
              reactions[r.reaction_type] = (reactions[r.reaction_type] || 0) + 1;
              if (r.user_id === userId) userReactions.push(r.reaction_type);
            }
          });

          return { ...poem, reactions, userReactions } as Poem;
        });

        setPoems(poemsWithReactions);
      }

      // Check today's count
      if (userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count } = await client
          .from("poems")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", today.toISOString());
        setTodayCount(count || 0);
      }

      setLoading(false);
    };
    init();
  }, []);

  // Subscribe to new poems
  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel("poems-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "poems" }, (payload) => {
        const newPoem = payload.new as Poem;
        setPoems((prev) => [{ ...newPoem, reactions: {}, userReactions: [] }, ...prev]);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const handleSubmit = useCallback(async (content: string, penName: string) => {
    if (!userId || todayCount >= 3) return;
    const client = supabase();
    const { data, error } = await client
      .from("poems")
      .insert({
        user_id: userId,
        pen_name: penName,
        prompt,
        content,
      })
      .select()
      .single();

    if (data && !error) {
      setPoems((prev) => [{ ...data, reactions: {}, userReactions: [] }, ...prev]);
      setTodayCount((c) => c + 1);
      setView("read");
    }
  }, [userId, todayCount, prompt]);

  const handleReact = useCallback(async (poemId: string, reactionType: string) => {
    if (!userId) return;
    const client = supabase();

    // Check if already reacted
    const existing = poems.find((p) => p.id === poemId)?.userReactions?.includes(reactionType);

    if (existing) {
      // Remove reaction
      await client
        .from("poem_reactions")
        .delete()
        .eq("poem_id", poemId)
        .eq("user_id", userId)
        .eq("reaction_type", reactionType);

      setPoems((prev) =>
        prev.map((p) => {
          if (p.id !== poemId) return p;
          return {
            ...p,
            reactions: { ...p.reactions, [reactionType]: Math.max(0, (p.reactions?.[reactionType] || 1) - 1) },
            userReactions: p.userReactions?.filter((r) => r !== reactionType),
          };
        })
      );
    } else {
      // Add reaction
      await client
        .from("poem_reactions")
        .insert({ poem_id: poemId, user_id: userId, reaction_type: reactionType });

      setPoems((prev) =>
        prev.map((p) => {
          if (p.id !== poemId) return p;
          return {
            ...p,
            reactions: { ...p.reactions, [reactionType]: (p.reactions?.[reactionType] || 0) + 1 },
            userReactions: [...(p.userReactions || []), reactionType],
          };
        })
      );
    }
  }, [userId, poems]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: darkBg ? "#000000" : "transparent" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs" style={{ color: "rgba(245, 158, 11, 0.3)" }}>Opening the book...</p>
        </div>
      </div>
    );
  }

  switch (view) {
    case "write":
      return (
        <PoemWriter
          prompt={prompt}
          onSubmit={handleSubmit}
          onBack={() => setView("title")}
          remaining={Math.max(0, 3 - todayCount)}
        />
      );
    case "read":
      return (
        <PoemReader
          poems={poems}
          onReact={handleReact}
          onBack={() => setView("title")}
          onWrite={() => setView("write")}
          isAdmin={isAdmin}
          onDelete={isAdmin ? async (poemId: string) => {
            await fetch("/api/admin/content", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "poems", id: poemId }),
            });
            setPoems((prev) => prev.filter((p) => p.id !== poemId));
          } : undefined}
        />
      );
    default:
      return (
        <PoetryTitle
          prompt={prompt}
          onWrite={() => setView("write")}
          onRead={() => setView("read")}
          poemCount={poems.length}
        />
      );
  }
}
