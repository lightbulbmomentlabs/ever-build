'use client';

import { useState } from 'react';
import { UserWithOrganization } from '@/lib/services/admin.service';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Eye, Shield } from 'lucide-react';
import { UserDetailsDialog } from './user-details-dialog';
import { DeleteUserDialog } from './delete-user-dialog';

interface UsersTableProps {
  users: UserWithOrganization[];
  currentAdminId: string;
}

export function UsersTable({ users, currentAdminId }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithOrganization | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithOrganization | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                User
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Organization
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Joined
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-steel-gray uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-steel-gray uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-steel-gray">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isCurrentAdmin = user.clerk_user_id === currentAdminId;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 font-semibold text-sm">
                            {(user as any).first_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal-blue">
                            {(user as any).first_name && (user as any).last_name
                              ? `${(user as any).first_name} ${(user as any).last_name}`
                              : user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-steel-gray">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-charcoal-blue">
                          {user.organization?.name || 'N/A'}
                        </p>
                        {user.organization && (
                          <p className="text-xs text-steel-gray">
                            Created {formatDistanceToNow(new Date(user.organization.created_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <p className="text-sm text-steel-gray">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {(user as any).is_admin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-steel-gray">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg text-steel-gray hover:bg-gray-100 hover:text-everbuild-orange transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isCurrentAdmin && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-2 rounded-lg text-steel-gray hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {userToDelete && (
        <DeleteUserDialog
          user={userToDelete}
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
        />
      )}
    </>
  );
}
