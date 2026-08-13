-- Fix: Allow Nera creation without strict auth
-- Run this in Supabase SQL Editor

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can insert own neras" ON neras;
DROP POLICY IF EXISTS "Users can join neras" ON nera_attendees;
DROP POLICY IF EXISTS "Hosts can update own neras" ON neras;

-- Make host_id nullable (for anonymous users)
ALTER TABLE neras ALTER COLUMN host_id DROP NOT NULL;

-- Make user_id nullable in attendees
ALTER TABLE nera_attendees ALTER COLUMN user_id DROP NOT NULL;

-- New permissive policies
CREATE POLICY "Anyone can insert neras" ON neras FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update neras" ON neras FOR UPDATE USING (true);
CREATE POLICY "Anyone can join neras" ON nera_attendees FOR INSERT WITH CHECK (true);
