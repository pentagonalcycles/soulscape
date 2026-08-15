-- Community Share feature (upload/download music + images)
-- Run this in Supabase SQL Editor

-- First, create the storage bucket via Supabase Dashboard → Storage
-- Bucket name: community-files
-- Public: yes (for read access)
-- File size limit: 52428800 (50 MB)

CREATE TABLE IF NOT EXISTS community_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('music', 'image')),
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT DEFAULT '',
  is_downloadable BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_files_user ON community_files(user_id);
CREATE INDEX IF NOT EXISTS idx_community_files_type ON community_files(file_type);
CREATE INDEX IF NOT EXISTS idx_community_files_created ON community_files(created_at DESC);

ALTER TABLE community_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read community files" ON community_files;
CREATE POLICY "Public read community files" ON community_files
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users insert own files" ON community_files;
CREATE POLICY "Authenticated users insert own files" ON community_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own files" ON community_files;
CREATE POLICY "Users update own files" ON community_files
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own files" ON community_files;
CREATE POLICY "Users delete own files" ON community_files
  FOR DELETE USING (auth.uid() = user_id);
