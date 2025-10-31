/**
 * Phase Service
 *
 * Business logic for managing project phases and their contact assignments.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';

type Phase = Database['public']['Tables']['phases']['Row'];
type PhaseInsert = Database['public']['Tables']['phases']['Insert'];
type PhaseUpdate = Database['public']['Tables']['phases']['Update'];
type PhaseContact = Database['public']['Tables']['phase_contacts']['Row'];
type PhaseContactInsert = Database['public']['Tables']['phase_contacts']['Insert'];

/**
 * Phase with contact assignments included
 */
export type PhaseWithContacts = Phase & {
  phase_contacts: (PhaseContact & {
    contact: {
      id: string;
      company_name: string;
      contact_person: string;
      phone_primary: string;
      trade: string;
      image_url?: string | null;
    };
  })[];
  // Hierarchy fields (explicitly added until Supabase types are regenerated)
  parent_phase_id?: string | null;
  is_task: boolean;
};

/**
 * Get all phases for a project
 */
export async function getPhasesByProject(
  projectId: string,
  organizationId: string
): Promise<Phase[]> {
  const supabase = getServerSupabaseClient();

  // First verify the project belongs to the organization
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  if (!project) {
    throw new NotFoundError('Project');
  }

  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('project_id', projectId)
    .order('sequence_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get phases: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single phase by ID with contact assignments
 */
export async function getPhaseById(
  phaseId: string,
  organizationId: string
): Promise<PhaseWithContacts> {
  const supabase = getServerSupabaseClient();

  // Get phase and verify it belongs to the organization's project
  const { data: phase, error: phaseError } = await supabase
    .from('phases')
    .select(`
      *,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (phaseError || !phase) {
    throw new NotFoundError('Phase');
  }

  // Type assertion needed due to the join
  const phaseData = phase as unknown as Phase & {
    projects: { organization_id: string };
  };

  if (phaseData.projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  // Get phase contacts with contact details
  const { data: phaseContacts, error: contactsError } = await supabase
    .from('phase_contacts')
    .select(`
      *,
      contact:contacts!inner (
        id,
        company_name,
        contact_person,
        phone_primary,
        trade,
        image_url
      )
    `)
    .eq('phase_id', phaseId);

  if (contactsError) {
    throw new Error(`Failed to get phase contacts: ${contactsError.message}`);
  }

  // Remove the projects join data before returning
  const { projects: _projects, ...phaseWithoutProjects } = phaseData;

  return {
    ...phaseWithoutProjects,
    phase_contacts: (phaseContacts || []) as any,
  } as PhaseWithContacts;
}

/**
 * Create a new phase
 */
export async function createPhase(
  data: PhaseInsert,
  organizationId: string
): Promise<Phase> {
  const supabase = getServerSupabaseClient();

  // Verify the project belongs to the organization
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', data.project_id)
    .eq('organization_id', organizationId)
    .single();

  if (!project) {
    throw new NotFoundError('Project');
  }

  const { data: newPhase, error } = await supabase
    .from('phases')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create phase: ${error.message}`);
  }

  return newPhase;
}

/**
 * Update a phase
 */
export async function updatePhase(
  phaseId: string,
  organizationId: string,
  updates: PhaseUpdate
): Promise<Phase> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization's project
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  const { data, error } = await supabase
    .from('phases')
    .update(updates)
    .eq('id', phaseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update phase: ${error.message}`);
  }

  return data;
}

/**
 * Delete a phase
 */
export async function deletePhase(
  phaseId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization's project
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  const { error } = await supabase.from('phases').delete().eq('id', phaseId);

  if (error) {
    throw new Error(`Failed to delete phase: ${error.message}`);
  }
}

/**
 * Update phase status with automatic date tracking
 */
export async function updatePhaseStatus(
  phaseId: string,
  organizationId: string,
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked',
  dates?: {
    actual_start_date?: string;
    actual_end_date?: string;
  }
): Promise<Phase> {
  const updates: PhaseUpdate = { status };

  // Auto-set dates based on status if not provided
  if (status === 'in_progress' && !dates?.actual_start_date) {
    updates.actual_start_date = new Date().toISOString();
  }

  if (status === 'completed' && !dates?.actual_end_date) {
    updates.actual_end_date = new Date().toISOString();
  }

  // Override with provided dates
  if (dates?.actual_start_date) {
    updates.actual_start_date = dates.actual_start_date;
  }

  if (dates?.actual_end_date) {
    updates.actual_end_date = dates.actual_end_date;
  }

  return updatePhase(phaseId, organizationId, updates);
}

/**
 * Assign a contact to a phase
 */
export async function assignContactToPhase(
  data: PhaseContactInsert,
  organizationId: string
): Promise<PhaseContact> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', data.phase_id)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  // Verify contact belongs to organization
  const { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', data.contact_id)
    .eq('organization_id', organizationId)
    .single();

  if (!contact) {
    throw new NotFoundError('Contact');
  }

  // Check if assignment already exists
  const { data: existingAssignment } = await supabase
    .from('phase_contacts')
    .select()
    .eq('phase_id', data.phase_id)
    .eq('contact_id', data.contact_id)
    .single();

  // Return existing assignment if found
  if (existingAssignment) {
    return existingAssignment;
  }

  // Create new assignment if it doesn't exist
  const { data: assignment, error } = await supabase
    .from('phase_contacts')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign contact to phase: ${error.message}`);
  }

  return assignment;
}

