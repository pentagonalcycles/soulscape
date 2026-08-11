"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface SaveButtonProps {
  postId: string;
}

export default function SaveButton({ postId }: SaveButtonProps) {
  const { userId } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSaved = useCallback(async () => {
    if (!userId) return;
    const client = supabase();
    const { data } = await client
      .from("saves")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .single();
    setSaved(!!data);
  }, [userId, postId]);

  useEffect(() => {
    checkSaved();
  }, [checkSaved]);

  const toggleSave = async () => {
    if (!userId || loading) return;
    setLoading(true);
    const client = supabase();

    if (saved) {
      await client
        .from("saves")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);
      setSaved(false);
    } else {
      await client.from("saves").insert({
        user_id: userId,
        post_id: postId,
      });
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleSave}
      disabled={!userId || loading}
      className="text-elovayne-dim hover:text-elovayne-gold transition-colors disabled:opacity-30"
      title={saved ? "Remove from saved" : "Save this post"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
