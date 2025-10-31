-- Add additional project location fields
-- Migration: 20251031230000

-- Add block_number, subdivision, and parcel_number columns to projects table
ALTER TABLE projects
  ADD COLUMN block_number TEXT,
  ADD COLUMN subdivision TEXT,
  ADD COLUMN parcel_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN projects.block_number IS 'Block number for the project location';
COMMENT ON COLUMN projects.subdivision IS 'Subdivision name for the project location';
COMMENT ON COLUMN projects.parcel_number IS 'Parcel Identification Number (PIN) for the property';
