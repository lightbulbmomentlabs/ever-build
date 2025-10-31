-- Add hierarchy support to phases table
-- This enables Phase → Task relationships for better construction workflow management

-- Add parent_phase_id column for hierarchy
ALTER TABLE phases
ADD COLUMN parent_phase_id UUID REFERENCES phases(id) ON DELETE CASCADE;

-- Add is_task boolean to distinguish phases from tasks
ALTER TABLE phases
ADD COLUMN is_task BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for efficient parent-child queries
CREATE INDEX idx_phases_parent_id ON phases(parent_phase_id) WHERE parent_phase_id IS NOT NULL;

-- Add index for filtering tasks vs phases
CREATE INDEX idx_phases_is_task ON phases(is_task);

-- Add constraint: tasks must have a parent phase
ALTER TABLE phases
ADD CONSTRAINT chk_task_has_parent
CHECK (
  (is_task = FALSE AND parent_phase_id IS NULL) OR
  (is_task = TRUE AND parent_phase_id IS NOT NULL)
);

-- Add comments for documentation
COMMENT ON COLUMN phases.parent_phase_id IS 'Reference to parent phase (NULL for top-level phases, set for tasks)';
COMMENT ON COLUMN phases.is_task IS 'True if this is a task within a phase, false if this is a top-level phase';

-- Update RLS policies to handle hierarchy (if any phase-specific policies exist)
-- Existing row-level security should continue to work since tasks inherit from phases
