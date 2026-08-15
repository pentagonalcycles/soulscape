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
      className="group glass-futuristic corner-accents neon-border rounded-2xl overflow-hidden cursor-pointer relative"
      whileHover={{
        y: -4,
        boxShadow: "0 8px 32px rgba(0, 255, 136, 0.1), 0 2px 8px rgba(0, 255, 136, 0.05)",
        transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
    >
      <div className="p-5 sm:p-6">
        {/* Top: type badge + status badges */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium icon-glow"
            style={{
              background: `${neraType.color}0D`,
              color: neraType.color,
              border: `1px solid ${neraType.color}20`,
            }}
          >
            <span className="text-[13px]">{neraType.icon}</span>
            {neraType.label}
          </span>
          {nera.is_online && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99, 102, 241, 0.08)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              Online
            </span>
          )}
          {!nera.is_public && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(148, 163, 184, 0.08)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.12)" }}>
              Private
            </span>
          )}
          {nera.status === "ongoing" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.18)" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ background: "#34d399" }} />
              Live now
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-[17px] mb-2 group-hover:opacity-80 transition-opacity"
          style={{
            color: "var(--text-primary, #e2e8f0)",
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
              color: "var(--text-muted, #94a3b8)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            &ldquo;{nera.description}&rdquo;
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #60b890)" }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
              {nera.is_online ? "Online" : nera.approximate_location || nera.city || "Location TBD"}
            </span>
            {nera.distance_miles !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0, 255, 136, 0.08)", color: "#00ff88" }}>
                {nera.distance_miles.toFixed(1)} mi
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #60b890)" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
              {getShortDate(nera.date_time)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim, #60b890)" }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[12px]" style={{ color: "var(--text-muted, #94a3b8)" }}>
              {new Date(nera.date_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(0, 255, 136, 0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {nera.attendee_names.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold ring-2 ring-[#15261d]"
                  style={{
                    background: `linear-gradient(135deg, ${neraType.color}18, ${neraType.color}0A)`,
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
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium ring-2 ring-[#15261d]"
                  style={{ background: "rgba(0, 255, 136, 0.08)", color: "var(--text-muted, #94a3b8)" }}
                >
                  +{nera.current_participants - 3}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium" style={{ color: "var(--text-primary, #e2e8f0)" }}>
                {nera.current_participants}/{nera.max_participants}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-dim, #60b890)" }}>
                {isFull ? "Full" : spotsLeft === 1 ? "1 spot left" : `${spotsLeft} spots left`}
              </span>
            </div>
          </div>

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
                      style={{ background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.12)" }}
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
                background: "rgba(0, 255, 136, 0.08)",
                color: "#00ff88",
                border: "1px solid rgba(0, 255, 136, 0.15)",
              }}
              whileHover={{ background: "rgba(0, 255, 136, 0.12)", borderColor: "rgba(0, 255, 136, 0.22)" }}
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
