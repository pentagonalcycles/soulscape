-- Live upgrade: chat safety, moderation, filters and stream metadata
-- Run after migration_live.sql. Idempotent.

-- ---------------------------------------------------------------------------
-- 1. Extend live_streams
-- ---------------------------------------------------------------------------
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS filter TEXT NOT NULL DEFAULT 'natural';
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS slow_mode BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS slow_mode_delay INTEGER NOT NULL DEFAULT 5;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS heartbeat_at TIMESTAMPTZ;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS ended_reason TEXT;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS pinned_message_id UUID;

-- ---------------------------------------------------------------------------
-- 2. Extend live_chat_messages (reply threading + soft delete)
-- ---------------------------------------------------------------------------
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES live_chat_messages(id) ON DELETE SET NULL;
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS reply_to_user_id UUID;
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS reply_to_text TEXT;
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE live_chat_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 3. Moderation tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (stream_id, user_id)
);

CREATE TABLE IF NOT EXISTS live_mutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_moderators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (stream_id, user_id)
);

CREATE TABLE IF NOT EXISTS live_banned_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed a conservative default list (admins can add more)
INSERT INTO live_banned_words (word) VALUES
  ('nigger'), ('faggot'), ('cunt'), ('retard'), ('kys'), ('kkk'), ('heil hitler')
ON CONFLICT (word) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Extend live_reports for comments + streams
-- ---------------------------------------------------------------------------
ALTER TABLE live_reports ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'stream' CHECK (target_type IN ('stream', 'comment'));
ALTER TABLE live_reports ADD COLUMN IF NOT EXISTS comment_id UUID;
ALTER TABLE live_reports ADD COLUMN IF NOT EXISTS reported_user_id UUID;
ALTER TABLE live_reports ADD COLUMN IF NOT EXISTS comment_text TEXT;
ALTER TABLE live_reports ADD COLUMN IF NOT EXISTS details TEXT;

-- ---------------------------------------------------------------------------
-- 4b. Ensure user moderation columns exist (AuthProvider and chat safety rely
--     on them; the admin enhancement migration may not have been applied).
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at timestamptz;

-- ---------------------------------------------------------------------------
-- 5. Chat safety function: per-message checks (length, slow mode, repeats,
--    banned words). Enforced by RLS on INSERT so it is real, not just UI.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_live_message_safe(target_stream UUID, uid UUID, msg TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  rec live_streams%ROWTYPE;
  word TEXT;
BEGIN
  IF msg IS NULL OR char_length(msg) = 0 OR char_length(msg) > 500 THEN
    RETURN false;
  END IF;

  SELECT * INTO rec FROM live_streams WHERE id = target_stream;
  IF rec.id IS NULL THEN
    RETURN false;
  END IF;

  -- Slow mode: one message per delay window per user
  IF rec.slow_mode THEN
    IF EXISTS (
      SELECT 1 FROM live_chat_messages c
      WHERE c.stream_id = target_stream AND c.user_id = uid
        AND c.created_at > NOW() - make_interval(secs => rec.slow_mode_delay::double precision)
    ) THEN
      RETURN false;
    END IF;
  END IF;

  -- Flood protection: no identical message within 20 seconds
  IF EXISTS (
    SELECT 1 FROM live_chat_messages c
    WHERE c.stream_id = target_stream AND c.user_id = uid
      AND c.message = msg
      AND c.created_at > NOW() - INTERVAL '20 seconds'
  ) THEN
    RETURN false;
  END IF;

  -- Banned words (case-insensitive substring)
  FOR word IN SELECT LOWER(w.word) FROM live_banned_words w LOOP
    IF char_length(word) > 0 AND POSITION(word IN LOWER(msg)) > 0 THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$;

-- Rate limiting / flood protection: max messages per window per user
CREATE OR REPLACE FUNCTION fn_live_chat_allowed(target_stream UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    uid IS NOT NULL
    AND EXISTS (SELECT 1 FROM live_streams s WHERE s.id = target_stream AND s.status = 'live')
    AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = uid AND u.is_banned = true)
    AND NOT EXISTS (SELECT 1 FROM live_blocks b WHERE b.stream_id = target_stream AND b.user_id = uid)
    AND NOT EXISTS (SELECT 1 FROM live_mutes m WHERE m.stream_id = target_stream AND m.user_id = uid AND m.expires_at > NOW())
    AND (SELECT COUNT(*) FROM live_chat_messages c
         WHERE c.stream_id = target_stream AND c.user_id = uid
           AND c.created_at > NOW() - INTERVAL '30 seconds') < 12
$$;

-- ---------------------------------------------------------------------------
-- 6. RLS policies
-- ---------------------------------------------------------------------------

-- live_chat_messages: real chat enforcement on insert
DROP POLICY IF EXISTS "Authenticated users can send messages" ON live_chat_messages;
CREATE POLICY "Safe chat insert" ON live_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND fn_live_chat_allowed(stream_id, user_id)
    AND fn_live_message_safe(stream_id, user_id, message)
  );

DROP POLICY IF EXISTS "Users can delete own messages" ON live_chat_messages;
CREATE POLICY "Delete chat messages" ON live_chat_messages
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = stream_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );

-- live_streams: creators can update (already), plus moderators/admins can end streams
CREATE POLICY "Moderators can update streams" ON live_streams
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = id AND m.user_id = auth.uid())
  );

-- live_blocks
ALTER TABLE live_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view blocks" ON live_blocks FOR SELECT USING (true);
CREATE POLICY "Creator or mod can block" ON live_blocks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id
      AND (s.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = s.id AND m.user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );
CREATE POLICY "Creator or mod can unblock" ON live_blocks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id
      AND (s.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = s.id AND m.user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );

-- live_mutes
ALTER TABLE live_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mutes" ON live_mutes FOR SELECT USING (true);
CREATE POLICY "Creator or mod can mute" ON live_mutes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id
      AND (s.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = s.id AND m.user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );
CREATE POLICY "Creator or mod can unmute" ON live_mutes FOR DELETE USING (
  EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id
    AND (s.user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM live_moderators m WHERE m.stream_id = s.id AND m.user_id = auth.uid())))
  OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );

-- live_moderators
ALTER TABLE live_moderators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view moderators" ON live_moderators FOR SELECT USING (true);
CREATE POLICY "Creator assigns moderators" ON live_moderators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );
CREATE POLICY "Creator removes moderators" ON live_moderators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );

-- live_banned_words
ALTER TABLE live_banned_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view banned words" ON live_banned_words FOR SELECT USING (true);
CREATE POLICY "Admins manage banned words" ON live_banned_words
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid()));

-- live_reports: stream creators can see reports about their stream, admins all
DROP POLICY IF EXISTS "Users can view own reports" ON live_reports;
CREATE POLICY "View live reports" ON live_reports
  FOR SELECT USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM live_streams s WHERE s.id = stream_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 7. Indexes + realtime
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_live_blocks_stream ON live_blocks(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_mutes_stream ON live_mutes(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_moderators_stream ON live_moderators(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_reply ON live_chat_messages(reply_to_id);

ALTER PUBLICATION supabase_realtime ADD TABLE live_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE live_mutes;
ALTER PUBLICATION supabase_realtime ADD TABLE live_moderators;