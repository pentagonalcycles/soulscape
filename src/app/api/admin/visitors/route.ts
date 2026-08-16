import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseService } from "@/lib/supabase";

// Log a page visit
export async function POST(req: NextRequest) {
  try {
    const { page_path, page_title } = await req.json();
    
    if (!page_path) {
      return NextResponse.json({ error: "page_path required" }, { status: 400 });
    }

    const client = supabase();
    const authHeader = req.headers.get("Authorization");
    let userId = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await client.auth.getUser(token);
      userId = user?.id || null;
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const referrer = req.headers.get("referer") || null;

    await client.from("page_visits").insert({
      user_id: userId,
      page_path,
      page_title: page_title || null,
      visitor_ip: ip,
      user_agent: userAgent,
      referrer,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to log visit" }, { status: 500 });
  }
}

// Get visitor data (authenticated users only - we'll check admin in the frontend)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const client = supabase();
  const { data: { user }, error: authError } = await client.auth.getUser(token);
  
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = url.searchParams.get("page");
  const limit = parseInt(url.searchParams.get("limit") || "100");

  const service = supabaseService();
  
  let query = service
    .from("page_visits")
    .select("*")
    .order("visited_at", { ascending: false })
    .limit(limit);

  if (page) {
    query = query.eq("page_path", page);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get unique visitor counts by page
  const { data: pageStats } = await service
    .from("page_visits")
    .select("page_path")
    .gte("visited_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const pageVisits: Record<string, number> = {};
  if (pageStats) {
    pageStats.forEach((visit: { page_path: string }) => {
      pageVisits[visit.page_path] = (pageVisits[visit.page_path] || 0) + 1;
    });
  }

  return NextResponse.json({ 
    visits: data || [],
    pageStats: pageVisits,
  });
}
