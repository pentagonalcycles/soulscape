-- Admin users table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Anyone can read admin status (needed for UI checks)
CREATE POLICY "Anyone can view admin users" ON admin_users
  FOR SELECT USING (true);

-- To make yourself an admin, run this after creating the table:
-- INSERT INTO admin_users (user_id) VALUES ('YOUR_USER_ID_HERE')
-- Replace YOUR_USER_ID_HERE with your actual user ID from auth.users
