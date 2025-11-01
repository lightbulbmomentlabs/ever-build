import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireAdmin, getAllUsers } from '@/lib/services/admin.service';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UsersTable } from '@/components/admin/users-table';

/**
 * Admin Users Management Page
 *
 * Displays all users with their organization details and activity metrics.
 * Provides ability to view user details and delete users.
 * Only accessible to admins.
 */
export default async function AdminUsersPage() {
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

  // Fetch all users with their organization details
  const users = await getAllUsers();

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
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">User Management</h1>
        <p className="mt-2 text-sm md:text-base text-steel-gray">
          Manage all users, view activity metrics, and perform administrative actions.
        </p>
      </div>

      {/* Users Summary */}
      <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-charcoal-blue">
              Total Users
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-purple-600 mt-2">
              {users.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-steel-gray">
              {users.filter(u => (u as any).is_admin).length} admin{users.filter(u => (u as any).is_admin).length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-steel-gray">
              {users.length - users.filter(u => (u as any).is_admin).length} regular user{users.length - users.filter(u => (u as any).is_admin).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <UsersTable users={users} currentAdminId={userId} />
      </div>
    </div>
  );
}
