import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { TeamTab } from '@/components/settings/team-tab';

/**
 * Team Settings Page
 *
 * Team member management (placeholder for future implementation).
 */
export default async function TeamSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  return <TeamTab organizationId={user.organization_id} />;
}
