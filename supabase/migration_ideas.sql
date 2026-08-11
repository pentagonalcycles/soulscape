-- Ideas Board Migration
-- Creates tables for ideas, votes, and comments

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('improvement', 'addition', 'change', 'bug', 'other')),
  is_anonymous boolean DEFAULT true,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'planned', 'implemented', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Idea votes table
CREATE TABLE IF NOT EXISTS idea_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, idea_id)
);

-- Idea comments table
CREATE TABLE IF NOT EXISTS idea_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_idea_votes_idea_id ON idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_idea_id ON idea_comments(idea_id);

-- RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_comments ENABLE ROW LEVEL SECURITY;

-- Ideas policies
CREATE POLICY "Anyone can read ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete own ideas" ON ideas FOR DELETE USING (auth.uid() = user_id);

-- Idea votes policies
CREATE POLICY "Anyone can read idea votes" ON idea_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert idea votes" ON idea_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own idea votes" ON idea_votes FOR DELETE USING (auth.uid() = user_id);

-- Idea comments policies
CREATE POLICY "Anyone can read idea comments" ON idea_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert idea comments" ON idea_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete own idea comments" ON idea_comments FOR DELETE USING (auth.uid() = user_id);
