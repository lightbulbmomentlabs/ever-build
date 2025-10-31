-- Update project status enum to include new status values
-- Migration: 20251031000001

-- Drop the existing constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add the new constraint with updated status values
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

-- Update the default status to 'not_started'
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'not_started';

-- Comment on the status column
COMMENT ON COLUMN projects.status IS 'Project status: not_started, active, on_hold, under_contract, irsa, sold, warranty_period, archived';
