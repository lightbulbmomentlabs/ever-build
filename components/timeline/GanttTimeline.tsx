'use client';

/**
 * Gantt Timeline Component
 *
 * Main timeline wrapper using react-calendar-timeline library
 * Supports drag-and-drop, multiple zoom levels, and dependencies
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineMarkers,
  CustomMarker,
  TimelineItemBase,
  TimelineGroupBase,
} from 'react-calendar-timeline';
import 'react-calendar-timeline/dist/style.css';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, CalendarDays, CheckCircle2, Clock, AlertCircle, Circle, ChevronRight, ChevronDown, RotateCw } from 'lucide-react';
import type { PhaseWithContacts } from '@/lib/services/phase.service';
import { PhaseTooltip } from './PhaseTooltip';
import { getPhaseColorStyles } from '@/lib/constants/phase-colors';
import { PhaseFormModal } from '@/components/phases/phase-form-modal';
import { ContactAvatar } from '@/components/contacts/contact-avatar';
import { useMobileContext } from '@/lib/hooks/use-mobile';

// Type definition for custom item renderer
interface ItemRendererProps<CustomItem extends TimelineItemBase<number>> {
  item: CustomItem;
  timelineContext: any;
  itemContext: any;
  getItemProps: (params?: any) => any;
  getResizeProps: (params?: any) => {
    left: any;
    right: any;
  };
}

// Zoom level configurations in milliseconds
const ZOOM_LEVELS = {
  week: {
    visibleTimeStart: 7 * 24 * 60 * 60 * 1000, // 7 days
    visibleTimeEnd: 7 * 24 * 60 * 60 * 1000,
    minZoom: 1 * 24 * 60 * 60 * 1000, // 1 day
    maxZoom: 14 * 24 * 60 * 60 * 1000, // 14 days
  },
  month: {
    visibleTimeStart: 30 * 24 * 60 * 60 * 1000, // 30 days
    visibleTimeEnd: 30 * 24 * 60 * 60 * 1000,
    minZoom: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxZoom: 60 * 24 * 60 * 60 * 1000, // 60 days
  },
  quarter: {
    visibleTimeStart: 90 * 24 * 60 * 60 * 1000, // 90 days
    visibleTimeEnd: 90 * 24 * 60 * 60 * 1000,
    minZoom: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxZoom: 120 * 24 * 60 * 60 * 1000, // 120 days
  },
  year: {
    visibleTimeStart: 365 * 24 * 60 * 60 * 1000, // 365 days
    visibleTimeEnd: 365 * 24 * 60 * 60 * 1000,
    minZoom: 90 * 24 * 60 * 60 * 1000, // 90 days
    maxZoom: 730 * 24 * 60 * 60 * 1000, // 2 years
  },
} as const;

type ZoomLevel = keyof typeof ZOOM_LEVELS;

interface GanttTimelineProps {
  projectId: string;
  phases: PhaseWithContacts[];
  onPhaseClick?: (phaseId: string) => void;
}

export function GanttTimeline({ projectId, phases, onPhaseClick }: GanttTimelineProps) {
  const router = useRouter();
  const { isMobile, isPortrait, isLandscape } = useMobileContext();

  // All hooks must be declared before any conditional returns
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');
  const [isSaving, setIsSaving] = useState(false);
  const [visibleTimeStart, setVisibleTimeStart] = useState<number | undefined>(undefined);
  const [visibleTimeEnd, setVisibleTimeEnd] = useState<number | undefined>(undefined);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [localPhases, setLocalPhases] = useState<PhaseWithContacts[]>(phases);
  const [sidebarWidth, setSidebarWidth] = useState(200); // Default 200px
  const [isResizing, setIsResizing] = useState(false);
  const timelineRef = useRef<any>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Sync local phases with server-provided phases prop
  useEffect(() => {
    setLocalPhases(phases);
  }, [phases]);

  // Handle sidebar resize
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const container = timelineContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;

    // Constrain width between 150px and 400px
    const constrainedWidth = Math.max(150, Math.min(400, newWidth));
    setSidebarWidth(constrainedWidth);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse move and mouse up listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Trigger modal open when editingPhaseId changes
  useEffect(() => {
    if (editingPhaseId && editButtonRef.current) {
      editButtonRef.current.click();
    }
  }, [editingPhaseId]);

  // Toggle phase expansion (memoized to prevent useEffect re-runs)
  const togglePhaseExpansion = useCallback((phaseId: string) => {
    console.log('GanttTimeline: Toggling phase expansion for:', phaseId);
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
        console.log('GanttTimeline: Expanded phase:', phaseId);
      } else {
        next.add(phaseId);
        console.log('GanttTimeline: Collapsed phase:', phaseId);
      }
      return next;
    });
  }, []);

  // Helper function to calculate end date from start date and duration
  // Creates dates at midnight in local timezone to match timeline day markers
  const calculateEndDate = (startDate: string, durationDays: number, bufferDays: number): Date => {
    const [year, month, day] = startDate.split('-').map(Number);
    // Create date at midnight local time (this matches what the timeline library expects)
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const totalDays = durationDays + bufferDays;
    return new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
  };

  // Get current time period boundaries based on zoom level
  const currentPeriod = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (zoomLevel) {
      case 'week': {
        // Highlight current day
        const dayStart = today.getTime();
        const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();
        return { start: dayStart, end: dayEnd };
      }
      case 'month': {
        // Highlight current week (Monday to Sunday)
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
        const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
        return { start: weekStart.getTime(), end: weekEnd.getTime() };
      }
      case 'quarter':
      case 'year': {
        // Highlight current month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart.getTime(), end: monthEnd.getTime() };
      }
    }
  }, [zoomLevel]);

  // Transform phases into timeline groups (rows)
  const groups = useMemo(() => {
    const result: {
      id: string;
      title: string;
      root?: boolean;
      stackItems?: boolean;
      height?: number;
    }[] = [];

    // Separate phases and tasks
    const topLevelPhases = localPhases.filter((p) => !p.parent_phase_id && !p.is_task);

    topLevelPhases.forEach((phase) => {
      // Get child tasks for this phase
      const childTasks = localPhases.filter((p) => p.parent_phase_id === phase.id);
      const isExpanded = !collapsedPhases.has(phase.id);
      const hasChildren = childTasks.length > 0;

      // Add the parent phase (title will be rendered by groupRenderer)
      result.push({
        id: phase.id,
        title: phase.name, // Keep as string - groupRenderer will handle custom rendering
        root: true,
        stackItems: false,
      });

      // Add child tasks only if phase is expanded
      if (isExpanded && hasChildren) {
        childTasks.forEach((task) => {
          result.push({
            id: task.id,
            title: task.name, // Keep as string - groupRenderer will add the prefix
            stackItems: false,
          });
        });
      }
    });

    return result;
  }, [localPhases, collapsedPhases]);

  // Transform phases into timeline items (bars)
  const items = useMemo(() => {
    console.log('GanttTimeline: Transforming phases into items', { phaseCount: localPhases.length });

    return localPhases
      .filter((phase) => {
        // Always show top-level phases
        if (!phase.is_task && !phase.parent_phase_id) return true;

        // For tasks, only show if parent phase is expanded
        if (phase.is_task && phase.parent_phase_id) {
          return !collapsedPhases.has(phase.parent_phase_id);
        }

        return true;
      })
      .map((phase) => {
      // Use planned_start_date if available, fallback to start_date
      const startDateStr = (phase as any).planned_start_date || (phase as any).start_date;

      // Parse start date at midnight local time (matches timeline day markers)
      const [year, month, day] = startDateStr.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const startTime = startDate.getTime();

      // Use planned_end_date if available (respects manual timeline adjustments),
      // otherwise calculate from duration
      let endDate: Date;
      if ((phase as any).planned_end_date) {
        // Use the stored end date (which may have been manually adjusted via timeline dragging)
        const endDateStr = (phase as any).planned_end_date;
        const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
        endDate = new Date(eYear, eMonth - 1, eDay, 0, 0, 0, 0);
      } else if ((phase as any).planned_duration_days !== undefined) {
        // Calculate from duration
        const durationDays = (phase as any).planned_duration_days || 0;
        const bufferDays = (phase as any).buffer_days || 0;
        endDate = calculateEndDate(startDateStr, durationDays, bufferDays);
      } else {
        // Fallback to end_date field if it exists
        const endDateStr = (phase as any).end_date;
        const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
        endDate = new Date(eYear, eMonth - 1, eDay, 0, 0, 0, 0);
      }

      // Add 1 day to end_time to make it inclusive (timeline library treats end_time as exclusive)
      // This ensures the bar extends through the entire end date
      const endTime = endDate.getTime() + 24 * 60 * 60 * 1000;

      console.log(`GanttTimeline: Phase "${phase.name}"`, {
        startDateStr,
        startTime,
        endTime,
        duration: (phase as any).planned_duration_days,
        buffer: (phase as any).buffer_days,
      });

      return {
        id: phase.id,
        group: phase.id, // Each phase/task has its own group row
        title: phase.name,
        start_time: startTime,
        end_time: endTime,
        itemProps: {
          className: phase.is_task ? 'timeline-task' : 'timeline-phase',
          'data-phase-id': phase.id,
          'data-status': phase.status,
          'data-is-task': phase.is_task ? 'true' : 'false',
        },
      };
    });
  }, [localPhases, collapsedPhases]);

  // Calculate timeline bounds based on project phases
  const { defaultTimeStart, defaultTimeEnd } = useMemo(() => {
    // Default fallback values
    const now = new Date();
    const fallbackStart = now.getTime();
    const fallbackEnd = now.getTime() + 30 * 24 * 60 * 60 * 1000;

    if (phases.length === 0) {
      return {
        defaultTimeStart: fallbackStart,
        defaultTimeEnd: fallbackEnd,
      };
    }

    // Filter out invalid dates and convert to timestamps (midnight local time)
    const startDates = phases
      .map((p) => {
        const startDateStr = (p as any).planned_start_date || (p as any).start_date;
        const [year, month, day] = startDateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
      })
      .filter((time) => !isNaN(time) && isFinite(time));

    const endDates = phases
      .map((p) => {
        const startDateStr = (p as any).planned_start_date || (p as any).start_date;
        if ((p as any).planned_duration_days !== undefined) {
          const durationDays = (p as any).planned_duration_days || 0;
          const bufferDays = (p as any).buffer_days || 0;
          const endDate = calculateEndDate(startDateStr, durationDays, bufferDays);
          // Add 1 day to make end dates inclusive for timeline display
          return endDate.getTime() + 24 * 60 * 60 * 1000;
        } else {
          const endDateStr = (p as any).end_date;
          // Add 1 day to make end dates inclusive for timeline display
          return new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000;
        }
      })
      .filter((time) => !isNaN(time) && isFinite(time));

    // If no valid dates found, use fallback
    if (startDates.length === 0 || endDates.length === 0) {
      console.warn('GanttTimeline: No valid dates found in phases, using fallback values');
      return {
        defaultTimeStart: fallbackStart,
        defaultTimeEnd: fallbackEnd,
      };
    }

    const earliestStart = Math.min(...startDates);
    const latestEnd = Math.max(...endDates);

    // Validate the calculated values
    if (isNaN(earliestStart) || isNaN(latestEnd) || !isFinite(earliestStart) || !isFinite(latestEnd)) {
      console.error('GanttTimeline: Invalid timeline bounds calculated', { earliestStart, latestEnd });
      return {
        defaultTimeStart: fallbackStart,
        defaultTimeEnd: fallbackEnd,
      };
    }

    // Ensure end is after start
    if (earliestStart >= latestEnd) {
      console.warn('GanttTimeline: Start date is after end date, using fallback');
      return {
        defaultTimeStart: fallbackStart,
        defaultTimeEnd: fallbackEnd,
      };
    }

    // Add padding (7 days before and after)
    const padding = 7 * 24 * 60 * 60 * 1000;

    return {
      defaultTimeStart: earliestStart - padding,
      defaultTimeEnd: latestEnd + padding,
    };
  }, [phases]);

  // Show orientation message on mobile portrait mode - check AFTER declaring all hooks
  if (isMobile && isPortrait) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border bg-white min-h-[400px]">
        <RotateCw className="h-16 w-16 text-blueprint-teal mb-4" />
        <h3 className="text-lg font-semibold text-charcoal-blue mb-2">
          Rotate Device for Timeline View
        </h3>
        <p className="text-steel-gray max-w-sm">
          The Gantt timeline works best in landscape orientation. Please rotate your device to view the full project timeline.
        </p>
        <p className="text-sm text-steel-gray mt-4">
          Or switch to the <strong>List</strong> tab to view phases in a card layout.
        </p>
      </div>
    );
  }

  // Helper function to get all dependent phases (recursively)
  const getDependentPhases = (phaseId: string): PhaseWithContacts[] => {
    const directDependents = phases.filter((p) => p.predecessor_phase_id === phaseId);
    const allDependents: PhaseWithContacts[] = [...directDependents];

    directDependents.forEach((dependent) => {
      allDependents.push(...getDependentPhases(dependent.id));
    });

    return allDependents;
  };

  // Helper function to cascade date changes to dependent phases
  const cascadeDateChanges = async (
    updatedPhaseId: string,
    newEndDate: Date
  ): Promise<void> => {
    const dependents = getDependentPhases(updatedPhaseId);

    if (dependents.length === 0) return;

    // Update each dependent phase to start after the predecessor ends
    await Promise.all(
      dependents.map(async (dependent) => {
        // Calculate current duration from planned_duration_days + buffer_days
        const dependentDuration = ((dependent as any).planned_duration_days || 0) + ((dependent as any).buffer_days || 0);
        const dependentDurationMs = dependentDuration * 24 * 60 * 60 * 1000;

        const newStartDate = new Date(newEndDate.getTime() + 24 * 60 * 60 * 1000); // Start 1 day after predecessor ends
        const newDependentEndDate = new Date(newStartDate.getTime() + dependentDurationMs);

        // Format date as YYYY-MM-DD for planned_start_date
        const formattedStartDate = newStartDate.toISOString().split('T')[0];

        await fetch(`/api/phases/${dependent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planned_start_date: formattedStartDate,
          }),
        });

        // Recursively cascade to this dependent's dependents
        await cascadeDateChanges(dependent.id, newDependentEndDate);
      })
    );
  };

  // NOTE: Chevrons and sidebar rendering are now handled by the groupRenderer prop
  // No need for DOM manipulation via useEffect

  const handleZoomChange = (newZoom: ZoomLevel) => {
    setZoomLevel(newZoom);
  };

  const handleFitAll = () => {
    // Fit the entire project timeline into view
    const padding = 7 * 24 * 60 * 60 * 1000; // 7 days padding
    setVisibleTimeStart(defaultTimeStart);
    setVisibleTimeEnd(defaultTimeEnd);
  };

  const handleJumpToToday = () => {
    // Center the view on today
    const now = Date.now();
    const viewportWidth = ZOOM_LEVELS[zoomLevel].visibleTimeStart;
    setVisibleTimeStart(now - viewportWidth / 2);
    setVisibleTimeEnd(now + viewportWidth / 2);
  };

  const handleItemClick = (itemId: string) => {
    onPhaseClick?.(itemId);
  };

  const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number) => {
    setVisibleTimeStart(visibleTimeStart);
    setVisibleTimeEnd(visibleTimeEnd);
  };

  const handleItemMove = async (
    itemId: string,
    dragTime: number,
    newGroupOrder: number
  ) => {
    const phase = localPhases.find((p) => p.id === itemId);
    if (!phase || isSaving) return;

    setIsSaving(true);

    // Get the old start time from planned_start_date
    const oldStartDateStr = (phase as any).planned_start_date;
    const oldStartTime = new Date(oldStartDateStr).getTime();
    const timeDiff = dragTime - oldStartTime;

    // Calculate new start date
    const newStartDate = new Date(dragTime);
    const formattedStartDate = newStartDate.toISOString().split('T')[0];

    // Calculate new end date based on duration
    const durationDays = (phase as any).planned_duration_days || 0;
    const bufferDays = (phase as any).buffer_days || 0;
    const newEndDate = calculateEndDate(formattedStartDate, durationDays, bufferDays);

    // OPTIMISTIC UPDATE: Update local state immediately
    setLocalPhases(prevPhases =>
      prevPhases.map(p => {
        if (p.id === itemId) {
          // Update the moved phase
          return { ...p, planned_start_date: formattedStartDate } as PhaseWithContacts;
        } else if (!phase.is_task && !phase.parent_phase_id && p.parent_phase_id === itemId) {
          // If this is a parent phase, also move child tasks
          const taskStartDateStr = (p as any).planned_start_date;
          const taskStartTime = new Date(taskStartDateStr).getTime();
          const newTaskStartTime = taskStartTime + timeDiff;
          const newTaskStartDate = new Date(newTaskStartTime);
          const formattedTaskStartDate = newTaskStartDate.toISOString().split('T')[0];
          return { ...p, planned_start_date: formattedTaskStartDate } as PhaseWithContacts;
        }
        return p;
      })
    );

    try {
      // Update the phase on the server (only need to update planned_start_date)
      const response = await fetch(`/api/phases/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planned_start_date: formattedStartDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update phase');
      }

      // If this is a parent phase, also move all child tasks
      if (!phase.is_task && !phase.parent_phase_id) {
        const childTasks = localPhases.filter((p) => p.parent_phase_id === itemId);

        await Promise.all(
          childTasks.map(async (task) => {
            const taskStartDateStr = (task as any).planned_start_date;
            const taskStartTime = new Date(taskStartDateStr).getTime();
            const newTaskStartTime = taskStartTime + timeDiff;
            const newTaskStartDate = new Date(newTaskStartTime);
            const formattedTaskStartDate = newTaskStartDate.toISOString().split('T')[0];

            return fetch(`/api/phases/${task.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                planned_start_date: formattedTaskStartDate,
              }),
            });
          })
        );
      }

      // Cascade changes to dependent phases
      await cascadeDateChanges(itemId, newEndDate);

      // Refresh to sync with server data (local state prevents snap-back during refresh)
      router.refresh();
    } catch (error) {
      console.error('Error moving phase:', error);
      // Revert local state to original phases on error
      setLocalPhases(phases);
      router.refresh();
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleItemResize = async (
    itemId: string,
    time: number,
    edge: 'left' | 'right'
  ) => {
    const phase = localPhases.find((p) => p.id === itemId);
    if (!phase || isSaving) return;

    setIsSaving(true);

    try {
      const newDate = new Date(time);
      const formattedDate = newDate.toISOString().split('T')[0];

      let updateData: { planned_start_date?: string; planned_duration_days?: number } = {};

      if (edge === 'left') {
        // Resizing start date - update planned_start_date and recalculate duration
        const oldEndDate = calculateEndDate(
          (phase as any).planned_start_date,
          (phase as any).planned_duration_days || 0,
          (phase as any).buffer_days || 0
        );

        // Calculate new duration (days between new start and old end)
        const newStartTime = new Date(formattedDate).getTime();
        const oldEndTime = oldEndDate.getTime();
        const newDurationMs = oldEndTime - newStartTime;
        const newDurationDays = Math.max(1, Math.ceil(newDurationMs / (24 * 60 * 60 * 1000)));

        updateData.planned_start_date = formattedDate;
        updateData.planned_duration_days = newDurationDays;
      } else {
        // Resizing end date - update planned_duration_days
        const startDateStr = (phase as any).planned_start_date;
        const startTime = new Date(startDateStr).getTime();
        const endTime = newDate.getTime();
        const durationMs = endTime - startTime;
        const bufferDays = (phase as any).buffer_days || 0;

        // New duration is total days minus buffer
        const totalDays = Math.max(1, Math.ceil(durationMs / (24 * 60 * 60 * 1000)));
        const newDurationDays = Math.max(1, totalDays - bufferDays);

        updateData.planned_duration_days = newDurationDays;
      }

      // OPTIMISTIC UPDATE: Update local state immediately
      setLocalPhases(prevPhases =>
        prevPhases.map(p =>
          p.id === itemId
            ? { ...p, ...updateData } as PhaseWithContacts
            : p
        )
      );

      // Update the phase on the server
      const response = await fetch(`/api/phases/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to resize phase');
      }

      // If we resized the end date (right edge), cascade changes to dependent phases
      if (edge === 'right') {
        await cascadeDateChanges(itemId, newDate);
      }

      // Refresh to sync with server data (local state prevents snap-back during refresh)
      router.refresh();
    } catch (error) {
      console.error('Error resizing phase:', error);
      // Revert local state to original phases on error
      setLocalPhases(phases);
      router.refresh();
    }
    finally {
      setIsSaving(false);
    }
  };

  // Helper function to get status icon and color
  const getStatusIcon = (status: PhaseWithContacts['status']) => {
    switch (status) {
      case 'completed':
        return { Icon: CheckCircle2, className: 'text-white' };
      case 'in_progress':
        return { Icon: Clock, className: 'text-white' };
      case 'delayed':
        return { Icon: AlertCircle, className: 'text-white' };
      case 'blocked':
        return { Icon: AlertCircle, className: 'text-white' };
      case 'not_started':
      default:
        return { Icon: Circle, className: 'text-white' };
    }
  };

  // Custom group (sidebar) renderer to show phase/task hierarchy with indentation
  const groupRenderer = ({ group }: { group: any }) => {
    const phase = localPhases.find((p) => p.id === group.id);

    // Always show the title, even if we can't find the phase in localPhases
    const title = group.title || 'Untitled';

    if (!phase) {
      // Fallback rendering when phase is not found
      return (
        <div className="flex items-center h-full px-4 py-3 text-sm">
          <span className="truncate font-semibold text-charcoal-blue" title={title}>
            {title}
          </span>
        </div>
      );
    }

    const isTask = !!phase.parent_phase_id || phase.is_task;
    const isPhase = !isTask;
    const hasChildren = isPhase && localPhases.some((p) => p.parent_phase_id === phase.id);
    const isExpanded = !collapsedPhases.has(phase.id);

    return (
      <div
        className={`flex items-center h-full text-sm ${
          isTask ? 'pl-8' : 'pl-4'
        }`}
      >
        {/* Expand/Collapse Icon for phases with children */}
        {isPhase && hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePhaseExpansion(phase.id);
            }}
            className="mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-steel-gray" />
            ) : (
              <ChevronRight className="h-4 w-4 text-steel-gray" />
            )}
          </button>
        )}

        {/* Phase/Task Name */}
        <span
          className={`truncate ${
            isPhase ? 'font-semibold text-charcoal-blue' : 'text-steel-gray'
          }`}
          title={title}
        >
          {title}
        </span>
      </div>
    );
  };

  // Custom item renderer to wrap timeline bars with tooltips
  const itemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps,
  }: ItemRendererProps<any>) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const phase = phases.find((p) => p.id === item.id);

    if (!phase) {
      // Fallback render if phase not found
      return <div {...getItemProps()} />;
    }

    // Get progress if available
    const progress = (phase as any).computed_progress;

    // Get status icon
    const statusDisplay = getStatusIcon(phase.status);

    // Get phase color using the color system
    const phaseColorStyles = getPhaseColorStyles(phase.color);
    const phaseHex = phaseColorStyles.hex;

    // Helper to convert hex to rgba with opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Extract key from props to avoid React warning
    const { key, ...itemProps } = getItemProps();

    // Extract and override specific style properties to avoid conflicts
    const {
      background,
      backgroundColor: _bgColor,
      border,
      borderWidth,
      borderLeftWidth,
      borderRightWidth,
      borderTopWidth,
      borderBottomWidth,
      ...cleanStyle
    } = itemProps.style || {};

    return (
      <PhaseTooltip phase={phase} onEditClick={() => setEditingPhaseId(phase.id)}>
        <div
          key={key}
          {...itemProps}
          className="group rounded"
          style={{
            ...cleanStyle,
            backgroundColor: phase.is_task ? phaseHex : hexToRgba(phaseHex, 0.3), // Tasks: 100% solid, Phases: 30% with progress overlay
            borderLeftWidth: '1px',
            borderRightWidth: '1px',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderStyle: 'solid',
            borderColor: phaseHex,
          }}
        >
          {/* Progress overlay - full opacity of phase color */}
          {progress !== undefined && progress > 0 && (
            <div
              className="absolute inset-0 rounded-l"
              style={{
                backgroundColor: phaseHex, // 100% opacity for progress
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          )}

          {/* Phase title */}
          <div className="relative z-10 flex items-center h-full px-2 gap-2">
            {/* Status Icon */}
            <statusDisplay.Icon
              className={`flex-shrink-0 w-3.5 h-3.5 ${statusDisplay.className} drop-shadow-sm`}
              strokeWidth={2.5}
            />

            <span className="text-xs font-medium truncate text-white flex-shrink">
              {itemContext.title}
            </span>

            {/* Contact Avatars */}
            {phase.phase_contacts && phase.phase_contacts.length > 0 && (
              <div className="flex items-center -space-x-1 ml-auto flex-shrink-0">
                {phase.phase_contacts.slice(0, 3).map((pc, index) => (
                  <div
                    key={pc.id}
                    className="relative"
                    style={{ zIndex: phase.phase_contacts.length - index }}
                    title={`${pc.contact.company_name} - ${pc.contact.trade}`}
                  >
                    <ContactAvatar
                      name={pc.contact.company_name}
                      imageUrl={pc.contact.image_url}
                      size="sm"
                      className="!w-5 !h-5 !text-[8px] border border-white shadow-sm"
                    />
                  </div>
                ))}
                {phase.phase_contacts.length > 3 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-gray-600 border border-white shadow-sm"
                    title={`+${phase.phase_contacts.length - 3} more contacts`}
                  >
                    +{phase.phase_contacts.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Resize Handle (Tasks Only) */}
            {phase.is_task && (
              <div className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-60 transition-opacity duration-200" title="Drag to resize">
                <div className="flex gap-[2px]">
                  <div className="flex flex-col gap-[2px]">
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                    <div className="w-[3px] h-[3px] rounded-full bg-white" />
                  </div>
                </div>
              </div>
            )}

            {progress !== undefined && (
              <span className="text-xs font-semibold text-white opacity-90 flex-shrink-0">
                {Math.round(progress)}%
              </span>
            )}
          </div>

          {/* Resize handles */}
          {itemContext.canMove && leftResizeProps && (
            <div {...leftResizeProps} />
          )}
          {itemContext.canMove && rightResizeProps && (
            <div {...rightResizeProps} />
          )}
        </div>
      </PhaseTooltip>
    );
  };

  return (
    <div className="w-full h-full relative">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blueprint-teal border-t-transparent rounded-full" />
            <span className="text-sm font-medium text-charcoal-blue">Saving changes...</span>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <span className="text-sm font-medium text-steel-gray mr-2">View:</span>
        {(Object.keys(ZOOM_LEVELS) as ZoomLevel[]).map((level) => (
          <Button
            key={level}
            variant={zoomLevel === level ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleZoomChange(level)}
            className="capitalize"
            disabled={isSaving}
          >
            {level}
          </Button>
        ))}

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFitAll}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <Maximize2 className="h-4 w-4" />
            Fit All
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineContainerRef} className="border rounded-lg bg-white shadow-sm overflow-hidden relative">
        {/* Sidebar Resize Handle */}
        <div
          className="timeline-resize-handle"
          style={{ left: `${sidebarWidth - 4}px` }}
          onMouseDown={handleResizeStart}
        />

        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={defaultTimeStart}
          defaultTimeEnd={defaultTimeEnd}
          visibleTimeStart={visibleTimeStart}
          visibleTimeEnd={visibleTimeEnd}
          onTimeChange={handleTimeChange}
          minZoom={ZOOM_LEVELS[zoomLevel].minZoom}
          maxZoom={ZOOM_LEVELS[zoomLevel].maxZoom}
          onItemClick={handleItemClick}
          onItemMove={handleItemMove}
          onItemResize={handleItemResize}
          itemRenderer={itemRenderer}
          groupRenderer={groupRenderer}
          lineHeight={60}
          itemHeightRatio={0.75}
          canMove={true} // ✓ Phase 3: Enabled drag-and-drop move
          canResize="both" // ✓ Phase 4: Enabled drag-and-drop resize on both edges
          canSelect={true}
          stackItems={true}
          sidebarWidth={sidebarWidth}
        >
          <TimelineHeaders>
            <SidebarHeader>
              {({ getRootProps }) => {
                return (
                  <div {...getRootProps()} className="bg-gray-50 border-r">
                    <div className="px-4 py-3 text-sm font-semibold text-charcoal-blue">
                      Phase / Task
                    </div>
                  </div>
                );
              }}
            </SidebarHeader>
            <DateHeader unit="primaryHeader" />
            <DateHeader />
          </TimelineHeaders>

          {/* Current Period Highlighting & Today Indicator */}
          <TimelineMarkers>
            {/* Current period background highlight (day/week/month) */}
            <CustomMarker date={currentPeriod.start}>
              {({ styles, date }) => {
                // Calculate width based on period duration
                const duration = currentPeriod.end - currentPeriod.start;
                const pixelsPerMs = 0.0001; // Approximate, will be adjusted by timeline
                const width = duration * pixelsPerMs;

                return (
                  <div
                    className="current-period-marker"
                    style={{
                      ...styles,
                      backgroundColor: 'rgba(26, 188, 156, 0.08)',
                      width: `${Math.max(width, 50)}px`,
                      height: '100%',
                      zIndex: 1,
                      pointerEvents: 'none',
                    }}
                  />
                );
              }}
            </CustomMarker>

            {/* Today Indicator - Vertical Line */}
            <CustomMarker date={Date.now()}>
              {({ styles }) => (
                <div
                  style={{
                    ...styles,
                    backgroundColor: 'var(--color-warning-amber)',
                    width: '2px',
                    height: '100%',
                    zIndex: 20,
                    pointerEvents: 'none',
                    boxShadow: '0 0 4px rgba(243, 156, 18, 0.5)',
                  }}
                />
              )}
            </CustomMarker>
          </TimelineMarkers>
        </Timeline>
      </div>

      {/* Phase Editor Modal - Controlled via hidden button ref */}
      <PhaseFormModal
        key={editingPhaseId || 'none'}
        projectId={projectId}
        phase={editingPhaseId ? (phases.find(p => p.id === editingPhaseId) || null) : null}
        phases={phases}
        trigger={
          <button
            ref={editButtonRef}
            style={{ display: 'none', position: 'absolute', pointerEvents: 'none' }}
            aria-hidden="true"
          />
        }
        onSuccess={() => {
          setEditingPhaseId(null);
          router.refresh();
        }}
      />
    </div>
  );
}
