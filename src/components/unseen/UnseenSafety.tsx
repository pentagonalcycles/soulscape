"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { REPORT_REASONS } from "@/lib/unseen/constants";

interface UnseenSafetyProps {
  onBack: () => void;
  reportUserId?: string;
  reportUserName?: string;
}

export default function UnseenSafety({ onBack, reportUserId, reportUserName }: UnseenSafetyProps) {
  const { userId } = useAuth();
  const [showReport, setShowReport] = useState(!!reportUserId);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);

  async function handleReport() {
    if (!userId || !reportUserId || !reason) return;
    const client = supabase();
    await client.from("unseen_reports").insert({
      reporter_id: userId,
      reported_id: reportUserId,
      reason,
      details: details || null,
    });
    setReported(true);
  }

  async function handleBlock() {
    if (!userId || !reportUserId) return;
    const client = supabase();
    await client.from("unseen_blocks").insert({
      blocker_id: userId,
      blocked_id: reportUserId,
    });
    setBlocked(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="mb-8 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>← Back</button>

        <h2 className="text-xl sm:text-2xl mb-8" style={{ fontWeight: 200, color: "rgba(224,231,255,0.9)" }}>
          Safety & Privacy
        </h2>

        {!showReport ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm mb-3" style={{ color: "rgba(224,231,255,0.8)" }}>Your safety matters</h3>
              <ul className="space-y-2 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                <li>• Never share personal contact details too quickly</li>
                <li>• Meet in public places if you decide to meet</li>
                <li>• Tell someone you trust about your plans</li>
                <li>• Report anyone who makes you feel unsafe</li>
                <li>• You can block anyone at any time</li>
              </ul>
            </div>

            {reportUserId && (
              <div className="space-y-3">
                <button onClick={() => setShowReport(true)}
                  className="w-full py-3 rounded-xl text-xs transition-all"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.7)" }}>
                  Report {reportUserName || "User"}
                </button>
                <button onClick={handleBlock}
                  className="w-full py-3 rounded-xl text-xs transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
                  Block {reportUserName || "User"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {reported ? (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "rgba(224,231,255,0.7)" }}>Report submitted. We will review it.</p>
                <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>← Return</button>
              </div>
            ) : blocked ? (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "rgba(224,231,255,0.7)" }}>User blocked.</p>
                <button onClick={onBack} className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>← Return</button>
              </div>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Why are you reporting {reportUserName || "this user"}?
                </p>
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map(r => (
                    <button key={r} onClick={() => setReason(r)}
                      className="w-full text-left px-4 py-3 rounded-xl text-xs transition-all"
                      style={{
                        background: reason === r ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${reason === r ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                        color: reason === r ? "rgba(239,68,68,0.7)" : "rgba(148,163,184,0.5)",
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
                <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} maxLength={500}
                  placeholder="Additional details (optional)..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(224,231,255,0.9)" }} />
                <div className="flex gap-3">
                  <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl text-xs"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.5)" }}>
                    Cancel
                  </button>
                  <button onClick={handleReport} disabled={!reason}
                    className="flex-1 py-3 rounded-xl text-xs"
                    style={{
                      background: reason ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${reason ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                      color: reason ? "rgba(239,68,68,0.7)" : "rgba(148,163,184,0.3)",
                    }}>
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