/**
 * Remove a contact from a phase
 */
export async function removeContactFromPhase(
  phaseId: string,
  contactId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  const { error } = await supabase
    .from('phase_contacts')
    .delete()
    .eq('phase_id', phaseId)
    .eq('contact_id', contactId);

  if (error) {
    throw new Error(`Failed to remove contact from phase: ${error.message}`);
  }
}

/**
 * Get contacts assigned to a phase
 */
export async function getPhaseContacts(
  phaseId: string,
  organizationId: string
): Promise<PhaseContact[]> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  const { data, error } = await supabase
    .from('phase_contacts')
    .select('*')
    .eq('phase_id', phaseId);

  if (error) {
    throw new Error(`Failed to get phase contacts: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculate phase end date based on start date and duration
 */
export function calculatePhaseEndDate(
  startDate: string,
  durationDays: number,
  bufferDays: number = 0
): string {
  const start = new Date(startDate);
  const totalDays = durationDays + bufferDays;
  const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
  return end.toISOString().split('T')[0];
}

/**
 * Phase with tasks included
 */
export type PhaseWithTasks = PhaseWithContacts & {
  tasks?: PhaseWithContacts[];
  computed_progress?: number;
};

/**
 * Get all phases with their tasks in hierarchical structure
 */
export async function getPhasesWithTasks(
  projectId: string,
  organizationId: string
): Promise<PhaseWithTasks[]> {
  const supabase = getServerSupabaseClient();

  // First verify the project belongs to the organization
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  if (!project) {
    throw new NotFoundError('Project');
  }

  // Get all phases and tasks with contacts
  const { data, error } = await supabase
    .from('phases')
    .select(`
      *,
      phase_contacts (
        *,
        contact:contacts!inner (
          id,
          company_name,
          contact_person,
          phone_primary,
          trade,
          image_url
        )
      )
    `)
    .eq('project_id', projectId)
    .order('sequence_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get phases with tasks: ${error.message}`);
  }

  const allItems = (data || []) as unknown as PhaseWithContacts[];

  // Separate phases and tasks
  const phases = allItems.filter((item) => !item.is_task);
  const tasks = allItems.filter((item) => item.is_task);

  // Organize tasks under their parent phases
  const phasesWithTasks: PhaseWithTasks[] = phases.map((phase) => {
    const phaseTasks = tasks.filter((task) => task.parent_phase_id === phase.id);
    const progress = calculatePhaseProgress(phase, phaseTasks);

    return {
      ...phase,
      tasks: phaseTasks,
      computed_progress: progress,
    };
  });

  return phasesWithTasks;
}

/**
 * Get only top-level phases (no tasks)
 */
