import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getOrganizationById } from '@/lib/services/organization.service';
import { BillingTab } from '@/components/settings/billing-tab';

/**
 * Billing Settings Page
 *
 * Subscription and billing management (placeholder for Stripe integration).
 */
export default async function BillingSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  const organization = await getOrganizationById(user.organization_id);

  return (
    <BillingTab
      subscriptionStatus={organization.subscription_status}
      subscriptionTier={organization.subscription_tier}
    />
  );
}
