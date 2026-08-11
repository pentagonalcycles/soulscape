-- Soul Echo: Anonymous emotional connection feature
-- Tables: soul_echo_reflections, soul_echo_matches, soul_echo_messages

-- 1. Reflections: anonymous emotional entries
CREATE TABLE IF NOT EXISTS soul_echo_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion_tags TEXT[] DEFAULT '{}',
  is_matched BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Matches: pairs of emotionally similar reflections
CREATE TABLE IF NOT EXISTS soul_echo_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_a_id UUID NOT NULL REFERENCES soul_echo_reflections(id) ON DELETE CASCADE,
  reflection_b_id UUID NOT NULL REFERENCES soul_echo_reflections(id) ON DELETE CASCADE,
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reflection_a_id, reflection_b_id)
);

-- 3. Messages: anonymous messages in connection rooms
CREATE TABLE IF NOT EXISTS soul_echo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES soul_echo_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'letter', 'encouragement', 'quote', 'song', 'kindness')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily limits: track submissions per user per day
CREATE TABLE IF NOT EXISTS soul_echo_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submission_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, submission_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_soul_echo_reflections_user ON soul_echo_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_soul_echo_reflections_active ON soul_echo_reflections(is_active, is_matched) WHERE is_active = TRUE AND is_matched = FALSE;
CREATE INDEX IF NOT EXISTS idx_soul_echo_matches_users ON soul_echo_matches(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_soul_echo_matches_status ON soul_echo_matches(status);
CREATE INDEX IF NOT EXISTS idx_soul_echo_messages_match ON soul_echo_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_soul_echo_daily_limits_user_date ON soul_echo_daily_limits(user_id, submission_date);

-- RLS Policies
ALTER TABLE soul_echo_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_echo_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_echo_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_echo_daily_limits ENABLE ROW LEVEL SECURITY;

-- Reflections: users can read active unmatched reflections for matching, and their own
CREATE POLICY "Users can view active unmatched reflections"
  ON soul_echo_reflections FOR SELECT
  USING (is_active = TRUE AND is_matched = FALSE);

CREATE POLICY "Users can view their own reflections"
  ON soul_echo_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
  ON soul_echo_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON soul_echo_reflections FOR UPDATE
  USING (auth.uid() = user_id);

-- Matches: users can view matches they are part of
CREATE POLICY "Users can view their matches"
  ON soul_echo_matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "System can create matches"
  ON soul_echo_matches FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their matches"
  ON soul_echo_matches FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Messages: users can view and insert messages in their matches
CREATE POLICY "Users can view messages in their matches"
  ON soul_echo_messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM soul_echo_matches
      WHERE user_a_id = auth.uid() OR user_b_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their matches"
  ON soul_echo_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    match_id IN (
      SELECT id FROM soul_echo_matches
      WHERE (user_a_id = auth.uid() OR user_b_id = auth.uid()) AND status = 'active'
    )
  );

-- Daily limits: users can view and insert their own limits
CREATE POLICY "Users can view their own daily limits"
  ON soul_echo_daily_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily limits"
  ON soul_echo_daily_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily limits"
  ON soul_echo_daily_limits FOR UPDATE
  USING (auth.uid() = user_id);
