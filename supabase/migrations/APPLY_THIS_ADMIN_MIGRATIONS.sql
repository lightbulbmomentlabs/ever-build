-- =============================================================================
-- ADMIN DASHBOARD MIGRATIONS
-- Apply these migrations in your Supabase SQL Editor
-- =============================================================================

-- Migration 1: Add admin flag to users table
-- Allows marking specific users as administrators with elevated permissions

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for performance when checking admin status
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Set kevinfremon@gmail.com as admin
UPDATE users
SET is_admin = true
WHERE email = 'kevinfremon@gmail.com';

-- Add comment for documentation
COMMENT ON COLUMN users.is_admin IS 'Flag indicating whether user has administrator privileges';

-- =============================================================================

-- Migration 2: Create error logs table for tracking application errors
-- Helps admins monitor bugs and issues users encounter

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Information
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if user deleted
  clerk_user_id TEXT, -- Keep for reference even if user deleted
  user_email TEXT, -- Denormalized for easy access

  -- Error Details
  error_message TEXT NOT NULL,
  error_stack TEXT, -- Full stack trace
  error_type TEXT NOT NULL CHECK (error_type IN (
    'javascript',
    'api',
    'database',
    'authentication',
    'validation',
    'network',
    'unknown'
  )),

  -- Context Information
  page_url TEXT NOT NULL, -- Where error occurred
  user_action TEXT, -- What user was doing (e.g., "Creating project", "Deleting contact")
  component_name TEXT, -- React component if applicable

  -- Technical Details
  user_agent TEXT, -- Browser info
  ip_address TEXT,
  browser_info JSONB, -- Parsed browser details

  -- Severity
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN (
    'warning',
    'error',
    'critical'
  )),

  -- Resolution Tracking
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_error_logs_user ON error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_error_logs_clerk_user ON error_logs(clerk_user_id);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_page_url ON error_logs(page_url);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view error logs
CREATE POLICY "Only admins can view error logs"
  ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.clerk_user_id = auth.jwt() ->> 'sub'
      AND users.is_admin = true
    )
  );

-- Policy: Anyone can insert error logs (for error tracking)
CREATE POLICY "Anyone can insert error logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can update error logs (for resolution)
CREATE POLICY "Only admins can update error logs"
  ON error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.clerk_user_id = auth.jwt() ->> 'sub'
      AND users.is_admin = true
    )
  );

-- Comments for documentation
COMMENT ON TABLE error_logs IS 'Stores application errors for admin monitoring and debugging';
COMMENT ON COLUMN error_logs.error_type IS 'Category of error (javascript, api, database, etc.)';
COMMENT ON COLUMN error_logs.user_action IS 'What the user was doing when error occurred';
COMMENT ON COLUMN error_logs.severity IS 'Error severity level (warning, error, critical)';

-- =============================================================================

-- Migration 3: Create admin activity log table
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

-- =============================================================================
-- MIGRATIONS COMPLETE
-- =============================================================================
