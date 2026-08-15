"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  title: string;
  description: string | null;
  details: string | null;
  price_cents: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface PurchaseRecord {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  users: { display_name: string | null; identity_type: string } | null;
  products: { title: string } | null;
}

interface MembershipRecord {
  id: string;
  status: string;
  plan: string;
  created_at: string;
  users: { display_name: string | null; identity_type: string } | null;
}

interface ReportRecord {
  id: string;
  source_type: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
  content_id: string;
  content_preview: string;
  author_name: string;
}

interface UserRecord {
  id: string;
  display_name: string | null;
  identity_type: string;
  avatar_url: string | null;
  bio: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  created_at: string;
  post_count: number;
  idea_count: number;
  poem_count: number;
}

interface ContentRecord {
  id: string;
  _type: string;
  content?: string;
  title?: string;
  message?: string;
  description?: string;
  display_name?: string;
  author_name?: string;
  user_id?: string;
  host_id?: string;
  created_at: string;
  is_anonymous?: boolean;
}

type AdminTab = "dashboard" | "reports" | "users" | "content";

export default function AdminPage() {
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("dashboard");

  // Dashboard state
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);

  // Reports state
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState("pending");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<{ profile: UserRecord; content: Record<string, ContentRecord[]> } | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [banConfirm, setBanConfirm] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  // Content state
  const [content, setContent] = useState<ContentRecord[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const checkAdmin = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase()
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    setIsAdmin(!!data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    const [purchRes, prodRes] = await Promise.all([
      fetch("/api/admin/purchases"),
      fetch("/api/admin/products"),
    ]);
    const purchData = await purchRes.json();
    setPurchases(purchData.purchases || []);
    setMemberships(purchData.memberships || []);
    setProducts(await prodRes.json());
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    const params = new URLSearchParams();
    if (reportStatusFilter !== "all") params.set("status", reportStatusFilter);
    if (reportTypeFilter !== "all") params.set("type", reportTypeFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    setReports(await res.json());
    setReportsLoading(false);
  }, [reportStatusFilter, reportTypeFilter]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const params = new URLSearchParams();
    if (userSearch) params.set("search", userSearch);
    const res = await fetch(`/api/admin/users?${params}`);
    setUsers(await res.json());
    setUsersLoading(false);
  }, [userSearch]);

  // Fetch user detail
  const fetchUserDetail = useCallback(async (uid: string) => {
    setUserDetailLoading(true);
    setSelectedUser(uid);
    const res = await fetch(`/api/admin/users/${uid}`);
    setUserDetail(await res.json());
    setUserDetailLoading(false);
  }, []);

  // Fetch content
  const fetchContent = useCallback(async () => {
    setContentLoading(true);
    const params = new URLSearchParams();
    if (contentTypeFilter !== "all") params.set("type", contentTypeFilter);
    const res = await fetch(`/api/admin/content?${params}`);
    setContent(await res.json());
    setContentLoading(false);
  }, [contentTypeFilter]);

  // Load data when tab changes
  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "dashboard") fetchDashboard();
    if (tab === "reports") fetchReports();
    if (tab === "users") fetchUsers();
    if (tab === "content") fetchContent();
  }, [tab, isAdmin, fetchDashboard, fetchReports, fetchUsers, fetchContent]);

  // Report actions
  const updateReportStatus = async (id: string, status: string, sourceType: string) => {
    await fetch("/api/admin/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, source_type: sourceType }),
    });
    fetchReports();
  };

  const deleteReportedContent = async (contentId: string, sourceType: string) => {
    const typeMap: Record<string, string> = { post: "posts" };
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeMap[sourceType] || "posts", id: contentId }),
    });
    fetchReports();
  };

  // User actions
  const toggleBan = async (uid: string, isBanned: boolean) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: uid, is_banned: !isBanned, ban_reason: !isBanned ? banReason : null }),
    });
    setBanConfirm(null);
    setBanReason("");
    fetchUsers();
    if (selectedUser === uid) fetchUserDetail(uid);
  };

  // Content actions
  const deleteContent = async (id: string, type: string) => {
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    setDeleteConfirm(null);
    fetchContent();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center py-20">
              <div className="text-elovayne-dim text-sm">Checking access...</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="global-corners" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-3xl mb-4">◈</div>
              <h1 className="text-2xl font-heading text-elovayne-light mb-2">Access Denied</h1>
              <p className="text-elovayne-dim text-sm">This area is restricted to authorised administrators.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "reports", label: "Reports", icon: "🚩" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "content", label: "Content", icon: "📄" },
  ];

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

        <div className="flex-1 pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading glow-text-strong mb-2">Admin Dashboard</h1>
              <p className="text-elovayne-dim text-sm mb-8">Manage users, content, reports and products.</p>

              {/* Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
                      tab === t.id
                        ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                        : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* ====== DASHBOARD TAB ====== */}
              {tab === "dashboard" && (
                <div className="space-y-8">
                  {/* Products */}
                  <div>
                    <h2 className="text-lg font-heading text-elovayne-light mb-3">Products</h2>
                    <div className="space-y-3">
                      {products.map((p) => (
                        <div key={p.id} className="sanctuary-glass-card rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-elovayne-light text-sm font-medium truncate">{p.title}</h3>
                            <p className="text-elovayne-dim text-xs">{p.category} · {p.is_active ? "Active" : "Hidden"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              defaultValue={p.price_cents / 100}
                              onBlur={(e) => {
                                const cents = Math.round(parseFloat(e.target.value) * 100);
                                if (!isNaN(cents) && cents >= 0) {
                                  fetch("/api/admin/products", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: p.id, price_cents: cents }),
                                  });
                                }
                              }}
                              className="w-20 px-2 py-1 rounded text-xs text-elovayne-light text-right"
                              style={{ background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.15)" }}
                            />
                            <button
                              onClick={() => {
                                fetch("/api/admin/products", {
                                  method: p.is_active ? "DELETE" : "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
                                });
                                setProducts(products.map(pr => pr.id === p.id ? { ...pr, is_active: !p.is_active } : pr));
                              }}
                              className={`px-3 py-1 rounded text-xs transition-all ${
                                p.is_active ? "text-elovayne-cosmic-pink border border-elovayne-cosmic-pink/20" : "text-elovayne-dim border border-elovayne-dim/20"
                              }`}
                            >
                              {p.is_active ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchases & Memberships side by side */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-lg font-heading text-elovayne-light mb-3">Recent Purchases</h2>
                      <div className="space-y-2">
                        {purchases.length === 0 ? (
                          <p className="text-elovayne-dim text-sm">No purchases yet.</p>
                        ) : purchases.slice(0, 10).map((p) => (
                          <div key={p.id} className="sanctuary-glass-card rounded-xl p-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-elovayne-light text-sm">{p.products?.title || "Product"}</p>
                              <p className="text-elovayne-dim text-xs">{p.users?.display_name || "Anonymous"} · {formatDate(p.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-elovayne-gold text-sm">£{(p.amount_cents / 100).toFixed(2)}</p>
                              <span className={`text-xs ${p.status === "completed" ? "text-elovayne-dim" : "text-elovayne-cosmic-pink"}`}>{p.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-heading text-elovayne-light mb-3">Memberships</h2>
                      <div className="space-y-2">
                        {memberships.length === 0 ? (
                          <p className="text-elovayne-dim text-sm">No memberships yet.</p>
                        ) : memberships.slice(0, 10).map((m) => (
                          <div key={m.id} className="sanctuary-glass-card rounded-xl p-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-elovayne-light text-sm">{m.users?.display_name || "User"}</p>
                              <p className="text-elovayne-dim text-xs">{m.plan} · {formatDate(m.created_at)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              m.status === "active" ? "bg-elovayne-violet/20 text-elovayne-violet" :
                              m.status === "cancelled" ? "bg-elovayne-dim/20 text-elovayne-dim" :
                              "bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink"
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====== REPORTS TAB ====== */}
              {tab === "reports" && (
                <div>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="flex gap-1">
                      {["pending", "reviewed", "resolved", "dismissed", "all"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setReportStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                            reportStatusFilter === s
                              ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                              : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 ml-auto">
                      {["all", "post"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setReportTypeFilter(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                            reportTypeFilter === t
                              ? "bg-elovayne-cosmic-pink/20 text-elovayne-light border border-elovayne-cosmic-pink/30"
                              : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                          }`}
                        >
                          {t === "all" ? "All Types" : "Posts"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {reportsLoading ? (
                    <p className="text-elovayne-dim text-sm text-center py-8">Loading reports...</p>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-3xl block mb-3">✨</span>
                      <p className="text-elovayne-dim text-sm">No reports found. The sanctuary is peaceful.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => (
                        <div key={r.id} className="sanctuary-glass-card rounded-xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                r.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                r.status === "reviewed" ? "bg-blue-500/20 text-blue-400" :
                                r.status === "resolved" ? "bg-green-500/20 text-green-400" :
                                "bg-elovayne-dim/20 text-elovayne-dim"
                              }`}>
                                {r.status}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-elovayne-deep/50 text-elovayne-muted capitalize">
                                Post
                              </span>
                              <span className="text-xs text-elovayne-dim">Reason: {r.reason}</span>
                            </div>
                            <span className="text-xs text-elovayne-dim">{formatDateTime(r.created_at)}</span>
                          </div>

                          <div className="bg-elovayne-deep/30 rounded-lg p-3 mb-3">
                            <p className="text-elovayne-light text-sm whitespace-pre-wrap line-clamp-3">{r.content_preview}</p>
                            <p className="text-xs text-elovayne-dim mt-1">by {r.author_name}</p>
                          </div>

                          {r.details && (
                            <p className="text-xs text-elovayne-muted mb-3 italic">&quot;{r.details}&quot;</p>
                          )}

                          <div className="flex gap-2">
                            {r.status === "pending" && (
                              <>
                                <button onClick={() => updateReportStatus(r.id, "reviewed", r.source_type)} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">Mark Reviewed</button>
                                <button onClick={() => { if (r.content_id) deleteReportedContent(r.content_id, r.source_type); updateReportStatus(r.id, "resolved", r.source_type); }} className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors">Remove Content</button>
                                <button onClick={() => updateReportStatus(r.id, "dismissed", r.source_type)} className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-deep/50 text-elovayne-muted hover:text-elovayne-light transition-colors">Dismiss</button>
                              </>
                            )}
                            {r.status === "reviewed" && (
                              <>
                                <button onClick={() => { if (r.content_id) deleteReportedContent(r.content_id, r.source_type); updateReportStatus(r.id, "resolved", r.source_type); }} className="px-3 py-1.5 text-xs rounded-lg bg-elovayne-cosmic-pink/20 text-elovayne-cosmic-pink hover:bg-elovayne-cosmic-pink/30 transition-colors">Remove Content</button>
                                <button onClick={() => updateReportStatus(r.id, "resolved", r.source_type)} className="px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">Resolve</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ====== USERS TAB ====== */}
              {tab === "users" && (
                <div>
                  {/* Search */}
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Search users by name..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--input-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))", color: "var(--text-primary, #e0f5e8)" }}
                    />
                    <button onClick={fetchUsers} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))", color: "var(--text-secondary, #e2e8f0)" }}>
                      Search
                    </button>
                  </div>

                  {/* User Detail View */}
                  {selectedUser && (
                    <div className="mb-6">
                      <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="text-xs mb-4 hover:underline" style={{ color: "var(--text-dim, #94a3b8)" }}>
                        ← Back to all users
                      </button>

                      {userDetailLoading ? (
                        <p className="text-sm py-4" style={{ color: "var(--text-dim, #94a3b8)" }}>Loading user details...</p>
                      ) : userDetail && (
                        <div className="sanctuary-glass-card rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-heading" style={{ color: "var(--text-primary, #e0f5e8)" }}>{userDetail.profile.display_name || "Anonymous"}</h3>
                              <p className="text-xs" style={{ color: "var(--text-dim, #94a3b8)" }}>{userDetail.profile.identity_type} · Joined {formatDate(userDetail.profile.created_at)}</p>
                              {userDetail.profile.bio && <p className="text-sm mt-2" style={{ color: "var(--text-secondary, #e2e8f0)" }}>{userDetail.profile.bio}</p>}
                              {userDetail.profile.is_banned && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Banned</span>
                                  {userDetail.profile.ban_reason && <span className="text-xs text-red-400/70">{userDetail.profile.ban_reason}</span>}
                                </div>
                              )}
                            </div>
                            <div>
                              {banConfirm === selectedUser ? (
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ban reason (optional)"
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg text-xs outline-none w-48"
                                    style={{ background: "var(--input-bg, rgba(0,255,136,0.06))", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--text-primary, #e0f5e8)" }}
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => toggleBan(selectedUser, userDetail.profile.is_banned)} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white">
                                      {userDetail.profile.is_banned ? "Unban" : "Ban"}
                                    </button>
                                    <button onClick={() => { setBanConfirm(null); setBanReason(""); }} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))" }}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setBanConfirm(selectedUser)} className={`px-4 py-2 rounded-lg text-xs ${userDetail.profile.is_banned ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                  {userDetail.profile.is_banned ? "Unban User" : "Ban User"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* User's content */}
                          {Object.entries(userDetail.content).map(([type, items]) => (
                            items.length > 0 && (
                              <div key={type} className="mt-4">
                                <h4 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-dim, #94a3b8)" }}>
                                  {type.replace("_", " ")} ({items.length})
                                </h4>
                                <div className="space-y-2">
                                  {items.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg" style={{ background: "var(--card-bg, rgba(0,255,136,0.03))" }}>
                                      <p className="text-sm line-clamp-2 flex-1" style={{ color: "var(--text-secondary, #e2e8f0)" }}>
                                        {item.content || item.title || item.message || item.description || "No content"}
                                      </p>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs" style={{ color: "var(--text-dim, #94a3b8)" }}>{formatDate(item.created_at)}</span>
                                        {deleteConfirm === item.id ? (
                                          <div className="flex gap-1">
                                             <button onClick={() => deleteContent(item.id, type)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">Yes</button>
                                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))" }}>No</button>
                                          </div>
                                        ) : (
                                          <button onClick={() => setDeleteConfirm(item.id)} className="px-2 py-1 rounded text-xs text-red-400" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>Delete</button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* User List */}
                  {!selectedUser && (
                    usersLoading ? (
                      <p className="text-sm py-4" style={{ color: "var(--text-dim, #94a3b8)" }}>Loading users...</p>
                    ) : users.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: "var(--text-dim, #94a3b8)" }}>No users found.</p>
                    ) : (
                      <div className="space-y-2">
                        {users.map((u) => (
                          <div key={u.id} className="sanctuary-glass-card rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => fetchUserDetail(u.id)}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))", color: "var(--text-secondary, #e2e8f0)" }}>
                                {(u.display_name || "A")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary, #e0f5e8)" }}>{u.display_name || "Anonymous"}</span>
                                  {u.is_banned && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400">Banned</span>}
                                </div>
                                <p className="text-xs" style={{ color: "var(--text-dim, #94a3b8)" }}>{u.identity_type} · {formatDate(u.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex gap-3 text-xs shrink-0" style={{ color: "var(--text-muted, #64748b)" }}>
                              <span>{u.post_count} posts</span>
                              <span>{u.idea_count} ideas</span>
                              <span>{u.poem_count} poems</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ====== CONTENT TAB ====== */}
              {tab === "content" && (
                <div>
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {["all", "posts", "ideas", "poems", "wish_lanterns"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setContentTypeFilter(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-all ${
                          contentTypeFilter === t
                            ? "bg-elovayne-violet/20 text-elovayne-light border border-elovayne-violet/30"
                            : "text-elovayne-dim border border-transparent hover:border-elovayne-dim/20"
                        }`}
                      >
                        {t === "all" ? "All" : t === "wish_lanterns" ? "Wish Lanterns" : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  {contentLoading ? (
                    <p className="text-elovayne-dim text-sm text-center py-8">Loading content...</p>
                  ) : content.length === 0 ? (
                    <p className="text-elovayne-dim text-sm text-center py-8">No content found.</p>
                  ) : (
                    <div className="space-y-2">
                      {content.map((item) => (
                        <div key={item.id} className="sanctuary-glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-elovayne-deep/50 text-elovayne-muted capitalize">
                                {item._type === "wish_lanterns" ? "Lantern" : item._type.slice(0, -1)}
                              </span>
                              <span className="text-xs text-elovayne-dim">{item.author_name || item.display_name || "Unknown"}</span>
                              <span className="text-xs text-elovayne-dim">· {formatDate(item.created_at)}</span>
                            </div>
                            <p className="text-sm text-elovayne-light line-clamp-2">{item.content || item.title || item.message || item.description || "No content"}</p>
                          </div>
                          {deleteConfirm === item.id ? (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => deleteContent(item.id, item._type)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">Delete</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs" style={{ background: "var(--card-bg, rgba(0,255,136,0.06))", border: "1px solid var(--border-subtle, rgba(0,255,136,0.12))" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(item.id)} className="px-3 py-1.5 text-xs rounded-lg text-red-400 shrink-0" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>Delete</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
