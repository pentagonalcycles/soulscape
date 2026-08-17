"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const VISITOR_KEY = "elovayne-visitor-id";
const VISITOR_NAME_KEY = "elovayne-visitor-name";

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function getVisitorName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const name = localStorage.getItem(VISITOR_NAME_KEY);
    return name && name.trim() ? name.trim().slice(0, 40) : null;
  } catch {
    return null;
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const recorded = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}|${userId || "anon"}`;
    if (recorded.current.has(key)) return;
    recorded.current.add(key);

    const visitorId = getVisitorId();
    supabase()
      .from("visits")
      .insert({
        user_id: userId || null,
        visitor_id: visitorId,
        path: pathname,
        referrer: document.referrer || null,
        visitor_name: getVisitorName(),
      })
      .then(({ error }) => {
        if (error) console.error("visit tracking failed:", error.message);
      });
  }, [pathname, userId]);

  return null;
}
