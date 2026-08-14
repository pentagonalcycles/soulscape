"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import type { NeraWithMeta } from "@/lib/nera/types";
import { getNeraTypeById, getShortDate } from "@/lib/nera/constants";

interface NeraCardProps {
  nera: NeraWithMeta;
  onClick: () => void;
  onDelete?: (neraId: string) => void;
}

export default function NeraCard({ nera, onClick, onDelete }: NeraCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const neraType = getNeraTypeById(nera.nera_type);
  const isFull = nera.current_participants >= nera.max_participants;
  const spotsLeft = nera.max_participants - nera.current_participants;

  return (
    <motion.div
      className="group rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--card-bg, rgba(0, 255, 136, 0.04))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.07))",
        boxShadow: "0 1px 2px rgba(0, 255, 136, 0.03), 0 4px 12px rgba(0, 255, 136, 0.02)",
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 8px 32px rgba(0, 255, 136, 0.08), 0 2px 8px rgba(0, 255, 136, 0.04)",
        transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
    >
      <div className="p-5 sm:p-6">
        {/* Top: type badge + status badges */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{
              background: `${neraType.color}0A`,
              color: neraType.color,
              border: `1px solid ${neraType.color}18`,
            }}
          >
            <span className="text-[13px]">{neraType.icon}</span>
            {neraType.label}
          </span>
          {nera.is_online && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(79, 70, 229, 0.06)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.12)" }}>
              Online
            </span>
          )}
          {!nera.is_public && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(100, 116, 139, 0.06)", color: "#64748b", border: "1px solid rgba(100, 116, 139, 0.1)" }}>
              Private
            </span>
          )}
          {nera.status === "ongoing" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16, 185, 129, 0.08)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: "#059669" }} />
              Live now
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-[17px] mb-2 group-hover:opacity-80 transition-opacity"
          style={{
            color: "var(--text-primary, #0f172a)",
            fontWeight: 500,
            fontFamily: "var(--font-heading)",
            letterSpacing: "0.01em",
            lineHeight: 1.3,
          }}
        >
          {nera.title}
        </h3>

        {/* Description */}
        {nera.description && (
          <p
            className="text-[13px] mb-4 line-clamp-2"
            style={{
              color: "var(--text-muted, #64748b)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            &ldquo;{nera.description}&rdquo;
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #94a3b8)" }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #64748b)" }}>
              {nera.is_online ? "Online" : nera.approximate_location || nera.city || "Location TBD"}
            </span>
            {nera.distance_miles !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0, 255, 136, 0.06)", color: "#00ff88" }}>
                {nera.distance_miles.toFixed(1)} mi
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #94a3b8)" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #64748b)" }}>
              {getShortDate(nera.date_time)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #94a3b8)" }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #64748b)" }}>
              {new Date(nera.date_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(0, 255, 136, 0.06)" }}>
          {/* Left: attendees + host */}
          <div className="flex items-center gap-3">
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {nera.attendee_names.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold ring-2 ring-white"
                  style={{
                    background: `linear-gradient(135deg, ${neraType.color}15, ${neraType.color}08)`,
                    color: neraType.color,
                    zIndex: 3 - i,
                  }}
                  title={a.name}
                >
                  {a.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {nera.current_participants > 3 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium ring-2 ring-white"
                  style={{ background: "rgba(0, 255, 136, 0.06)", color: "var(--text-muted, #64748b)" }}
                >
                  +{nera.current_participants - 3}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium" style={{ color: "var(--text-primary, #0f172a)" }}>
                {nera.current_participants}/{nera.max_participants}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-dim, #94a3b8)" }}>
                {isFull ? "Full" : spotsLeft === 1 ? "1 spot left" : `${spotsLeft} spots left`}
              </span>
            </div>
          </div>

          {/* Right: delete + view button */}
          <div className="flex items-center gap-2">
            {onDelete && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(nera.id); setConfirmDelete(false); }}
                      className="text-[11px] px-2 py-1 rounded-lg text-white"
                      style={{ background: "#ef4444" }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                      className="text-[11px] px-2 py-1 rounded-lg"
                      style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    className="text-[11px] px-2 py-1 rounded-lg"
                    style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.15)" }}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
            <motion.button
              className="text-[12px] px-4 py-2 rounded-xl font-medium transition-colors"
              style={{
                background: "rgba(0, 255, 136, 0.06)",
                color: "#00ff88",
                border: "1px solid rgba(0, 255, 136, 0.1)",
              }}
              whileHover={{ background: "rgba(0, 255, 136, 0.1)", borderColor: "rgba(0, 255, 136, 0.18)" }}
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              View Nera
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
