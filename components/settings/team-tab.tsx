'use client';

import { Users, UserPlus, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Team Tab Component (Placeholder)
 *
 * Team member management - to be implemented in future phase
 */

interface TeamTabProps {
  organizationId: string;
}

export function TeamTab({ organizationId }: TeamTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-blue">Team Management</h2>
          <p className="text-sm text-steel-gray">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button disabled>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {/* Team Members Section */}
        <div className="mb-6 border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-steel-gray" />
            <h3 className="text-base font-semibold text-charcoal-blue">Team Members</h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-steel-gray mb-4">
              No team members yet. Invite your team to collaborate on projects.
            </p>
            <div className="space-y-3">
              {/* Placeholder member rows */}
              <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Users className="h-5 w-5 text-steel-gray" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-blue">Team Member</p>
                    <p className="text-xs text-steel-gray">member@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-gray">Admin</span>
                  <Button variant="ghost" size="sm" disabled>
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles & Permissions Section */}
        <div className="mb-6 border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-steel-gray" />
            <h3 className="text-base font-semibold text-charcoal-blue">Roles & Permissions</h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-steel-gray mb-4">
              Define custom roles and granular permissions for your team.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4 opacity-50">
                <h4 className="text-sm font-medium text-charcoal-blue mb-1">Admin</h4>
                <p className="text-xs text-steel-gray">Full access to all features</p>
              </div>
              <div className="rounded-lg border p-4 opacity-50">
                <h4 className="text-sm font-medium text-charcoal-blue mb-1">Manager</h4>
                <p className="text-xs text-steel-gray">Manage projects and team</p>
              </div>
              <div className="rounded-lg border p-4 opacity-50">
                <h4 className="text-sm font-medium text-charcoal-blue mb-1">Member</h4>
                <p className="text-xs text-steel-gray">View and edit assigned projects</p>
              </div>
              <div className="rounded-lg border p-4 opacity-50">
                <h4 className="text-sm font-medium text-charcoal-blue mb-1">Viewer</h4>
                <p className="text-xs text-steel-gray">Read-only access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invitations Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-steel-gray" />
            <h3 className="text-base font-semibold text-charcoal-blue">Pending Invitations</h3>
          </div>
          <div className="ml-8">
            <p className="text-sm text-steel-gray mb-4">
              No pending invitations
            </p>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 rounded-lg bg-sky-blue/10 border border-sky-blue/20 p-4">
          <p className="text-sm text-charcoal-blue">
            <strong>Coming Soon:</strong> Team management features including member invitations, role-based access control, and activity tracking will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
