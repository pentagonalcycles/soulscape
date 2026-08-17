import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const DAY = 86_400_000;
const MIN = 60_000;

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

  const [totalVisits, todayVisits, visitsLast7, visitsLast30, activeNow] = await Promise.all([
    count(),
    count(startOfToday.toISOString()),
    count(new Date(now - 7 * DAY).toISOString()),
    count(new Date(now - 30 * DAY).toISOString()),
    count(new Date(now - 30 * MIN).toISOString()),
  ]);

  // Fetch the last 90 days of raw rows for client-side aggregation
  const { data: rows } = await client
    .from("visits")
    .select("visitor_id, user_id, path, referrer, created_at")
    .gte("created_at", new Date(now - 90 * DAY).toISOString());

  const recent = rows || [];
  const cutoff30 = now - 30 * DAY;

  const uniqueVisitors = new Set<string>();
  const signedInVisitors = new Set<string>();
  const unique30 = new Set<string>();
  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const directCount = { visits: 0 };
  const visitorDays = new Map<string, Set<string>>(); // visitor -> distinct active days (last 30d)
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, visits: 0 }));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({ day: d, visits: 0 }));

  for (const r of recent) {
    if (r.visitor_id) uniqueVisitors.add(r.visitor_id);
    if (r.user_id) signedInVisitors.add(r.user_id);

    const t = new Date(r.created_at).getTime();
    const inLast30 = t >= cutoff30;
    if (inLast30) {
      if (r.visitor_id) unique30.add(r.visitor_id);

      const p = r.path || "/";
      pathCounts.set(p, (pathCounts.get(p) || 0) + 1);

      const raw = r.referrer;
      if (raw) {
        try {
          const host = new URL(raw).hostname.replace(/^www\./, "");
          referrerCounts.set(host, (referrerCounts.get(host) || 0) + 1);
        } catch {
          /* ignore malformed referrer */
        }
      } else {
        directCount.visits += 1;
      }

      // returning/new tracking
      if (r.visitor_id) {
        const days = visitorDays.get(r.visitor_id) || new Set<string>();
        days.add(dayKey(t));
        visitorDays.set(r.visitor_id, days);
      }

      // time-of-day + day-of-week
      const dt = new Date(t);
      hourly[dt.getHours()].visits += 1;
      weekday[dt.getDay()].visits += 1;
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

  // Returning = visited on 2+ distinct days in the last 30 days
  const returningVisitors = [...visitorDays.values()].filter((d) => d.size >= 2).length;
  const newVisitors = Math.max(0, unique30.size - returningVisitors);

  // Most recent visitors with display names
  const { data: recentVisits } = await client
    .from("visits")
    .select("id, path, created_at, user_id, visitor_id, visitor_name, users ( display_name )")
    .order("created_at", { ascending: false })
    .limit(30);

  const recentVisitors = (recentVisits || []).map((v) => {
    const profile = v.users as { display_name?: string | null } | null;
    return {
      path: v.path,
      created_at: v.created_at,
      name: v.visitor_name || (v.user_id && profile?.display_name ? profile.display_name : null),
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
      activeNow,
      avgPerVisitor: visitsLast30 && unique30.size ? Math.round((visitsLast30 / unique30.size) * 10) / 10 : 0,
      returningVisitors,
      newVisitors,
      repeatRate: unique30.size ? Math.round((returningVisitors / unique30.size) * 100) : 0,
      directVisits: directCount.visits,
      referralVisits: visitsLast30 - directCount.visits,
    },
    last14Days: days.map((date, i) => ({ date, visits: visitsPerDay[i] })),
    hourly,
    weekday,
    topPaths,
    topReferrers,
    recentVisitors,
  });
}
