-- Fix: Update claim_signal and hear_signal functions to accept TEXT IDs
-- Run this in Supabase SQL Editor

-- Update claim_signal function to accept text
CREATE OR REPLACE FUNCTION claim_signal(signal_uuid text, receiver_uuid text)
RETURNS boolean AS $$
DECLARE
  claimed_count integer;
BEGIN
  UPDATE human_signals
  SET status = 'claimed',
      claimed_by = receiver_uuid,
      claimed_at = now()
  WHERE id::text = signal_uuid
    AND status = 'waiting'
    AND sender_id != receiver_uuid
    AND expires_at > now();

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update hear_signal function to accept text
CREATE OR REPLACE FUNCTION hear_signal(signal_uuid text)
RETURNS boolean AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE human_signals
  SET status = 'heard',
      heard_at = now()
  WHERE id::text = signal_uuid
    AND status = 'claimed';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
