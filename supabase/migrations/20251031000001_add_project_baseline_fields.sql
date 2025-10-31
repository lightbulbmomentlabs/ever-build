-- Migration: Add baseline tracking fields to projects table
-- Description: Adds fields to track the original project plan for schedule adherence tracking
-- Created: 2025-10-31

-- Add baseline fields to projects table
ALTER TABLE projects
ADD COLUMN baseline_start_date DATE,
ADD COLUMN baseline_duration_days INTEGER CHECK (baseline_duration_days IS NULL OR baseline_duration_days > 0),
ADD COLUMN baseline_set_date TIMESTAMP WITH TIME ZONE;

-- Add helpful comment
COMMENT ON COLUMN projects.baseline_start_date IS 'Original planned project start date (set when project baseline is established)';
COMMENT ON COLUMN projects.baseline_duration_days IS 'Original planned total project duration in days';
COMMENT ON COLUMN projects.baseline_set_date IS 'Timestamp when the baseline was established (for audit trail)';
