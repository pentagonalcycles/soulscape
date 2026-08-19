"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MuralRoom } from "@/lib/mural/types";
import { useBgTheme } from "@/lib/useBgTheme";

const THEME_COLORS = [
  "var(--elovayne-nebula)", "var(--elovayne-violet)", "#8b5cf6", "#ec4899",
  "#f97316", "#10b981", "#3b82f6", "#ef4444",
];

interface MuralLobbyProps {
  onJoinRoom: (room: MuralRoom) => void;
}

export default function MuralLobby({ onJoinRoom }: MuralLobbyProps) {
  const { darkBg } = useBgTheme();
  const [rooms, setRooms] = useState<MuralRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTheme, setNewTheme] = useState("var(--elovayne-nebula)");
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const client = supabase();
        const { data, error } = await client
          .from("mural_rooms")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) console.error("[Mural] Fetch error:", error.message);
        setRooms(data || []);
      } catch (e) {
        console.error("[Mural] Exception:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  async function createRoom() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const client = supabase();

      console.log("[Mural] Creating room:", newName.trim());
      const { data, error } = await client
        .from("mural_rooms")
        .insert({
          name: newName.trim(),
          theme: newTheme,
          canvas_width: 3000,
          canvas_height: 2000,
        })
        .select()
        .single();

      console.log("[Mural] Insert result:", { data, error });

      if (data && !error) {
        setRooms((prev) => [data, ...prev]);
        setShowCreate(false);
        setNewName("");
        onJoinRoom(data);
      } else {
        const msg = error?.message || error?.details || error?.hint || JSON.stringify(error) || "Failed to create room";
        console.error("[Mural] Insert error:", msg);
        setError(msg);
      }
    } catch (e: unknown) {
      console.error("[Mural] Exception:", e);
      setError(e instanceof Error ? e.message : "Failed to create room. Please try again.");
    }
    setCreating(false);
  }

  async function deleteRoom(roomId: string) {
    const client = supabase();
    const { error } = await client
      .from("mural_rooms")
      .update({ is_active: false })
      .eq("id", roomId);
    if (!error) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    }
  }

  async function clearAllRooms() {
    const client = supabase();
    const { error } = await client
      .from("mural_rooms")
      .update({ is_active: false })
      .eq("is_active", true);
    if (!error) {
      setRooms([]);
      setClearConfirm(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: darkBg ? "#000000" : "transparent" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <Link
          href="/"
          className="inline-block mb-4 px-4 py-1.5 rounded-lg text-xs cursor-pointer"
          style={{
            background: "rgba(0, 255, 136, 0.06)",
            border: "1px solid rgba(0, 255, 136, 0.12)",
            color: "var(--elovayne-nebula)",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
        <h1
          className="text-4xl font-light mb-3"
          style={{
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(135deg, var(--elovayne-nebula), var(--elovayne-violet))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Collaborative Mural
        </h1>
        <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
          Paint together. Create something beautiful.
        </p>
      </motion.div>

      <div className="flex gap-3 mb-8">
        <motion.button
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-xl text-white text-sm font-medium cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--elovayne-nebula), var(--elovayne-violet))",
            boxShadow: "0 4px 20px rgba(0, 255, 136, 0.3)",
          }}
        >
          + Create New Room
        </motion.button>

        {rooms.length > 0 && (
          <>
            {clearConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "rgba(240,255,245,0.65)" }}>Clear all?</span>
                <button
                  onClick={clearAllRooms}
                  className="px-3 py-2 rounded-xl text-xs cursor-pointer text-white"
                  style={{ background: "#ef4444" }}
                >
                  Yes, clear all
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.12)", color: "rgba(224,245,232,0.5)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <motion.button
                onClick={() => setClearConfirm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl text-sm cursor-pointer"
                style={{
                  background: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                }}
              >
                Clear All Rooms
              </motion.button>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: "rgba(240, 255, 245, 0.6)" }}>
          Loading rooms...
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center" style={{ color: "rgba(240, 255, 245, 0.6)" }}>
          <p className="text-lg mb-2">No active rooms</p>
          <p className="text-sm">Create one to start painting together</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 w-full max-w-2xl"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl relative group"
              style={{
                background: "rgba(0, 255, 136, 0.06)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${room.theme}33`,
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
              }}
            >
              <button
                onClick={() => onJoinRoom(room)}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: room.theme, boxShadow: `0 0 12px ${room.theme}66` }}
                  />
                  <span className="font-medium text-sm" style={{ color: "#0f172a" }}>
                    {room.name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
                  {room.canvas_width} x {room.canvas_height}
                </p>
              </button>
              <div className="mt-3 flex gap-2">
                  {deleteConfirm === room.id ? (
                    <>
                      <span className="text-xs py-1" style={{ color: "rgba(240,255,245,0.65)" }}>Delete?</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoom(room.id);
                          setDeleteConfirm(null);
                        }}
                        className="px-2 py-1 rounded text-xs cursor-pointer text-white"
                        style={{ background: "#ef4444" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(null);
                        }}
                        className="px-2 py-1 rounded text-xs cursor-pointer"
                        style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.12)", color: "rgba(224,245,232,0.5)" }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(room.id);
                      }}
                      className="px-2 py-1 rounded text-xs cursor-pointer"
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", touchAction: "none" }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-5 sm:p-6 w-full max-w-sm rounded-xl"
              style={{
                background: "var(--card-bg, rgba(255,255,255,0.95))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0, 255, 136, 0.12)",
                touchAction: "manipulation",
              }}
            >
              <h2
                className="text-xl mb-4 font-light"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "linear-gradient(135deg, var(--elovayne-nebula), var(--elovayne-violet))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Create a Room
              </h2>

              <input
                type="text"
                placeholder="Room name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-lg text-sm mb-4 outline-none"
                style={{
                  background: "rgba(0, 255, 136, 0.06)",
                  border: "1px solid rgba(0, 255, 136, 0.12)",
                  color: "#0f172a",
                  touchAction: "manipulation",
                }}
                onKeyDown={(e) => e.key === "Enter" && createRoom()}
              />

              {error && (
                <p className="text-xs mb-4" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}

              <p className="text-xs mb-2" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
                Theme color
              </p>
              <div className="flex gap-2 mb-5">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTheme(c)}
                    className="w-10 h-10 rounded-full cursor-pointer transition-transform"
                    style={{
                      background: c,
                      boxShadow: newTheme === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                      transform: newTheme === c ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCreate(false); setError(null); }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm cursor-pointer"
                  style={{
                    background: "rgba(0, 255, 136, 0.06)",
                    border: "1px solid rgba(0, 255, 136, 0.12)",
                    color: "rgba(224, 245, 232, 0.6)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  disabled={!newName.trim() || creating}
                  className="flex-1 px-4 py-2 rounded-lg text-sm text-white cursor-pointer disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, var(--elovayne-nebula), var(--elovayne-violet))",
                  }}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
