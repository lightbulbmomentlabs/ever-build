/**
 * SMS Service
 *
 * Business logic for sending SMS messages via Twilio and logging them.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import type { Database } from '@/lib/db/supabase-client';
import twilio from 'twilio';
import { SMS_TEMPLATES, calculateSMSSegments } from '@/lib/utils/sms.utils';

type SMSMessage = Database['public']['Tables']['sms_messages']['Row'];
type SMSMessageInsert = Database['public']['Tables']['sms_messages']['Insert'];

/**
 * Send an SMS message via Twilio and log it in the database
 */
export async function sendSMS(data: {
  organizationId: string;
  contactId: string;
  toPhone: string;
  messageBody: string;
  projectId?: string;
  phaseId?: string;
}): Promise<SMSMessage> {
  const supabase = getServerSupabaseClient();

  // Validate Twilio credentials are configured
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials not configured');
  }

  // Initialize Twilio client
  const client = twilio(twilioAccountSid, twilioAuthToken);

  try {
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: data.messageBody,
      from: twilioPhoneNumber,
      to: data.toPhone,
    });

    // Log the message in database
    const messageRecord: SMSMessageInsert = {
      organization_id: data.organizationId,
      contact_id: data.contactId,
      project_id: data.projectId || null,
      phase_id: data.phaseId || null,
      to_phone: data.toPhone,
      message_body: data.messageBody,
      twilio_sid: message.sid,
      status: message.status as 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered' | 'pending',
      error_message: message.errorMessage || null,
    };

    const { data: savedMessage, error } = await supabase
      .from('sms_messages')
      .insert(messageRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log SMS message: ${error.message}`);
    }

    return savedMessage;
  } catch (error: any) {
    // Log failed message attempt
    const failedMessage: SMSMessageInsert = {
      organization_id: data.organizationId,
      contact_id: data.contactId,
      project_id: data.projectId || null,
      phase_id: data.phaseId || null,
      to_phone: data.toPhone,
      message_body: data.messageBody,
      twilio_sid: null,
      status: 'failed',
      error_message: error.message || 'Unknown error',
    };

    const { data: savedMessage } = await supabase
      .from('sms_messages')
      .insert(failedMessage)
      .select()
      .single();

    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Get SMS message history for a contact
 */
export async function getSMSHistory(
  contactId: string,
  organizationId: string,
  limit: number = 50
): Promise<SMSMessage[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('contact_id', contactId)
    .eq('organization_id', organizationId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get SMS history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get SMS messages for a project
 */
export async function getProjectSMSHistory(
  projectId: string,
  organizationId: string
): Promise<SMSMessage[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .order('sent_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get project SMS history: ${error.message}`);
  }

  return data || [];
}

// Re-export utilities for convenience
export { SMS_TEMPLATES, calculateSMSSegments };
