-- Campfire Chat: anonymous group chat rooms around a virtual fire

CREATE TABLE campfire_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_preset BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_campfire_rooms_active ON campfire_rooms(is_active, created_at DESC);

ALTER TABLE campfire_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campfire rooms" ON campfire_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create campfire rooms" ON campfire_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update campfire rooms" ON campfire_rooms FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete campfire rooms" ON campfire_rooms FOR DELETE USING (auth.uid() IS NOT NULL);

-- Seed preset rooms
INSERT INTO campfire_rooms (name, is_preset, is_active) VALUES
  ('Late Night Thoughts', true, true),
  ('Quiet Corner', true, true),
  ('Random Chat', true, true);
