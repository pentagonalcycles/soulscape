-- Fix: Allow Human Signal to work without strict auth
-- Run this in Supabase SQL Editor

-- Make sender_id nullable
ALTER TABLE human_signals ALTER COLUMN sender_id DROP NOT NULL;

-- Make receiver_id nullable in acknowledgements
ALTER TABLE signal_acknowledgements ALTER COLUMN receiver_id DROP NOT NULL;

-- Make user_id nullable in rate limits
ALTER TABLE signal_rate_limits ALTER COLUMN user_id DROP NOT NULL;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can insert own signals" ON human_signals;
DROP POLICY IF EXISTS "Users can read own sent signals" ON human_signals;
DROP POLICY IF EXISTS "Senders can update own signals" ON human_signals;
DROP POLICY IF EXISTS "Users can read signals they claimed" ON human_signals;
DROP POLICY IF EXISTS "Users can insert own rate limit" ON signal_rate_limits;
DROP POLICY IF EXISTS "Users can read own rate limit" ON signal_rate_limits;
DROP POLICY IF EXISTS "Users can update own rate limit" ON signal_rate_limits;
DROP POLICY IF EXISTS "Users can insert acknowledgements" ON signal_acknowledgements;

-- New permissive policies
CREATE POLICY "Anyone can insert signals" ON human_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read signals" ON human_signals FOR SELECT USING (true);
CREATE POLICY "Anyone can update signals" ON human_signals FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert rate limits" ON signal_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read rate limits" ON signal_rate_limits FOR SELECT USING (true);
CREATE POLICY "Anyone can update rate limits" ON signal_rate_limits FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert acknowledgements" ON signal_acknowledgements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read acknowledgements" ON signal_acknowledgements FOR SELECT USING (true);
