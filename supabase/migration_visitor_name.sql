-- Elovayne Visitor Names
-- Lets anonymous visitors choose a name shown on the /stats "Who came" list.
-- Run this in Supabase SQL Editor.

alter table visits add column if not exists visitor_name text;

create index if not exists visits_visitor_name_idx on visits (visitor_name);
