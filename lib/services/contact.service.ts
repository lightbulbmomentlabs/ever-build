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
 * Get all contacts for an organization with their category assignments
 */
export async function getContacts(
  organizationId: string,
  filters?: {
    is_active?: boolean;
    search?: string;
  }
): Promise<any[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('contacts')
    .select(`
      *,
      contact_category_assignments(
        id,
        category:contact_categories(
          id,
          name
        ),
        sub_type:contact_sub_types(
          id,
          name
        )
      )
    `)
    .eq('organization_id', organizationId)
    .order('company_name', { ascending: true });

  // Default to only active contacts unless explicitly filtering
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  } else {
    query = query.eq('is_active', true);
  }

  if (filters?.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`
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
 * @deprecated Use getContactCategories instead
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
 * Get all contact categories with their sub-types
 */
export async function getContactCategories() {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contact_categories')
    .select(`
      id,
      name,
      description,
      sort_order,
      sub_types:contact_sub_types(
        id,
        name,
        description,
        sort_order
      )
    `)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get contact categories: ${error.message}`);
  }

  // Sort sub-types within each category
  return (data || []).map((category) => ({
    ...category,
    sub_types: (category.sub_types || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ),
  }));
}

/**
 * Get category assignments for a contact
 */
export async function getContactCategoryAssignments(contactId: string) {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contact_category_assignments')
    .select(`
      id,
      category:contact_categories(
        id,
        name
      ),
      sub_type:contact_sub_types(
        id,
        name
      ),
      created_at
    `)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get category assignments: ${error.message}`);
  }

  return data || [];
}

/**
 * Assign a category/sub-type to a contact
 */
export async function assignContactCategory(
  contactId: string,
  categoryId: string,
  subTypeId: string
) {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('contact_category_assignments')
    .insert({
      contact_id: contactId,
      category_id: categoryId,
      sub_type_id: subTypeId,
    })
    .select(`
      id,
      category:contact_categories(
        id,
        name
      ),
      sub_type:contact_sub_types(
        id,
        name
      ),
      created_at
    `)
    .single();

  if (error) {
    throw new Error(`Failed to assign category: ${error.message}`);
  }

  return data;
}

/**
 * Remove a category assignment from a contact
 */
export async function removeContactCategory(assignmentId: string): Promise<void> {
  const supabase = getServerSupabaseClient();

  const { error } = await supabase
    .from('contact_category_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    throw new Error(`Failed to remove category assignment: ${error.message}`);
  }
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
