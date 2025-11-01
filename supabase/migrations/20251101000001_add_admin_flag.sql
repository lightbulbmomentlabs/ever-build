-- Add admin flag to users table
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
