"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { NERA_TYPES, NERA_EMOTIONS, getNeraTypeById } from "@/lib/nera/constants";
import type { NeraWithMeta, NeraType, NeraEmotion, Nera } from "@/lib/nera/types";
import NeraCard from "./NeraCard";
import dynamic from "next/dynamic";

const NeraMap = dynamic(() => import("./NeraMap"), { ssr: false });

interface NeraFeedProps {
  onSelect: (nera: NeraWithMeta) => void;
  onCreate: () => void;
}

export default function NeraFeed({ onSelect, onCreate }: NeraFeedProps) {
  const { userId, isAdmin } = useAuth();
  const [neras, setNeras] = useState<NeraWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEmotion, setActiveEmotion] = useState<NeraEmotion | "all">("all");
  const [activeType, setActiveType] = useState<NeraType | "all">("all");
  const [section, setSection] = useState<"all" | "near" | "online">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const fetchNeras = useCallback(async () => {
    setLoading(true);
    const client = supabase();

    let query = client
      .from("neras")
      .select("*")
      .eq("status", "upcoming")
      .order("date_time", { ascending: true });

    if (section === "online") {
      query = query.eq("is_online", true);
    }

    const { data: nerasData } = await query.limit(50);

    if (nerasData) {
      const enriched: NeraWithMeta[] = await Promise.all(
        nerasData.map(async (n: Nera) => {
          const { data: host } = await client
            .from("users")
            .select("display_name, avatar_url")
            .eq("id", n.host_id)
            .maybeSingle();

          const { data: attendees } = await client
            .from("nera_attendees")
            .select("user_id, status")
            .eq("nera_id", n.id)
            .eq("status", "joined");

          let userAttendeeStatus = null;
          if (userId) {
            const attendee = attendees?.find((a) => a.user_id === userId);
            if (attendee) userAttendeeStatus = attendee.status;
          }

          const attendeeNames = await Promise.all(
            (attendees || []).slice(0, 4).map(async (a) => {
              const { data: u } = await client
                .from("users")
                .select("display_name, avatar_url")
                .eq("id", a.user_id)
                .maybeSingle();
              return { name: u?.display_name || "Anonymous", avatar: u?.avatar_url || null };
            })
          );

          let distanceMiles: number | undefined;
          if (userLat !== null && userLng !== null && n.lat !== null && n.lng !== null) {
            distanceMiles = haversineDistance(userLat, userLng, n.lat, n.lng);
          }

          return {
            ...n,
            host_name: host?.display_name || "Anonymous",
            host_avatar: host?.avatar_url || null,
            user_attendee_status: userAttendeeStatus,
            is_host: n.host_id === userId,
            attendee_names: attendeeNames,
            distance_miles: distanceMiles,
          };
        })
      );

      let filtered = enriched;

      if (activeEmotion !== "all") {
        filtered = filtered.filter((n) => n.emotion_tags?.includes(activeEmotion));
      }
      if (activeType !== "all") {
        filtered = filtered.filter((n) => n.nera_type === activeType);
      }
      if (section === "near" && userLat !== null) {
        filtered = filtered
          .filter((n) => n.distance_miles !== undefined && n.distance_miles < 50)
          .sort((a, b) => (a.distance_miles || 0) - (b.distance_miles || 0));
      }

      setNeras(filtered);
    }
    setLoading(false);
  }, [userId, activeEmotion, activeType, section, userLat, userLng]);

  useEffect(() => { fetchNeras(); }, [fetchNeras]);

  function enableLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationEnabled(true);
        setSection("near");
      },
      () => { setLocationEnabled(false); }
    );
  }

  const sectionTabs = [
    { id: "all" as const, label: "All Gatherings" },
    { id: "near" as const, label: "Near Me" },
    { id: "online" as const, label: "Online" },
  ];

  const handleAdminDelete = async (neraId: string) => {
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "neras", id: neraId }),
    });
    setNeras((prev) => prev.filter((n) => n.id !== neraId));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Brand mark */}
          <motion.div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 204, 106, 0.06))",
              border: "1px solid rgba(0, 255, 136, 0.1)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="text-xl" style={{ color: "#00ff88" }}>{'\ud83e\udee7'}</span>
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl mb-3"
            style={{
              fontWeight: 300,
              color: "var(--text-primary, #0f172a)",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-heading)",
              lineHeight: 1.1,
            }}
          >
            NERA
          </h1>
          <p
            className="text-base sm:text-lg mb-2"
            style={{
              color: "var(--text-muted, #64748b)",
              fontFamily: "var(--font-accent)",
              letterSpacing: "0.01em",
              fontWeight: 400,
            }}
          >
            Find people. Find a place. Be there.
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
            How do you want to connect today?
          </p>
        </motion.div>

        {/* Start a Nera CTA */}
        <motion.button
          onClick={onCreate}
          className="w-full py-4 rounded-2xl text-[15px] mb-10 flex items-center justify-center gap-2.5 font-medium"
          style={{
            background: "linear-gradient(135deg, #00ff88, #00cc6a)",
            color: "#ffffff",
            boxShadow: "0 4px 24px rgba(0, 255, 136, 0.2), 0 1px 4px rgba(0, 255, 136, 0.1)",
            border: "none",
            letterSpacing: "0.02em",
          }}
          whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0, 255, 136, 0.28), 0 2px 8px rgba(0, 255, 136, 0.12)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Start a Nera
        </motion.button>

        {/* Emotion Discovery */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p
            className="text-[11px] mb-3 uppercase tracking-widest font-medium"
            style={{ color: "var(--text-dim, #94a3b8)", letterSpacing: "0.12em" }}
          >
            How are you feeling?
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveEmotion("all")}
              className="flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-medium transition-all"
              style={{
                background: activeEmotion === "all" ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.03)",
                color: activeEmotion === "all" ? "#00ff88" : "var(--text-muted, #64748b)",
                border: `1px solid ${activeEmotion === "all" ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.06)"}`,
              }}
            >
              All
            </button>
            {NERA_EMOTIONS.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveEmotion(activeEmotion === e.id ? "all" : e.id)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeEmotion === e.id ? `${e.color}10` : "rgba(0, 255, 136, 0.03)",
                  color: activeEmotion === e.id ? e.color : "var(--text-muted, #64748b)",
                  border: `1px solid ${activeEmotion === e.id ? `${e.color}20` : "rgba(0, 255, 136, 0.06)"}`,
                }}
              >
                {e.icon} {e.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section tabs + View toggle */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex gap-1 p-1 rounded-2xl flex-1" style={{ background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.05)" }}>
            {sectionTabs.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id === "near" && !locationEnabled) { enableLocation(); return; }
                  setSection(s.id);
                }}
                className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all"
                style={{
                  background: section === s.id ? "var(--card-bg, rgba(0, 255, 136, 0.06))" : "transparent",
                  color: section === s.id ? "#00ff88" : "var(--text-dim, #94a3b8)",
                  boxShadow: section === s.id ? "0 1px 4px rgba(0, 255, 136, 0.08)" : "none",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          {/* Map/List toggle */}
          <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.05)" }}>
            <button
              onClick={() => setViewMode("list")}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: viewMode === "list" ? "var(--card-bg, rgba(0, 255, 136, 0.06))" : "transparent",
                color: viewMode === "list" ? "#00ff88" : "var(--text-dim, #94a3b8)",
                boxShadow: viewMode === "list" ? "0 1px 4px rgba(0, 255, 136, 0.08)" : "none",
              }}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: viewMode === "map" ? "var(--card-bg, rgba(0, 255, 136, 0.06))" : "transparent",
                color: viewMode === "map" ? "#00ff88" : "var(--text-dim, #94a3b8)",
                boxShadow: viewMode === "map" ? "0 1px 4px rgba(0, 255, 136, 0.08)" : "none",
              }}
              title="Map view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </button>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveType("all")}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-medium transition-all"
            style={{
              background: activeType === "all" ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
              color: activeType === "all" ? "#00ff88" : "var(--text-muted, #64748b)",
              border: `1px solid ${activeType === "all" ? "rgba(0, 255, 136, 0.15)" : "rgba(0, 255, 136, 0.05)"}`,
            }}
          >
            All types
          </button>
          {NERA_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(activeType === t.id ? "all" : t.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-medium transition-all whitespace-nowrap"
              style={{
                background: activeType === t.id ? `${t.color}0D` : "rgba(0, 255, 136, 0.02)",
                color: activeType === t.id ? t.color : "var(--text-muted, #64748b)",
                border: `1px solid ${activeType === t.id ? `${t.color}20` : "rgba(0, 255, 136, 0.05)"}`,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content: Map or List */}
        {loading ? (
          viewMode === "map" ? (
            <div className="rounded-2xl h-72 sm:h-96 flex items-center justify-center" style={{ background: "var(--card-bg, rgba(0, 255, 136, 0.04))", border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.06))" }}>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0, 255, 136, 0.15)", borderTopColor: "#00ff88" }} />
                <p className="text-[13px]" style={{ color: "var(--text-dim, #94a3b8)" }}>Loading map...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl h-44 animate-pulse" style={{ background: "var(--card-bg, rgba(0, 255, 136, 0.04))" }} />
              ))}
            </div>
          )
        ) : viewMode === "map" ? (
          <NeraMap neras={neras} onSelect={onSelect} userLat={userLat} userLng={userLng} />
        ) : neras.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-5"
              style={{
                background: "rgba(0, 255, 136, 0.05)",
                border: "1px solid rgba(0, 255, 136, 0.08)",
              }}
            >
              <span className="text-3xl">{'\ud83e\udee7'}</span>
            </div>
            <p className="text-[15px] mb-2 font-medium" style={{ color: "var(--text-primary, #0f172a)", fontFamily: "var(--font-heading)" }}>
              {activeEmotion !== "all" || activeType !== "all" ? "No matching nerabs" : "No nerabs yet"}
            </p>
            <p className="text-[13px] mb-6" style={{ color: "var(--text-muted, #64748b)" }}>
              {activeEmotion !== "all" || activeType !== "all"
                ? "Try adjusting your filters or create the first one."
                : "Be the first to bring people together."}
            </p>
            <button
              onClick={onCreate}
              className="text-[13px] px-5 py-2.5 rounded-xl font-medium"
              style={{
                background: "rgba(0, 255, 136, 0.06)",
                color: "#00ff88",
                border: "1px solid rgba(0, 255, 136, 0.12)",
              }}
            >
              + Start a Nera
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Results count */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[12px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                {neras.length} gathering{neras.length !== 1 ? "s" : ""}
              </p>
            </div>
            <AnimatePresence>
              {neras.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <NeraCard nera={n} onClick={() => onSelect(n)} onDelete={handleAdminDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Safety footer */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1))" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)" }} />
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim, #94a3b8)", maxWidth: "320px", margin: "0 auto" }}>
            Always meet in public places for the first time. Never share your exact address. Trust your instincts.
          </p>
        </motion.div>
      </div>

      {/* Mobile floating + button */}
      <motion.button
        onClick={onCreate}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-50 sm:hidden"
        style={{
          background: "linear-gradient(135deg, #00ff88, #00cc6a)",
          color: "#ffffff",
          boxShadow: "0 8px 28px rgba(0, 255, 136, 0.3), 0 2px 8px rgba(0, 255, 136, 0.15)",
          border: "none",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </motion.button>
    </div>
  );
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
