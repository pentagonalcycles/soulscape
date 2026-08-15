-- Storage RLS policies for community-files bucket
-- Run this in Supabase SQL Editor
-- Enables direct browser uploads (bypasses Vercel body size limits)

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users upload own files" ON storage.objects;
CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-files'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Allow authenticated users to update their own files
DROP POLICY IF EXISTS "Users update own files storage" ON storage.objects;
CREATE POLICY "Users update own files storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'community-files'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Users delete own files storage" ON storage.objects;
CREATE POLICY "Users delete own files storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-files'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Public read access for community-files
DROP POLICY IF EXISTS "Public read community files storage" ON storage.objects;
CREATE POLICY "Public read community files storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-files');
