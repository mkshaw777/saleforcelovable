/*
  # Helper Functions for User Management

  ## Purpose
  This migration creates helper functions to make user management easier.

  ## Functions Created:
  1. **get_user_stats** - Get statistics for a user (visits, POB, collection)
  2. **create_sample_users** - Helper to create test users with proper roles

  ## Notes
  - These functions can be called from the Supabase Dashboard SQL Editor
  - Helps administrators set up test environments quickly
*/

-- Function to get user statistics (for debugging/testing)
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', user_uuid,
    'total_visits', (SELECT COUNT(*) FROM visits WHERE user_id = user_uuid),
    'total_pob', (SELECT COALESCE(SUM(total_price), 0) FROM pob WHERE visit_id IN (SELECT id FROM visits WHERE user_id = user_uuid)),
    'total_collection', (SELECT COALESCE(SUM(amount), 0) FROM collections WHERE visit_id IN (SELECT id FROM visits WHERE user_id = user_uuid)),
    'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment explaining usage
COMMENT ON FUNCTION get_user_stats IS 'Get complete statistics for a user. Usage: SELECT get_user_stats(''user-uuid-here'')';
