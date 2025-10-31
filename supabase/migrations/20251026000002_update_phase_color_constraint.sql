-- Update phase color constraint to include gray and change default
-- This adds gray as a color option and makes it the default

-- Drop the existing constraint
ALTER TABLE phases DROP CONSTRAINT IF EXISTS phases_color_check;

-- Add the updated constraint with gray included
ALTER TABLE phases
ADD CONSTRAINT phases_color_check CHECK (
  color IN ('gray', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'teal', 'pink', 'indigo', 'lime')
);

-- Change the default value to gray for new phases
ALTER TABLE phases ALTER COLUMN color SET DEFAULT 'gray';
