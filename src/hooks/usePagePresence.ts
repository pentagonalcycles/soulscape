"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export function usePagePresence(path: string) {
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const tabIdRef = useRef<string>("");
  const pathRef = useRef<string>(path);

  // Keep pathRef in sync
  useEffect(() => { pathRef.current = path; }, [path]);

  // Subscribe once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    tabIdRef.current = tabId;

    const client = supabase();
    const channel = client.channel("site-presence");
    channelRef.current = channel;

    const countForPath = () => {
      const state = channel.presenceState<{ path: string }>();
      let here = 0;
      const currentPath = pathRef.current;
      for (const key in state) {
        const entries = state[key];
        if (Array.isArray(entries)) {
          for (const entry of entries) {
            if (entry.path === currentPath) here++;
          }
        }
      }
      setCount(here);
    };

    channel
      .on("presence", { event: "sync" }, countForPath)
      .on("presence", { event: "join" }, countForPath)
      .on("presence", { event: "leave" }, countForPath)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ path: pathRef.current, tab_id: tabId });
          countForPath();
        }
      });

    return () => {
      channel.untrack();
      client.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  // Update tracked path when navigating
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;
    // Untrack then re-track with new path
    channel.untrack().then(() => {
      channel.track({ path, tab_id: tabIdRef.current });
    });
  }, [path]);

  return count;
}
