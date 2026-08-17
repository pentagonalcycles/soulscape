"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

interface LiveStreamInsert {
  id: string;
  user_id: string;
  title: string;
  status: string;
  started_at: string;
}

interface Alert {
  id: string;
  name: string;
  title: string;
}

const AUTO_HIDE_MS = 12000;

export default function LiveStreamAlert() {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [alert, setAlert] = useState<Alert | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const scheduleHide = useCallback((id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAlert((prev) => (prev && prev.id === id ? null : prev));
    }, AUTO_HIDE_MS);
  }, []);

  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel("live-stream-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_streams" },
        async (payload) => {
          const stream = payload.new as LiveStreamInsert;
          if (stream.status !== "live") return;
          if (userId && stream.user_id === userId) return;
          if (seenRef.current.has(stream.id)) return;
          seenRef.current.add(stream.id);

          const { data: user } = await client
            .from("users")
            .select("display_name")
            .eq("id", stream.user_id)
            .single();
          const name = user?.display_name || "Anonymous";

          setAlert({ id: stream.id, name, title: stream.title });
          scheduleHide(stream.id);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId, scheduleHide]);

  if (pathname === "/live") return null;

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: "fixed",
            bottom: 84,
            right: 20,
            zIndex: 9999,
          }}
        >
          <Link
            href="/live"
            onClick={() => setAlert(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              maxWidth: 340,
              borderRadius: 14,
              background: "rgba(18, 34, 26, 0.92)",
              border: "1px solid rgba(0, 255, 136, 0.25)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 255, 136, 0.08)",
              backdropFilter: "blur(12px)",
              textDecoration: "none",
              color: "#e8fff0",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ef4444",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: -5,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.35)",
                  animation: "livePulse 1.6s ease-out infinite",
                }}
              />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#00ff88",
                  marginBottom: 2,
                }}
              >
                {alert.name} is live
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#c0e8d0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {alert.title}
              </span>
            </span>
            <button
              aria-label="Dismiss"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAlert(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(224, 245, 232, 0.5)",
                fontSize: 16,
                lineHeight: 1,
                cursor: "pointer",
                padding: 4,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
