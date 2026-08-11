-- Stargazing: anonymous messages hidden in the stars

CREATE TABLE IF NOT EXISTS stargazer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stargazer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stargazer messages"
  ON stargazer_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can leave messages"
  ON stargazer_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_stargazer_created ON stargazer_messages (created_at DESC);
