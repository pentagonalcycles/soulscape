-- Soulscape Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Rooms table
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  theme_colors jsonb not null default '{}',
  ambient_settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Insert default rooms
insert into rooms (name, slug, description, icon_text, theme_colors, ambient_settings) values
('Sanctuary', 'sanctuary', 'A safe space for all expressions', '🌌',
  '{"primary": "#6b3fa0", "secondary": "#9d7cd8", "bg": "#0a0a2e", "glow": "#e879a8"}',
  '{"particleDensity": 80, "particleSpeed": 0.3}'),
('Healing', 'healing', 'A room for those on the path to healing', '💚',
  '{"primary": "#2dd4a8", "secondary": "#5eead4", "bg": "#0a1a2e", "glow": "#99f6e4"}',
  '{"particleDensity": 60, "particleSpeed": 0.2, "waveMotion": true}'),
('Hope', 'hope', 'A room for those seeking and sharing hope', '✨',
  '{"primary": "#f5d062", "secondary": "#fbbf24", "bg": "#1a1a2e", "glow": "#fde68a"}',
  '{"particleDensity": 70, "particleSpeed": 0.4, "risingParticles": true}'),
('Loneliness', 'loneliness', 'You are not alone here', '🌙',
  '{"primary": "#60a5fa", "secondary": "#93c5fd", "bg": "#0a0a2e", "glow": "#bfdbfe"}',
  '{"particleDensity": 40, "particleSpeed": 0.15}'),
('Grief', 'grief', 'A space to sit with loss and find gentle company', '🩶',
  '{"primary": "#a78bfa", "secondary": "#c4b5fd", "bg": "#0f0f2e", "glow": "#ddd6fe"}',
  '{"particleDensity": 50, "particleSpeed": 0.2, "mistyOverlays": true}'),
('Creativity', 'creativity', 'Let your imagination flow freely', '🎨',
  '{"primary": "#f472b6", "secondary": "#fb7185", "bg": "#1a0a2e", "glow": "#fda4af"}',
  '{"particleDensity": 90, "particleSpeed": 0.5, "dynamicColors": true}'),
('Love', 'love', 'A room for all forms of love', '💗',
  '{"primary": "#fb7185", "secondary": "#fda4af", "bg": "#1a0a1e", "glow": "#fecdd3"}',
  '{"particleDensity": 65, "particleSpeed": 0.3, "floatingOrbs": true}'),
('Anxiety', 'anxiety', 'Breathe. You are safe here', '🌊',
  '{"primary": "#818cf8", "secondary": "#a5b4fc", "bg": "#0a0a2e", "glow": "#c7d2fe"}',
  '{"particleDensity": 55, "particleSpeed": 0.35, "subtleFlicker": true}'),
('New Beginnings', 'new-beginnings', 'Every ending is a new beginning', '🌅',
  '{"primary": "#fb923c", "secondary": "#fdba74", "bg": "#1a1a1e", "glow": "#fed7aa"}',
  '{"particleDensity": 70, "particleSpeed": 0.4, "risingParticles": true}'),
('Self-Discovery', 'self-discovery', 'Explore the depths of who you are', '🔮',
  '{"primary": "#c084fc", "secondary": "#e879f6", "bg": "#1a0a2e", "glow": "#f0abfc"}',
  '{"particleDensity": 75, "particleSpeed": 0.3, "kaleidoscope": true}');

-- Users table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  identity_type text not null check (identity_type in ('anonymous', 'alias', 'real')),
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Posts table
create table posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  content_type text not null check (content_type in ('text', 'poem', 'story', 'art', 'voice')),
  room_id uuid references rooms(id) on delete set null,
  emotion_tags text[] default '{}',
  is_anonymous boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reactions table
create table reactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('understanding', 'hope', 'company', 'less_alone', 'comfort')),
  created_at timestamptz not null default now(),
  unique(user_id, post_id, reaction_type)
);

-- Saves table
create table saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

-- Reports table
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references users(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Journals table (private)
create table journals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text,
  content text not null,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index posts_user_id_idx on posts(user_id);
create index posts_room_id_idx on posts(room_id);
create index posts_created_at_idx on posts(created_at desc);
create index reactions_post_id_idx on reactions(post_id);
create index reactions_user_id_idx on reactions(user_id);
create index saves_user_id_idx on saves(user_id);
create index journals_user_id_idx on journals(user_id);

-- Row Level Security (RLS)
alter table users enable row level security;
alter table posts enable row level security;
alter table reactions enable row level security;
alter table saves enable row level security;
alter table reports enable row level security;
alter table journals enable row level security;

-- Users policies
create policy "Users can view own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);

-- Posts policies
create policy "Anyone can view posts" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- Reactions policies
create policy "Anyone can view reactions" on reactions for select using (true);
create policy "Authenticated users can create reactions" on reactions for insert with check (auth.uid() = user_id);
create policy "Users can delete own reactions" on reactions for delete using (auth.uid() = user_id);

-- Saves policies
create policy "Users can view own saves" on saves for select using (auth.uid() = user_id);
create policy "Authenticated users can create saves" on saves for insert with check (auth.uid() = user_id);
create policy "Users can delete own saves" on saves for delete using (auth.uid() = user_id);

-- Reports policies
create policy "Users can view own reports" on reports for select using (auth.uid() = reporter_id);
create policy "Authenticated users can create reports" on reports for insert with check (auth.uid() = reporter_id);

-- Journals policies (completely private)
create policy "Users can view own journals" on journals for select using (auth.uid() = user_id);
create policy "Authenticated users can create journals" on journals for insert with check (auth.uid() = user_id);
create policy "Users can update own journals" on journals for update using (auth.uid() = user_id);
create policy "Users can delete own journals" on journals for delete using (auth.uid() = user_id);
