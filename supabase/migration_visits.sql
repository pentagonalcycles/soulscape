-- Elovayne Visitor Stats
-- Public analytics for the /stats page.
-- Run this in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists visits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  visitor_id text,
  path text not null default '/',
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists visits_created_at_idx on visits (created_at desc);
create index if not exists visits_visitor_id_idx on visits (visitor_id);
create index if not exists visits_path_idx on visits (path);

alter table visits enable row level security;

-- Public read + insert: the stats page is intentionally public.
create policy "Anyone can view visits" on visits for select using (true);
create policy "Anyone can record visits" on visits for insert with check (true);
