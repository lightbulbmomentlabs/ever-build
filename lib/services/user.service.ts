/**
 * User Service
 *
 * Business logic for user management.
 * Handles user creation, updates, and Clerk-Supabase synchronization.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError, ConflictError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Create a new user in Supabase
 * Called from Clerk webhook after user signs up
 */
export async function createUser(data: UserInsert): Promise<User> {
  const supabase = getServerSupabaseClient();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', data.clerk_user_id)
    .single();

  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  // Create user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return newUser;
}

/**
 * Get user by Clerk user ID
 */
export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new NotFoundError('User');
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, updates: UserUpdate): Promise<User> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
}

/**
 * Delete user
 * Called from Clerk webhook when user is deleted
 */
export async function deleteUser(clerkUserId: string): Promise<void> {
  const supabase = getServerSupabaseClient();

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_user_id', clerkUserId);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Get user's organization
 */
export async function getUserOrganization(userId: string) {
  const supabase = getServerSupabaseClient();

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (userError) {
    throw new NotFoundError('User');
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organization_id)
    .single();

  if (orgError) {
    throw new NotFoundError('Organization');
  }

  return organization;
}
