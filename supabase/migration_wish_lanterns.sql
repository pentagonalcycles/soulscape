-- Wish Lanterns: floating lanterns with messages

CREATE TABLE wish_lanterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lanterns_created ON wish_lanterns(created_at DESC);

ALTER TABLE wish_lanterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lanterns" ON wish_lanterns FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lanterns" ON wish_lanterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own lanterns" ON wish_lanterns FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE wish_lanterns;
