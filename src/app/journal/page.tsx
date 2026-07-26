"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import Navigation from "@/components/Navigation";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "💔", label: "Heartbroken" },
  { emoji: "🌟", label: "Hopeful" },
  { emoji: "🌙", label: "Reflective" },
];

export default function JournalPage() {
  const { userId } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const client = supabase();
    const { data } = await client
      .from("journals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setEntries((data as JournalEntry[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSave = async () => {
    if (!userId || !title.trim() || !content.trim()) return;
    setSaving(true);

    const client = supabase();

    if (editingId) {
      await client
        .from("journals")
        .update({
          title: title.trim(),
          content: content.trim(),
          mood,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);
    } else {
      await client.from("journals").insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
        mood,
      });
    }

    setTitle("");
    setContent("");
    setMood(null);
    setEditing(false);
    setEditingId(null);
    setSaving(false);
    fetchEntries();
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setEditingId(entry.id);
    setEditing(true);
  };

  const handleDelete = async (id: string) => {
    const client = supabase();
    await client.from("journals").delete().eq("id", id);
    fetchEntries();
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setMood(null);
    setEditing(false);
    setEditingId(null);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nebula />
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="journal" />

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-elovayne-light glow-text-strong mb-4">
                Your Journal
              </h1>
              <p className="font-accent text-xl text-elovayne-muted">
                A quiet constellation only you can see
              </p>
            </motion.div>

            {/* New Entry Button / Editor */}
            <motion.div
              className="glass rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full text-left flex items-center gap-4 py-2"
                >
                  <div className="w-10 h-10 rounded-full bg-elovayne-nebula/20 flex items-center justify-center">
                    <span className="text-elovayne-violet text-lg">✦</span>
                  </div>
                  <span className="text-elovayne-muted font-body">
                    Capture a new whisper of thought...
                  </span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg text-elovayne-light">
                      {editingId ? "Edit Entry" : "New Entry"}
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="text-sm text-elovayne-dim hover:text-elovayne-light transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="                    Name this constellation..."
                    className="w-full bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors font-heading"
                  />

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="                    Let your thoughts drift like stardust..."
                    rows={6}
                    className="w-full bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors resize-none font-body"
                  />

                  {/* Mood Selector */}
                  <div>
                    <p className="text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                      What constellation of feeling are you in?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((m) => (
                        <button
                          key={m.emoji}
                          onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                            mood === m.emoji
                              ? "bg-elovayne-nebula/30 border border-elovayne-violet/30"
                              : "bg-elovayne-deep/30 border border-transparent hover:border-elovayne-nebula/20"
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span className="text-elovayne-muted">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={handleSave}
                      disabled={!title.trim() || !content.trim() || saving}
                      className="px-6 py-3 rounded-full font-body text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background:
                          title.trim() && content.trim()
                            ? "linear-gradient(135deg, rgba(107, 63, 160, 0.8), rgba(157, 124, 216, 0.8))"
                            : "rgba(107, 63, 160, 0.3)",
                        boxShadow:
                          title.trim() && content.trim()
                            ? "0 0 20px rgba(157, 124, 216, 0.3)"
                            : "none",
                      }}
                      whileHover={title.trim() && content.trim() ? { scale: 1.02 } : {}}
                      whileTap={title.trim() && content.trim() ? { scale: 0.98 } : {}}
                    >
                      <span className="text-elovayne-light">
                        {saving ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
                      </span>
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Entries List */}
            {loading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-elovayne-dim text-sm font-body">Gathering your constellations...</p>
              </motion.div>
            ) : entries.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-4xl block mb-4">📝</span>
                <p className="text-elovayne-dim text-sm font-body">
                  Your constellation is empty. Begin writing to map your inner cosmos.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      className="glass rounded-2xl p-6 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-heading text-lg text-elovayne-light">
                            {entry.mood && <span className="mr-2">{entry.mood}</span>}
                            {entry.title}
                          </h3>
                          <p className="text-xs text-elovayne-dim">
                            {formatDate(entry.created_at)}
                            {entry.updated_at !== entry.created_at && " (edited)"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-xs text-elovayne-dim hover:text-elovayne-violet transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-xs text-elovayne-dim hover:text-elovayne-cosmic-pink transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-elovayne-light font-body text-sm whitespace-pre-wrap leading-relaxed">
                        {entry.content}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
