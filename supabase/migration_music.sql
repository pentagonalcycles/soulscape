-- Music Generation feature
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT 'Untitled',
  prompt TEXT NOT NULL,
  lyrics TEXT,
  style TEXT,
  mood TEXT,
  duration INTEGER DEFAULT 180,
  audio_url TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_shared BOOLEAN DEFAULT FALSE,
  share_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_user ON music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_shared ON music_tracks(is_shared, created_at DESC) WHERE is_shared = TRUE;
CREATE INDEX IF NOT EXISTS idx_music_tracks_status ON music_tracks(status);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created ON music_tracks(created_at DESC);

ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own tracks" ON music_tracks;
CREATE POLICY "Users read own tracks" ON music_tracks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own tracks" ON music_tracks;
CREATE POLICY "Users insert own tracks" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own tracks" ON music_tracks;
CREATE POLICY "Users update own tracks" ON music_tracks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own tracks" ON music_tracks;
CREATE POLICY "Users delete own tracks" ON music_tracks
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read shared tracks" ON music_tracks;
CREATE POLICY "Public read shared tracks" ON music_tracks
  FOR SELECT USING (is_shared = TRUE);

-- Rate limiting: track daily generation counts
CREATE TABLE IF NOT EXISTS music_daily_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  gen_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, gen_date)
);

ALTER TABLE music_daily_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own limits" ON music_daily_limits;
CREATE POLICY "Users read own limits" ON music_daily_limits
  FOR SELECT USING (auth.uid() = user_id);
