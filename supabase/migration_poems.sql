-- Poetry Prompts: daily prompts, anonymous poems, reactions

CREATE TABLE poems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pen_name TEXT NOT NULL DEFAULT 'Anonymous',
  prompt TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poem_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poem_id, user_id, reaction_type)
);

CREATE INDEX idx_poems_created ON poems(created_at DESC);
CREATE INDEX idx_poems_user ON poems(user_id, created_at DESC);
CREATE INDEX idx_poem_reactions_poem ON poem_reactions(poem_id);

ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poems" ON poems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create poems" ON poems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own poems" ON poems FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view poem reactions" ON poem_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reactions" ON poem_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON poem_reactions FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE poems;
