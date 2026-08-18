-- Feature purchases table for pay-per-feature unlocks
-- Users pay once to unlock specific features permanently

CREATE TABLE IF NOT EXISTS feature_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  stripe_session_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'gbp',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_purchases_user ON feature_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_purchases_feature ON feature_purchases(feature_id);

ALTER TABLE feature_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own feature purchases" ON feature_purchases
  FOR SELECT USING (auth.uid()::text = user_id);

-- Service role can insert (webhook)
CREATE POLICY "Service can insert feature purchases" ON feature_purchases
  FOR INSERT WITH CHECK (true);

-- Service role can update (webhook)
CREATE POLICY "Service can update feature purchases" ON feature_purchases
  FOR UPDATE USING (true);
