-- Create error logs table for tracking application errors
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
