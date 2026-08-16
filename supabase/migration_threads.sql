-- Threads projects for knitting and crochet

CREATE TABLE IF NOT EXISTS threads_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  craft TEXT NOT NULL CHECK (craft IN ('knitting', 'crochet')),
  project_type TEXT,
  size TEXT,
  yarn_type TEXT,
  yarn_weight TEXT,
  yarn_color TEXT,
  needle_hook_size TEXT,
  difficulty TEXT DEFAULT 'beginner',
  current_row INTEGER DEFAULT 0,
  repeat_count INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'frogged')),
  notes TEXT DEFAULT '',
  pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threads_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES threads_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_projects_user ON threads_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_photos_project ON threads_photos(project_id);

ALTER TABLE threads_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON threads_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create projects" ON threads_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON threads_projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON threads_projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own photos" ON threads_photos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create photos" ON threads_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON threads_photos
  FOR DELETE USING (auth.uid() = user_id);
