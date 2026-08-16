-- Tarot readings and favourites for the Elovayne Tarot feature

CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT,
  spread_id TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  cards JSONB NOT NULL,
  interpretation TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tarot_favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('card', 'spread', 'reading')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_tarot_readings_user ON tarot_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarot_favourites_user ON tarot_favourites(user_id, item_type);

ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own readings" ON tarot_readings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create readings" ON tarot_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings" ON tarot_readings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings" ON tarot_readings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favourites" ON tarot_favourites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create favourites" ON tarot_favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favourites" ON tarot_favourites
  FOR DELETE USING (auth.uid() = user_id);
