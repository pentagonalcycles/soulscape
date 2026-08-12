-- Fix: Allow anonymous room creation for campfire, mural, and living room
-- Run this in Supabase SQL Editor

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create campfire rooms" ON campfire_rooms;
DROP POLICY IF EXISTS "Authenticated users can create mural rooms" ON mural_rooms;

-- Campfire: Allow anyone to create rooms (including anonymous users)
CREATE POLICY "Anyone can create campfire rooms" ON campfire_rooms FOR INSERT WITH CHECK (true);

-- Mural: Allow anyone to create rooms (including anonymous users)
CREATE POLICY "Anyone can create mural rooms" ON mural_rooms FOR INSERT WITH CHECK (true);
