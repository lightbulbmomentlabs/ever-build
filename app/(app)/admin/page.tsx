import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireAdmin, getDashboardStats } from '@/lib/services/admin.service';
import Link from 'next/link';
import { Users, Activity, FolderKanban, Building2, AlertTriangle, TrendingUp } from 'lucide-react';

/**
 * Admin Dashboard Page
 *
 * Dashboard showing key metrics for admins.
 * Only accessible to users with is_admin = true.
 */
export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin (throws UnauthorizedError if not)
  try {
    await requireAdmin(userId);
  } catch (error) {
    // Redirect non-admins to dashboard
    redirect('/dashboard');
  }

  // Fetch dashboard statistics
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">Admin Dashboard</h1>
        <p className="mt-2 text-sm md:text-base text-steel-gray">
          Monitor application health and user activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
        {/* Total Users */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Users</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.total_users}
              </p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Users (30 days) */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Active Users (30d)</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.active_users_30d}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Organizations */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Organizations</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.total_organizations}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Projects</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.total_projects}
              </p>
            </div>
            <div className="rounded-full bg-everbuild-orange/10 p-3">
              <FolderKanban className="h-6 w-6 text-everbuild-orange" />
            </div>
          </div>
        </div>

        {/* Unresolved Errors */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Unresolved Errors</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.unresolved_errors}
              </p>
            </div>
            <div className="rounded-full bg-red-50 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Signups (30 days) */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">New Signups (30d)</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {stats.signups_last_30d.reduce((sum, count) => sum + count, 0)}
              </p>
            </div>
            <div className="rounded-full bg-teal-50 p-3">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Signups Chart */}
      <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-semibold text-charcoal-blue mb-4">
          Signups Last 30 Days
        </h2>
        <div className="flex items-end justify-between gap-1 h-32">
          {stats.signups_last_30d.map((count, index) => {
            const maxCount = Math.max(...stats.signups_last_30d, 1);
            const height = (count / maxCount) * 100;

            return (
              <div
                key={index}
                className="flex-1 bg-purple-100 hover:bg-purple-200 transition-colors rounded-t"
                style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                title={`Day ${index + 1}: ${count} signups`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-steel-gray">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-lg border bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base md:text-lg font-semibold text-charcoal-blue mb-2">
            Manage Users
          </h3>
          <p className="text-sm text-steel-gray">
            View all users, their activity, and manage accounts.
          </p>
        </Link>

        <Link
          href="/admin/errors"
          className="rounded-lg border bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base md:text-lg font-semibold text-charcoal-blue mb-2">
            Error Logs
          </h3>
          <p className="text-sm text-steel-gray">
            Monitor and resolve application errors and bugs.
          </p>
        </Link>

        <Link
          href="/admin/activity"
          className="rounded-lg border bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base md:text-lg font-semibold text-charcoal-blue mb-2">
            Activity Log
          </h3>
          <p className="text-sm text-steel-gray">
            View all administrative actions and audit trail.
          </p>
        </Link>
      </div>
    </div>
  );
}
