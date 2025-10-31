import { z } from 'zod';

/**
 * Project Validation Schemas
 *
 * These schemas validate project information
 */

/**
 * Project Status Enum
 */
export const projectStatusEnum = z.enum([
  'not_started',
  'active',
  'on_hold',
  'under_contract',
  'irsa',
  'sold',
  'warranty_period',
  'archived',
]);

/**
 * Project Create/Update Schema
 */
export const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().length(2, 'State must be 2 characters (e.g., CA)'),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  lot_number: z.string().optional().nullable(),
  block_number: z.string().optional().nullable(),
  subdivision: z.string().optional().nullable(),
  parcel_number: z.string().optional().nullable(),
  model_type: z.string().optional().nullable(),
  square_footage: z.number().int().positive('Square footage must be positive').optional().nullable(),
  status: projectStatusEnum.default('active'),
  target_completion_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  actual_completion_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).default({}),
  // Baseline tracking fields
  baseline_start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  baseline_duration_days: z
    .number()
    .int()
    .positive('Baseline duration must be positive')
    .optional()
    .nullable(),
});

/**
 * Project Filter Schema
 * Used for filtering projects list
 */
export const projectFilterSchema = z.object({
  status: projectStatusEnum.optional(),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type ProjectFilter = z.infer<typeof projectFilterSchema>;
