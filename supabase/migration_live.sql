-- Live streaming feature for Elovayne

CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Stream',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'ended')),
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_user ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_stream ON live_chat_messages(stream_id, created_at);
CREATE INDEX IF NOT EXISTS idx_live_reports_stream ON live_reports(stream_id);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_reports ENABLE ROW LEVEL SECURITY;

-- Live streams: anyone can view live streams
CREATE POLICY "Anyone can view live streams" ON live_streams
  FOR SELECT USING (true);

-- Authenticated users can create streams
CREATE POLICY "Authenticated users can create streams" ON live_streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own streams (end stream)
CREATE POLICY "Users can update own streams" ON live_streams
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own streams
CREATE POLICY "Users can delete own streams" ON live_streams
  FOR DELETE USING (auth.uid() = user_id);

-- Live chat: anyone can view messages
CREATE POLICY "Anyone can view live chat" ON live_chat_messages
  FOR SELECT USING (true);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages" ON live_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete own messages
CREATE POLICY "Users can delete own messages" ON live_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Reports: reporter can create, admin can view
CREATE POLICY "Authenticated users can create reports" ON live_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON live_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;
