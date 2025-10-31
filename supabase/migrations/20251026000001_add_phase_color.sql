-- Add color column to phases table
-- This allows users to visually identify phases with color coding in the timeline

ALTER TABLE phases
ADD COLUMN color TEXT DEFAULT 'gray' CHECK (
  color IN ('gray', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'teal', 'pink', 'indigo', 'lime')
);

-- Add index for potential color-based queries
CREATE INDEX idx_phases_color ON phases(color) WHERE color IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN phases.color IS 'Visual color identifier for the phase (gray, blue, green, orange, purple, red, yellow, teal, pink, indigo, lime)';
