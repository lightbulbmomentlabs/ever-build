-- Add organization settings fields for builder profile and billing
-- This enables the Settings page functionality

-- Add new columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS url_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'past_due', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Create index on url_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_url_slug ON organizations(url_slug);

-- Create index on stripe_customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN organizations.url_slug IS 'Unique slug for public builder profile URLs (e.g., everbuild.com/builder/{slug})';
COMMENT ON COLUMN organizations.subscription_status IS 'Current subscription status: free (default), active (paid), past_due (payment failed), cancelled';
COMMENT ON COLUMN organizations.subscription_tier IS 'Subscription plan tier: free, pro, or enterprise';
