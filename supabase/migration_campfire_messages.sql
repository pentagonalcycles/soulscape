-- Campfire message persistence
-- Messages are stored so history loads when joining a room

CREATE TABLE IF NOT EXISTS campfire_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL DEFAULT '#f59e0b',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campfire_messages_room ON campfire_messages(room_id, created_at DESC);

ALTER TABLE campfire_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read campfire messages" ON campfire_messages
  FOR SELECT USING (true);

-- Anyone can insert messages (campfire is open to all)
CREATE POLICY "Anyone can insert campfire messages" ON campfire_messages
  FOR INSERT WITH CHECK (true);

-- Auto-cleanup: delete messages older than 24 hours
-- (Run via pg_cron or manually)

ALTER PUBLICATION supabase_realtime ADD TABLE campfire_messages;
