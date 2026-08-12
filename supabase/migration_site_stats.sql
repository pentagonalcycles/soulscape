-- Site Stats: Track page views and unique visitors
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_stats_created ON site_stats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_stats_page ON site_stats(page);

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site stats" ON site_stats;
DROP POLICY IF EXISTS "Anyone can insert site stats" ON site_stats;

CREATE POLICY "stats_select" ON site_stats FOR SELECT USING (true);
CREATE POLICY "stats_insert" ON site_stats FOR INSERT WITH CHECK (true);
