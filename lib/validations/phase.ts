import { z } from 'zod';

/**
 * Phase Validation Schemas
 *
 * These schemas validate phase/task information for projects
 */

/**
 * Phase Status Enum
 */
export const phaseStatusEnum = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'blocked',
]);

/**
 * Phase Create/Update Schema
 */
export const phaseSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z.string().min(2, 'Phase name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  sequence_order: z.number().int().min(1, 'Sequence order must be at least 1'),
  planned_start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  planned_duration_days: z.number().int().min(0).optional(),
  actual_start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  actual_end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  status: phaseStatusEnum.default('not_started'),
  predecessor_phase_id: z.string().uuid('Invalid phase ID').optional().nullable(),
  buffer_days: z.number().int().min(0, 'Buffer days must be 0 or more').default(0),
  color: z.string().default('gray'),
  metadata: z.record(z.string(), z.any()).default({}),
  // Hierarchy fields
  parent_phase_id: z.string().uuid('Invalid parent phase ID').optional().nullable(),
  is_task: z.boolean().default(false),
}).refine(
  (data) => {
    // Validation: tasks must have a parent phase
    if (data.is_task && !data.parent_phase_id) {
      return false;
    }
    // Validation: phases must NOT have a parent phase
    if (!data.is_task && data.parent_phase_id) {
      return false;
    }
    return true;
  },
  {
    message: 'Tasks must have a parent_phase_id, and phases must not have a parent_phase_id',
  }
);

/**
 * Phase Contact Assignment Schema
 * Used when assigning contacts to phases
 */
export const phaseContactSchema = z.object({
  phase_id: z.string().uuid('Invalid phase ID'),
  contact_id: z.string().uuid('Invalid contact ID'),
  role: z.string().optional().nullable(),
  notification_advance_days: z
    .number()
    .int()
    .min(0, 'Notification advance days must be 0 or more')
    .default(7),
});

/**
 * Phase Update Status Schema
 * Used for status updates with date tracking
 */
export const phaseStatusUpdateSchema = z.object({
  status: phaseStatusEnum,
  actual_start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional(),
  actual_end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional(),
});

/**
 * Phase Update Schema (no defaults)
 * Used for PATCH operations to avoid overwriting fields with defaults
 * We recreate the schema without .default() to prevent Zod from applying defaults on partial updates
 */
export const phaseUpdateSchema = z.object({
  project_id: z.string().uuid('Invalid project ID').optional(),
  name: z.string().min(2, 'Phase name must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  sequence_order: z.number().int().min(1, 'Sequence order must be at least 1').optional(),
  planned_start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ).optional(),
  planned_duration_days: z.number().int().min(0).optional(),
  actual_start_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  actual_end_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional()
    .nullable(),
  status: phaseStatusEnum.optional(),
  predecessor_phase_id: z.string().uuid('Invalid phase ID').optional().nullable(),
  buffer_days: z.number().int().min(0, 'Buffer days must be 0 or more').optional(),
  color: z.string().optional(), // NO DEFAULT
  metadata: z.record(z.string(), z.any()).optional(),
  // Hierarchy fields
  parent_phase_id: z.string().uuid('Invalid parent phase ID').optional().nullable(),
  is_task: z.boolean().optional(),
});

export type Phase = z.infer<typeof phaseSchema>;
export type PhaseUpdate = z.infer<typeof phaseUpdateSchema>;
export type PhaseStatus = z.infer<typeof phaseStatusEnum>;
export type PhaseContact = z.infer<typeof phaseContactSchema>;
export type PhaseStatusUpdate = z.infer<typeof phaseStatusUpdateSchema>;
