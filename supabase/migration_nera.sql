-- NERA Feature Migration
-- Find people. Find a place. Be there.

-- Neras table
CREATE TABLE IF NOT EXISTS neras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  nera_type text NOT NULL CHECK (nera_type IN (
    'quiet_coffee', 'walk_and_talk', 'create_together', 'lets_eat',
    'game_night', 'music_people', 'deep_conversation', 'fresh_air',
    'need_company', 'something_spontaneous', 'online_tonight'
  )),
  emotion_tags text[] DEFAULT '{}',
  location_name text,
  city text,
  approximate_location text,
  lat numeric,
  lng numeric,
  is_online boolean DEFAULT false,
  is_public boolean DEFAULT true,
  date_time timestamptz NOT NULL,
  max_participants integer DEFAULT 6 CHECK (max_participants >= 2 AND max_participants <= 50),
  current_participants integer DEFAULT 1,
  image_url text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nera attendees
CREATE TABLE IF NOT EXISTS nera_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nera_id uuid NOT NULL REFERENCES neras(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'pending', 'left')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(nera_id, user_id)
);

-- Nera join requests (for private nerabs)
CREATE TABLE IF NOT EXISTS nera_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nera_id uuid NOT NULL REFERENCES neras(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(nera_id, user_id)
);

-- Nera messages (group chat)
CREATE TABLE IF NOT EXISTS nera_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nera_id uuid NOT NULL REFERENCES neras(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Nera reports
CREATE TABLE IF NOT EXISTS nera_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nera_id uuid NOT NULL REFERENCES neras(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('inappropriate', 'unsafe', 'spam', 'fake', 'other')),
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_neras_host ON neras(host_id);
CREATE INDEX IF NOT EXISTS idx_neras_type ON neras(nera_type);
CREATE INDEX IF NOT EXISTS idx_neras_status ON neras(status);
CREATE INDEX IF NOT EXISTS idx_neras_date_time ON neras(date_time);
CREATE INDEX IF NOT EXISTS idx_neras_city ON neras(city);
CREATE INDEX IF NOT EXISTS idx_neras_online ON neras(is_online);
CREATE INDEX IF NOT EXISTS idx_nera_attendees_nera ON nera_attendees(nera_id);
CREATE INDEX IF NOT EXISTS idx_nera_messages_nera ON nera_messages(nera_id);
CREATE INDEX IF NOT EXISTS idx_nera_messages_created ON nera_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_nera_join_requests_nera ON nera_join_requests(nera_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE nera_attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE nera_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE neras;

-- RLS
ALTER TABLE neras ENABLE ROW LEVEL SECURITY;
ALTER TABLE nera_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE nera_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nera_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nera_reports ENABLE ROW LEVEL SECURITY;

-- Neras policies
CREATE POLICY "Anyone can read public neras" ON neras FOR SELECT USING (is_public = true OR host_id = auth.uid());
CREATE POLICY "Users can insert own neras" ON neras FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own neras" ON neras FOR UPDATE USING (auth.uid() = host_id);

-- Attendees policies
CREATE POLICY "Anyone can read attendees" ON nera_attendees FOR SELECT USING (true);
CREATE POLICY "Users can join neras" ON nera_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave neras" ON nera_attendees FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON nera_attendees FOR UPDATE USING (auth.uid() = user_id);

-- Join requests policies
CREATE POLICY "Users can read own requests" ON nera_join_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hosts can read requests for their neras" ON nera_join_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM neras WHERE neras.id = nera_join_requests.nera_id AND neras.host_id = auth.uid())
);
CREATE POLICY "Users can insert own requests" ON nera_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hosts can update requests for their neras" ON nera_join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM neras WHERE neras.id = nera_join_requests.nera_id AND neras.host_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Attendees can read messages" ON nera_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM nera_attendees WHERE nera_attendees.nera_id = nera_messages.nera_id AND nera_attendees.user_id = auth.uid() AND nera_attendees.status = 'joined')
  OR EXISTS (SELECT 1 FROM neras WHERE neras.id = nera_messages.nera_id AND neras.host_id = auth.uid())
);
CREATE POLICY "Attendees can insert messages" ON nera_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM nera_attendees WHERE nera_attendees.nera_id = nera_messages.nera_id AND nera_attendees.user_id = auth.uid() AND nera_attendees.status = 'joined')
);

-- Reports policies
CREATE POLICY "Users can insert own reports" ON nera_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read own reports" ON nera_reports FOR SELECT USING (auth.uid() = reporter_id);
