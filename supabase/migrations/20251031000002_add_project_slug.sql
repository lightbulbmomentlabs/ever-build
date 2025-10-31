-- Add slug columns to projects table
-- Migration: 20251031000002

-- Add slug column (will store the URL-friendly version of the project name)
ALTER TABLE projects ADD COLUMN slug TEXT;

-- Add slug_sequence column (tracks the numeric suffix for duplicate names)
ALTER TABLE projects ADD COLUMN slug_sequence INTEGER DEFAULT 0;

-- Create a function to generate a unique slug for a project
CREATE OR REPLACE FUNCTION generate_unique_project_slug(
  project_name TEXT,
  org_id UUID,
  project_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  sequence_num INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from project name
  base_slug := LOWER(TRIM(project_name));
  base_slug := REGEXP_REPLACE(base_slug, '[^\w\s-]', '', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '[\s_]+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g');

  -- Start with base slug
  final_slug := base_slug;

  -- Check if slug exists (excluding current project if updating)
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM projects
      WHERE organization_id = org_id
      AND slug = final_slug
      AND (project_id IS NULL OR id != project_id)
    ) INTO slug_exists;

    EXIT WHEN NOT slug_exists;

    -- If slug exists, append sequence number
    sequence_num := sequence_num + 1;
    final_slug := base_slug || '-' || sequence_num;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to auto-update slug when project name changes
CREATE OR REPLACE FUNCTION update_project_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update slug if name has changed or slug is NULL
  IF (TG_OP = 'INSERT' OR OLD.name != NEW.name OR NEW.slug IS NULL) THEN
    NEW.slug := generate_unique_project_slug(NEW.name, NEW.organization_id, NEW.id);

    -- Update slug_sequence based on whether slug has a number suffix
    IF NEW.slug ~ '-[0-9]+$' THEN
      NEW.slug_sequence := SUBSTRING(NEW.slug FROM '-([0-9]+)$')::INTEGER;
    ELSE
      NEW.slug_sequence := 0;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug on INSERT and UPDATE
DROP TRIGGER IF EXISTS project_slug_trigger ON projects;
CREATE TRIGGER project_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_slug();

-- Backfill slugs for existing projects
UPDATE projects SET slug = NULL WHERE slug IS NULL;

-- Make slug NOT NULL after backfilling
ALTER TABLE projects ALTER COLUMN slug SET NOT NULL;

-- Create unique index on (organization_id, slug)
CREATE UNIQUE INDEX idx_projects_org_slug ON projects(organization_id, slug);

-- Add index for faster slug lookups
CREATE INDEX idx_projects_slug ON projects(slug);

-- Comment on columns
COMMENT ON COLUMN projects.slug IS 'URL-friendly slug generated from project name, unique within organization';
COMMENT ON COLUMN projects.slug_sequence IS 'Numeric suffix used in slug for duplicate names (0 if no suffix)';
