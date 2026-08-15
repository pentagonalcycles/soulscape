"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { getNeraTypeById, formatNeraDateTime, getTimeUntil, REPORT_REASONS } from "@/lib/nera/constants";
import type { NeraWithMeta, NeraMessage } from "@/lib/nera/types";

interface NeraDetailProps {
  nera: NeraWithMeta;
  onBack: () => void;
  onDelete?: (neraId: string) => void;
}

export default function NeraDetail({ nera, onBack, onDelete }: NeraDetailProps) {
  const { userId, isAdmin } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attendees, setAttendees] = useState<{ name: string; avatar: string | null; status: string }[]>([]);
  const [messages, setMessages] = useState<(NeraMessage & { author_name: string })[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reported, setReported] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const neraType = getNeraTypeById(nera.nera_type);
  const isFull = nera.current_participants >= nera.max_participants;
  const isPast = new Date(nera.date_time).getTime() < Date.now();
  const isAttending = nera.user_attendee_status === "joined";
  const isHost = nera.is_host;
  const needsJoinRequest = !nera.is_public && !isHost && !isAttending;

  const fetchAttendees = useCallback(async () => {
    const client = supabase();
    const { data } = await client
      .from("nera_attendees")
      .select("user_id, status")
      .eq("nera_id", nera.id)
      .neq("status", "left");
    if (data) {
      const enriched = await Promise.all(
        data.map(async (a) => {
          const { data: user } = await client
            .from("users")
            .select("display_name, avatar_url")
            .eq("id", a.user_id)
            .maybeSingle();
          return { name: user?.display_name || "Anonymous", avatar: user?.avatar_url || null, status: a.status };
        })
      );
      setAttendees(enriched);
    }
  }, [nera.id]);

  const fetchMessages = useCallback(async () => {
    const client = supabase();
    const { data } = await client
      .from("nera_messages")
      .select("*")
      .eq("nera_id", nera.id)
      .order("created_at", { ascending: true })
      .limit(50);
    if (data) {
      const enriched = await Promise.all(
        data.map(async (m) => {
          const { data: user } = await client
            .from("users")
            .select("display_name")
            .eq("id", m.user_id)
            .maybeSingle();
          return { ...m, author_name: user?.display_name || "Anonymous" };
        })
      );
      setMessages(enriched);
    }
  }, [nera.id]);

  useEffect(() => { fetchAttendees(); fetchMessages(); }, [fetchAttendees, fetchMessages]);

  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel("nera-" + nera.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "nera_messages", filter: "nera_id=eq." + nera.id }, () => fetchMessages())
      .on("postgres_changes", { event: "*", schema: "public", table: "nera_attendees", filter: "nera_id=eq." + nera.id }, () => fetchAttendees())
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [nera.id, fetchMessages, fetchAttendees]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleJoin() {
    if (!userId) return;
    setJoining(true);
    const client = supabase();
    if (needsJoinRequest) {
      await client.from("nera_join_requests").insert({ nera_id: nera.id, user_id: userId, status: "pending" });
    } else {
      await client.from("nera_attendees").insert({ nera_id: nera.id, user_id: userId, status: "joined" });
      await client.from("neras").update({ current_participants: nera.current_participants + 1 }).eq("id", nera.id);
    }
    setJoining(false);
    fetchAttendees();
  }

  async function handleLeave() {
    if (!userId) return;
    setLeaving(true);
    const client = supabase();
    await client.from("nera_attendees").delete().eq("nera_id", nera.id).eq("user_id", userId);
    if (isAttending) {
      await client.from("neras").update({ current_participants: Math.max(1, nera.current_participants - 1) }).eq("id", nera.id);
    }
    setLeaving(false);
    fetchAttendees();
  }

  async function sendMessage() {
    if (!messageText.trim() || !userId) return;
    const client = supabase();
    await client.from("nera_messages").insert({ nera_id: nera.id, user_id: userId, content: messageText.trim() });
    setMessageText("");
  }

  async function submitReport() {
    if (!userId || !reportReason) return;
    const client = supabase();
    await client.from("nera_reports").insert({ reporter_id: userId, nera_id: nera.id, reason: reportReason, details: reportDetails || null });
    setReported(true);
  }

  async function cancelNera() {
    const client = supabase();
    await client.from("neras").update({ status: "cancelled" }).eq("id", nera.id);
    onBack();
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(0, 255, 136, 0.03)",
    border: "1px solid rgba(0, 255, 136, 0.12)",
    color: "var(--text-primary, #e2e8f0)",
    outline: "none",
    borderRadius: "14px",
    backdropFilter: "blur(16px)",
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-24 pb-20">
        {/* Back + Admin Delete */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--text-dim, #60b890)" }}
            whileHover={{ color: "#00ff88" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </motion.button>
          {onDelete && (
            <>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-dim, #60b890)" }}>Delete this Nera?</span>
                  <button onClick={() => { onDelete(nera.id); onBack(); }} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white">Yes, delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.12)" }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  Delete Nera
                </button>
              )}
            </>
          )}
        </div>

        {/* Header card */}
        <motion.div
          className="glass-futuristic corner-accents neon-border rounded-3xl p-6 sm:p-8 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium icon-glow" style={{ background: `${neraType.color}0D`, color: neraType.color, border: `1px solid ${neraType.color}20` }}>
              <span className="text-[13px]">{neraType.icon}</span> {neraType.label}
            </span>
            {nera.is_online && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99, 102, 241, 0.08)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.15)" }}>Online</span>}
            {!nera.is_public && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(148, 163, 184, 0.08)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.12)" }}>Private</span>}
            {nera.status === "cancelled" && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}>Cancelled</span>}
          </div>

          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl mb-3"
            style={{ fontWeight: 400, color: "var(--text-primary, #e2e8f0)", fontFamily: "var(--font-heading)", letterSpacing: "0.02em", lineHeight: 1.2 }}
          >
            {nera.title}
          </h1>

          {/* Host */}
          <p className="text-[13px] mb-4" style={{ color: "var(--text-muted, #94a3b8)" }}>
            Hosted by <span className="font-medium" style={{ color: "var(--text-primary, #e2e8f0)" }}>{nera.host_name}</span>
          </p>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim, #60b890)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[13px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
                {nera.is_online ? "Online" : nera.approximate_location || nera.city || "Location TBD"}
              </span>
              {nera.distance_miles !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0, 255, 136, 0.08)", color: "#00ff88" }}>
                  {nera.distance_miles.toFixed(1)} mi
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim, #60b890)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[13px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
                {formatNeraDateTime(nera.date_time)} &middot; {getTimeUntil(nera.date_time)}
              </span>
            </div>
          </div>

          {/* Description */}
          {nera.description && (
            <div className="glass-futuristic p-4 rounded-2xl mb-5" style={{ border: "1px solid rgba(0, 255, 136, 0.05)" }}>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary, #94a3b8)" }}>{nera.description}</p>
            </div>
          )}

          {/* Action button */}
          {nera.status !== "cancelled" && !isPast && (
            <div className="flex gap-3">
              {isAttending ? (
                <button onClick={handleLeave} disabled={leaving} className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
                  {leaving ? "Leaving..." : "Leave Nera"}
                </button>
              ) : needsJoinRequest ? (
                <button onClick={handleJoin} disabled={joining} className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium relative overflow-hidden" style={{ background: "linear-gradient(135deg, #00ff88, #00cc6a)", color: "#ffffff", boxShadow: "0 4px 16px rgba(0, 255, 136, 0.25)" }}>
                  <div className="scanlines pointer-events-none absolute inset-0 opacity-10" />
                  {joining ? "Requesting..." : "Request to Join"}
                </button>
              ) : (
                <button onClick={handleJoin} disabled={joining || isFull} className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium relative overflow-hidden" style={{ background: isFull ? "rgba(0, 255, 136, 0.04)" : "linear-gradient(135deg, #00ff88, #00cc6a)", color: isFull ? "var(--text-dim, #60b890)" : "#ffffff", boxShadow: isFull ? "none" : "0 4px 16px rgba(0, 255, 136, 0.25)" }}>
                  {isFull ? "Full" : <><div className="scanlines pointer-events-none absolute inset-0 opacity-10" />{"I\u2019m In"}</>}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Attendees card */}
        <motion.div
          className="glass-futuristic corner-accents rounded-3xl p-6 mb-6"
          style={{ border: "1px solid rgba(0, 255, 136, 0.06)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium" style={{ color: "var(--text-primary, #e2e8f0)" }}>Attendees</h3>
            <span className="text-[12px]" style={{ color: isFull ? "#ef4444" : "var(--text-dim, #60b890)" }}>
              {nera.current_participants}/{nera.max_participants}
            </span>
          </div>
          {attendees.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--text-dim, #60b890)" }}>No one has joined yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attendees.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${neraType.color}08`, border: `1px solid ${neraType.color}15` }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold" style={{ background: `${neraType.color}18`, color: neraType.color }}>
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: "var(--text-primary, #e2e8f0)" }}>{a.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Chat */}
        {isAttending && (
          <motion.div
            className="glass-futuristic corner-accents rounded-3xl p-6 mb-6"
            style={{ border: "1px solid rgba(0, 255, 136, 0.06)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full flex items-center justify-between text-[13px] font-medium"
              style={{ color: "var(--text-primary, #e2e8f0)" }}
            >
              <span>Group Chat</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "rgba(0, 255, 136, 0.08)", color: "var(--text-dim, #60b890)" }}>
                {messages.length}
              </span>
            </button>
            {showChat && (
              <div className="mt-4">
                <div className="max-h-56 overflow-y-auto mb-4 space-y-3 pr-1" style={{ scrollbarWidth: "thin" }}>
                  {messages.map((m) => (
                    <div key={m.id} className="text-[13px]">
                      <span className="font-medium" style={{ color: "#00ff88" }}>{m.author_name}: </span>
                      <span style={{ color: "var(--text-muted, #94a3b8)" }}>{m.content}</span>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-[12px]" style={{ color: "var(--text-dim, #60b890)" }}>No messages yet. Say something!</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Say something..."
                    className="flex-1 px-4 py-2.5 text-[13px]"
                    style={inputStyle}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="px-4 py-2.5 rounded-2xl text-[12px] font-medium transition-all"
                    style={{
                      background: messageText.trim() ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.03)",
                      color: messageText.trim() ? "#00ff88" : "var(--text-dim, #60b890)",
                      border: `1px solid ${messageText.trim() ? "rgba(0, 255, 136, 0.18)" : "rgba(0, 255, 136, 0.06)"}`,
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Host controls */}
        {isHost && nera.status === "upcoming" && (
          <motion.div
            className="glass-futuristic corner-accents rounded-3xl p-6 mb-6"
            style={{ border: "1px solid rgba(0, 255, 136, 0.06)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h3 className="text-[13px] font-medium mb-3" style={{ color: "var(--text-primary, #e2e8f0)" }}>Host Controls</h3>
            <button onClick={cancelNera} className="w-full py-2.5 rounded-xl text-[12px] font-medium" style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              Cancel Nera
            </button>
          </motion.div>
        )}

        {/* Safety */}
        <motion.div
          className="glass-futuristic corner-accents rounded-3xl p-6 mb-6"
          style={{ border: "1px solid rgba(0, 255, 136, 0.06)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3 className="text-[13px] font-medium" style={{ color: "var(--text-primary, #e2e8f0)" }}>Community & Safety</h3>
          </div>
          <ul className="text-[12px] space-y-1.5" style={{ color: "var(--text-muted, #94a3b8)", lineHeight: 1.6 }}>
            <li>Always meet in public places for the first time</li>
            <li>Never share your home address or personal location</li>
            <li>Trust your instincts &mdash; leave if something feels wrong</li>
            <li>Tell a friend where you are going and who you are meeting</li>
          </ul>
        </motion.div>

        {/* Report */}
        {!isHost && !showReport && !reported && (
          <button onClick={() => setShowReport(true)} className="text-[12px]" style={{ color: "var(--text-dim, #60b890)" }}>
            Report this Nera
          </button>
        )}
        {showReport && !reported && (
          <motion.div
            className="glass-futuristic corner-accents rounded-3xl p-6"
            style={{ border: "1px solid rgba(239, 68, 68, 0.08)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[13px] font-medium mb-3" style={{ color: "var(--text-primary, #e2e8f0)" }}>Why are you reporting?</p>
            <div className="space-y-2 mb-3">
              {REPORT_REASONS.map((r) => (
                <button key={r.value} onClick={() => setReportReason(r.value)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all"
                  style={{ background: reportReason === r.value ? "rgba(239, 68, 68, 0.06)" : "rgba(0, 255, 136, 0.02)", border: `1px solid ${reportReason === r.value ? "rgba(239, 68, 68, 0.12)" : "rgba(0, 255, 136, 0.06)"}`, color: reportReason === r.value ? "#ef4444" : "var(--text-muted, #94a3b8)" }}>
                  {r.label}
                </button>
              ))}
            </div>
            <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} rows={2} placeholder="Details (optional)..." className="w-full px-4 py-3 rounded-xl text-[13px] resize-none mb-3" style={inputStyle} />
            <div className="flex gap-3">
              <button onClick={() => setShowReport(false)} className="flex-1 py-2.5 rounded-xl text-[13px]" style={{ background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)", color: "var(--text-muted, #94a3b8)" }}>Cancel</button>
              <button onClick={submitReport} disabled={!reportReason} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium" style={{ background: reportReason ? "rgba(239, 68, 68, 0.08)" : "rgba(0, 255, 136, 0.03)", border: `1px solid ${reportReason ? "rgba(239, 68, 68, 0.15)" : "rgba(0, 255, 136, 0.06)"}`, color: reportReason ? "#ef4444" : "var(--text-dim, #60b890)" }}>
                Submit
              </button>
            </div>
          </motion.div>
        )}
        {reported && (
          <p className="text-[13px] font-medium" style={{ color: "#34d399" }}>Report submitted. Thank you.</p>
        )}
      </div>
    </div>
  );
}
