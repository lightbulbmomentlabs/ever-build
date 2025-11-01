'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  CheckCircle,
  User,
  Globe,
  Monitor,
  Calendar,
  Code,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ErrorDetailsDialogProps {
  error: ErrorLog;
  open: boolean;
  onClose: () => void;
  currentAdminId: string;
}

const severityColors = {
  critical: 'text-red-700 bg-red-100',
  error: 'text-orange-700 bg-orange-100',
  warning: 'text-yellow-700 bg-yellow-100',
};

export function ErrorDetailsDialog({
  error,
  open,
  onClose,
  currentAdminId,
}: ErrorDetailsDialogProps) {
  const [resolving, setResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleResolve = async () => {
    try {
      setResolving(true);

      const response = await fetch(`/api/admin/errors/${error.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resolve error');
      }

      toast({
        title: 'Error resolved',
        description: 'The error has been marked as resolved.',
      });

      onClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resolve error',
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-charcoal-blue flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Severity */}
          <div className="flex items-center gap-3">
            {error.resolved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle className="h-4 w-4" />
                Resolved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Open
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                severityColors[error.severity as keyof typeof severityColors]
              }`}
            >
              {error.severity.toUpperCase()}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-steel-gray">
              {error.error_type}
            </span>
          </div>

          {/* Error Message */}
          <div className="rounded-lg border bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Error Message
            </h3>
            <p className="text-sm text-red-800 font-mono break-all">{error.error_message}</p>
          </div>

          {/* Context Information */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-charcoal-blue mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Context Information
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-steel-gray mt-0.5" />
                <div>
                  <p className="text-xs text-steel-gray">Page URL</p>
                  <p className="text-sm font-medium text-charcoal-blue break-all">{error.page_url}</p>
                </div>
              </div>

              {error.user_action && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-steel-gray mt-0.5" />
                  <div>
                    <p className="text-xs text-steel-gray">User Action</p>
                    <p className="text-sm font-medium text-charcoal-blue">{error.user_action}</p>
                  </div>
                </div>
              )}

              {error.component_name && (
                <div className="flex items-start gap-3">
                  <Code className="h-4 w-4 text-steel-gray mt-0.5" />
                  <div>
                    <p className="text-xs text-steel-gray">Component</p>
                    <p className="text-sm font-medium text-charcoal-blue">{error.component_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-steel-gray mt-0.5" />
                <div>
                  <p className="text-xs text-steel-gray">Occurred At</p>
                  <p className="text-sm font-medium text-charcoal-blue">
                    {format(new Date(error.created_at), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          {error.user_email && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-charcoal-blue mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h3>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-steel-gray">Email</p>
                  <p className="text-sm font-medium text-charcoal-blue">{error.user_email}</p>
                </div>
                {error.clerk_user_id && (
                  <div>
                    <p className="text-xs text-steel-gray">Clerk User ID</p>
                    <p className="text-xs font-mono text-charcoal-blue break-all">
                      {error.clerk_user_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-charcoal-blue mb-3 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Technical Details
            </h3>
            <div className="grid gap-3">
              {error.user_agent && (
                <div>
                  <p className="text-xs text-steel-gray">User Agent</p>
                  <p className="text-xs text-charcoal-blue break-all">{error.user_agent}</p>
                </div>
              )}
              {error.ip_address && (
                <div>
                  <p className="text-xs text-steel-gray">IP Address</p>
                  <p className="text-xs font-mono text-charcoal-blue">{error.ip_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stack Trace */}
          {error.error_stack && (
            <div className="rounded-lg border bg-gray-900 p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Stack Trace
              </h3>
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                {error.error_stack}
              </pre>
            </div>
          )}

          {/* Resolution Section */}
          {error.resolved ? (
            <div className="rounded-lg border bg-green-50 p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolution
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-green-800">Resolved At</p>
                  <p className="text-sm font-medium text-green-900">
                    {error.resolved_at ? format(new Date(error.resolved_at), 'PPpp') : 'N/A'}
                  </p>
                </div>
                {error.resolution_notes && (
                  <div>
                    <p className="text-xs text-green-800">Notes</p>
                    <p className="text-sm text-green-900">{error.resolution_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-charcoal-blue mb-3">
                Mark as Resolved
              </h3>
              <Textarea
                placeholder="Add resolution notes (optional)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={onClose} disabled={resolving}>
                  Cancel
                </Button>
                <Button onClick={handleResolve} disabled={resolving}>
                  {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
