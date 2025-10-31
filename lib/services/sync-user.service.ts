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
  // Get current user from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error('No authenticated user');
  }

  // Check if user exists in Supabase
  const existingUser = await getUserByClerkId(clerkUser.id);

  if (existingUser) {
    // User already exists, return it
    return existingUser;
  }

  // User doesn't exist, create organization first
  const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';

  const organization = await createOrganization({
    name: `${fullName}'s Organization`,
  });

  // Create user in Supabase
  const newUser = await createUser({
    clerk_user_id: clerkUser.id,
    organization_id: organization.id,
    email: email,
    full_name: fullName,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
  });

  return newUser;
}
