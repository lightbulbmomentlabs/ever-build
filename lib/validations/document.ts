import { z } from 'zod';

/**
 * Document Validation Schemas
 *
 * These schemas validate project document uploads and metadata
 */

/**
 * Document Category Enum
 */
export const documentCategoryEnum = z.enum([
  'permits',
  'plans_drawings',
  'contracts',
  'invoices',
  'inspections',
  'photos',
  'warranties',
  'schedules',
  'specifications',
  'other',
]);

/**
 * Document Visibility Enum
 */
export const documentVisibilityEnum = z.enum([
  'internal',           // Builder/owner only
  'shared_with_subs',   // Accessible by assigned subcontractors
  'public',             // Anyone with project access
]);

/**
 * Allowed file types for document uploads
 */
export const allowedFileTypes = [
  // Documents
  'application/pdf',

  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',

  // Spreadsheets
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx

  // Word Documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx

  // Text
  'text/plain',

  // CAD files (common in construction)
  'application/acad',
  'application/x-acad',
  'application/autocad_dwg',
  'image/x-dwg',
  'application/dwg',
  'application/x-dwg',
  'application/x-autocad',
  'image/vnd.dwg',
];

/**
 * Max file size: 25MB in bytes
 */
export const MAX_FILE_SIZE = 26214400; // 25 * 1024 * 1024

/**
 * Document Create Schema
 */
export const documentCreateSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  phase_id: z.string().uuid('Invalid phase ID').optional().nullable(),

  // File information
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().refine(
    (type) => allowedFileTypes.includes(type),
    'File type not supported'
  ),
  file_size: z.number()
    .positive('File size must be positive')
    .max(MAX_FILE_SIZE, 'File size must not exceed 25MB'),

  // Metadata
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  category: documentCategoryEnum,
  visibility: documentVisibilityEnum.default('internal'),
});

/**
 * Document Update Schema
 */
export const documentUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  category: documentCategoryEnum.optional(),
  visibility: documentVisibilityEnum.optional(),
  phase_id: z.string().uuid('Invalid phase ID').optional().nullable(),
});

/**
 * Document Filter Schema
 */
export const documentFilterSchema = z.object({
  category: documentCategoryEnum.optional(),
  visibility: documentVisibilityEnum.optional(),
  phase_id: z.string().uuid('Invalid phase ID').optional(),
  search: z.string().optional(),
});

/**
 * File Upload Schema (for client-side validation)
 */
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'File size must not exceed 25MB'
  ).refine(
    (file) => allowedFileTypes.includes(file.type),
    'File type not supported'
  ),
});

/**
 * Helper to get human-readable category label
 */
export const categoryLabels: Record<z.infer<typeof documentCategoryEnum>, string> = {
  permits: 'Permits',
  plans_drawings: 'Plans & Drawings',
  contracts: 'Contracts',
  invoices: 'Invoices & Estimates',
  inspections: 'Inspections',
  photos: 'Photos',
  warranties: 'Warranties',
  schedules: 'Schedules',
  specifications: 'Specifications',
  other: 'Other',
};

/**
 * Helper to get human-readable visibility label
 */
export const visibilityLabels: Record<z.infer<typeof documentVisibilityEnum>, string> = {
  internal: 'Internal Only',
  shared_with_subs: 'Shared with Subcontractors',
  public: 'Public',
};

/**
 * Helper to get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensionMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
    'application/dwg': 'dwg',
  };

  return extensionMap[mimeType] || 'file';
}

/**
 * Helper to format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export type DocumentCreate = z.infer<typeof documentCreateSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;
export type DocumentFilter = z.infer<typeof documentFilterSchema>;
export type DocumentCategory = z.infer<typeof documentCategoryEnum>;
export type DocumentVisibility = z.infer<typeof documentVisibilityEnum>;
