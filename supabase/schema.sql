-- ==============================================================================
-- EverBuild MVP - Complete Database Schema
-- ==============================================================================
-- This schema includes all tables needed for the MVP and is designed to support
-- future features (Phase 2 & 3) without requiring major refactors.
--
-- Creation Date: 2025-10-25
-- Version: 1.0 (MVP)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- CORE TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Organizations (Companies/Builders)
-- ------------------------------------------------------------------------------
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT org_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- ------------------------------------------------------------------------------
-- Users (Builders, Project Managers, Foremen)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,

  -- Future: role-based access control (Phase 3)
  -- role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'project_manager', 'foreman', 'readonly')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT user_name_not_empty CHECK (LENGTH(TRIM(full_name)) > 0)
);

-- ------------------------------------------------------------------------------
-- Contacts (Subcontractors, Vendors, Suppliers)
-- ------------------------------------------------------------------------------
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contact Information
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  trade TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,

  -- Business Details
  lead_time_days INTEGER DEFAULT 2 CHECK (lead_time_days >= 0),
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT contact_company_not_empty CHECK (LENGTH(TRIM(company_name)) > 0),
  CONSTRAINT contact_person_not_empty CHECK (LENGTH(TRIM(contact_person)) > 0),
  CONSTRAINT contact_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ------------------------------------------------------------------------------
-- Projects (Spec Homes)
-- ------------------------------------------------------------------------------
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Project Details
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  slug_sequence INTEGER DEFAULT 0,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lot_number TEXT,
  block_number TEXT,
  subdivision TEXT,
  parcel_number TEXT,
  model_type TEXT,
  square_footage INTEGER CHECK (square_footage IS NULL OR square_footage > 0),

  -- Status
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'on_hold', 'under_contract', 'irsa', 'sold', 'warranty_period', 'archived')),

  -- Dates
  target_completion_date DATE NOT NULL,
  actual_completion_date DATE,

  -- Additional Information
  notes TEXT,

  -- Future: metadata for extensibility (Phase 2+)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT project_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT project_address_not_empty CHECK (LENGTH(TRIM(address)) > 0),
  CONSTRAINT project_completion_dates CHECK (actual_completion_date IS NULL OR actual_completion_date >= target_completion_date - INTERVAL '1 year')
);

-- ------------------------------------------------------------------------------
-- Phases (Construction Stages)
-- ------------------------------------------------------------------------------
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Phase Details
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL CHECK (sequence_order > 0),

  -- Planned Schedule
  planned_start_date DATE NOT NULL,
  planned_duration_days INTEGER NOT NULL CHECK (planned_duration_days >= 0),
  planned_end_date DATE NOT NULL,

  -- Actual Schedule
  actual_start_date DATE,
  actual_end_date DATE,

  -- Status
  status TEXT DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'delayed', 'blocked')
  ),

  -- Dependencies
  predecessor_phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  buffer_days INTEGER DEFAULT 0 CHECK (buffer_days >= 0),

  -- Visual Identification
  color TEXT DEFAULT 'gray' CHECK (
    color IN ('gray', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'teal', 'pink', 'indigo', 'lime')
  ),

  -- Future: metadata for extensibility
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT phase_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT phase_dates_valid CHECK (planned_end_date >= planned_start_date),
  CONSTRAINT phase_no_self_dependency CHECK (predecessor_phase_id IS NULL OR predecessor_phase_id != id),
  CONSTRAINT phase_actual_dates CHECK (actual_end_date IS NULL OR actual_start_date IS NULL OR actual_end_date >= actual_start_date)
);

-- ------------------------------------------------------------------------------
-- Phase Contacts (Junction Table: Assigns Contacts to Phases)
-- ------------------------------------------------------------------------------
CREATE TABLE phase_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Assignment Details
  role TEXT, -- e.g., "Lead", "Helper", "Material Supplier"
  notification_advance_days INTEGER DEFAULT 2 CHECK (notification_advance_days >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE(phase_id, contact_id)
);

-- ------------------------------------------------------------------------------
-- SMS Messages (Outbound Notifications and Manual Messages)
-- ------------------------------------------------------------------------------
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associated Records (all optional - can be standalone message)
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,

  -- Message Details
  to_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,

  -- Twilio Details
  twilio_sid TEXT, -- Twilio message SID
  twilio_status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed, etc.
  twilio_error_code TEXT,
  twilio_error_message TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,

  -- Future: notification type for automated messages (Phase 2)
  -- notification_type TEXT CHECK (notification_type IN ('phase_reminder', 'schedule_change', 'completion_request', 'manual')),

  -- Future: metadata for extensibility
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT sms_message_not_empty CHECK (LENGTH(TRIM(message_body)) > 0)
);

