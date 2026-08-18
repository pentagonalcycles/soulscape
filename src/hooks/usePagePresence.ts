"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface PagePresenceEntry {
  path: string;
  tab_id: string;
}

// Shared channel and state across all hooks
let sharedChannel: RealtimeChannel | null = null;
let sharedTabId = "";
const listeners = new Set<(path: string) => void>();
let currentPath = "";

function getOrCreateChannel(): RealtimeChannel {
  if (sharedChannel) return sharedChannel;

  const client = supabase();
  sharedTabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  sharedChannel = client.channel("site-presence");

  sharedChannel
    .on("presence", { event: "sync" }, () => notifyListeners())
    .on("presence", { event: "join" }, () => notifyListeners())
    .on("presence", { event: "leave" }, () => notifyListeners())
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await sharedChannel?.track({ path: currentPath, tab_id: sharedTabId });
        notifyListeners();
      }
    });

  return sharedChannel;
}

function notifyListeners() {
  if (!sharedChannel) return;
  for (const listener of listeners) {
    listener(currentPath);
  }
}

function getPresenceState(): { entries: PagePresenceEntry[]; byPath: Record<string, number> } {
  if (!sharedChannel) return { entries: [], byPath: {} };
  const state = sharedChannel.presenceState<PagePresenceEntry>();
  const entries: PagePresenceEntry[] = [];
  const byPath: Record<string, number> = {};
  for (const key in state) {
    const items = state[key];
    if (Array.isArray(items)) {
      for (const item of items) {
        entries.push(item);
        byPath[item.path] = (byPath[item.path] || 0) + 1;
      }
    }
  }
  return { entries, byPath };
}

export function usePagePresence(path: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    currentPath = path;
    const channel = getOrCreateChannel();

    const update = (currentPath: string) => {
      const { byPath } = getPresenceState();
      setCount(byPath[path] || 0);
    };

    listeners.add(update);
    update(path);

    // Re-track when path changes
    if (sharedChannel) {
      sharedChannel.untrack().then(() => {
        sharedChannel?.track({ path, tab_id: sharedTabId });
      });
    }

    return () => {
      listeners.delete(update);
    };
  }, [path]);

  return count;
}

export function useAllPresence(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const channel = getOrCreateChannel();

    const update = () => {
      const { byPath } = getPresenceState();
      setCounts({ ...byPath });
    };

    listeners.add(update);
    update();

    return () => {
      listeners.delete(update);
    };
  }, []);

  return counts;
}
