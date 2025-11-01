import { z } from 'zod';

/**
 * Contact Validation Schemas
 *
 * These schemas validate contact/subcontractor information
 */

/**
 * Format phone number to E.164 format (+1XXXXXXXXXX)
 * Required for Twilio SMS
 */
function formatPhoneToE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If 10 digits, add +1 prefix
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If 11 digits starting with 1, add + prefix
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Already has +1 or invalid format - return as is
  return phone;
}

/**
 * Contact Create/Update Schema
 */
export const contactSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person must be at least 2 characters'),
  phone_primary: z
    .string()
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
      },
      'Invalid US/Canada phone number. Must be 10 digits or 11 digits starting with 1.'
    )
    .transform(formatPhoneToE164),
  phone_secondary: z
    .string()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const digits = val.replace(/\D/g, '');
        return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
      },
      'Invalid US/Canada phone number. Must be 10 digits or 11 digits starting with 1.'
    )
    .transform((val) => val && val.trim() ? formatPhoneToE164(val) : val)
    .optional()
    .nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  lead_time_days: z.number().int().min(0, 'Lead time must be 0 or more days').default(0),
  notes: z.string().optional().nullable(),
  image_url: z.string().url('Invalid URL').optional().nullable(),
  is_active: z.boolean().default(true),
});

/**
 * Contact Filter Schema
 * Used for filtering contacts list
 */
export const contactFilterSchema = z.object({
  is_active: z.boolean().optional(),
  search: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;
export type ContactFilter = z.infer<typeof contactFilterSchema>;
