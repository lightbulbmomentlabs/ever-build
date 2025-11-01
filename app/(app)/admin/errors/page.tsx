import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireAdmin, getErrorLogs } from '@/lib/services/admin.service';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ErrorLogsTable } from '@/components/admin/error-logs-table';
import { ErrorLogsFilters } from '@/components/admin/error-logs-filters';

/**
 * Admin Error Logs Page
 *
 * Displays application errors for monitoring and debugging.
 * Provides filtering by severity and resolution status.
 * Allows admins to mark errors as resolved with notes.
 * Only accessible to admins.
 */
export default async function AdminErrorLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    severity?: string;
    resolved?: string;
  }>;
}) {
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

  // Get filter params
  const params = await searchParams;
  const severity = params.severity;
  const resolvedFilter = params.resolved === 'true' ? true : params.resolved === 'false' ? false : undefined;

  // Fetch error logs with filters
  const errorLogs = await getErrorLogs({
    severity: severity || undefined,
    resolved: resolvedFilter,
    limit: 100, // Show last 100 errors
  });

  // Calculate statistics
  const totalErrors = errorLogs.length;
  const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;
  const criticalErrors = errorLogs.filter(e => e.severity === 'critical').length;
  const errorsByType = errorLogs.reduce((acc, error) => {
    acc[error.error_type] = (acc[error.error_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">Error Logs</h1>
        <p className="mt-2 text-sm md:text-base text-steel-gray">
          Monitor application errors and track their resolution.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Errors */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Errors</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
                {totalErrors}
              </p>
            </div>
          </div>
        </div>

        {/* Unresolved */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Unresolved</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-red-600">
                {unresolvedErrors}
              </p>
            </div>
          </div>
        </div>

        {/* Critical */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Critical</h3>
              <p className="mt-2 text-2xl md:text-3xl font-semibold text-orange-600">
                {criticalErrors}
              </p>
            </div>
          </div>
        </div>

        {/* Most Common Type */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs md:text-sm font-medium text-steel-gray">Most Common</h3>
              <p className="mt-2 text-xl md:text-2xl font-semibold text-charcoal-blue">
                {Object.keys(errorsByType).length > 0
                  ? (Object.entries(errorsByType).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as string)
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ErrorLogsFilters currentSeverity={severity} currentResolved={resolvedFilter} />

      {/* Error Logs Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <ErrorLogsTable errorLogs={errorLogs} currentAdminId={userId} />
      </div>
    </div>
  );
}
