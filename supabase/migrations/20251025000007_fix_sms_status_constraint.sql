-- Fix SMS Messages Status Constraint
-- Update the status check constraint to include all Twilio statuses

-- Drop the existing constraint
ALTER TABLE sms_messages DROP CONSTRAINT IF EXISTS sms_messages_status_check;

-- Add updated constraint with all Twilio message statuses
ALTER TABLE sms_messages ADD CONSTRAINT sms_messages_status_check
  CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered', 'pending'));

-- Update the column comment
COMMENT ON COLUMN sms_messages.status IS 'Twilio message status: queued, sending, sent, delivered, failed, undelivered, or pending';
