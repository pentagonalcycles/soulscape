"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CampfireRoom } from "@/lib/campfire/types";

interface CampfireLobbyProps {
  onJoinRoom: (room: CampfireRoom, displayName: string) => void;
}

const PRESET_ICONS: Record<string, string> = {
  "Late Night Thoughts": "🌙",
  "Quiet Corner": "🤫",
  "Random Chat": "🎲",
};

export default function CampfireLobby({ onJoinRoom }: CampfireLobbyProps) {
  const [rooms, setRooms] = useState<CampfireRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState<CampfireRoom | null>(null);
  const [newName, setNewName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [creating, setCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const client = supabase();
      const { data: { session } } = await client.auth.getSession();
      let uid = session?.user.id;
      if (!uid) {
        const { data: authData } = await client.auth.signInAnonymously();
        uid = authData.user?.id;
      }
      if (uid) setUserId(uid);

      const { data } = await client
        .from("campfire_rooms")
        .select("*")
        .eq("is_active", true)
        .order("is_preset", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      setRooms(data || []);
      setLoading(false);
    };
    init();
  }, []);

  async function createRoom() {
    if (!newName.trim() || !userId || creating) return;
    setCreating(true);
    setError(null);
    const client = supabase();
    const { data, error } = await client
      .from("campfire_rooms")
      .insert({
        name: newName.trim(),
        created_by: userId,
      })
      .select()
      .single();

    if (data && !error) {
      setRooms((prev) => [data, ...prev]);
      setShowCreate(false);
      setNewName("");
      setShowJoin(data);
    } else {
      setError(error?.message || "Failed to create room. Please try again.");
    }
    setCreating(false);
  }

  function handleJoin() {
    if (!displayName.trim() || !showJoin) return;
    onJoinRoom(showJoin, displayName.trim());
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: "linear-gradient(180deg, #050510 0%, #0a0a2e 50%, #1a0a2e 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "40%",
          background: "radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 relative z-10"
      >
        <Link
          href="/"
          className="inline-block mb-4 px-4 py-1.5 rounded-lg text-xs cursor-pointer"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            color: "#f59e0b",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
        <h1
          className="text-3xl sm:text-4xl font-light tracking-wide mb-2"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Campfire Chat
        </h1>
        <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
          Sit by the fire. Share what&apos;s on your mind.
        </p>
      </motion.div>

      <motion.button
        onClick={() => setShowCreate(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mb-8 px-8 py-3 rounded-xl text-sm cursor-pointer relative z-10"
        style={{
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          color: "white",
          border: "none",
          boxShadow: "0 0 30px rgba(245, 158, 11, 0.25)",
        }}
      >
        Light a Fire
      </motion.button>

      {loading ? (
        <p className="text-sm relative z-10" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
          Finding campfires...
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3 w-full max-w-lg relative z-10"
        >
          {rooms.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setShowJoin(room)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer text-left transition-all"
              style={{
                background: "rgba(245, 158, 11, 0.05)",
                border: "1px solid rgba(245, 158, 11, 0.1)",
              }}
            >
              <span className="text-2xl">
                {PRESET_ICONS[room.name] || "🔥"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                  {room.name}
                </p>
                <p className="text-[10px]" style={{ color: "rgba(255, 255, 255, 0.25)" }}>
                  {room.is_preset ? "Always burning" : "Custom fire"}
                </p>
              </div>
              <span className="text-xs" style={{ color: "rgba(245, 158, 11, 0.4)" }}>
                Join →
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Join modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowJoin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 rounded-2xl w-full max-w-sm text-center"
              style={{
                background: "linear-gradient(180deg, rgba(20, 10, 5, 0.95), rgba(10, 5, 2, 0.98))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                boxShadow: "0 0 60px rgba(245, 158, 11, 0.1)",
              }}
            >
              <div className="text-4xl mb-4">🔥</div>
              <h2 className="text-lg font-light mb-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                {showJoin.name}
              </h2>
              <p className="text-xs mb-6" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                Choose a display name to sit by the fire
              </p>

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-6"
                style={{
                  background: "rgba(245, 158, 11, 0.06)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoin(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoin}
                  disabled={!displayName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    border: "none",
                    color: "white",
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  Sit by the Fire
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create room modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 rounded-2xl w-full max-w-sm text-center"
              style={{
                background: "linear-gradient(180deg, rgba(20, 10, 5, 0.95), rgba(10, 5, 2, 0.98))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                boxShadow: "0 0 60px rgba(245, 158, 11, 0.1)",
              }}
            >
              <div className="text-4xl mb-4">🪵</div>
              <h2 className="text-lg font-light mb-4" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Light a New Fire
              </h2>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name your campfire..."
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-6"
                style={{
                  background: "rgba(245, 158, 11, 0.06)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && createRoom()}
              />

              {error && (
                <p className="text-xs mb-4 text-center" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCreate(false); setError(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  disabled={!newName.trim() || creating}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    border: "none",
                    color: "white",
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  {creating ? "Lighting..." : "Light Fire"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
