/**
 * Clerk Webhook Utilities
 *
 * Helper functions for verifying and handling Clerk webhooks
 */

import { Webhook } from 'svix';

/**
 * Verify Clerk webhook signature
 *
 * @param payload - Raw request body
 * @param headers - Request headers
 * @returns Verified webhook event
 */
export function verifyClerkWebhook(
  payload: string,
  headers: Record<string, string | string[] | undefined>
): any {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get Svix headers for signature verification
  const svixId = headers['svix-id'] as string;
  const svixTimestamp = headers['svix-timestamp'] as string;
  const svixSignature = headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing Svix headers');
  }

  // Create Svix webhook instance
  const webhook = new Webhook(WEBHOOK_SECRET);

  try {
    // Verify the webhook signature
    return webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (error) {
    throw new Error('Webhook signature verification failed');
  }
}

/**
 * Extract user data from Clerk webhook event
 */
export function extractUserFromClerkEvent(event: any): {
  clerkUserId: string;
  email: string;
  fullName: string;
  phone: string | null;
} {
  const data = event.data;

  return {
    clerkUserId: data.id,
    email: data.email_addresses?.[0]?.email_address || '',
    fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User',
    phone: data.phone_numbers?.[0]?.phone_number || null,
  };
}
