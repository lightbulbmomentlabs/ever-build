-- Fix project status constraint
-- Migration: 20251031173000
--
-- This migration ensures the status constraint allows all valid values
-- Run this in Supabase SQL Editor

-- First, check what constraints exist
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'projects'::regclass AND conname LIKE '%status%';

-- Drop ALL constraints on the status column
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'projects'::regclass
        AND conname LIKE '%status%'
    )
    LOOP
        EXECUTE 'ALTER TABLE projects DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add the new constraint with all valid status values
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    'not_started',
    'active',
    'on_hold',
    'under_contract',
    'irsa',
    'sold',
    'warranty_period',
    'archived'
  ));

-- Ensure the default is set
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'not_started';

-- Comment on the status column
COMMENT ON COLUMN projects.status IS 'Project status: not_started, active, on_hold, under_contract, irsa, sold, warranty_period, archived';
