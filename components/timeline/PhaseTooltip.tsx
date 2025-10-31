'use client';

/**
 * Phase Tooltip Component
 *
 * Rich hover card displaying comprehensive phase information
 * - Phase name, description, dates, status
 * - Progress indicator with percentage
 * - Assigned contacts with roles
 * - Predecessor phase information
 * - Edit button to open phase editor modal
 */

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Link as LinkIcon, Pencil } from 'lucide-react';
import type { PhaseWithContacts } from '@/lib/services/phase.service';

interface PhaseTooltipProps {
  phase: PhaseWithContacts;
  children: React.ReactNode;
  onEditClick?: () => void;
}

// Helper function to format dates
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper function to get status badge variant and color
const getStatusDisplay = (status: PhaseWithContacts['status']) => {
  switch (status) {
    case 'completed':
      return { variant: 'default' as const, label: 'Completed', icon: CheckCircle, className: 'bg-success-green text-white' };
    case 'in_progress':
      return { variant: 'default' as const, label: 'In Progress', icon: Clock, className: 'bg-blueprint-teal text-white' };
    case 'delayed':
      return { variant: 'destructive' as const, label: 'Delayed', icon: AlertCircle, className: 'bg-error-red text-white' };
    case 'blocked':
      return { variant: 'destructive' as const, label: 'Blocked', icon: AlertCircle, className: 'bg-error-red text-white' };
    case 'not_started':
    default:
      return { variant: 'secondary' as const, label: 'Not Started', icon: Calendar, className: 'bg-steel-gray text-white' };
  }
};

export function PhaseTooltip({ phase, children, onEditClick }: PhaseTooltipProps) {
  const statusDisplay = getStatusDisplay(phase.status);
  const StatusIcon = statusDisplay.icon;

  // Calculate duration
  const durationDays = ((phase as any).planned_duration_days || 0) + ((phase as any).buffer_days || 0);

  // Format dates
  const startDate = formatDate((phase as any).planned_start_date);
  const [year, month, day] = (phase as any).planned_start_date.split('-').map(Number);
  const startTime = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
  const endDate = new Date(startTime + durationDays * 24 * 60 * 60 * 1000);
  const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <HoverCard openDelay={500} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 !z-[9999]" side="top" align="center">
        <div className="space-y-3">
          {/* Phase Name & Type */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-charcoal-blue leading-tight">
                {phase.name}
              </h4>
              <Badge className={statusDisplay.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusDisplay.label}
              </Badge>
            </div>
            {phase.description && (
              <p className="text-xs text-steel-gray mt-1 line-clamp-2">
                {phase.description}
              </p>
            )}
          </div>

          {/* Dates & Duration */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-steel-gray">
              <Calendar className="h-3.5 w-3.5 text-blueprint-teal" />
              <span className="font-medium">Start:</span>
              <span>{startDate}</span>
            </div>
            <div className="flex items-center gap-2 text-steel-gray">
              <Calendar className="h-3.5 w-3.5 text-blueprint-teal" />
              <span className="font-medium">End:</span>
              <span>{formattedEndDate}</span>
            </div>
            <div className="flex items-center gap-2 text-steel-gray">
              <Clock className="h-3.5 w-3.5 text-blueprint-teal" />
              <span className="font-medium">Duration:</span>
              <span>{durationDays} days</span>
              {(phase as any).buffer_days > 0 && (
                <span className="text-xs text-steel-gray">
                  ({(phase as any).planned_duration_days}d + {(phase as any).buffer_days}d buffer)
                </span>
              )}
            </div>
          </div>

          {/* Progress Indicator (if available) */}
          {(phase as any).computed_progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal-blue">Progress</span>
                <span className="text-steel-gray">{Math.round((phase as any).computed_progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-success-green h-full rounded-full transition-all duration-300"
                  style={{ width: `${(phase as any).computed_progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Assigned Contacts */}
          {phase.phase_contacts && phase.phase_contacts.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-blue">
                <Users className="h-3.5 w-3.5 text-blueprint-teal" />
                <span>Assigned Contacts ({phase.phase_contacts.length})</span>
              </div>
              <div className="space-y-1">
                {phase.phase_contacts.slice(0, 3).map((pc) => (
                  <div
                    key={pc.id}
                    className="flex items-start gap-2 text-xs text-steel-gray pl-5"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-charcoal-blue">
                        {pc.contact.company_name}
                      </div>
                      <div className="text-xs">
                        {pc.contact.trade}
                        {pc.role && ` • ${pc.role}`}
                      </div>
                    </div>
                  </div>
                ))}
                {phase.phase_contacts.length > 3 && (
                  <div className="text-xs text-steel-gray pl-5">
                    +{phase.phase_contacts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Predecessor Phase */}
          {phase.predecessor_phase_id && (
            <div className="flex items-center gap-1.5 text-xs text-steel-gray pt-1 border-t">
              <LinkIcon className="h-3.5 w-3.5 text-blueprint-teal" />
              <span className="font-medium">Depends on previous phase</span>
            </div>
          )}

          {/* Edit Button */}
          {onEditClick && (
            <div className="pt-2 border-t mt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick();
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                {(phase as any).is_task ? 'Edit Task' : 'Edit Phase'}
              </Button>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
