/**
 * Project Metrics Calculation Utilities
 *
 * Functions to calculate project duration, completion percentage, and schedule status
 */

type Phase = {
  id: string;
  planned_start_date: string;
  planned_end_date?: string | null;
  planned_duration_days: number;
  buffer_days: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  is_task: boolean;
  parent_phase_id?: string | null;
  computed_progress?: number;
};

type Project = {
  baseline_start_date?: string | null;
  baseline_duration_days?: number | null;
  baseline_set_date?: string | null;
};

export interface ProjectDuration {
  totalDays: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ScheduleStatus {
  status: 'on_track' | 'needs_attention' | 'behind';
  message: string;
  daysOff: number | null;
}

/**
 * Calculate end date from start date and duration
 */
function calculateEndDate(startDate: string, durationDays: number, bufferDays: number): Date {
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const totalDays = durationDays + bufferDays;
  return new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
}

/**
 * Calculate project duration from phases
 * Returns total days and start/end dates
 */
export function calculateProjectDuration(phases: Phase[]): ProjectDuration {
  if (!phases || phases.length === 0) {
    return {
      totalDays: 0,
      startDate: null,
      endDate: null,
    };
  }

  // Filter out tasks, only consider top-level phases
  const topLevelPhases = phases.filter((p) => !p.is_task && !p.parent_phase_id);

  if (topLevelPhases.length === 0) {
    return {
      totalDays: 0,
      startDate: null,
      endDate: null,
    };
  }

  // Find earliest start date
  const startDates = topLevelPhases.map((p) => {
    const [year, month, day] = p.planned_start_date.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  });
  const earliestStart = new Date(Math.min(...startDates.map((d) => d.getTime())));

  // Find latest end date
  const endDates = topLevelPhases.map((p) => {
    if (p.planned_end_date) {
      const [year, month, day] = p.planned_end_date.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return calculateEndDate(p.planned_start_date, p.planned_duration_days, p.buffer_days);
  });
  const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

  // Calculate total days
  const totalMs = latestEnd.getTime() - earliestStart.getTime();
  const totalDays = Math.ceil(totalMs / (24 * 60 * 60 * 1000));

  return {
    totalDays,
    startDate: earliestStart,
    endDate: latestEnd,
  };
}

/**
 * Calculate project completion percentage
 * Based on weighted average of phase progress
 *
 * Each phase's progress is calculated based on its tasks' completion,
 * weighted by task duration. The overall project completion is the
 * average of all phase progress percentages.
 */
export function calculateCompletionPercentage(phases: Phase[]): number {
  if (!phases || phases.length === 0) {
    return 0;
  }

  // Filter out tasks, only consider top-level phases
  const topLevelPhases = phases.filter((p) => !p.is_task && !p.parent_phase_id);

  if (topLevelPhases.length === 0) {
    return 0;
  }

  // Calculate average progress across all phases
  const totalProgress = topLevelPhases.reduce((sum, phase) => {
    // Use computed_progress if available (includes task-weighted calculation)
    // Otherwise fall back to simple status check
    if (phase.computed_progress !== undefined) {
      return sum + phase.computed_progress;
    }
    return sum + (phase.status === 'completed' ? 100 : 0);
  }, 0);

  return Math.round(totalProgress / topLevelPhases.length);
}

/**
 * Determine project schedule status
 * Compares baseline to current timeline and checks phase statuses
 */
export function getScheduleStatus(
  project: Project,
  phases: Phase[],
  currentDuration: ProjectDuration
): ScheduleStatus {
  const hasBaseline = project.baseline_duration_days && project.baseline_start_date;

  // Check for delayed or blocked phases
  const hasDelayedPhases = phases.some((p) => p.status === 'delayed' || p.status === 'blocked');

  // If no baseline is set, just check phase statuses
  if (!hasBaseline) {
    if (hasDelayedPhases) {
      return {
        status: 'needs_attention',
        message: 'Some phases are delayed or blocked',
        daysOff: null,
      };
    }

    return {
      status: 'on_track',
      message: 'Project timeline looks good',
      daysOff: null,
    };
  }

  // Compare current duration to baseline
  const baselineDays = project.baseline_duration_days!;
  const currentDays = currentDuration.totalDays;
  const daysDifference = currentDays - baselineDays;

  // Calculate threshold (10% variance is acceptable)
  const acceptableVariance = Math.ceil(baselineDays * 0.1);

  if (hasDelayedPhases) {
    if (daysDifference > acceptableVariance) {
      return {
        status: 'behind',
        message: `Project is ${Math.abs(daysDifference)} days behind baseline`,
        daysOff: daysDifference,
      };
    }

    return {
      status: 'needs_attention',
      message: 'Some phases need attention',
      daysOff: daysDifference,
    };
  }

  if (daysDifference > acceptableVariance) {
    return {
      status: 'behind',
      message: `Timeline extended by ${daysDifference} days`,
      daysOff: daysDifference,
    };
  }

  if (daysDifference < -acceptableVariance) {
    return {
      status: 'on_track',
      message: `Ahead of schedule by ${Math.abs(daysDifference)} days`,
      daysOff: daysDifference,
    };
  }

  return {
    status: 'on_track',
    message: 'On track with baseline',
    daysOff: daysDifference,
  };
}

/**
 * Format date range as readable string
 */
export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) {
    return 'Not set';
  }

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = startDate.toLocaleDateString('en-US', formatOptions);
  const end = endDate.toLocaleDateString('en-US', formatOptions);

  return `${start} - ${end}`;
}
