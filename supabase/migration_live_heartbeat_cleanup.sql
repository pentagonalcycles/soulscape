-- Cleanup stale live streams that haven't sent a heartbeat in 30+ seconds
-- Called by the client before fetching live streams

CREATE OR REPLACE FUNCTION cleanup_stale_live_streams()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE live_streams
  SET
    status = 'ended',
    ended_at = NOW(),
    ended_reason = 'timeout'
  WHERE
    status = 'live'
    AND heartbeat_at IS NOT NULL
    AND heartbeat_at < NOW() - INTERVAL '30 seconds';
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION cleanup_stale_live_streams() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_live_streams() TO anon;
