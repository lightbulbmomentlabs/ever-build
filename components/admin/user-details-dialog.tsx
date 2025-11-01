'use client';

import { useEffect, useState } from 'react';
import { UserWithOrganization, UserActivityMetrics } from '@/lib/services/admin.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { User, Building2, Calendar, Mail, FolderKanban, ListChecks, Users, FileText, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserDetailsDialogProps {
  user: UserWithOrganization;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsDialog({ user, open, onClose }: UserDetailsDialogProps) {
  const [metrics, setMetrics] = useState<UserActivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUserMetrics();
    }
  }, [open, user.id]);

  const fetchUserMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${user.id}/metrics`);

      if (!response.ok) {
        throw new Error('Failed to fetch user metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user activity metrics',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-charcoal-blue">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Section */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-charcoal-blue mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-steel-gray mt-0.5" />
                <div>
                  <p className="text-xs text-steel-gray">Email</p>
                  <p className="text-sm font-medium text-charcoal-blue">{user.email}</p>
                </div>
              </div>

              {((user as any).first_name || (user as any).last_name) && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-steel-gray mt-0.5" />
                  <div>
                    <p className="text-xs text-steel-gray">Name</p>
                    <p className="text-sm font-medium text-charcoal-blue">
                      {[(user as any).first_name, (user as any).last_name].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-steel-gray mt-0.5" />
                <div>
                  <p className="text-xs text-steel-gray">Joined</p>
                  <p className="text-sm font-medium text-charcoal-blue">
                    {format(new Date(user.created_at), 'PPP')} ({formatDistanceToNow(new Date(user.created_at), { addSuffix: true })})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-steel-gray mt-0.5" />
                <div>
                  <p className="text-xs text-steel-gray">Organization</p>
                  <p className="text-sm font-medium text-charcoal-blue">
                    {user.organization?.name || 'N/A'}
                  </p>
                  {user.organization && (
                    <p className="text-xs text-steel-gray">
                      Created {format(new Date(user.organization.created_at), 'PPP')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Metrics Section */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-charcoal-blue mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Metrics
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : metrics ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <FolderKanban className="h-4 w-4 text-everbuild-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-steel-gray">Projects Created</p>
                      <p className="text-lg font-semibold text-charcoal-blue">{metrics.projects_count}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ListChecks className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-steel-gray">Phases Created</p>
                      <p className="text-lg font-semibold text-charcoal-blue">{metrics.phases_count}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <ListChecks className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-steel-gray">Tasks Created</p>
                      <p className="text-lg font-semibold text-charcoal-blue">{metrics.tasks_count}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-steel-gray">Contacts Created</p>
                      <p className="text-lg font-semibold text-charcoal-blue">{metrics.contacts_count}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <FileText className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-steel-gray">Documents Uploaded</p>
                      <p className="text-lg font-semibold text-charcoal-blue">{metrics.documents_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-steel-gray text-center py-4">
                Failed to load activity metrics
              </p>
            )}
          </div>

          {/* Technical Details Section */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-charcoal-blue mb-3">Technical Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-steel-gray">User ID</p>
                <p className="text-xs font-mono text-charcoal-blue break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-xs text-steel-gray">Clerk User ID</p>
                <p className="text-xs font-mono text-charcoal-blue break-all">{user.clerk_user_id}</p>
              </div>
              {user.organization && (
                <div>
                  <p className="text-xs text-steel-gray">Organization ID</p>
                  <p className="text-xs font-mono text-charcoal-blue break-all">{user.organization.id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
