import { z } from 'zod';

/**
 * Authentication & User Validation Schemas
 *
 * These schemas validate user input for authentication flows
 * and user profile management.
 */

/**
 * User Profile Schema
 * Used when creating or updating user profiles
 */
export const userProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .regex(
      /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
      'Invalid phone number format'
    )
    .optional()
    .nullable(),
});

/**
 * Organization Schema
 * Used when creating or updating organizations
 */
export const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Organization = z.infer<typeof organizationSchema>;
