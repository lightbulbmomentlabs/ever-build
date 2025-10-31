/**
 * User Sync Service
 *
 * Handles on-demand user synchronization between Clerk and Supabase.
 * This is called when a user first accesses the app after signing up.
 */

import { currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser } from './user.service';
import { createOrganization } from './organization.service';

/**
 * Ensure user exists in Supabase
 * If not, create user and organization
 *
 * Call this on first app access (e.g., dashboard page)
 */
export async function ensureUserExists() {
  try {
    // Get current user from Clerk
    console.log('[ensureUserExists] Getting current user from Clerk');
    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.error('[ensureUserExists] No authenticated user from Clerk');
      throw new Error('No authenticated user');
    }

    console.log('[ensureUserExists] Clerk user found:', clerkUser.id);

    // Check if user exists in Supabase
    console.log('[ensureUserExists] Checking if user exists in Supabase');
    const existingUser = await getUserByClerkId(clerkUser.id);

    if (existingUser) {
      // User already exists, return it
      console.log('[ensureUserExists] User already exists in Supabase:', existingUser.id);
      return existingUser;
    }

    console.log('[ensureUserExists] User does not exist, creating new user and organization');

    // User doesn't exist, create organization first
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';

    console.log('[ensureUserExists] Creating organization for:', fullName);
    const organization = await createOrganization({
      name: `${fullName}'s Organization`,
    });

    console.log('[ensureUserExists] Organization created:', organization.id);

    // Create user in Supabase
    console.log('[ensureUserExists] Creating user in Supabase');
    const newUser = await createUser({
      clerk_user_id: clerkUser.id,
      organization_id: organization.id,
      email: email,
      full_name: fullName,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
    });

    console.log('[ensureUserExists] User created successfully:', newUser.id);
    return newUser;
  } catch (error) {
    console.error('[ensureUserExists] Error during user sync:', error);
    throw error;
  }
}
