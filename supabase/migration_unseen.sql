-- UNSEEN Dating Feature Migration
-- "Meet the person before the picture."

-- Dating profiles (linked to existing auth.users)
CREATE TABLE IF NOT EXISTS unseen_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 120),
  gender text NOT NULL,
  interested_in text NOT NULL CHECK (interested_in IN ('men', 'women', 'everyone')),
  broad_location text,
  dating_intention text NOT NULL CHECK (dating_intention IN ('relationship', 'something_casual', 'friendship', 'seeing_whats_out_there')),
  bio text,
  voice_intro_url text,
  is_active boolean DEFAULT true,
  is_verified_18 boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dating preferences
CREATE TABLE IF NOT EXISTS unseen_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age_min integer DEFAULT 18 CHECK (age_min >= 18),
  age_max integer DEFAULT 99 CHECK (age_max <= 120),
  distance_preference text DEFAULT 'anywhere' CHECK (distance_preference IN ('nearby', 'country', 'anywhere')),
  show_me text DEFAULT 'everyone' CHECK (show_me IN ('men', 'women', 'everyone')),
  updated_at timestamptz DEFAULT now()
);

-- Profile interests (many-to-many)
CREATE TABLE IF NOT EXISTS unseen_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest text NOT NULL,
  UNIQUE(user_id, interest)
);

-- Personality questions
CREATE TABLE IF NOT EXISTS unseen_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category text,
  display_order integer
);

-- Personality answers
CREATE TABLE IF NOT EXISTS unseen_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES unseen_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Profile photos
CREATE TABLE IF NOT EXISTS unseen_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Discovery decisions
CREATE TABLE IF NOT EXISTS unseen_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('interested', 'passed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(decider_id, target_id)
);

-- Mutual matches
CREATE TABLE IF NOT EXISTS unseen_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage text DEFAULT 'mind' CHECK (current_stage IN ('mind', 'voice', 'reveal', 'door', 'ended')),
  stage_mind_a boolean DEFAULT false,
  stage_mind_b boolean DEFAULT false,
  stage_voice_a boolean DEFAULT false,
  stage_voice_b boolean DEFAULT false,
  stage_reveal_a boolean DEFAULT false,
  stage_reveal_b boolean DEFAULT false,
  conversation_prompt_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- Conversation prompts
CREATE TABLE IF NOT EXISTS unseen_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  category text
);