export async function getTopLevelPhases(
  projectId: string,
  organizationId: string
): Promise<Phase[]> {
  const supabase = getServerSupabaseClient();

  // First verify the project belongs to the organization
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  if (!project) {
    throw new NotFoundError('Project');
  }

  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_task', false)
    .order('sequence_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get top-level phases: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculate phase progress from task completion
 * Returns percentage (0-100)
 *
 * Progress is weighted by task duration - completing a 7-day task contributes
 * more to progress than completing a 1-day task.
 */
export function calculatePhaseProgress(
  phase: Phase,
  tasks: Phase[]
): number {
  if (!tasks || tasks.length === 0) {
    // No tasks: use phase status
    return phase.status === 'completed' ? 100 : 0;
  }

  // Calculate total duration across all tasks
  const totalDuration = tasks.reduce((sum, task) => {
    return sum + (task.planned_duration_days || 0);
  }, 0);

  // If no duration data, fall back to simple count-based calculation
  if (totalDuration === 0) {
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  // Calculate weighted completion based on duration
  const completedDuration = tasks.reduce((sum, task) => {
    if (task.status === 'completed') {
      return sum + (task.planned_duration_days || 0);
    }
    return sum;
  }, 0);

  return Math.round((completedDuration / totalDuration) * 100);
}

/**
 * Calculate phase dates from tasks (envelope of all task dates)
 * Returns null if no tasks or if dates should not be auto-calculated
 */
export function calculatePhaseDatesFromTasks(
  tasks: Phase[]
): { start_date: string; end_date: string } | null {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  const taskDates = tasks.map((task) => {
    const startDate = new Date(task.planned_start_date);
    const endDate = new Date(
      calculatePhaseEndDate(
        task.planned_start_date,
        task.planned_duration_days,
        task.buffer_days
      )
    );
    return { start: startDate, end: endDate };
  });

  const earliestStart = new Date(
    Math.min(...taskDates.map((d) => d.start.getTime()))
  );
  const latestEnd = new Date(Math.max(...taskDates.map((d) => d.end.getTime())));

  return {
    start_date: earliestStart.toISOString().split('T')[0],
    end_date: latestEnd.toISOString().split('T')[0],
  };
}

/**
 * Get tasks for a specific phase
 */
export async function getTasksByPhase(
  phaseId: string,
  organizationId: string
): Promise<PhaseWithContacts[]> {
  const supabase = getServerSupabaseClient();

  // Verify phase belongs to organization
  const { data: phase } = await supabase
    .from('phases')
    .select(`
      id,
      projects!inner (
        organization_id
      )
    `)
    .eq('id', phaseId)
    .single();

  if (!phase || (phase as any).projects.organization_id !== organizationId) {
    throw new NotFoundError('Phase');
  }

  // Get tasks with contacts
  const { data, error } = await supabase
    .from('phases')
    .select(`
      *,
      phase_contacts (
        *,
        contact:contacts!inner (
          id,
          company_name,
          contact_person,
          phone_primary,
          trade
        )
      )
    `)
    .eq('parent_phase_id', phaseId)
    .eq('is_task', true)
    .order('sequence_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }

  return (data || []) as unknown as PhaseWithContacts[];
}

// ============================================================================
// Dynamic Phase Duration Calculation
// ============================================================================

/**
 * Task timeline entry with calculated dates
 */
export type TaskTimelineEntry = {
  taskId: string;
  taskName: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  bufferDays: number;
  sequenceOrder: number;
  hasExplicitStartDate: boolean;
};

/**
 * Result of phase duration calculation
 */
export type PhaseDurationCalculation = {
  earliestTaskStart: Date | null;
  latestTaskEnd: Date | null;
  calculatedDurationDays: number;
  suggestedEndDate: Date | null;
  taskTimeline: TaskTimelineEntry[];
  hasOverlappingTasks: boolean;
  hasGaps: boolean;
  totalGapDays: number;
};

/**
 * Calculate effective start and end dates for all tasks
 * Handles tasks without explicit start dates (sequential after previous task)
 */
export function calculateTaskTimeline(
  tasks: Phase[],
  phaseStartDate: string
): TaskTimelineEntry[] {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Sort tasks by sequence_order
  const sortedTasks = [...tasks].sort((a, b) => a.sequence_order - b.sequence_order);

  const timeline: TaskTimelineEntry[] = [];
  let previousTaskEndDate: Date | null = null;

  for (const task of sortedTasks) {
    let taskStartDate: Date;
    const hasExplicitStartDate = !!task.planned_start_date;

    if (hasExplicitStartDate) {
      // Task has explicit start date
      taskStartDate = new Date(task.planned_start_date);
    } else {
      // No explicit start date: calculate based on previous task or phase start
      if (previousTaskEndDate) {
        // Start after previous task ends (add 1 day)
        taskStartDate = new Date(previousTaskEndDate);
        taskStartDate.setDate(taskStartDate.getDate() + 1);
      } else {
        // First task without date: use phase start date
        taskStartDate = new Date(phaseStartDate);
      }
    }

    // Calculate task end date (start + duration + buffer)
    const totalTaskDays = task.planned_duration_days + (task.buffer_days || 0);
    const taskEndDate = new Date(taskStartDate);
    taskEndDate.setDate(taskEndDate.getDate() + totalTaskDays);

    timeline.push({
      taskId: task.id,
      taskName: task.name,
      startDate: taskStartDate,
      endDate: taskEndDate,
      durationDays: task.planned_duration_days,
      bufferDays: task.buffer_days || 0,
      sequenceOrder: task.sequence_order,
      hasExplicitStartDate,
    });

    // Update previous end date for next iteration
    previousTaskEndDate = taskEndDate;
  }

  return timeline;
}

/**
 * Calculate suggested phase duration from constituent tasks
 * Returns detailed calculation information
 */
export async function calculateSuggestedPhaseDuration(
  phaseId: string,
  organizationId: string
): Promise<PhaseDurationCalculation> {
  // Get the phase to access its start date
  const phase = await getPhaseById(phaseId, organizationId);

  // Get all tasks for this phase
  const tasks = await getTasksByPhase(phaseId, organizationId);

  // If no tasks, return null values
  if (!tasks || tasks.length === 0) {
    return {
      earliestTaskStart: null,
      latestTaskEnd: null,
      calculatedDurationDays: 0,
      suggestedEndDate: null,
      taskTimeline: [],
      hasOverlappingTasks: false,
      hasGaps: false,
      totalGapDays: 0,
    };
  }

  // Calculate timeline for all tasks
  const timeline = calculateTaskTimeline(tasks, phase.planned_start_date);

  // Find earliest start and latest end
  const earliestTaskStart = new Date(
    Math.min(...timeline.map((t) => t.startDate.getTime()))
  );
  const latestTaskEnd = new Date(
    Math.max(...timeline.map((t) => t.endDate.getTime()))
  );

  // Calculate duration in days (from earliest start to latest end)
  // Note: Task end dates represent the day AFTER completion (exclusive)
  // So we need to convert elapsed time to duration by rounding instead of ceiling
  const timeSpanMs = latestTaskEnd.getTime() - earliestTaskStart.getTime();
  const timeSpanDays = Math.round(timeSpanMs / (24 * 60 * 60 * 1000));

  // Check for overlapping tasks
  let hasOverlappingTasks = false;
  for (let i = 0; i < timeline.length; i++) {
    for (let j = i + 1; j < timeline.length; j++) {
      const task1 = timeline[i];
      const task2 = timeline[j];

      // Check if date ranges overlap
      if (
        (task1.startDate <= task2.endDate && task1.endDate >= task2.startDate) ||
        (task2.startDate <= task1.endDate && task2.endDate >= task1.startDate)
      ) {
        hasOverlappingTasks = true;
        break;
      }
    }
    if (hasOverlappingTasks) break;
  }

  // Calculate gaps between tasks (only for non-overlapping sequential tasks)
  let totalGapDays = 0;
  let hasGaps = false;
  if (!hasOverlappingTasks && timeline.length > 1) {
    for (let i = 0; i < timeline.length - 1; i++) {
      const currentEnd = timeline[i].endDate;
      const nextStart = timeline[i + 1].startDate;
      const gapMs = nextStart.getTime() - currentEnd.getTime();
      const gapDays = Math.max(0, Math.floor(gapMs / (24 * 60 * 60 * 1000)));

      if (gapDays > 0) {
        totalGapDays += gapDays;
        hasGaps = true;
      }
    }
  }

  // Add phase-level buffer to the suggested end date
  const suggestedEndDate = new Date(latestTaskEnd);
  suggestedEndDate.setDate(suggestedEndDate.getDate() + (phase.buffer_days || 0));

  return {
    earliestTaskStart,
    latestTaskEnd,
    calculatedDurationDays: timeSpanDays,
    suggestedEndDate,
    taskTimeline: timeline,
    hasOverlappingTasks,
    hasGaps,
    totalGapDays,
  };
}

/**
 * Recalculate and update phase duration based on tasks
 * @param phaseId - ID of the phase to recalculate
 * @param organizationId - Organization ID for authorization
 * @param forceUpdate - If true, always update planned_duration_days. If false, respect user overrides
 * @returns Updated phase data with calculation info
 */
export async function recalculatePhaseDuration(
  phaseId: string,
  organizationId: string,
  forceUpdate: boolean = false
): Promise<Phase & { calculation?: PhaseDurationCalculation }> {
  const supabase = getServerSupabaseClient();

  // Get current phase data
  const phase = await getPhaseById(phaseId, organizationId);

  // Calculate suggested duration from tasks
  const calculation = await calculateSuggestedPhaseDuration(phaseId, organizationId);

  // Prepare update object
  // Note: calculated_duration_days will be available after running the migration
  const updates: PhaseUpdate & { calculated_duration_days?: number } = {
    calculated_duration_days: calculation.calculatedDurationDays,
  };

  // Get duration mode from metadata
  const metadata = (phase.metadata as any) || {};

  // Always update the planned_duration_days when tasks exist
  // This ensures the timeline bars update automatically
  if (calculation.calculatedDurationDays > 0) {
    updates.planned_duration_days = calculation.calculatedDurationDays;

    // Update metadata to track that this was auto-calculated
    updates.metadata = {
      ...metadata,
      duration_mode: 'auto',
      last_calculated: new Date().toISOString(),
      calculated_duration_days: calculation.calculatedDurationDays, // Store in metadata until migration runs
    };
  } else if (calculation.calculatedDurationDays === 0) {
    // No tasks: keep manual mode
    updates.metadata = {
      ...metadata,
      duration_mode: 'manual',
      last_calculated: new Date().toISOString(),
      calculated_duration_days: 0,
    };
  }

  // Update the phase
  const { data: updatedPhase, error } = await supabase
    .from('phases')
    .update(updates as any) // Cast to any since calculated_duration_days not in types yet
    .eq('id', phaseId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update phase duration: ${error.message}`);
  }

  return {
    ...updatedPhase,
    calculation,
  };
}

/**
 * Validate task dates against parent phase constraints
 * Returns array of validation errors (empty if valid)
 */
export function validateTaskDates(
  task: PhaseInsert | PhaseUpdate,
  parentPhase: Phase
): string[] {
  const errors: string[] = [];

  // Validate task start date is on or after phase start date
  if (task.planned_start_date && parentPhase.planned_start_date) {
    const taskStart = new Date(task.planned_start_date);
    const phaseStart = new Date(parentPhase.planned_start_date);

    if (taskStart < phaseStart) {
      errors.push(
        `Task start date (${task.planned_start_date}) must be on or after phase start date (${parentPhase.planned_start_date})`
      );
    }
  }

  // Validate task duration is positive
  if (task.planned_duration_days !== undefined && task.planned_duration_days < 1) {
    errors.push('Task duration must be at least 1 day');
  }

  // Validate buffer is non-negative
  if (task.buffer_days !== undefined && task.buffer_days < 0) {
    errors.push('Task buffer days cannot be negative');
  }

  return errors;
}
