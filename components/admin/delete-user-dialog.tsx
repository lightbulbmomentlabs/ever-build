'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserWithOrganization } from '@/lib/services/admin.service';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeleteUserDialogProps {
  user: UserWithOrganization;
  open: boolean;
  onClose: () => void;
}

export function DeleteUserDialog({ user, open, onClose }: DeleteUserDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast({
        title: 'User deleted',
        description: `${user.email} and all associated data have been permanently deleted.`,
      });

      onClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Delete User</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to permanently delete <strong>{user.email}</strong>?
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-900 font-semibold mb-2">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                <li>User account and profile</li>
                <li>All projects created by this user</li>
                <li>All phases, tasks, and documents</li>
                <li>All contacts</li>
                {user.organization && (
                  <li>
                    <strong>The entire organization "{user.organization.name}"</strong> if this is the only member
                  </li>
                )}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
