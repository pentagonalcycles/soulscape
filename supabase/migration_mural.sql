-- Mural: Collaborative real-time painting rooms

CREATE TABLE mural_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT DEFAULT '#0d9488',
  canvas_width INT DEFAULT 3000,
  canvas_height INT DEFAULT 2000,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE mural_strokes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES mural_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  stroke_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mural_strokes_room ON mural_strokes(room_id, created_at);
CREATE INDEX idx_mural_rooms_active ON mural_rooms(is_active, created_at DESC);

ALTER TABLE mural_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE mural_strokes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mural rooms" ON mural_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create mural rooms" ON mural_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update mural rooms" ON mural_rooms FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete mural rooms" ON mural_rooms FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view mural strokes" ON mural_strokes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create mural strokes" ON mural_strokes FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE mural_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE mural_strokes;
