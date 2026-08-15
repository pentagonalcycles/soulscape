-- Migration: Admin Enhancements
-- Adds user banning, admin RLS policies, and helper functions

-- 1. Add moderation columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at timestamptz;

-- 2. Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = uid);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Admin RLS policies — allow admins to update any user (ban/unban)
DROP POLICY IF EXISTS "Admins can update any user" ON users;
CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (is_admin(auth.uid()));

-- 4. Admin RLS policies — allow admins to delete any post
DROP POLICY IF EXISTS "Admins can delete any post" ON posts;
CREATE POLICY "Admins can delete any post" ON posts
  FOR DELETE USING (is_admin(auth.uid()));

-- 5. Admin RLS policies — allow admins to delete any idea
DROP POLICY IF EXISTS "Admins can delete any idea" ON ideas;
CREATE POLICY "Admins can delete any idea" ON ideas
  FOR DELETE USING (is_admin(auth.uid()));

-- 8. Admin RLS policies — allow admins to delete any idea comment
DROP POLICY IF EXISTS "Admins can delete any idea comment" ON idea_comments;
CREATE POLICY "Admins can delete any idea comment" ON idea_comments
  FOR DELETE USING (is_admin(auth.uid()));

-- 9. Admin RLS policies — allow admins to delete any poem
DROP POLICY IF EXISTS "Admins can delete any poem" ON poems;
CREATE POLICY "Admins can delete any poem" ON poems
  FOR DELETE USING (is_admin(auth.uid()));

-- 10. Admin RLS policies — allow admins to delete stargazer messages
DROP POLICY IF EXISTS "Admins can delete any stargazer message" ON stargazer_messages;
CREATE POLICY "Admins can delete any stargazer message" ON stargazer_messages
  FOR DELETE USING (is_admin(auth.uid()));

-- 11. Admin RLS policies — allow admins to delete wish lanterns
DROP POLICY IF EXISTS "Admins can delete any wish lantern" ON wish_lanterns;
CREATE POLICY "Admins can delete any wish lantern" ON wish_lanterns
  FOR DELETE USING (is_admin(auth.uid()));

-- 12. Admin RLS policies — allow admins to delete mural rooms
DROP POLICY IF EXISTS "Admins can delete any mural room" ON mural_rooms;
CREATE POLICY "Admins can delete any mural room" ON mural_rooms
  FOR DELETE USING (is_admin(auth.uid()));

-- 13. Admin RLS policies — allow admins to delete living room messages
DROP POLICY IF EXISTS "Admins can delete any living room message" ON living_room_messages;
CREATE POLICY "Admins can delete any living room message" ON living_room_messages
  FOR DELETE USING (is_admin(auth.uid()));

-- 14. Admin RLS policies — allow admins to update any report
DROP POLICY IF EXISTS "Admins can update any report" ON reports;
CREATE POLICY "Admins can update any report" ON reports
  FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any unseen report" ON unseen_reports;
CREATE POLICY "Admins can update any unseen report" ON unseen_reports
  FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any living room report" ON living_room_reports;
CREATE POLICY "Admins can update any living room report" ON living_room_reports
  FOR UPDATE USING (is_admin(auth.uid()));

-- 15. Admin RLS policies — allow admins to read all reports
DROP POLICY IF EXISTS "Admins can read all reports" ON reports;
CREATE POLICY "Admins can read all reports" ON reports
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all unseen reports" ON unseen_reports;
CREATE POLICY "Admins can read all unseen reports" ON unseen_reports
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all living room reports" ON living_room_reports;
CREATE POLICY "Admins can read all living room reports" ON living_room_reports
  FOR SELECT USING (is_admin(auth.uid()));

-- 16. Admin RLS policies — allow admins to read all users
DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (true);

-- 17. Index for banned users lookup
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned) WHERE is_banned = true;
