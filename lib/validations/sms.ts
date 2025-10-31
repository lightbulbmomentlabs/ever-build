import { z } from 'zod';

/**
 * SMS Validation Schemas
 *
 * These schemas validate SMS message data
 */

/**
 * SMS Send Schema
 * Used when sending SMS notifications
 */
export const smsSendSchema = z.object({
  to_phone: z
    .string()
    .regex(
      /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
      'Invalid phone number format'
    ),
  message_body: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1600, 'Message too long (max 1600 characters)'),
  contact_id: z.string().uuid('Invalid contact ID').optional().nullable(),
  project_id: z.string().uuid('Invalid project ID').optional().nullable(),
  phase_id: z.string().uuid('Invalid phase ID').optional().nullable(),
  metadata: z.record(z.string(), z.any()).default({}),
});

/**
 * SMS Filter Schema
 * Used for filtering SMS messages
 */
export const smsFilterSchema = z.object({
  contact_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  phase_id: z.string().uuid().optional(),
  status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type SmsSend = z.infer<typeof smsSendSchema>;
export type SmsFilter = z.infer<typeof smsFilterSchema>;
