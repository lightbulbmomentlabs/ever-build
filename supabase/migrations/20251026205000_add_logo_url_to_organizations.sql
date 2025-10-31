-- Add logo_url column to organizations table
ALTER TABLE organizations
ADD COLUMN logo_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN organizations.logo_url IS 'URL to the organization logo stored in Supabase Storage';
