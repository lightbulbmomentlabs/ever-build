'use client';

/**
 * Delete Phase Confirmation Dialog
 *
 * Confirmation dialog for deleting phases with safety checks
 */

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface DeletePhaseDialogProps {
  phaseId: string;
  phaseName: string;
  hasAssignedContacts?: boolean;
  hasDependentPhases?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeletePhaseDialog({
  phaseId,
  phaseName,
  hasAssignedContacts = false,
  hasDependentPhases = false,
  trigger,
  onSuccess,
}: DeletePhaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/phases/${phaseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete phase');
      }

      toast({
        title: 'Phase Deleted',
        description: `${phaseName} has been deleted successfully.`,
      });

      setOpen(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete phase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="text-error-red hover:text-error-red">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-amber" />
            Delete Phase?
          </AlertDialogTitle>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Are you sure you want to delete <span className="font-semibold">{phaseName}</span>?
              This action cannot be undone.
            </p>

            {(hasAssignedContacts || hasDependentPhases) && (
              <div className="rounded-md bg-warning-amber/10 p-3 text-sm text-warning-amber">
                <p className="font-semibold mb-1">Warning:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {hasAssignedContacts && (
                    <li>This phase has assigned contacts that will be unassigned</li>
                  )}
                  {hasDependentPhases && (
                    <li>Other phases depend on this phase - their dependencies will be removed</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Phase
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
