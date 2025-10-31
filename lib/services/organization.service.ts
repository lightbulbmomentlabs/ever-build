/**
 * Organization Service
 *
 * Business logic for organization management.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError, ConflictError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

/**
 * Create a new organization
 */
export async function createOrganization(data: OrganizationInsert): Promise<Organization> {
  const supabase = getServerSupabaseClient();

  const { data: newOrg, error } = await supabase
    .from('organizations')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create organization: ${error.message}`);
  }

  return newOrg;
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(organizationId: string): Promise<Organization> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw new NotFoundError('Organization');
  }

  return data;
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  updates: OrganizationUpdate
): Promise<Organization> {
  const supabase = getServerSupabaseClient();

  // Check if url_slug is being updated and if it's already taken
  if (updates.url_slug) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('url_slug', updates.url_slug)
      .neq('id', organizationId)
      .single();

    if (existing) {
      throw new ConflictError('URL slug is already taken');
    }
  }

  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`);
  }

  return data;
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(organizationId: string) {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get organization users: ${error.message}`);
  }

  return data;
}

/**
 * Check if a URL slug is available
 */
export async function checkUrlSlugAvailability(
  slug: string,
  excludeOrganizationId?: string
): Promise<boolean> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('organizations')
    .select('id')
    .eq('url_slug', slug);

  if (excludeOrganizationId) {
    query = query.neq('id', excludeOrganizationId);
  }

  const { data } = await query.single();

  return !data; // Available if no data found
}

/**
 * Upload organization logo to Supabase Storage
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<string> {
  const supabase = getServerSupabaseClient();

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${organizationId}-${Date.now()}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('organization-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload logo: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('organization-assets').getPublicUrl(data.path);

  // Update organization with logo URL
  await updateOrganization(organizationId, { logo_url: publicUrl });

  return publicUrl;
}

/**
 * Delete organization logo from Supabase Storage
 */
export async function deleteOrganizationLogo(
  organizationId: string,
  logoUrl: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Extract path from URL
  const urlParts = logoUrl.split('/organization-assets/');
  if (urlParts.length !== 2) {
    throw new Error('Invalid logo URL');
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error } = await supabase.storage
    .from('organization-assets')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete logo: ${error.message}`);
  }

  // Update organization to remove logo URL
  await updateOrganization(organizationId, { logo_url: null });
}
