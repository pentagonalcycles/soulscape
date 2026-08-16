-- Page visit tracking for admin analytics

CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_page ON page_visits(page_path, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_user ON page_visits(user_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_time ON page_visits(visited_at DESC);

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view page visits (we'll check admin in the API)
CREATE POLICY "Authenticated users can view page visits" ON page_visits
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Anyone can insert visits (for tracking)
CREATE POLICY "Anyone can insert page visits" ON page_visits
  FOR INSERT WITH CHECK (true);
