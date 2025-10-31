/**
 * Clerk Webhook Handler
 *
 * This webhook handles user lifecycle events from Clerk:
 * - user.created: Create user in Supabase
 * - user.updated: Update user in Supabase
 * - user.deleted: Delete user from Supabase
 *
 * Setup instructions:
 * 1. In Clerk Dashboard, go to Webhooks
 * 2. Create a new endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy the webhook secret to CLERK_WEBHOOK_SECRET in .env.local
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyClerkWebhook, extractUserFromClerkEvent } from '@/lib/utils/clerk-webhook';
import { createUser, updateUser, deleteUser, getUserByClerkId } from '@/lib/services/user.service';
import { createOrganization } from '@/lib/services/organization.service';

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const payload = await req.text();

    // Get headers
    const headers = Object.fromEntries(req.headers);

    // Verify webhook signature
    let event;
    try {
      event = verifyClerkWebhook(payload, headers);
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event);
        break;

      case 'user.updated':
        await handleUserUpdated(event);
        break;

      case 'user.deleted':
        await handleUserDeleted(event);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle user.created event
 * Creates a new organization and user in Supabase
 */
async function handleUserCreated(event: any) {
  const userData = extractUserFromClerkEvent(event);

  // Create organization for the user
  // MVP: Each user gets their own organization (single-tenant per org)
  const organization = await createOrganization({
    name: `${userData.fullName}'s Organization`,
  });

  // Create user in Supabase
  await createUser({
    clerk_user_id: userData.clerkUserId,
    organization_id: organization.id,
    email: userData.email,
    full_name: userData.fullName,
    phone: userData.phone,
  });

  console.log(`User created: ${userData.clerkUserId}`);
}

/**
 * Handle user.updated event
 * Updates user information in Supabase
 */
async function handleUserUpdated(event: any) {
  const userData = extractUserFromClerkEvent(event);

  // Get existing user
  const existingUser = await getUserByClerkId(userData.clerkUserId);

  if (!existingUser) {
    console.warn(`User not found for update: ${userData.clerkUserId}`);
    return;
  }

  // Update user
  await updateUser(existingUser.id, {
    email: userData.email,
    full_name: userData.fullName,
    phone: userData.phone,
  });

  console.log(`User updated: ${userData.clerkUserId}`);
}

/**
 * Handle user.deleted event
 * Deletes user from Supabase (CASCADE will handle related records)
 */
async function handleUserDeleted(event: any) {
  const data = event.data;
  const clerkUserId = data.id;

  await deleteUser(clerkUserId);

  console.log(`User deleted: ${clerkUserId}`);
}
