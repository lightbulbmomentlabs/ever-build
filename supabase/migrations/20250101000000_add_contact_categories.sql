-- ==============================================================================
-- Contact Categories Migration
-- ==============================================================================
-- This migration adds a flexible category system to replace the single 'trade'
-- field with support for multiple categories and sub-types per contact.
--
-- Created: 2025-11-01
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Contact Categories (Main Categories)
-- ------------------------------------------------------------------------------
CREATE TABLE contact_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT category_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT category_sort_order_positive CHECK (sort_order > 0)
);

-- ------------------------------------------------------------------------------
-- Contact Sub-Types (Sub-categories within main categories)
-- ------------------------------------------------------------------------------
CREATE TABLE contact_sub_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES contact_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT sub_type_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT sub_type_sort_order_positive CHECK (sort_order > 0),

  -- Ensure unique sub-type names within each category
  UNIQUE(category_id, name)
);

-- ------------------------------------------------------------------------------
-- Contact Category Assignments (Many-to-many join table)
-- ------------------------------------------------------------------------------
CREATE TABLE contact_category_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES contact_categories(id) ON DELETE CASCADE,
  sub_type_id UUID NOT NULL REFERENCES contact_sub_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE(contact_id, category_id, sub_type_id)
);

-- ------------------------------------------------------------------------------
-- Add migration tracking column to contacts table
-- ------------------------------------------------------------------------------
ALTER TABLE contacts
ADD COLUMN trade_migrated BOOLEAN DEFAULT false;

-- Add comment explaining the migration status
COMMENT ON COLUMN contacts.trade_migrated IS 'Tracks if trade field has been migrated to new category system';

-- ==============================================================================
-- INDEXES
-- ==============================================================================

-- Contact Categories
CREATE INDEX idx_contact_categories_sort ON contact_categories(sort_order);
CREATE INDEX idx_contact_categories_name ON contact_categories(name);

-- Contact Sub-Types
CREATE INDEX idx_contact_sub_types_category ON contact_sub_types(category_id);
CREATE INDEX idx_contact_sub_types_sort ON contact_sub_types(category_id, sort_order);
CREATE INDEX idx_contact_sub_types_name ON contact_sub_types(name);

-- Contact Category Assignments
CREATE INDEX idx_contact_category_assignments_contact ON contact_category_assignments(contact_id);
CREATE INDEX idx_contact_category_assignments_category ON contact_category_assignments(category_id);
CREATE INDEX idx_contact_category_assignments_sub_type ON contact_category_assignments(sub_type_id);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Add updated_at triggers for new tables
CREATE TRIGGER update_contact_categories_updated_at
  BEFORE UPDATE ON contact_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_sub_types_updated_at
  BEFORE UPDATE ON contact_sub_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on new tables
ALTER TABLE contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_sub_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_category_assignments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Contact Categories policies (Read-only for all authenticated users)
-- ------------------------------------------------------------------------------
CREATE POLICY "All authenticated users can view categories"
  ON contact_categories FOR SELECT
  USING (auth.jwt() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- Contact Sub-Types policies (Read-only for all authenticated users)
-- ------------------------------------------------------------------------------
CREATE POLICY "All authenticated users can view sub-types"
  ON contact_sub_types FOR SELECT
  USING (auth.jwt() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- Contact Category Assignments policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view category assignments in their organization"
  ON contact_category_assignments FOR SELECT
  USING (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can create category assignments in their organization"
  ON contact_category_assignments FOR INSERT
  WITH CHECK (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can delete category assignments in their organization"
  ON contact_category_assignments FOR DELETE
  USING (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id = get_user_org_id()
    )
  );

-- ==============================================================================
-- COMMENTS
-- ==============================================================================

COMMENT ON TABLE contact_categories IS 'Main categories for organizing contacts (e.g., PRE-CONSTRUCTION SERVICES, SITE WORK & PREPARATION)';
COMMENT ON TABLE contact_sub_types IS 'Sub-types within each category (e.g., Architect, Interior Designer under PRE-CONSTRUCTION SERVICES)';
COMMENT ON TABLE contact_category_assignments IS 'Many-to-many relationship allowing contacts to have multiple category/sub-type assignments';

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
