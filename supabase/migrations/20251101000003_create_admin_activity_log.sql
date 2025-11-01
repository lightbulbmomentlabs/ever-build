-- Create admin activity log table
-- Tracks all administrative actions for audit purposes

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Admin who performed the action
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL, -- Denormalized for easy access

  -- Action Details
  action TEXT NOT NULL CHECK (action IN (
    'user_deleted',
    'error_resolved',
    'user_promoted_to_admin',
    'user_demoted_from_admin',
    'organization_deleted',
    'data_exported',
    'settings_changed',
    'other'
  )),

  -- Target Information
  target_user_id UUID, -- User being acted upon
  target_user_email TEXT,
  target_organization_id UUID,

  -- Additional Context
  details JSONB, -- Flexible field for action-specific data
  description TEXT, -- Human-readable description

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_activity_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_target_user ON admin_activity_log(target_user_id) WHERE target_user_id IS NOT NULL;

-- Row Level Security (RLS)
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view activity log
CREATE POLICY "Only admins can view activity log"
  ON admin_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.clerk_user_id = auth.jwt() ->> 'sub'
      AND users.is_admin = true
    )
  );

-- Policy: Only admins can insert activity log entries
CREATE POLICY "Only admins can insert activity log"
  ON admin_activity_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.clerk_user_id = auth.jwt() ->> 'sub'
      AND users.is_admin = true
    )
  );

-- Comments for documentation
COMMENT ON TABLE admin_activity_log IS 'Audit log of all administrative actions';
COMMENT ON COLUMN admin_activity_log.action IS 'Type of administrative action performed';
COMMENT ON COLUMN admin_activity_log.details IS 'JSON object with action-specific details';
