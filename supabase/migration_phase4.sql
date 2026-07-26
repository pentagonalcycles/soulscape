-- Phase 4 migration: Add ambient sound preferences
-- Run this in Supabase SQL Editor

-- Add ambient sound columns to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ambient_sound boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sound_volume numeric DEFAULT 0.5;
