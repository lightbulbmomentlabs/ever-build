import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getOrganizationById } from '@/lib/services/organization.service';
import { ProfileTab } from '@/components/settings/profile-tab';

/**
 * Profile Settings Page
 *
 * Organization profile settings including company info, address, and logo.
 */
export default async function ProfileSettingsPage() {
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
    <ProfileTab
      organizationId={organization.id}
      initialData={{
        name: organization.name,
        company_name: organization.company_name,
        address_line1: organization.address_line1,
        address_line2: organization.address_line2,
        city: organization.city,
        state: organization.state,
        zip_code: organization.zip_code,
        country: organization.country,
        phone: organization.phone,
        website: organization.website,
        url_slug: organization.url_slug,
        logo_url: organization.logo_url,
      }}
    />
  );
}
