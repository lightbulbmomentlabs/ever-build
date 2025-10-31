/**
 * Contact Service
 *
 * Business logic for managing contacts/subcontractors.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

/**
 * Get all contacts for an organization
 */
export async function getContacts(
  organizationId: string,
  filters?: {
    trade?: string;
    is_active?: boolean;
    search?: string;
  }
): Promise<Contact[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', organizationId)
    .order('company_name', { ascending: true });

  // Apply filters
  if (filters?.trade) {
    query = query.eq('trade', filters.trade);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  if (filters?.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,trade.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get contacts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single contact by ID
 */
export async function getContactById(
  contactId: string,
  organizationId: string
): Promise<Contact> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('organization_id', organizationId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Contact');
  }

  return data;
}

/**
 * Create a new contact
 */
export async function createContact(data: ContactInsert): Promise<Contact> {
  const supabase = getServerSupabaseClient();

  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return newContact;
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string,
  organizationId: string,
  updates: ContactUpdate
): Promise<Contact> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', contactId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`);
  }

  return data;
}

/**
 * Delete a contact (soft delete by setting is_active to false)
 */
export async function deleteContact(
  contactId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  const { error } = await supabase
    .from('contacts')
    .update({ is_active: false })
    .eq('id', contactId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
}

/**
 * Get unique trades from contacts
 */
export async function getContactTrades(organizationId: string): Promise<string[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contacts')
    .select('trade')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to get contact trades: ${error.message}`);
  }

  // Get unique trades
  const trades = [...new Set(data.map((c) => c.trade))];
  return trades.sort();
}

/**
 * Upload contact image to Supabase Storage
 */
export async function uploadContactImage(
  contactId: string,
  organizationId: string,
  file: File
): Promise<string> {
  const supabase = getServerSupabaseClient();

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${contactId}-${Date.now()}.${fileExt}`;
  const filePath = `contact-images/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('contact-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('contact-images').getPublicUrl(data.path);

  // Update contact with image URL
  await updateContact(contactId, organizationId, { image_url: publicUrl });

  return publicUrl;
}

/**
 * Delete contact image from Supabase Storage
 */
export async function deleteContactImage(
  contactId: string,
  organizationId: string,
  imageUrl: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Extract path from URL
  const urlParts = imageUrl.split('/contact-images/');
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL');
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error } = await supabase.storage
    .from('contact-images')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  // Update contact to remove image URL
  await updateContact(contactId, organizationId, { image_url: null });
}
