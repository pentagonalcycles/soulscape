-- Fix: Change human signal columns from UUID to TEXT to support fallback IDs
-- Run this in Supabase SQL Editor

-- Change sender_id to text
ALTER TABLE human_signals ALTER COLUMN sender_id TYPE TEXT;

-- Change claimed_by to text
ALTER TABLE human_signals ALTER COLUMN claimed_by TYPE TEXT;

-- Change receiver_id in acknowledgements to text
ALTER TABLE signal_acknowledgements ALTER COLUMN receiver_id TYPE TEXT;

-- Change user_id in rate limits to text
ALTER TABLE signal_rate_limits ALTER COLUMN user_id TYPE TEXT;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can insert signals" ON human_signals;
DROP POLICY IF EXISTS "Anyone can read signals" ON human_signals;
DROP POLICY IF EXISTS "Anyone can update signals" ON human_signals;
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON signal_rate_limits;
DROP POLICY IF EXISTS "Anyone can read rate limits" ON signal_rate_limits;
DROP POLICY IF EXISTS "Anyone can update rate limits" ON signal_rate_limits;
DROP POLICY IF EXISTS "Anyone can insert acknowledgements" ON signal_acknowledgements;
DROP POLICY IF EXISTS "Anyone can read acknowledgements" ON signal_acknowledgements;

-- Permissive policies
CREATE POLICY "Anyone can insert signals" ON human_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read signals" ON human_signals FOR SELECT USING (true);
CREATE POLICY "Anyone can update signals" ON human_signals FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert rate limits" ON signal_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rate limits" ON signal_rate_limits FOR SELECT USING (true);
CREATE POLICY "Anyone can update rate limits" ON signal_rate_limits FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert acknowledgements" ON signal_acknowledgements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read acknowledgements" ON signal_acknowledgements FOR SELECT USING (true);
