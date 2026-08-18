"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface PagePresenceEntry {
  path: string;
  tabId: string;
}

export function usePagePresence(path: string) {
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const tabIdRef = useRef<string>("");
  const pathRef = useRef<string>(path);

  useEffect(() => { pathRef.current = path; }, [path]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    tabIdRef.current = tabId;

    const client = supabase();
    const channel = client.channel("site-presence");
    channelRef.current = channel;

    const countForPath = () => {
      const state = channel.presenceState<PagePresenceEntry>();
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

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;
    channel.untrack().then(() => {
      channel.track({ path, tab_id: tabIdRef.current });
    });
  }, [path]);

  return count;
}

export function useAllPresence(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const tabIdRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    tabIdRef.current = tabId;

    const client = supabase();
    const channel = client.channel("site-presence");
    channelRef.current = channel;

    const updateCounts = () => {
      const state = channel.presenceState<PagePresenceEntry>();
      const map: Record<string, number> = {};
      for (const key in state) {
        const entries = state[key];
        if (Array.isArray(entries)) {
          for (const entry of entries) {
            map[entry.path] = (map[entry.path] || 0) + 1;
          }
        }
      }
      setCounts(map);
    };

    channel
      .on("presence", { event: "sync" }, updateCounts)
      .on("presence", { event: "join" }, updateCounts)
      .on("presence", { event: "leave" }, updateCounts)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ path: window.location.pathname, tab_id: tabId });
          updateCounts();
        }
      });

    return () => {
      channel.untrack();
      client.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  return counts;
}
