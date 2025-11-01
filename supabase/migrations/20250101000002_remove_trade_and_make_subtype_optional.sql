-- Migration: Remove trade column and make sub_type_id optional
-- Created: 2025-01-01

-- 1. Remove the trade column and trade_migrated flag from contacts table
ALTER TABLE contacts
  DROP COLUMN IF EXISTS trade,
  DROP COLUMN IF EXISTS trade_migrated;

-- 2. Make sub_type_id optional in contact_category_assignments
-- Drop the existing constraint that requires sub_type_id
ALTER TABLE contact_category_assignments
  ALTER COLUMN sub_type_id DROP NOT NULL;

-- 3. Update the unique constraint to handle optional sub_type_id
-- Drop the old unique constraint
ALTER TABLE contact_category_assignments
  DROP CONSTRAINT IF EXISTS contact_category_assignments_contact_id_category_id_sub_type_key;

-- Create a new unique constraint that allows multiple NULL sub_type_id values
-- This uses a partial unique index which allows NULLs
DROP INDEX IF EXISTS contact_category_assignments_unique_with_subtype;
CREATE UNIQUE INDEX contact_category_assignments_unique_with_subtype
  ON contact_category_assignments(contact_id, category_id, sub_type_id)
  WHERE sub_type_id IS NOT NULL;

-- Create another unique constraint for category-only assignments (where sub_type_id is NULL)
DROP INDEX IF EXISTS contact_category_assignments_unique_category_only;
CREATE UNIQUE INDEX contact_category_assignments_unique_category_only
  ON contact_category_assignments(contact_id, category_id)
  WHERE sub_type_id IS NULL;

-- 4. Update the foreign key to allow NULL
-- The foreign key already exists, but we need to ensure it allows NULL
-- No change needed as foreign keys automatically allow NULL unless column is NOT NULL
