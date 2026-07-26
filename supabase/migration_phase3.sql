-- Phase 3 Migration: Personal Space
-- Run this in Supabase SQL Editor AFTER the base schema

-- Add contact details to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_info text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_type text CHECK (contact_type IN ('email', 'discord', 'website', 'other'));

-- User preferences table for UI personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  accent_color text not null default '#9d7cd8',
  show_starfield boolean not null default true,
  nebula_intensity text not null default 'normal' CHECK (nebula_intensity IN ('off', 'subtle', 'normal', 'vivid')),
  animation_speed text not null default 'normal' CHECK (animation_speed IN ('minimal', 'normal')),
  compact_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Update RLS for users to allow public read (for profiles)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Anyone can view user profiles" ON users FOR SELECT USING (true);
