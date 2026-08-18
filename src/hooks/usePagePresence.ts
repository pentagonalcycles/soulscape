"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceEntry {
  path: string;
}

export function usePagePresence(path: string) {
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const visitorIdRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get or create persistent visitor ID
    let vid = localStorage.getItem("elovayne-visitor-id");
    if (!vid) {
      vid = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("elovayne-visitor-id", vid);
    }
    visitorIdRef.current = vid;

    const channel = supabase().channel("site-presence", {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceEntry>();
        const here: string[] = [];
        for (const key in state) {
          const entries = state[key];
          if (Array.isArray(entries)) {
            for (const entry of entries) {
              if (entry.path === path) here.push(key);
            }
          }
        }
        setCount(here.length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ path });
        }
      });

    return () => {
      channel.untrack();
      supabase().removeChannel(channel);
      channelRef.current = null;
    };
  }, [path]);

  return count;
}