-- ==============================================================================
-- FUTURE TABLES (Prepared for Phase 2 & 3)
-- ==============================================================================
-- These tables are commented out for MVP but structured for easy addition later

-- ------------------------------------------------------------------------------
-- Notifications Queue (Phase 2: Automated Notifications)
-- ------------------------------------------------------------------------------
-- CREATE TABLE notifications (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
--   contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
--
--   notification_type TEXT NOT NULL CHECK (
--     notification_type IN ('phase_reminder', 'schedule_change', 'completion_request', 'delay_notice')
--   ),
--
--   status TEXT DEFAULT 'queued' CHECK (
--     status IN ('queued', 'sent', 'delivered', 'failed', 'clicked')
--   ),
--
--   token UUID UNIQUE DEFAULT uuid_generate_v4(),
--
--   scheduled_for TIMESTAMPTZ NOT NULL,
--   sent_at TIMESTAMPTZ,
--   delivered_at TIMESTAMPTZ,
--   clicked_at TIMESTAMPTZ,
--
--   message_body TEXT NOT NULL,
--   message_sid TEXT,
--   error_message TEXT,
--
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ------------------------------------------------------------------------------
-- Status Updates (Phase 2: Subcontractor Status Updates)
-- ------------------------------------------------------------------------------
-- CREATE TABLE status_updates (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
--   phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
--   contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
--
--   status TEXT NOT NULL CHECK (
--     status IN ('completed', 'in_progress', 'running_late', 'delayed', 'issue')
--   ),
--
--   delay_days INTEGER CHECK (delay_days >= 0),
--   notes TEXT,
--   photos TEXT[], -- Array of file paths
--
--   submitted_at TIMESTAMPTZ DEFAULT NOW(),
--   ip_address INET
-- );

-- ------------------------------------------------------------------------------
-- Documents (Phase 3: Document Management)
-- ------------------------------------------------------------------------------
-- CREATE TABLE documents (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
--
--   file_name TEXT NOT NULL,
--   file_path TEXT NOT NULL,
--   file_type TEXT NOT NULL,
--   file_size INTEGER NOT NULL CHECK (file_size > 0),
--
--   title TEXT NOT NULL,
--   description TEXT,
--   tags TEXT[],
--
--   uploaded_by UUID NOT NULL REFERENCES users(id),
--   uploaded_at TIMESTAMPTZ DEFAULT NOW(),
--
--   version INTEGER DEFAULT 1,
--   is_active BOOLEAN DEFAULT true
-- );

-- ------------------------------------------------------------------------------
-- Audit Log (Phase 3: Activity Tracking)
-- ------------------------------------------------------------------------------
-- CREATE TABLE audit_log (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--
--   -- Associated Records (all optional)
--   organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
--   project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
--   phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
--   contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
--   user_id UUID REFERENCES users(id) ON DELETE SET NULL,
--
--   -- Event Details
--   event_type TEXT NOT NULL,
--   event_data JSONB DEFAULT '{}'::jsonb,
--
--   -- Audit Information
--   timestamp TIMESTAMPTZ DEFAULT NOW(),
--   ip_address INET
-- );

-- ==============================================================================
-- INDEXES
-- ==============================================================================

-- Organizations
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);

-- Users
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Contacts
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_trade ON contacts(trade);
CREATE INDEX idx_contacts_active ON contacts(is_active) WHERE is_active = true;
CREATE INDEX idx_contacts_company_name ON contacts(company_name);
CREATE INDEX idx_contacts_search ON contacts USING gin(
  to_tsvector('english', company_name || ' ' || contact_person)
);

