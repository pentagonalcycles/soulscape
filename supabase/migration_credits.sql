-- Music Credit System
-- Run this in Supabase SQL Editor

-- Add credits to users table (5 free starter credits)
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits integer DEFAULT 5;

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'generation', 'refund', 'bonus')),
  description text,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own transactions" ON credit_transactions;
CREATE POLICY "Users read own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own transactions" ON credit_transactions;
CREATE POLICY "Users insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant 5 free credits to all existing users who don't have any
UPDATE users SET credits = 5 WHERE credits IS NULL;
