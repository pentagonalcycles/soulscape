import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const DAY = 86_400_000;

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export async function GET() {
  const client = supabase();
  const now = Date.now();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Simple counts (exact, head-only)
  const count = async (rangeStart?: string) => {
    let q = client.from("visits").select("id", { count: "exact", head: true });
    if (rangeStart) q = q.gte("created_at", rangeStart);
    const { count: c } = await q;
    return c ?? 0;
  };

  const [totalVisits, todayVisits, visitsLast7, visitsLast30] = await Promise.all([
    count(),
    count(startOfToday.toISOString()),
    count(new Date(now - 7 * DAY).toISOString()),
    count(new Date(now - 30 * DAY).toISOString()),
  ]);

  // Fetch the last 90 days of raw rows for client-side aggregation
  const { data: rows } = await client
    .from("visits")
    .select("visitor_id, user_id, path, referrer, created_at")
    .gte("created_at", new Date(now - 90 * DAY).toISOString());

  const recent = rows || [];

  const uniqueVisitors = new Set<string>();
  const signedInVisitors = new Set<string>();
  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  for (const r of recent) {
    if (r.visitor_id) uniqueVisitors.add(r.visitor_id);
    if (r.user_id) signedInVisitors.add(r.user_id);

    const inLast30 = new Date(r.created_at).getTime() >= now - 30 * DAY;
    if (inLast30) {
      const p = r.path || "/";
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
      const ref = r.referrer
        ? new URL(r.referrer).hostname.replace(/^www\./, "")
        : null;
      if (ref) referrerCounts.set(ref, (referrerCounts.get(ref) || 0) + 1);
    }
  }

  // Per-day buckets for the last 14 days
  const days: string[] = [];
  const visitsPerDay: number[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push(dayKey(now - i * DAY));
    visitsPerDay.push(0);
  }
  for (const r of recent) {
    const d = dayKey(new Date(r.created_at).getTime());
    const idx = days.indexOf(d);
    if (idx >= 0) visitsPerDay[idx]++;
  }

  // Most recent visitors with display names
  const { data: recentVisits } = await client
    .from("visits")
    .select("id, path, created_at, user_id, visitor_id, users ( display_name )")
    .order("created_at", { ascending: false })
    .limit(30);

  const recentVisitors = (recentVisits || []).map((v) => {
    const profile = v.users as { display_name?: string | null } | null;
    return {
      path: v.path,
      created_at: v.created_at,
      name: v.user_id && profile?.display_name ? profile.display_name : null,
    };
  });

  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([path, visits]) => ({ path, visits }));

  const topReferrers = [...referrerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([referrer, visits]) => ({ referrer, visits }));

  return NextResponse.json({
    totals: {
      totalVisits,
      todayVisits,
      visitsLast7,
      visitsLast30,
      uniqueVisitors: uniqueVisitors.size,
      signedInVisitors: signedInVisitors.size,
    },
    last14Days: days.map((date, i) => ({ date, visits: visitsPerDay[i] })),
    topPaths,
    topReferrers,
    recentVisitors,
  });
}
