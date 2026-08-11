-- Human Weather Migration
-- Emotion check-ins with privacy-safe region data

-- Emotion check-ins table
CREATE TABLE IF NOT EXISTS emotion_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  emotion text NOT NULL CHECK (emotion IN (
    'happy', 'calm', 'hopeful', 'loved', 'excited', 'energised',
    'tired', 'sad', 'lonely', 'anxious', 'overwhelmed', 'angry',
    'lost', 'numb', 'unnamed'
  )),
  country_code text,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting table (prevent rapid repeated submissions)
CREATE TABLE IF NOT EXISTS emotion_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ip_hash text,
  last_checkin_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes for aggregation queries
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_created_at ON emotion_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_country ON emotion_checkins(country_code);
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_emotion ON emotion_checkins(emotion);
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_user_id ON emotion_checkins(user_id);

-- RLS
ALTER TABLE emotion_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_rate_limits ENABLE ROW LEVEL SECURITY;

-- Emotion checkins policies
CREATE POLICY "Anyone can read emotion checkins" ON emotion_checkins FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert checkins" ON emotion_checkins FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can read own checkins" ON emotion_checkins FOR SELECT USING (auth.uid() = user_id);

-- Rate limit policies
CREATE POLICY "Users can read own rate limit" ON emotion_rate_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rate limit" ON emotion_rate_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rate limit" ON emotion_rate_limits FOR UPDATE USING (auth.uid() = user_id);
