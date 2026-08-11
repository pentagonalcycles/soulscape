-- Human Signal Migration
-- Anonymous emotional signals between strangers

-- Signals table
CREATE TABLE IF NOT EXISTS human_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL CHECK (signal_type IN (
    'company', 'understand', 'encouragement', 'listen',
    'difficult_day', 'good_share', 'dont_know', 'not_alone'
  )),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'claimed', 'heard', 'expired')),
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  heard_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Signal acknowledgements
CREATE TABLE IF NOT EXISTS signal_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES human_signals(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting
CREATE TABLE IF NOT EXISTS signal_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_signal_at timestamptz NOT NULL DEFAULT now(),
  signals_today integer NOT NULL DEFAULT 1,
  today_date date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_human_signals_status ON human_signals(status);
CREATE INDEX IF NOT EXISTS idx_human_signals_expires_at ON human_signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_human_signals_sender ON human_signals(sender_id);
CREATE INDEX IF NOT EXISTS idx_human_signals_created ON human_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_ack_signal ON signal_acknowledgements(signal_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE human_signals;

-- RLS
ALTER TABLE human_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_rate_limits ENABLE ROW LEVEL SECURITY;

-- Signals policies
CREATE POLICY "Users can read own sent signals" ON human_signals
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can read signals they claimed" ON human_signals
  FOR SELECT USING (auth.uid() = claimed_by);

CREATE POLICY "Users can read waiting signals from others" ON human_signals
  FOR SELECT USING (status = 'waiting' AND sender_id != auth.uid() AND expires_at > now());

CREATE POLICY "Users can insert own signals" ON human_signals
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can update own signals" ON human_signals
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Receivers can claim waiting signals" ON human_signals
  FOR UPDATE USING (
    status = 'waiting'
    AND sender_id != auth.uid()
    AND expires_at > now()
  );

-- Acknowledgements policies
CREATE POLICY "Signal senders can read acknowledgements" ON signal_acknowledgements
  FOR SELECT USING (
    signal_id IN (SELECT id FROM human_signals WHERE sender_id = auth.uid())
  );

CREATE POLICY "Receivers can read own acknowledgements" ON signal_acknowledgements
  FOR SELECT USING (auth.uid() = receiver_id);

CREATE POLICY "Users can insert acknowledgements" ON signal_acknowledgements
  FOR INSERT WITH CHECK (auth.uid() = receiver_id);

-- Rate limits policies
CREATE POLICY "Users can read own rate limit" ON signal_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limit" ON signal_rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limit" ON signal_rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Concurrency-safe claim function
CREATE OR REPLACE FUNCTION claim_signal(signal_uuid uuid, receiver_uuid uuid)
RETURNS boolean AS $$
DECLARE
  claimed_count integer;
BEGIN
  UPDATE human_signals
  SET status = 'claimed',
      claimed_by = receiver_uuid,
      claimed_at = now()
  WHERE id = signal_uuid
    AND status = 'waiting'
    AND sender_id != receiver_uuid
    AND expires_at > now();

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark signal as heard
CREATE OR REPLACE FUNCTION hear_signal(signal_uuid uuid)
RETURNS boolean AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE human_signals
  SET status = 'heard',
      heard_at = now()
  WHERE id = signal_uuid
    AND status = 'claimed';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
