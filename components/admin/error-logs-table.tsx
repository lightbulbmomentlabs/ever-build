'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { ErrorDetailsDialog } from './error-details-dialog';

// Type will be available after migrations are applied
type ErrorLog = {
  id: string;
  user_id?: string | null;
  clerk_user_id?: string | null;
  user_email?: string | null;
  error_message: string;
  error_stack?: string | null;
  error_type: string;
  page_url: string;
  user_action?: string | null;
  component_name?: string | null;
  severity: 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
};

interface ErrorLogsTableProps {
  errorLogs: ErrorLog[];
  currentAdminId: string;
}

const severityColors = {
  critical: 'bg-red-100 text-red-700',
  error: 'bg-orange-100 text-orange-700',
  warning: 'bg-yellow-100 text-yellow-700',
};

const errorTypeLabels: Record<string, string> = {
  javascript: 'JavaScript',
  api: 'API',
  database: 'Database',
  authentication: 'Auth',
  validation: 'Validation',
  network: 'Network',
  unknown: 'Unknown',
};

export function ErrorLogsTable({ errorLogs, currentAdminId }: ErrorLogsTableProps) {
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Error
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                User
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Page
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-steel-gray uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {errorLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-steel-gray">
                  No error logs found
                </td>
              </tr>
            ) : (
              errorLogs.map((error) => (
                <tr key={error.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-charcoal-blue truncate">
                        {error.error_message}
                      </p>
                      {error.user_action && (
                        <p className="text-xs text-steel-gray truncate">
                          Action: {error.user_action}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-steel-gray">
                      {errorTypeLabels[error.error_type] || error.error_type}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm">
                      {error.user_email ? (
                        <>
                          <p className="font-medium text-charcoal-blue truncate max-w-[150px]">
                            {error.user_email.split('@')[0]}
                          </p>
                          <p className="text-xs text-steel-gray truncate max-w-[150px]">
                            @{error.user_email.split('@')[1]}
                          </p>
                        </>
                      ) : (
                        <p className="text-steel-gray">Anonymous</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm text-steel-gray truncate max-w-[200px]" title={error.page_url}>
                      {new URL(error.page_url, 'http://localhost').pathname}
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        severityColors[error.severity as keyof typeof severityColors]
                      }`}
                    >
                      {error.severity}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm text-steel-gray">
                      {formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {error.resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedError(error)}
                        className="p-2 rounded-lg text-steel-gray hover:bg-gray-100 hover:text-everbuild-orange transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Error Details Dialog */}
      {selectedError && (
        <ErrorDetailsDialog
          error={selectedError}
          open={!!selectedError}
          onClose={() => setSelectedError(null)}
          currentAdminId={currentAdminId}
        />
      )}
    </>
  );
}