-- Projects
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_target_date ON projects(target_completion_date);
CREATE UNIQUE INDEX idx_projects_org_slug ON projects(organization_id, slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_search ON projects USING gin(
  to_tsvector('english', name || ' ' || address)
);

-- Phases
CREATE INDEX idx_phases_project ON phases(project_id);
CREATE INDEX idx_phases_sequence ON phases(project_id, sequence_order);
CREATE INDEX idx_phases_status ON phases(status);
CREATE INDEX idx_phases_predecessor ON phases(predecessor_phase_id);
CREATE INDEX idx_phases_dates ON phases(planned_start_date, planned_end_date);
CREATE INDEX idx_phases_color ON phases(color) WHERE color IS NOT NULL;

-- Phase Contacts
CREATE INDEX idx_phase_contacts_phase ON phase_contacts(phase_id);
CREATE INDEX idx_phase_contacts_contact ON phase_contacts(contact_id);

-- SMS Messages
CREATE INDEX idx_sms_org ON sms_messages(organization_id);
CREATE INDEX idx_sms_contact ON sms_messages(contact_id);
CREATE INDEX idx_sms_project ON sms_messages(project_id);
CREATE INDEX idx_sms_phase ON sms_messages(phase_id);
CREATE INDEX idx_sms_sent_at ON sms_messages(sent_at DESC);
CREATE INDEX idx_sms_status ON sms_messages(twilio_status);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Update updated_at timestamp automatically
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at
  BEFORE UPDATE ON phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- Calculate phase end date automatically
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_phase_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate end date as start date + duration days
  NEW.planned_end_date := NEW.planned_start_date + (NEW.planned_duration_days || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_phase_dates
  BEFORE INSERT OR UPDATE OF planned_start_date, planned_duration_days ON phases
  FOR EACH ROW
  EXECUTE FUNCTION calculate_phase_end_date();

-- ------------------------------------------------------------------------------
-- Prevent circular dependencies in phases
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_phase_circular_dependency()
RETURNS TRIGGER AS $$
DECLARE
  visited_ids UUID[];
  current_id UUID;
BEGIN
  -- If no predecessor, no circular dependency possible
  IF NEW.predecessor_phase_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Start with the predecessor
  current_id := NEW.predecessor_phase_id;
  visited_ids := ARRAY[NEW.id];

  -- Follow the chain of predecessors
  WHILE current_id IS NOT NULL LOOP
    -- Check if we've seen this ID before (circular dependency)
    IF current_id = ANY(visited_ids) THEN
      RAISE EXCEPTION 'Circular dependency detected in phase predecessors';
    END IF;

    -- Add to visited list
    visited_ids := array_append(visited_ids, current_id);

    -- Get the next predecessor
    SELECT predecessor_phase_id INTO current_id
    FROM phases
    WHERE id = current_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_circular_dependency
  BEFORE INSERT OR UPDATE OF predecessor_phase_id ON phases
  FOR EACH ROW
  EXECUTE FUNCTION check_phase_circular_dependency();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper function to get user's organization ID from Clerk user ID
-- ------------------------------------------------------------------------------
-- NOTE: This function extracts the Clerk user ID from the JWT claims
-- Clerk sets the user ID in the 'sub' claim of the JWT
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM users
  WHERE clerk_user_id = auth.jwt()->>'sub'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get current Clerk user ID from JWT
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
  SELECT auth.jwt()->>'sub';
$$ LANGUAGE SQL SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- Organizations policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "Users can update their own organization"
  ON organizations FOR UPDATE
  USING (id = get_user_org_id());

-- ------------------------------------------------------------------------------
-- Users policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (clerk_user_id = get_clerk_user_id());

-- ------------------------------------------------------------------------------
-- Contacts policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view contacts in their organization"
  ON contacts FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can create contacts in their organization"
  ON contacts FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update contacts in their organization"
  ON contacts FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete contacts in their organization"
  ON contacts FOR DELETE
  USING (organization_id = get_user_org_id());

-- ------------------------------------------------------------------------------
-- Projects policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can create projects in their organization"
  ON projects FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update projects in their organization"
  ON projects FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete projects in their organization"
  ON projects FOR DELETE
  USING (organization_id = get_user_org_id());

-- ------------------------------------------------------------------------------
-- Phases policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view phases in their organization's projects"
  ON phases FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can create phases in their organization's projects"
  ON phases FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can update phases in their organization's projects"
  ON phases FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can delete phases in their organization's projects"
  ON phases FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = get_user_org_id()
    )
  );

-- ------------------------------------------------------------------------------
-- Phase Contacts policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view phase contacts in their organization"
  ON phase_contacts FOR SELECT
  USING (
    phase_id IN (
      SELECT p.id FROM phases p
      INNER JOIN projects pr ON p.project_id = pr.id
      WHERE pr.organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can create phase contacts in their organization"
  ON phase_contacts FOR INSERT
  WITH CHECK (
    phase_id IN (
      SELECT p.id FROM phases p
      INNER JOIN projects pr ON p.project_id = pr.id
      WHERE pr.organization_id = get_user_org_id()
    )
    AND
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can delete phase contacts in their organization"
  ON phase_contacts FOR DELETE
  USING (
    phase_id IN (
      SELECT p.id FROM phases p
      INNER JOIN projects pr ON p.project_id = pr.id
      WHERE pr.organization_id = get_user_org_id()
    )
  );

-- ------------------------------------------------------------------------------
-- SMS Messages policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view SMS messages in their organization"
  ON sms_messages FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "Users can create SMS messages in their organization"
  ON sms_messages FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

-- ==============================================================================
-- SEED DATA (Optional - for development/testing)
-- ==============================================================================
-- Uncomment to add sample data for testing

-- INSERT INTO organizations (name) VALUES ('Test Construction Company');

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================

-- To apply this schema:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
--
-- Or use Supabase CLI:
-- supabase db push

-- Schema version tracking
COMMENT ON SCHEMA public IS 'EverBuild MVP Schema v1.0 - Created 2025-10-25';
