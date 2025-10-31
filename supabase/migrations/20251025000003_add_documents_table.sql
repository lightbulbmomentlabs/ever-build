-- Add documents table for project document management
-- This allows builders to upload and organize project documents like permits, plans, photos, etc.

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE, -- Optional: link to specific phase
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- File Information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_type TEXT NOT NULL, -- MIME type
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 26214400), -- Max 25MB

  -- Document Metadata
  title TEXT NOT NULL,
  description TEXT,

  -- Document Category
  category TEXT NOT NULL CHECK (category IN (
    'permits',
    'plans_drawings',
    'contracts',
    'invoices',
    'inspections',
    'photos',
    'warranties',
    'schedules',
    'specifications',
    'other'
  )),

  -- Visibility Control
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN (
    'internal',           -- Builder/owner only
    'shared_with_subs',   -- Accessible by assigned subcontractors
    'public'              -- Anyone with project access (future: clients)
  )),

  -- Upload Information
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Version Control (for future enhancements)
  version INTEGER DEFAULT 1,

  -- Soft Delete
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_documents_project ON documents(project_id) WHERE is_active = true;
CREATE INDEX idx_documents_phase ON documents(phase_id) WHERE is_active = true AND phase_id IS NOT NULL;
CREATE INDEX idx_documents_org ON documents(organization_id) WHERE is_active = true;
CREATE INDEX idx_documents_category ON documents(category) WHERE is_active = true;
CREATE INDEX idx_documents_visibility ON documents(visibility) WHERE is_active = true;
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC) WHERE is_active = true;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents in their organization
CREATE POLICY "Users can view org documents"
  ON documents
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: Users can insert documents in their organization
CREATE POLICY "Users can insert org documents"
  ON documents
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: Users can update documents in their organization
CREATE POLICY "Users can update org documents"
  ON documents
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: Users can delete documents in their organization
CREATE POLICY "Users can delete org documents"
  ON documents
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Comments for documentation
COMMENT ON TABLE documents IS 'Stores project documents like permits, plans, photos, contracts, etc.';
COMMENT ON COLUMN documents.category IS 'Document category for organization (permits, plans_drawings, contracts, etc.)';
COMMENT ON COLUMN documents.visibility IS 'Controls who can access the document (internal, shared_with_subs, public)';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes, maximum 25MB (26214400 bytes)';
