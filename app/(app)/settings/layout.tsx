import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getOrganizationById } from '@/lib/services/organization.service';
import { SettingsNav } from '@/components/settings/settings-tabs';

/**
 * Settings Layout
 *
 * Shared layout for all settings pages with navigation.
 */

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user and organization data
  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  const organization = await getOrganizationById(user.organization_id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-blue">Settings</h1>
        <p className="mt-2 text-steel-gray">
          Manage your account and organization settings
        </p>
      </div>

      <SettingsNav />

      {children}
    </div>
  );
}
