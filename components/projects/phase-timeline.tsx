'use client';

/**
 * Phase Timeline Component
 *
 * Displays project phases in a timeline view with full CRUD operations
 * Includes drag-and-drop reordering and visual Gantt chart view
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SendSMSModal } from '@/components/sms/send-sms-modal';
import { PhaseFormModal } from '@/components/phases/phase-form-modal';
import { DeletePhaseDialog } from '@/components/phases/delete-phase-dialog';
import { QuickAssignContact } from '@/components/phases/quick-assign-contact';
import { TaskQuickAddButton } from '@/components/phases/task-quick-add-button';
import { GripVertical, CheckCircle2, Calendar, Clock, Users, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { usePhaseExpandState } from '@/hooks/use-phase-expand-state';
import { getPhaseColorStyles } from '@/lib/constants/phase-colors';

type PhaseContact = {
  id: string;
  role: string | null;
  contact: {
    id: string;
    company_name: string;
    contact_person: string;
    phone_primary: string;
    trade: string;
  };
};

type Phase = {
  id: string;
  name: string;
  description?: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  sequence_order: number;
  planned_start_date: string;
  planned_duration_days: number;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  buffer_days: number;
  predecessor_phase_id?: string | null;
  phase_contacts?: PhaseContact[];
  color?: string | null;
  metadata?: any;
  // Hierarchy fields
  parent_phase_id?: string | null;
  is_task: boolean;
  tasks?: Phase[];
  computed_progress?: number;
};

interface PhaseTimelineProps {
  projectId: string;
  phases: Phase[];
}

const statusColors = {
  not_started: 'bg-steel-gray/30 text-steel-gray border border-steel-gray/40',
  in_progress: 'bg-blueprint-teal/30 text-blueprint-teal border border-blueprint-teal/40',
  completed: 'bg-success-green/30 text-success-green border border-success-green/40',
  delayed: 'bg-warning-amber/30 text-warning-amber border border-warning-amber/40',
  blocked: 'bg-error-red/30 text-error-red border border-error-red/40',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  delayed: 'Delayed',
  blocked: 'Blocked',
};

// Sortable Phase Card Component
function SortablePhaseCard({
  phase,
  projectId,
  sortedPhases,
  hasDependentPhases,
  handleStatusUpdate,
  isLoading,
  formatDate,
  calculateEndDate,
  nestingLevel = 0,
  isExpanded,
  onToggleExpand,
  isTask = false,
}: {
  phase: Phase;
  projectId: string;
  sortedPhases: Phase[];
  hasDependentPhases: (phaseId: string) => boolean;
  handleStatusUpdate: (phaseId: string, newStatus: Phase['status']) => Promise<void>;
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  calculateEndDate: (startDate: string, durationDays: number, bufferDays: number) => Date;
  nestingLevel?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isTask?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const endDate = calculateEndDate(
    phase.planned_start_date,
    phase.planned_duration_days,
    phase.buffer_days
  );

  const actualDuration = phase.actual_start_date && phase.actual_end_date
    ? Math.ceil(
        (new Date(phase.actual_end_date).getTime() -
          new Date(phase.actual_start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const phaseColorStyles = getPhaseColorStyles(phase.color);

  // Calculate left margin based on nesting level
  const leftMargin = nestingLevel * 2; // 2rem per level

  // Determine if we should show collapsed view (works for both phases and tasks)
  const showCollapsedView = isExpanded === false;

  // Calculate progress percentage for visualization
  const progressPercentage = !isTask && phase.computed_progress !== undefined
    ? phase.computed_progress
    : phase.status === 'completed'
    ? 100
    : phase.status === 'in_progress'
    ? 50
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: phaseColorStyles.hex,
        borderLeftWidth: isTask ? '2px' : '4px',
        marginLeft: `${leftMargin}rem`,
      }}
      className={`group rounded-lg border transition-all duration-300 hover:shadow-md relative overflow-hidden ${
        isTask ? 'bg-gray-50/50 p-3 md:p-4' : 'bg-white p-4 md:p-6'
      }`}
    >
      {/* Visual connector for nested phases */}
      {nestingLevel > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"
          style={{ left: '-1rem' }}
        />
      )}

      {/* Mobile: Stack vertically */}
      <div className="flex flex-col md:hidden gap-3">
        {/* Top row: Expand, Badge, Name */}
        <div className="flex items-start gap-2">
          {/* Expand/Collapse icon */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-steel-gray hover:text-charcoal-blue transition-colors flex-shrink-0 p-2 -ml-2"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronDown className={`${isTask ? 'h-4 w-4' : 'h-5 w-5'}`} />
              ) : (
                <ChevronRight className={`${isTask ? 'h-4 w-4' : 'h-5 w-5'}`} />
              )}
            </button>
          )}

          <span
            className={`flex items-center justify-center rounded-full text-sm font-semibold text-white flex-shrink-0 ${isTask ? 'h-6 w-6 text-xs' : 'h-7 w-7'}`}
            style={{ backgroundColor: phaseColorStyles.hex }}
          >
            {phase.sequence_order}
          </span>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-charcoal-blue ${isTask ? 'text-sm' : 'text-base'}`}>
              {phase.name}
            </h3>

            {/* Task count and progress for phases */}
            {!isTask && phase.tasks && phase.tasks.length > 0 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-steel-gray">
                  {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
                </span>
                {phase.computed_progress !== undefined && (
                  <span className="text-xs text-steel-gray">
                    {phase.computed_progress}% complete
                  </span>
                )}
              </div>
            )}
          </div>

          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
              statusColors[phase.status]
            }`}
          >
            {statusLabels[phase.status]}
          </span>
        </div>

        {/* Progress Bar */}
        {!isTask && (
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full origin-left animate-grow-width"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: phaseColorStyles.hex,
              }}
            />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-2 justify-end">
          {phase.status === 'not_started' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(phase.id, 'in_progress')}
              disabled={isLoading}
              className="min-h-[44px] flex-1"
            >
              Start
            </Button>
          )}

          {phase.status === 'in_progress' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(phase.id, 'completed')}
              disabled={isLoading}
              className="min-h-[44px] flex-1"
            >
              Mark Done
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="min-h-[44px] min-w-[44px] flex-shrink-0"
                disabled={isLoading}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <PhaseFormModal
                projectId={projectId}
                phase={phase}
                phases={sortedPhases}
                onSuccess={() => {
                  window.location.reload();
                }}
                trigger={
                  <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded">
                    Edit Phase
                  </button>
                }
              />
              <QuickAssignContact
                phaseId={phase.id}
                phaseName={phase.name}
                assignedContactIds={phase.phase_contacts?.filter(pc => pc.contact).map(pc => pc.contact.id) || []}
                onSuccess={() => {
                  window.location.reload();
                }}
                trigger={
                  <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded">
                    Assign Contact
                  </button>
                }
              />
              {!phase.is_task && (
                <TaskQuickAddButton
                  phaseId={phase.id}
                  phaseName={phase.name}
                  phaseColor={phase.color}
                  phaseStartDate={phase.planned_start_date}
                  existingTasks={phase.tasks || []}
                  onSuccess={() => {
                    window.location.reload();
                  }}
                  trigger={
                    <button className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded">
                      Add Task
                    </button>
                  }
                />
              )}
              <DeletePhaseDialog
                phaseId={phase.id}
                phaseName={phase.name}
                hasAssignedContacts={phase.phase_contacts && phase.phase_contacts.length > 0}
                hasDependentPhases={hasDependentPhases(phase.id)}
                trigger={
                  <button className="w-full text-left px-2 py-2 text-sm text-error-red hover:bg-gray-100 rounded">
                    Delete
                  </button>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-start justify-between">
        <div className="flex items-start gap-2 md:gap-3 flex-1">
          {/* Drag Handle */}
          <button
            className="mt-1 cursor-grab active:cursor-grabbing text-steel-gray hover:text-charcoal-blue flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 md:gap-3">
              {/* Expand/Collapse icon for both phases and tasks */}
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="text-steel-gray hover:text-charcoal-blue transition-colors flex-shrink-0 p-2 -ml-2"
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                  {isExpanded ? (
                    <ChevronDown className={`${isTask ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  ) : (
                    <ChevronRight className={`${isTask ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  )}
                </button>
              )}

              <span
                className={`flex items-center justify-center rounded-full text-sm font-semibold text-white flex-shrink-0 ${isTask ? 'h-6 w-6 text-xs' : 'h-8 w-8'}`}
                style={{ backgroundColor: phaseColorStyles.hex }}
              >
                {phase.sequence_order}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-charcoal-blue ${isTask ? 'text-base' : 'text-xl'} truncate`}>
                    {phase.name}
                  </h3>

                  {/* Duration Mode Badge for phases with tasks */}
                  {!isTask && phase.tasks && phase.tasks.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 flex-shrink-0">
                      Auto-Calculated
                    </span>
                  )}

                  {/* Task count and progress indicator for phases */}
                  {!isTask && phase.tasks && phase.tasks.length > 0 && (
                    <span className="text-sm text-steel-gray flex-shrink-0">
                      ({phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''})
                      {phase.computed_progress !== undefined && (
                        <span className="ml-1">
                          • {phase.computed_progress}%
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Progress Bar - Inline with header for phases */}
                {!isTask && (
                  <div className="w-full max-w-xs h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full origin-left animate-grow-width"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: phaseColorStyles.hex,
                      }}
                    />
                  </div>
                )}

                {/* Description - Hidden when collapsed on mobile, visible on desktop */}
                {phase.description && !showCollapsedView && (
                  <p className="mt-1 text-sm text-steel-gray hidden md:block">
                    {phase.description}
                  </p>
                )}
                {phase.description && showCollapsedView && (
                  <p className="mt-1 text-sm text-steel-gray line-clamp-1 hidden md:block">
                    {phase.description}
                  </p>
                )}
              </div>
            </div>

            {/* Expandable Details Section - hidden when collapsed (Desktop only) */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showCollapsedView ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
              }`}
            >
            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-steel-gray">Planned Start</p>
                <p className="mt-1 text-sm text-charcoal-blue">
                  {formatDate(phase.planned_start_date)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-steel-gray">Planned End</p>
                <p className="mt-1 text-sm text-charcoal-blue">
                  {formatDate(`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-steel-gray">Duration</p>
                <p className="mt-1 text-sm text-charcoal-blue">
                  {phase.planned_duration_days} days
                  {phase.buffer_days > 0 && (
                    <span className="text-steel-gray">
                      {' '}
                      (+{phase.buffer_days} buffer)
                    </span>
                  )}
                  {/* Show auto-calculated indicator */}
                  {!isTask && phase.tasks && phase.tasks.length > 0 && (
                    <span className="block text-xs text-green-600 mt-1">
                      ✓ Auto-calculated from tasks
                    </span>
                  )}
                </p>
              </div>

              {phase.actual_start_date && (
                <div>
                  <p className="text-xs font-medium text-steel-gray">Actual Start</p>
                  <p className="mt-1 text-sm text-charcoal-blue">
                    {formatDate(phase.actual_start_date)}
                  </p>
                </div>
              )}

              {phase.actual_end_date && (
                <div>
                  <p className="text-xs font-medium text-steel-gray">Actual End</p>
                  <p className="mt-1 text-sm text-charcoal-blue">
                    {formatDate(phase.actual_end_date)}
                  </p>
                </div>
              )}

              {actualDuration && (
                <div>
                  <p className="text-xs font-medium text-steel-gray">
                    Actual Duration
                  </p>
                  <p className="mt-1 text-sm text-charcoal-blue">
                    {actualDuration} days
                  </p>
                </div>
              )}
            </div>

            {/* Assigned Contacts */}
            {phase.phase_contacts && phase.phase_contacts.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-steel-gray mb-2">
                  Assigned Contacts
                </p>
                <div className="space-y-2">
                  {phase.phase_contacts.filter(pc => pc.contact).map((pc) => (
                    <div
                      key={pc.id}
                      className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal-blue">
                          {pc.contact.company_name} ({pc.contact.trade})
                        </p>
                        <p className="text-xs text-steel-gray">
                          {pc.contact.contact_person}
                          {pc.role && ` • ${pc.role}`}
                        </p>
                      </div>
                      <SendSMSModal
                        contactId={pc.contact.id}
                        contactName={pc.contact.contact_person}
                        contactPhone={pc.contact.phone_primary}
                        projectId={projectId}
                        phaseId={phase.id}
                        phaseName={phase.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
            {/* End Expandable Details Section */}
          </div>
        </div>

        <div className="ml-2 md:ml-4 flex flex-col items-end gap-2">
          <span
            className={`inline-flex rounded-full px-2 md:px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              statusColors[phase.status]
            }`}
          >
            {statusLabels[phase.status]}
          </span>

          {/* Desktop: All buttons visible */}
          <div className="flex gap-2">
            {phase.status === 'not_started' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(phase.id, 'in_progress')}
                disabled={isLoading}
              >
                Start
              </Button>
            )}

            {phase.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate(phase.id, 'completed')}
                disabled={isLoading}
              >
                Mark Done
              </Button>
            )}

            <PhaseFormModal
              projectId={projectId}
              phase={phase}
              phases={sortedPhases}
              onSuccess={() => {
                window.location.reload();
              }}
            />

            <QuickAssignContact
              phaseId={phase.id}
              phaseName={phase.name}
              assignedContactIds={phase.phase_contacts?.filter(pc => pc.contact).map(pc => pc.contact.id) || []}
              onSuccess={() => {
                window.location.reload();
              }}
            />

            {!phase.is_task && (
              <TaskQuickAddButton
                phaseId={phase.id}
                phaseName={phase.name}
                phaseColor={phase.color}
                phaseStartDate={phase.planned_start_date}
                existingTasks={phase.tasks || []}
                onSuccess={() => {
                  window.location.reload();
                }}
              />
            )}

            <DeletePhaseDialog
              phaseId={phase.id}
              phaseName={phase.name}
              hasAssignedContacts={phase.phase_contacts && phase.phase_contacts.length > 0}
              hasDependentPhases={hasDependentPhases(phase.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhaseTimeline({ projectId, phases }: PhaseTimelineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localPhases, setLocalPhases] = useState(phases);
  const [isMounted, setIsMounted] = useState(false);

  const { toast } = useToast();

  // Expand/collapse state for phases
  const { expandedPhases, togglePhase, expandAll, collapseAll, isExpanded } =
    usePhaseExpandState(projectId, localPhases);

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update local phases when prop changes
  useEffect(() => {
    setLocalPhases(phases);
  }, [phases]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const calculateEndDate = (startDate: string, durationDays: number, bufferDays: number) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const totalDays = durationDays + bufferDays;
    const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return end;
  };

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusUpdate = async (phaseId: string, newStatus: Phase['status']) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/phases/${phaseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update phase status');
      }

      toast({
        title: 'Status Updated',
        description: 'Phase status has been updated successfully.',
      });

      window.location.reload();
    } catch (error) {
      console.error('Error updating phase status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update phase status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag end - reorder phases
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedPhases.findIndex((p) => p.id === active.id);
    const newIndex = sortedPhases.findIndex((p) => p.id === over.id);

    // Optimistically update UI
    const newPhases = arrayMove(sortedPhases, oldIndex, newIndex).map((phase, index) => ({
      ...phase,
      sequence_order: index + 1,
    }));

    setLocalPhases(newPhases);

    // Update sequence orders in backend
    try {
      const phaseToUpdate = newPhases[newIndex];
      const response = await fetch(`/api/phases/${phaseToUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence_order: newIndex + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update phase order');
      }

      toast({
        title: 'Phase Reordered',
        description: 'Phase order has been updated successfully.',
      });

      // Refresh to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating phase order:', error);
      // Revert optimistic update
      setLocalPhases(phases);
      toast({
        title: 'Error',
        description: 'Failed to update phase order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (phases.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-steel-gray mb-4">
          No phases yet. Add your first phase to start planning the project timeline.
        </p>
        <PhaseFormModal
          projectId={projectId}
          phases={[]}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>
    );
  }

  const sortedPhases = [...localPhases].sort((a, b) => a.sequence_order - b.sequence_order);

  // Get top-level phases (not tasks) for card view
  const topLevelPhases = sortedPhases.filter((p) => !p.is_task);

  // Check if phase has dependent phases
  const hasDependentPhases = (phaseId: string) => {
    return sortedPhases.some((p) => p.predecessor_phase_id === phaseId);
  };

  // Calculate nesting level for a phase based on predecessor chain
  const getPhaseDependencyDepth = (phase: Phase, allPhases: Phase[]): number => {
    if (!phase.predecessor_phase_id) return 0;

    const visited = new Set<string>();
    let depth = 0;
    let currentPhaseId = phase.predecessor_phase_id;

    while (currentPhaseId) {
      if (visited.has(currentPhaseId)) break; // Prevent infinite loops
      visited.add(currentPhaseId);
      depth++;

      const predecessor = allPhases.find((p) => p.id === currentPhaseId);
      if (!predecessor || !predecessor.predecessor_phase_id) break;
      currentPhaseId = predecessor.predecessor_phase_id;
    }

    return depth;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-3 md:gap-4">
          <h3 className="text-base md:text-lg font-semibold text-charcoal-blue">
            {sortedPhases.length} Phase{sortedPhases.length !== 1 ? 's' : ''}
          </h3>

          {/* Expand/Collapse All buttons */}
          {topLevelPhases.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-10 md:h-8 text-xs min-h-[44px] md:min-h-0"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 md:h-8 text-xs min-h-[44px] md:min-h-0"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </div>
          )}
        </div>

        <PhaseFormModal
          projectId={projectId}
          phases={sortedPhases}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      </div>

      {/* Card View with Drag-and-Drop */}
      {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={topLevelPhases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {topLevelPhases.map((phase) => (
                    <div key={phase.id}>
                      <SortablePhaseCard
                        phase={phase}
                        projectId={projectId}
                        sortedPhases={sortedPhases}
                        hasDependentPhases={hasDependentPhases}
                        handleStatusUpdate={handleStatusUpdate}
                        isLoading={isLoading}
                        formatDate={formatDate}
                        calculateEndDate={calculateEndDate}
                        nestingLevel={getPhaseDependencyDepth(phase, sortedPhases)}
                        isExpanded={isExpanded(phase.id)}
                        onToggleExpand={() => togglePhase(phase.id)}
                      />
                      {/* Render tasks when expanded */}
                      {isExpanded(phase.id) && phase.tasks && phase.tasks.length > 0 && (
                        <div className="ml-8 mt-3 space-y-3">
                          {phase.tasks.map((task) => (
                            <SortablePhaseCard
                              key={task.id}
                              phase={task}
                              projectId={projectId}
                              sortedPhases={sortedPhases}
                              hasDependentPhases={hasDependentPhases}
                              handleStatusUpdate={handleStatusUpdate}
                              isLoading={isLoading}
                              formatDate={formatDate}
                              calculateEndDate={calculateEndDate}
                              nestingLevel={0}
                              isExpanded={isExpanded(task.id)}
                              onToggleExpand={() => togglePhase(task.id)}
                              isTask={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-4">
              {topLevelPhases.map((phase) => (
                <div key={phase.id}>
                  <SortablePhaseCard
                    phase={phase}
                    projectId={projectId}
                    sortedPhases={sortedPhases}
                    hasDependentPhases={hasDependentPhases}
                    handleStatusUpdate={handleStatusUpdate}
                    isLoading={isLoading}
                    formatDate={formatDate}
                    calculateEndDate={calculateEndDate}
                    nestingLevel={getPhaseDependencyDepth(phase, sortedPhases)}
                    isExpanded={isExpanded(phase.id)}
                    onToggleExpand={() => togglePhase(phase.id)}
                  />
                  {/* Render tasks when expanded */}
                  {isExpanded(phase.id) && phase.tasks && phase.tasks.length > 0 && (
                    <div className="ml-8 mt-3 space-y-3">
                      {phase.tasks.map((task) => (
                        <SortablePhaseCard
                          key={task.id}
                          phase={task}
                          projectId={projectId}
                          sortedPhases={sortedPhases}
                          hasDependentPhases={hasDependentPhases}
                          handleStatusUpdate={handleStatusUpdate}
                          isLoading={isLoading}
                          formatDate={formatDate}
                          calculateEndDate={calculateEndDate}
                          nestingLevel={0}
                          isExpanded={isExpanded(task.id)}
                          onToggleExpand={() => togglePhase(task.id)}
                          isTask={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
