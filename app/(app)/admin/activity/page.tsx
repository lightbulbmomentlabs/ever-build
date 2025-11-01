import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireAdmin, getAdminActivityLogs } from '@/lib/services/admin.service';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ActivityLogTable } from '@/components/admin/activity-log-table';

/**
 * Admin Activity Log Page
 *
 * Displays audit trail of all administrative actions.
 * Shows who performed what action and when.
 * Only accessible to admins.
 */
export default async function AdminActivityLogPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin (throws AuthorizationError if not)
  try {
    await requireAdmin(userId);
  } catch (error) {
    redirect('/dashboard');
  }

  // Fetch activity logs (last 100 entries)
  const activityLogs = await getAdminActivityLogs({
    limit: 100,
  });

  // Calculate statistics
  const totalActions = activityLogs.length;
  const userDeletions = activityLogs.filter(log => log.action === 'user_deleted').length;
  const errorsResolved = activityLogs.filter(log => log.action === 'error_resolved').length;
  const uniqueAdmins = new Set(activityLogs.map(log => log.admin_user_id)).size;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-steel-gray hover:text-everbuild-orange mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">Activity Log</h1>
        <p className="mt-2 text-sm md:text-base text-steel-gray">
          Audit trail of all administrative actions performed in the system.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Actions */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Actions</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {totalActions}
              </p>
            </div>
          </div>
        </div>

        {/* User Deletions */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">User Deletions</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-red-600">
                {userDeletions}
              </p>
            </div>
          </div>
        </div>

        {/* Errors Resolved */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Errors Resolved</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-green-600">
                {errorsResolved}
              </p>
            </div>
          </div>
        </div>

        {/* Active Admins */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Active Admins</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-purple-600">
                {uniqueAdmins}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <ActivityLogTable activityLogs={activityLogs} />
      </div>
    </div>
  );
}
