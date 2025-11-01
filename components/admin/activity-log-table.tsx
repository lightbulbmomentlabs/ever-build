'use client';

import { formatDistanceToNow } from 'date-fns';
import { Shield, Trash2, CheckCircle, UserPlus, UserMinus, Building2, Download, Settings, Info } from 'lucide-react';

// Type will be available after migrations are applied
type AdminActivityLog = {
  id: string;
  admin_user_id: string;
  admin_email: string;
  action: string;
  target_user_id?: string | null;
  target_user_email?: string | null;
  target_organization_id?: string | null;
  details?: any;
  description?: string | null;
  created_at: string;
};

interface ActivityLogTableProps {
  activityLogs: AdminActivityLog[];
}

const actionIcons: Record<string, React.ElementType> = {
  user_deleted: Trash2,
  error_resolved: CheckCircle,
  user_promoted_to_admin: UserPlus,
  user_demoted_from_admin: UserMinus,
  organization_deleted: Building2,
  data_exported: Download,
  settings_changed: Settings,
  other: Info,
};

const actionColors: Record<string, string> = {
  user_deleted: 'text-red-600 bg-red-50',
  error_resolved: 'text-green-600 bg-green-50',
  user_promoted_to_admin: 'text-purple-600 bg-purple-50',
  user_demoted_from_admin: 'text-orange-600 bg-orange-50',
  organization_deleted: 'text-red-600 bg-red-50',
  data_exported: 'text-blue-600 bg-blue-50',
  settings_changed: 'text-gray-600 bg-gray-50',
  other: 'text-gray-600 bg-gray-50',
};

const actionLabels: Record<string, string> = {
  user_deleted: 'User Deleted',
  error_resolved: 'Error Resolved',
  user_promoted_to_admin: 'Promoted to Admin',
  user_demoted_from_admin: 'Demoted from Admin',
  organization_deleted: 'Organization Deleted',
  data_exported: 'Data Exported',
  settings_changed: 'Settings Changed',
  other: 'Other Action',
};

export function ActivityLogTable({ activityLogs }: ActivityLogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
              Admin
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
              Action
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
              Target
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activityLogs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-steel-gray">
                No activity logs found
              </td>
            </tr>
          ) : (
            activityLogs.map((log) => {
              const Icon = actionIcons[log.action] || Info;
              const colorClass = actionColors[log.action] || actionColors.other;
              const actionLabel = actionLabels[log.action] || log.action;

              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-blue truncate max-w-[150px]">
                          {log.admin_email.split('@')[0]}
                        </p>
                        <p className="text-xs text-steel-gray truncate max-w-[150px]">
                          @{log.admin_email.split('@')[1]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {actionLabel}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {log.target_user_email ? (
                      <div className="text-sm">
                        <p className="font-medium text-charcoal-blue truncate max-w-[150px]">
                          {log.target_user_email.split('@')[0]}
                        </p>
                        <p className="text-xs text-steel-gray truncate max-w-[150px]">
                          @{log.target_user_email.split('@')[1]}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-steel-gray">—</p>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm text-steel-gray max-w-md truncate" title={log.description || undefined}>
                      {log.description || 'No description'}
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-sm text-steel-gray whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
