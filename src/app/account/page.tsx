"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Membership {
  id: string;
  status: string;
  plan: string;
  created_at: string;
  expires_at: string | null;
}

interface Purchase {
  id: string;
  product_id: string | null;
  amount_cents: number;
  status: string;
  created_at: string;
  products: { title: string } | null;
}

interface Download {
  id: string;
  product_id: string | null;
  download_count: number;
  products: { title: string; download_url: string } | null;
  purchases: { status: string } | null;
}

export default function AccountPage() {
  const { userId, userProfile, updateProfile } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const client = supabase();

    const { data: mem } = await client
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "past_due", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setMembership(mem as Membership | null);

    const { data: pur } = await client
      .from("purchases")
      .select("*, products(title)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setPurchases((pur as Purchase[]) || []);

    const { data: dl } = await client
      .from("downloads")
      .select("*, products(title, download_url), purchases(status)")
      .eq("user_id", userId);
    setDownloads((dl as Download[]) || []);

    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded")) setMessage("Welcome to Elovayne Plus! Your membership is now active.");
    if (params.get("purchased")) setMessage("Purchase complete! Your downloads are available below.");
  }, []);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameMessage("");
    try {
      await updateProfile({ display_name: displayName.trim() });
      setNameMessage("Name saved!");
      setTimeout(() => setNameMessage(""), 3000);
    } catch {
      setNameMessage("Failed to save. Try again.");
    }
    setSavingName(false);
  };

  const handleManageMembership = async () => {
    if (!userId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Silently fail
    }
    setPortalLoading(false);
  };

  const handleDownload = async (purchaseId: string) => {
    const res = await fetch(`/api/download/${purchaseId}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-elovayne-dim text-sm">Loading your account...</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 255, 136, 0.03) 100%)",
          zIndex: 2,
        }}
      />
      <div className="global-corners" />
      <div className="global-corners-extra" />

      <div className="relative z-10 min-h-screen flex flex-col">

        <div className="flex-1 pt-24 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading glow-text-strong mb-8" style={{ textShadow: "0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(57, 255, 20, 0.08)" }}>Your Account</h1>

              {message && (
                <div className="mb-6 p-4 rounded-xl text-sm text-elovayne-light" style={{ background: "rgba(45, 212, 168, 0.1)", border: "1px solid rgba(45, 212, 168, 0.2)" }}>
                  {message}
                </div>
              )}

              {/* Membership */}
              <div className="glass-elevated rounded-2xl p-6 mb-6" style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(8px)" }}>
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Membership</h2>
                {membership ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        membership.status === "active" ? "bg-elovayne-violet/20 text-elovayne-violet" :
                        membership.status === "cancelled" ? "bg-elovayne-dim/20 text-elovayne-dim" :
                        "bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink"
                      }`}>
                        {membership.status === "active" ? "Elovayne Plus" : membership.status}
                      </span>
                    </div>
                    {membership.expires_at && (
                      <p className="text-elovayne-dim text-xs mb-4">
                        {membership.status === "cancelled" ? "Access until" : "Renews"}: {formatDate(membership.expires_at)}
                      </p>
                    )}
                    <button
                      onClick={handleManageMembership}
                      disabled={portalLoading}
                      className="px-4 py-2 rounded-lg text-xs font-body text-elovayne-muted border border-elovayne-dim/20 hover:border-elovayne-violet/40 transition-all disabled:opacity-40"
                    >
                      {portalLoading ? "Loading..." : "Manage Membership"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-elovayne-dim text-sm mb-4">You have access to community features.</p>
                  </div>
                )}
              </div>

              {/* Purchases */}
              <div className="glass-elevated rounded-2xl p-6 mb-6" style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(8px)" }}>
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Purchase History</h2>
                {purchases.length === 0 ? (
                  <p className="text-elovayne-dim text-sm">No purchases yet.</p>
                ) : (
                  <div className="space-y-3">
                    {purchases.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(0, 255, 136, 0.04)" }}>
                        <div>
                          <p className="text-elovayne-light text-sm">{p.products?.title || "Product"}</p>
                          <p className="text-elovayne-dim text-xs">{formatDate(p.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-elovayne-gold text-sm">£{(p.amount_cents / 100).toFixed(2)}</p>
                          <span className={`text-xs ${p.status === "completed" ? "text-elovayne-dim" : "text-elovayne-cosmic-pink"}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Downloads */}
              <div className="glass-elevated rounded-2xl p-6 mb-6" style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(8px)" }}>
                <h2 className="font-heading text-lg text-elovayne-light mb-4">Downloads</h2>
                {downloads.length === 0 ? (
                  <p className="text-elovayne-dim text-sm">No downloads available.</p>
                ) : (
                  <div className="space-y-3">
                    {downloads.filter(d => d.purchases?.status === "completed").map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(0, 255, 136, 0.04)" }}>
                        <div>
                          <p className="text-elovayne-light text-sm">{d.products?.title || "Product"}</p>
                          <p className="text-elovayne-dim text-xs">Downloaded {d.download_count} time{d.download_count !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                          onClick={() => handleDownload(d.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-elovayne-violet border border-elovayne-violet/20 hover:border-elovayne-violet/40 transition-all"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
