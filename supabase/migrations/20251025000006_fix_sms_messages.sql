-- Fix SMS Messages Table
-- Drop and recreate the table to ensure proper schema

-- Drop existing table if it exists
DROP TABLE IF EXISTS sms_messages CASCADE;

-- Create SMS Messages Table
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
  to_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_sms_messages_org ON sms_messages(organization_id);
CREATE INDEX idx_sms_messages_contact ON sms_messages(contact_id);
CREATE INDEX idx_sms_messages_project ON sms_messages(project_id);
CREATE INDEX idx_sms_messages_phase ON sms_messages(phase_id);
CREATE INDEX idx_sms_messages_sent_at ON sms_messages(sent_at DESC);

-- Row Level Security
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view SMS messages from their organization
CREATE POLICY "Users can view org SMS messages"
ON sms_messages
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Policy: Users can create SMS messages for their organization
CREATE POLICY "Users can create SMS messages in org"
ON sms_messages
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Policy: Users can update SMS messages in their organization
CREATE POLICY "Users can update org SMS messages"
ON sms_messages
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Comments for documentation
COMMENT ON TABLE sms_messages IS 'Stores manual SMS messages sent to contacts via Twilio';
COMMENT ON COLUMN sms_messages.twilio_sid IS 'Twilio message SID for tracking delivery status';
COMMENT ON COLUMN sms_messages.status IS 'Message status: sent, delivered, failed, or pending';
