-- The Living Room: calm shared space for meaningful conversation
-- Tables: living_room_rooms, living_room_participants, living_room_messages, living_room_reactions, living_room_questions

-- 1. Rooms: shared conversation spaces
CREATE TABLE IF NOT EXISTS living_room_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type TEXT DEFAULT 'general' NOT NULL,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ending', 'closed')),
  current_question TEXT,
  question_started_at TIMESTAMPTZ,
  session_started_at TIMESTAMPTZ DEFAULT NOW(),
  session_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Participants: users in rooms
CREATE TABLE IF NOT EXISTS living_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES living_room_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol_type TEXT NOT NULL,
  symbol_color TEXT NOT NULL,
  is_quiet_mode BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- 3. Messages: conversation messages
CREATE TABLE IF NOT EXISTS living_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES living_room_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'question', 'system', 'reaction')),
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reactions: gentle acknowledgements
CREATE TABLE IF NOT EXISTS living_room_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES living_room_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES living_room_messages(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thank_you', 'relate', 'stayed_with_me')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Questions: conversation prompts
CREATE TABLE IF NOT EXISTS living_room_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reports: moderation
CREATE TABLE IF NOT EXISTS living_room_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES living_room_rooms(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_id UUID REFERENCES living_room_messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL CHECK (reason IN ('harassment', 'hate_speech', 'inappropriate', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lr_rooms_status ON living_room_rooms(status, room_type);
CREATE INDEX IF NOT EXISTS idx_lr_participants_room ON living_room_participants(room_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lr_participants_user ON living_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_lr_messages_room ON living_room_messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lr_reactions_room ON living_room_reactions(room_id);
CREATE INDEX IF NOT EXISTS idx_lr_questions_active ON living_room_questions(is_active);

-- RLS Policies
ALTER TABLE living_room_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_room_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_room_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_room_reports ENABLE ROW LEVEL SECURITY;

-- Rooms: anyone can view active rooms
CREATE POLICY "Users can view active rooms"
  ON living_room_rooms FOR SELECT
  USING (status IN ('active', 'ending'));

CREATE POLICY "System can create rooms"
  ON living_room_rooms FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update rooms"
  ON living_room_rooms FOR UPDATE
  USING (TRUE);

-- Participants: users can view participants in their room, insert themselves
CREATE POLICY "Users can view participants in their rooms"
  ON living_room_participants FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM living_room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can join rooms"
  ON living_room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON living_room_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages: users can view messages in their room, insert their own
CREATE POLICY "Users can view messages in their rooms"
  ON living_room_messages FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM living_room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can send messages in their rooms"
  ON living_room_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    room_id IN (
      SELECT room_id FROM living_room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Reactions: users can view and insert reactions in their room
CREATE POLICY "Users can view reactions in their rooms"
  ON living_room_reactions FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM living_room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Users can add reactions in their rooms"
  ON living_room_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    room_id IN (
      SELECT room_id FROM living_room_participants
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Questions: anyone can view active questions
CREATE POLICY "Users can view active questions"
  ON living_room_questions FOR SELECT
  USING (is_active = TRUE);

-- Reports: users can insert reports
CREATE POLICY "Users can submit reports"
  ON living_room_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON living_room_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Seed some conversation questions
INSERT INTO living_room_questions (question, category) VALUES
  ('What gave you hope recently?', 'reflection'),
  ('What made today difficult?', 'sharing'),
  ('What is something you are grateful for?', 'gratitude'),
  ('What lesson changed your life?', 'wisdom'),
  ('What would you tell your younger self?', 'reflection'),
  ('What are you quietly proud of?', 'celebration'),
  ('What small thing brought you joy today?', 'joy'),
  ('What is a kindness you witnessed recently?', 'kindness'),
  ('What are you holding onto right now?', 'reflection'),
  ('What would you like to let go of?', 'release'),
  ('What song has been living in your mind?', 'connection'),
  ('What is a place that feels like home to you?', 'comfort'),
  ('What skill are you learning or want to learn?', 'growth'),
  ('What memory do you treasure most?', 'nostalgia'),
  ('What boundary have you set recently?', 'growth'),
  ('What comfort do you return to again and again?', 'comfort'),
  ('What act of kindness did you receive lately?', 'gratitude'),
  ('What is something you find beautifully ordinary?', 'appreciation'),
  ('What conversation stayed with you?', 'connection'),
  ('What are you looking forward to?', 'hope')
ON CONFLICT DO NOTHING;
