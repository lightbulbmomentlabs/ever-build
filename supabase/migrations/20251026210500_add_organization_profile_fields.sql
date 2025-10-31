-- Add profile fields to organizations table
ALTER TABLE organizations
ADD COLUMN company_name TEXT,
ADD COLUMN address_line1 TEXT,
ADD COLUMN address_line2 TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN country TEXT DEFAULT 'US',
ADD COLUMN phone TEXT,
ADD COLUMN website TEXT,
ADD COLUMN url_slug TEXT;

-- Add unique constraint on url_slug
CREATE UNIQUE INDEX organizations_url_slug_idx ON organizations(url_slug) WHERE url_slug IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN organizations.company_name IS 'Legal company name for contracts and invoices';
COMMENT ON COLUMN organizations.address_line1 IS 'Street address line 1';
COMMENT ON COLUMN organizations.address_line2 IS 'Street address line 2 (suite, apt, etc)';
COMMENT ON COLUMN organizations.city IS 'City';
COMMENT ON COLUMN organizations.state IS 'State (2-letter code)';
COMMENT ON COLUMN organizations.zip_code IS 'ZIP code';
COMMENT ON COLUMN organizations.country IS 'Country (2-letter code)';
COMMENT ON COLUMN organizations.phone IS 'Phone number';
COMMENT ON COLUMN organizations.website IS 'Company website URL';
COMMENT ON COLUMN organizations.url_slug IS 'Unique URL slug for public builder profile';
