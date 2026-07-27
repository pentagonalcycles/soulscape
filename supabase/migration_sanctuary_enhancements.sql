-- Sanctuary enhancements migration
-- Adds mood, has_content_warning to posts and creates replies table

-- Add mood and has_content_warning columns to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mood text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS has_content_warning boolean DEFAULT false;

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  is_anonymous boolean default true,
  created_at timestamptz not null default now()
);

-- Indexes for replies
CREATE INDEX IF NOT EXISTS replies_post_id_idx ON replies(post_id);
CREATE INDEX IF NOT EXISTS replies_user_id_idx ON replies(user_id);

-- RLS for replies
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Replies: anyone can read
CREATE POLICY "Replies are viewable by everyone"
  ON replies FOR SELECT
  USING (true);

-- Replies: authenticated users can insert
CREATE POLICY "Authenticated users can insert replies"
  ON replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Replies: only author can delete their own
CREATE POLICY "Authors can delete their own replies"
  ON replies FOR DELETE
  USING (auth.uid() = user_id);