-- Prompt answers (The Question Between Us)
CREATE TABLE IF NOT EXISTS unseen_prompt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES unseen_matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Messages (after Door stage)
CREATE TABLE IF NOT EXISTS unseen_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES unseen_matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blocks
CREATE TABLE IF NOT EXISTS unseen_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS unseen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_unseen_decisions_decider ON unseen_decisions(decider_id);
CREATE INDEX IF NOT EXISTS idx_unseen_decisions_target ON unseen_decisions(target_id);
CREATE INDEX IF NOT EXISTS idx_unseen_matches_user_a ON unseen_matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_unseen_matches_user_b ON unseen_matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_unseen_messages_match ON unseen_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_unseen_photos_user ON unseen_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_unseen_interests_user ON unseen_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_unseen_answers_user ON unseen_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_unseen_blocks_blocker ON unseen_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_unseen_blocks_blocked ON unseen_blocks(blocked_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE unseen_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE unseen_messages;

-- RLS
ALTER TABLE unseen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_prompt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE unseen_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Anyone can read active unseen profiles" ON unseen_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can read own unseen profile" ON unseen_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unseen profile" ON unseen_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unseen profile" ON unseen_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own unseen profile" ON unseen_profiles FOR DELETE USING (auth.uid() = user_id);

-- Preferences: private per user
CREATE POLICY "Users can read own preferences" ON unseen_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON unseen_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON unseen_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Interests: public read, owner write
CREATE POLICY "Anyone can read unseen interests" ON unseen_interests FOR SELECT USING (true);
CREATE POLICY "Users can insert own interests" ON unseen_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interests" ON unseen_interests FOR DELETE USING (auth.uid() = user_id);

-- Questions: public read only
CREATE POLICY "Anyone can read unseen questions" ON unseen_questions FOR SELECT USING (true);

-- Answers: public read (for discovery), owner write
CREATE POLICY "Anyone can read unseen answers" ON unseen_answers FOR SELECT USING (true);
CREATE POLICY "Users can insert own answers" ON unseen_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON unseen_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON unseen_answers FOR DELETE USING (auth.uid() = user_id);

-- Photos: owner read/write (signed URLs handle access)
CREATE POLICY "Users can read own photos" ON unseen_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos" ON unseen_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON unseen_photos FOR DELETE USING (auth.uid() = user_id);

-- Decisions: owner read/write, target can read decisions about them (for mutual match detection)
CREATE POLICY "Users can read own decisions" ON unseen_decisions FOR SELECT USING (auth.uid() = decider_id);
CREATE POLICY "Users can read decisions about them" ON unseen_decisions FOR SELECT USING (auth.uid() = target_id);
CREATE POLICY "Users can insert own decisions" ON unseen_decisions FOR INSERT WITH CHECK (auth.uid() = decider_id);

-- Matches: participants only
CREATE POLICY "Users can read own matches" ON unseen_matches FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "System can insert matches" ON unseen_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update matches" ON unseen_matches FOR UPDATE USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Prompts: public read only
CREATE POLICY "Anyone can read unseen prompts" ON unseen_prompts FOR SELECT USING (true);

-- Prompt answers: match participants can read, owner write
CREATE POLICY "Match participants can read prompt answers" ON unseen_prompt_answers FOR SELECT USING (
  match_id IN (SELECT id FROM unseen_matches WHERE user_a_id = auth.uid() OR user_b_id = auth.uid())
);
CREATE POLICY "Users can insert own prompt answers" ON unseen_prompt_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages: match participants only
CREATE POLICY "Match participants can read messages" ON unseen_messages FOR SELECT USING (
  match_id IN (SELECT id FROM unseen_matches WHERE user_a_id = auth.uid() OR user_b_id = auth.uid())
);
CREATE POLICY "Match participants can insert messages" ON unseen_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  match_id IN (SELECT id FROM unseen_matches WHERE user_a_id = auth.uid() OR user_b_id = auth.uid())
);

-- Blocks: owner read/write
CREATE POLICY "Users can read own blocks" ON unseen_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can insert own blocks" ON unseen_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON unseen_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Reports: reporter write, admin read (admin policies handled separately)
CREATE POLICY "Users can insert own reports" ON unseen_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read own reports" ON unseen_reports FOR SELECT USING (auth.uid() = reporter_id);

-- Seed personality questions
INSERT INTO unseen_questions (question_text, category, display_order) VALUES
  ('What makes you feel safe around someone?', 'values', 1),
  ('What could you talk about until 3 AM?', 'personality', 2),
  ('What does love look like when nobody is watching?', 'values', 3),
  ('What tiny thing instantly makes your day better?', 'lifestyle', 4),
  ('What does your perfect quiet Sunday look like?', 'lifestyle', 5),
  ('What are you currently building toward in your life?', 'values', 6),
  ('What is something people misunderstand about you?', 'personality', 7),
  ('Would you rather disappear somewhere quiet or get lost in a city together?', 'lifestyle', 8),
  ('What is the most important thing in a relationship?', 'relationship', 9),
  ('How do you show someone you care about them?', 'relationship', 10);

-- Seed conversation prompts
INSERT INTO unseen_prompts (prompt_text, category) VALUES
  ('You have one free plane ticket tomorrow. Where are you taking each other?', 'adventure'),
  ('What would our completely ridiculous first date be?', 'fun'),
  ('What does your perfect Sunday look like?', 'lifestyle'),
  ('Which place would you show someone if you wanted them to understand you?', 'personal'),
  ('What tiny thing makes you instantly like somebody?', 'connection'),
  ('If we could disappear for 48 hours, where would we go?', 'adventure'),
  ('What is the most interesting conversation you have ever had?', 'connection'),
  ('What would you cook for someone you really wanted to impress?', 'fun'),
  ('What is a skill you would love to learn together?', 'growth'),
  ('If we were stuck in a rainstorm, what would we do?', 'fun');

-- Seed interests
-- (These are inserted via the application, not migration)
