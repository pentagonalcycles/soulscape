-- Elyra personal storage: conversations, projects, and memories.
-- Everything is private per user (RLS enforces isolation).

CREATE TABLE IF NOT EXISTS elyra_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elyra_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  what_building TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  framework TEXT NOT NULL DEFAULT '',
  files TEXT NOT NULL DEFAULT '',
  decisions TEXT NOT NULL DEFAULT '',
  progress TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elyra_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elyra_conversations_user ON elyra_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_elyra_projects_user ON elyra_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_elyra_memories_user ON elyra_memories(user_id, created_at DESC);

ALTER TABLE elyra_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE elyra_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE elyra_memories ENABLE ROW LEVEL SECURITY;

-- Conversations: only the owner can see, create, edit, or delete.
CREATE POLICY "Users can view own conversations" ON elyra_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON elyra_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON elyra_conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON elyra_conversations FOR DELETE USING (auth.uid() = user_id);

-- Projects: only the owner.
CREATE POLICY "Users can view own projects" ON elyra_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON elyra_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON elyra_projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON elyra_projects FOR DELETE USING (auth.uid() = user_id);

-- Memories: only the owner.
CREATE POLICY "Users can view own memories" ON elyra_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON elyra_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON elyra_memories FOR DELETE USING (auth.uid() = user_id);