import { z } from 'zod';

/**
 * Organization Validation Schemas
 *
 * These schemas validate organization settings and profile information
 */

/**
 * Subscription Status Enum
 */
export const subscriptionStatusEnum = z.enum([
  'free',
  'active',
  'past_due',
  'cancelled',
]);

/**
 * Subscription Tier Enum
 */
export const subscriptionTierEnum = z.enum(['free', 'pro', 'enterprise']);

/**
 * URL Slug Validation
 * Must be lowercase, alphanumeric with hyphens, 3-50 characters
 */
const urlSlugSchema = z
  .string()
  .min(3, 'URL slug must be at least 3 characters')
  .max(50, 'URL slug must be at most 50 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'URL slug must be lowercase letters, numbers, and hyphens only'
  );

/**
 * Phone Number Validation (US format)
 */
const phoneSchema = z
  .string()
  .regex(
    /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
    'Invalid phone number format'
  )
  .optional()
  .nullable();

/**
 * Website URL Validation
 */
const websiteSchema = z
  .string()
  .url('Invalid website URL')
  .optional()
  .nullable();

/**
 * Zip Code Validation (US format)
 */
const zipCodeSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format')
  .optional()
  .nullable();

/**
 * Organization Profile Update Schema
 * Used for updating organization profile settings
 */
export const organizationProfileSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .optional()
    .nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().length(2, 'State must be 2-letter code').optional().nullable(),
  zip_code: zipCodeSchema,
  country: z.string().length(2, 'Country must be 2-letter code').default('US'),
  phone: phoneSchema,
  website: websiteSchema,
  url_slug: urlSlugSchema.optional().nullable(),
});

/**
 * URL Slug Check Schema
 * Used for checking if a URL slug is available
 */
export const urlSlugCheckSchema = z.object({
  slug: urlSlugSchema,
  exclude_organization_id: z.string().uuid().optional(),
});

/**
 * Logo Upload Schema
 * Used for validating logo file uploads
 */
export const logoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type),
      'File must be an image (JPEG, PNG, WebP, or SVG)'
    ),
  organization_id: z.string().uuid('Invalid organization ID'),
});

/**
 * Organization Settings Update Schema
 * Used for updating general organization settings
 */
export const organizationSettingsSchema = z.object({
  subscription_status: subscriptionStatusEnum.optional(),
  subscription_tier: subscriptionTierEnum.optional(),
  stripe_customer_id: z.string().optional().nullable(),
});

// Type exports
export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;
export type UrlSlugCheck = z.infer<typeof urlSlugCheckSchema>;
export type LogoUpload = z.infer<typeof logoUploadSchema>;
export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;
export type SubscriptionTier = z.infer<typeof subscriptionTierEnum>;
