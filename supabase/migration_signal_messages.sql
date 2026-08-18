-- Signal chat messages for Human Signal feature
-- Allows users who claimed a signal to chat with the sender

CREATE TABLE IF NOT EXISTS signal_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID NOT NULL REFERENCES human_signals(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_messages_signal ON signal_messages(signal_id, created_at);

ALTER TABLE signal_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages for signals they're part of
CREATE POLICY "Users can read signal messages" ON signal_messages
  FOR SELECT USING (true);

-- Authenticated users can insert messages
CREATE POLICY "Users can insert signal messages" ON signal_messages
  FOR INSERT WITH CHECK (true);

-- Add chat_started_at to human_signals to track when chat began
ALTER TABLE human_signals ADD COLUMN IF NOT EXISTS chat_started_at TIMESTAMPTZ;
