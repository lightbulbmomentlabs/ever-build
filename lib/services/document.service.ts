/**
 * Document Service
 *
 * Handles project document uploads, storage, and management
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { Database } from '@/lib/db/supabase-client';
import {
  DocumentCreate,
  DocumentUpdate,
  DocumentFilter,
} from '@/lib/validations/document';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdateType = Database['public']['Tables']['documents']['Update'];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFileToStorage(
  file: File,
  projectId: string,
  organizationId: string
): Promise<{ path: string; url: string }> {
  const supabase = getServerSupabaseClient();

  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${organizationId}/${projectId}/${timestamp}_${sanitizedFileName}`;

  // Upload to storage bucket
  const { data, error } = await supabase.storage
    .from('project-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new ValidationError(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('project-documents')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

/**
 * Create a document record
 */
export async function createDocument(
  data: DocumentCreate,
  filePath: string,
  organizationId: string,
  uploadedBy: string
): Promise<Document> {
  const supabase = getServerSupabaseClient();

  const documentData: DocumentInsert = {
    organization_id: organizationId,
    project_id: data.project_id,
    phase_id: data.phase_id || null,
    file_name: data.file_name,
    file_path: filePath,
    file_type: data.file_type,
    file_size: data.file_size,
    title: data.title,
    description: data.description || null,
    category: data.category,
    visibility: data.visibility,
    uploaded_by: uploadedBy,
  };

  const { data: document, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    throw new ValidationError(`Failed to create document: ${error.message}`);
  }

  return document;
}

/**
 * Get all documents for a project
 */
export async function getDocumentsByProject(
  projectId: string,
  organizationId: string,
  filters?: DocumentFilter
): Promise<Document[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false });

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.visibility) {
    query = query.eq('visibility', filters.visibility);
  }

  if (filters?.phase_id) {
    query = query.eq('phase_id', filters.phase_id);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,file_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new ValidationError(`Failed to fetch documents: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all documents for a phase
 */
export async function getDocumentsByPhase(
  phaseId: string,
  organizationId: string
): Promise<Document[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('phase_id', phaseId)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new ValidationError(`Failed to fetch phase documents: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(
  documentId: string,
  organizationId: string
): Promise<Document> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new NotFoundError('Document not found');
  }

  return data;
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  updates: DocumentUpdate,
  organizationId: string
): Promise<Document> {
  const supabase = getServerSupabaseClient();

  // First verify the document exists and belongs to the organization
  await getDocumentById(documentId, organizationId);

  const updateData: DocumentUpdateType = {
    ...(updates.title && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.category && { category: updates.category }),
    ...(updates.visibility && { visibility: updates.visibility }),
    ...(updates.phase_id !== undefined && { phase_id: updates.phase_id }),
  };

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error || !data) {
    throw new ValidationError(`Failed to update document: ${error?.message}`);
  }

  return data;
}

/**
 * Delete a document (soft delete)
 */
export async function deleteDocument(
  documentId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // First verify the document exists and belongs to the organization
  const document = await getDocumentById(documentId, organizationId);

  // Soft delete - mark as inactive
  const { error } = await supabase
    .from('documents')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new ValidationError(`Failed to delete document: ${error.message}`);
  }

  // Optionally delete from storage as well
  // Note: We're keeping files in storage for potential recovery
  // If you want to delete from storage immediately:
  /*
  const { error: storageError } = await supabase.storage
    .from('project-documents')
    .remove([document.file_path]);

  if (storageError) {
    console.error('Failed to delete file from storage:', storageError);
  }
  */
}

/**
 * Permanently delete a document and its file
 */
export async function permanentlyDeleteDocument(
  documentId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Get the document to access file path
  const document = await getDocumentById(documentId, organizationId);

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('project-documents')
    .remove([document.file_path]);

  if (storageError) {
    console.error('Failed to delete file from storage:', storageError);
    // Continue with database deletion even if storage fails
  }

  // Delete from database
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new ValidationError(`Failed to permanently delete document: ${error.message}`);
  }
}

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(
  documentId: string,
  organizationId: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const supabase = getServerSupabaseClient();

  // Verify document exists and belongs to organization
  const document = await getDocumentById(documentId, organizationId);

  // Generate signed URL for download
  const { data, error } = await supabase.storage
    .from('project-documents')
    .createSignedUrl(document.file_path, expiresIn);

  if (error || !data) {
    throw new ValidationError(`Failed to generate download URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Get document statistics for a project
 */
export async function getDocumentStats(
  projectId: string,
  organizationId: string
): Promise<{
  total: number;
  byCategory: Record<string, number>;
  totalSize: number;
}> {
  const documents = await getDocumentsByProject(projectId, organizationId);

  const stats = {
    total: documents.length,
    byCategory: {} as Record<string, number>,
    totalSize: 0,
  };

  documents.forEach((doc) => {
    stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
    stats.totalSize += doc.file_size;
  });

  return stats;
}
