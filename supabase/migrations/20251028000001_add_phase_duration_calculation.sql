-- Migration: Add Phase Duration Calculation Features
-- Purpose: Enable dynamic phase duration calculation from tasks
-- Date: 2025-10-28

-- Add calculated_duration_days column to store auto-calculated values
ALTER TABLE phases
ADD COLUMN IF NOT EXISTS calculated_duration_days INTEGER CHECK (calculated_duration_days >= 0);

-- Add comment for clarity
COMMENT ON COLUMN phases.calculated_duration_days IS 'Auto-calculated duration based on constituent tasks. NULL if phase has no tasks or calculation not performed.';

-- Update the existing trigger to include buffer_days in planned_end_date calculation
-- This fixes the current behavior where buffer is not included in the database
DROP TRIGGER IF EXISTS calculate_phase_end_date_trigger ON phases;
DROP FUNCTION IF EXISTS calculate_phase_end_date();

CREATE OR REPLACE FUNCTION calculate_phase_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate end date including both duration and buffer days
  NEW.planned_end_date := NEW.planned_start_date +
    ((NEW.planned_duration_days + COALESCE(NEW.buffer_days, 0)) || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_phase_end_date_trigger
  BEFORE INSERT OR UPDATE OF planned_start_date, planned_duration_days, buffer_days
  ON phases
  FOR EACH ROW
  EXECUTE FUNCTION calculate_phase_end_date();

-- Add validation constraint: tasks must start on or after parent phase start date
-- This will be checked at the application layer primarily, but we add a comment for documentation
COMMENT ON TABLE phases IS 'Phases and tasks table. Tasks (is_task=true) must have planned_start_date >= parent_phase.planned_start_date (validated at application layer).';

-- Create index on parent_phase_id for faster task lookups
CREATE INDEX IF NOT EXISTS idx_phases_parent_phase_id ON phases(parent_phase_id) WHERE parent_phase_id IS NOT NULL;

-- Create index on is_task for filtering
CREATE INDEX IF NOT EXISTS idx_phases_is_task ON phases(is_task) WHERE is_task = true;

-- Add helper function to get all tasks for a phase
CREATE OR REPLACE FUNCTION get_phase_tasks(phase_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  planned_start_date DATE,
  planned_duration_days INTEGER,
  buffer_days INTEGER,
  sequence_order INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.planned_start_date,
    p.planned_duration_days,
    p.buffer_days,
    p.sequence_order,
    p.status
  FROM phases p
  WHERE p.parent_phase_id = phase_id
    AND p.is_task = true
  ORDER BY p.sequence_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_phase_tasks(UUID) IS 'Returns all tasks for a given phase, ordered by sequence_order';

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION get_phase_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_phase_tasks(UUID) TO service_role;
