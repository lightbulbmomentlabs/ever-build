'use client';

/**
 * Phase Form Modal Component
 *
 * Modal for creating and editing project phases.
 * Handles validation, date calculations, and phase dependencies.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PHASE_COLORS, PhaseColor, DEFAULT_PHASE_COLOR } from '@/lib/constants/phase-colors';
import { AssignContactsSection } from '@/components/phases/assign-contacts-section';
import { Trash2, UserPlus } from 'lucide-react';

// Form validation schema
const phaseFormSchema = z.object({
  name: z.string().min(2, 'Phase name must be at least 2 characters'),
  description: z.string().optional(),
  sequence_order: z.number().int().min(1, 'Sequence order must be at least 1'),
  planned_start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  planned_duration_days: z
    .number()
    .int()
    .min(0)
    .max(365, 'Duration cannot exceed 365 days')
    .optional(),
  buffer_days: z.number().int().min(0, 'Buffer days must be 0 or more').max(90, 'Buffer days cannot exceed 90'),
  predecessor_phase_id: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'delayed', 'blocked']),
  color: z.string().optional(),
});

type PhaseFormValues = z.infer<typeof phaseFormSchema>;

type Contact = {
  id: string;
  company_name: string;
  contact_person: string;
  trade: string;
  phone_primary: string;
};

type PhaseContact = {
  id: string;
  role: string | null;
  contact: Contact;
};

type Phase = {
  id: string;
  name: string;
  description?: string | null;
  sequence_order: number;
  planned_start_date: string;
  planned_duration_days: number;
  buffer_days: number;
  predecessor_phase_id?: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  color?: string | null;
  phase_contacts?: PhaseContact[];
  // Hierarchy fields for tasks
  parent_phase_id?: string | null;
  is_task?: boolean;
  // Auto-calculation fields
  tasks?: Phase[];
  metadata?: any;
  calculated_duration_days?: number;
};

interface PhaseFormModalProps {
  projectId: string;
  phase?: Phase | null; // If provided, opens in edit mode
  phases: Phase[]; // All phases for the project (for dependency selection)
  trigger?: React.ReactNode; // Custom trigger button
  onSuccess?: () => void; // Callback after successful save
}

export function PhaseFormModal({
  projectId,
  phase,
  phases,
  trigger,
  onSuccess,
}: PhaseFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingContacts, setPendingContacts] = useState<Array<{ contactId: string; role: string }>>([]);
  const [pendingContactDeletes, setPendingContactDeletes] = useState<string[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!phase;

  // Check if phase has auto-calculated duration from tasks
  const hasAutoCalculatedDuration = isEditMode && phase && (
    (phase.tasks && phase.tasks.length > 0) ||
    (phase.metadata && (phase.metadata as any).duration_mode === 'auto')
  );
  const calculatedDuration = phase?.calculated_duration_days || phase?.planned_duration_days;

  // Fetch available contacts for assignment
  useEffect(() => {
    if (open && !isEditMode) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
          const response = await fetch('/api/contacts');
          if (!response.ok) throw new Error('Failed to fetch contacts');
          const data = await response.json();
          setAvailableContacts(data.contacts || []);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [open, isEditMode]);

  // Get next sequence order for new phases
  const getNextSequenceOrder = useCallback(() => {
    if (phases.length === 0) return 1;
    return Math.max(...phases.map((p) => p.sequence_order)) + 1;
  }, [phases]);

  // Initialize form
  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: {
      name: phase?.name || '',
      description: phase?.description || '',
      sequence_order: phase?.sequence_order || getNextSequenceOrder(),
      planned_start_date: phase?.planned_start_date || new Date().toISOString().split('T')[0],
      planned_duration_days: phase?.planned_duration_days || 1,
      buffer_days: phase?.buffer_days || 0,
      predecessor_phase_id: phase?.predecessor_phase_id || '',
      status: phase?.status || 'not_started',
      color: phase?.color || DEFAULT_PHASE_COLOR,
    },
  });

  // Reset form when phase changes or dialog closes
  useEffect(() => {
    if (open) {
      const formValues = {
        name: phase?.name || '',
        description: phase?.description || '',
        sequence_order: phase?.sequence_order || getNextSequenceOrder(),
        planned_start_date: phase?.planned_start_date || new Date().toISOString().split('T')[0],
        planned_duration_days: phase?.planned_duration_days || 1,
        buffer_days: phase?.buffer_days || 0,
        predecessor_phase_id: phase?.predecessor_phase_id || '',
        status: phase?.status || 'not_started',
        color: phase?.color || DEFAULT_PHASE_COLOR,
      };
      form.reset(formValues);
      setPendingContacts([]); // Clear pending contacts when opening
      setPendingContactDeletes([]); // Clear pending deletes when opening
    }
  }, [open, phase?.id, phase?.name, phase?.description, phase?.sequence_order, phase?.planned_start_date, phase?.planned_duration_days, phase?.buffer_days, phase?.predecessor_phase_id, phase?.status, phase?.color, form, getNextSequenceOrder]);

  // Calculate end date based on start date, duration, and buffer
  const calculateEndDate = (startDate: string, duration: number, buffer: number) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const totalDays = duration + buffer;
    const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);

    // Format back to YYYY-MM-DD using local timezone
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  };

  const onSubmit = async (values: PhaseFormValues) => {
    setLoading(true);

    try {
      const url = isEditMode
        ? `/api/phases/${phase.id}`
        : `/api/projects/${projectId}/phases`;

      const method = isEditMode ? 'PATCH' : 'POST';

      const payload = {
        ...values,
        // Clean up empty strings and set defaults
        description: values.description || null,
        predecessor_phase_id: values.predecessor_phase_id || null,
        color: values.color || DEFAULT_PHASE_COLOR,
        // Default duration to 1 if not provided (for phases without tasks)
        planned_duration_days: values.planned_duration_days || 1,
        // Preserve task hierarchy fields when editing
        ...(isEditMode && phase && {
          parent_phase_id: phase.parent_phase_id,
          is_task: phase.is_task,
        }),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} phase`);
      }

      // If creating a new phase with pending contacts, assign them
      if (!isEditMode && pendingContacts.length > 0 && data.phase?.id) {
        try {
          // Assign all pending contacts
          await Promise.all(
            pendingContacts.map((pc) =>
              fetch(`/api/phases/${data.phase.id}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contact_id: pc.contactId,
                  role: pc.role || null,
                  notification_advance_days: 7,
                }),
              })
            )
          );
        } catch (contactError) {
          console.error('Error assigning contacts:', contactError);
          // Still show success for phase creation
          toast({
            title: 'Phase Created',
            description: `${values.name} created, but some contacts failed to assign.`,
            variant: 'destructive',
          });
          setOpen(false);
          form.reset();
          if (onSuccess) onSuccess();
          else window.location.reload();
          return;
        }
      }

      // If editing and have pending contact deletes, process them
      if (isEditMode && pendingContactDeletes.length > 0 && phase?.id) {
        try {
          // Delete all pending contact assignments
          await Promise.all(
            pendingContactDeletes.map((contactId) =>
              fetch(`/api/phases/${phase.id}/contacts/${contactId}`, {
                method: 'DELETE',
              })
            )
          );
        } catch (deleteError) {
          console.error('Error removing contacts:', deleteError);
          // Show warning but don't block the success flow
          toast({
            title: 'Warning',
            description: `${values.name} updated, but some contacts failed to remove.`,
            variant: 'destructive',
          });
        }
      }

      const entityType = (isEditMode && phase?.is_task) ? 'Task' : 'Phase';
      toast({
        title: `${entityType} ${isEditMode ? 'Updated' : 'Created'}`,
        description: `${values.name} has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      setOpen(false);
      form.reset();
      setPendingContacts([]);
      setPendingContactDeletes([]);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error: any) {
      const entityType = (isEditMode && phase?.is_task) ? 'task' : 'phase';
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} ${entityType}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} ${entityType}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Watch start date, duration, and buffer to show calculated end date
  const watchedStartDate = form.watch('planned_start_date');
  const watchedDuration = form.watch('planned_duration_days');
  const watchedBuffer = form.watch('buffer_days');

  // Watch dependency field for auto-setting start date
  const watchedDependency = form.watch('predecessor_phase_id');

  // Available predecessors for dependency selection - memoized to prevent infinite re-renders
  const availablePredecessors = useMemo(() => {
    const currentItem = phase; // The item being edited (or null for create)
    // A task has either is_task=true OR a parent_phase_id
    const isCurrentTask = currentItem?.is_task === true || !!currentItem?.parent_phase_id;
    const currentParentPhaseId = currentItem?.parent_phase_id || null;
    const currentSequenceOrder = currentItem?.sequence_order || Infinity;

    // Flatten phases array to include nested tasks
    const allPhasesAndTasks: any[] = [];
    phases.forEach((p) => {
      allPhasesAndTasks.push(p); // Add the phase itself
      if (p.tasks && Array.isArray(p.tasks)) {
        allPhasesAndTasks.push(...p.tasks); // Add all nested tasks
      }
    });

    if (isCurrentTask) {
      // For TASKS: Show only other tasks within the SAME parent phase
      return allPhasesAndTasks
        .filter((p) => {
          // A task has either is_task=true OR a parent_phase_id
          const isTask = p.is_task === true || !!p.parent_phase_id;
          const matchesParent = p.parent_phase_id === currentParentPhaseId;
          const notSelf = !isEditMode || p.id !== currentItem.id;

          return (
            isTask && // Must be a task
            matchesParent && // Must be in same parent phase
            notSelf // Exclude self in edit mode
          );
        })
        .sort((a, b) => a.sequence_order - b.sequence_order);
    } else {
      // For PHASES: Show only other phases (not tasks) that come BEFORE in sequence
      return allPhasesAndTasks
        .filter((p) => {
          // A phase has is_task=false AND no parent_phase_id
          const isPhase = p.is_task === false && !p.parent_phase_id;
          return (
            isPhase && // Must be a phase (not a task)
            p.sequence_order < currentSequenceOrder && // Must come before current phase
            (!isEditMode || !currentItem || p.id !== currentItem.id) // Exclude self in edit mode
          );
        })
        .sort((a, b) => a.sequence_order - b.sequence_order);
    }
  }, [phases, phase, isEditMode]);

  const calculatedEndDate = calculateEndDate(
    watchedStartDate || new Date().toISOString().split('T')[0],
    watchedDuration || 1,
    watchedBuffer || 0
  );

  // Auto-set start date when dependency changes (only in CREATE mode, not EDIT mode)
  useEffect(() => {
    // Skip if in edit mode - don't auto-change dates for existing tasks
    if (isEditMode) return;

    // Skip if no dependency selected or "none" selected
    if (!watchedDependency || watchedDependency === 'none') return;

    // Find the selected dependency item
    const dependencyItem = availablePredecessors.find((p) => p.id === watchedDependency);
    if (!dependencyItem) return;

    // Use the stored planned_end_date from the database
    // This ensures we use the actual end date (which may have been adjusted by timeline dragging)
    const depEndDate = dependencyItem.planned_end_date;
    if (!depEndDate) return;

    // Parse end date and add 1 day
    const [year, month, day] = depEndDate.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

    // Format to YYYY-MM-DD
    const nextDayISO = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    // Update form start date
    form.setValue('planned_start_date', nextDayISO);
  }, [watchedDependency, availablePredecessors, form, isEditMode]);

  // Check for date conflict (start date before dependency end date)
  const dateConflict = (() => {
    if (!watchedDependency || watchedDependency === 'none' || !watchedStartDate) {
      return null;
    }

    const dependencyItem = availablePredecessors.find((p) => p.id === watchedDependency);
    if (!dependencyItem) return null;

    // Use the stored planned_end_date from the database
    // This ensures we're checking against the actual end date (which may have been adjusted by timeline dragging)
    const depEndDate = dependencyItem.planned_end_date;
    if (!depEndDate) return null;

    // Parse dates as local dates (not UTC) to avoid timezone issues
    const [startYear, startMonth, startDay] = watchedStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = depEndDate.split('-').map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    // Only show conflict if start date is BEFORE or SAME as dependency end date
    // If start date is AFTER dependency end date, that's valid (no conflict)
    if (startDate <= endDate) {
      return {
        dependencyName: dependencyItem.name,
        dependencyEndDate: depEndDate,
      };
    }

    return null;
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size={isEditMode ? 'sm' : 'default'}
            variant={isEditMode ? 'outline' : 'default'}
            aria-label={isEditMode ? 'Edit' : 'Add Phase'}
          >
            {isEditMode ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Phase
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-w-[700px] p-0 gap-0 flex flex-col !z-[10000]">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {isEditMode
              ? (phase?.is_task ? 'Edit Task' : 'Edit Phase')
              : 'Add New Phase'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the ${phase?.is_task ? 'task' : 'phase'} details below.`
              : 'Create a new phase for your project. All fields with * are required.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-6 pb-4 space-y-4 flex-1">
            {/* Phase Name with Color Picker */}
            <div className="flex gap-3 items-end">
              {/* Phase Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Phase Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Foundation, Framing, Drywall"
                        className="font-semibold h-14"
                        style={{ fontSize: '1.25rem' }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Picker Dropdown */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => {
                  const selectedColor = PHASE_COLORS[field.value as PhaseColor] || PHASE_COLORS[DEFAULT_PHASE_COLOR];
                  return (
                    <FormItem className="mt-8">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              style={{
                                backgroundColor: selectedColor.hex,
                                width: '2em',
                                height: '2em'
                              }}
                              className="rounded-md transition-all hover:scale-105 ring-1 ring-gray-300 flex-shrink-0"
                              title={selectedColor.name}
                              aria-label="Select phase color"
                            />
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="end">
                          <div className="flex gap-2 flex-wrap max-w-[180px]">
                            {Object.entries(PHASE_COLORS).map(([colorKey, colorValue]) => {
                              const isSelected = field.value === colorKey;
                              return (
                                <button
                                  key={colorKey}
                                  type="button"
                                  onClick={() => field.onChange(colorKey)}
                                  style={{ backgroundColor: colorValue.hex }}
                                  className={`relative h-7 w-7 rounded-md transition-all hover:scale-110 ${
                                    isSelected ? 'ring-2 ring-charcoal-blue ring-offset-1' : ''
                                  }`}
                                  title={colorValue.name}
                                >
                                  {isSelected && (
                                    <Check className="h-4 w-4 m-auto text-white" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Predecessor Phase (Dependency) - Positioned right after Name for better UX */}
            <FormField
              control={form.control}
              name="predecessor_phase_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depends On (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="!z-[10001]">
                      <SelectItem value="none">No dependency</SelectItem>
                      {availablePredecessors.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {phase?.is_task
                            ? 'No other tasks in this phase'
                            : 'No earlier phases available'}
                        </div>
                      )}
                      {availablePredecessors.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.sequence_order}. {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {phase?.is_task
                      ? 'This task cannot start until the selected task is completed. Start date will auto-update.'
                      : 'This phase cannot start until the selected phase is completed. Start date will auto-update.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this phase..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sequence Order and Planned Start Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sequence_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sequence Order *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Timeline order (1 = first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planned_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Conflict Warning */}
            {dateConflict && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Date Conflict Detected
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Start date is before or on the same day as dependency "{dateConflict.dependencyName}" ends ({new Date(dateConflict.dependencyEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}).
                      Consider updating the start date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Duration and Buffer */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Duration Field - Conditional Rendering */}
              {hasAutoCalculatedDuration ? (
                // Auto-calculated duration display (read-only)
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Duration (Days)
                  </label>
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        Auto-Calculated
                      </span>
                      <span className="text-2xl font-semibold text-blue-900">
                        {calculatedDuration} days
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Duration is automatically calculated based on {phase?.tasks?.length || 0} task(s) assigned to this phase.
                    </p>
                  </div>
                </div>
              ) : (
                // Manual duration input
                <FormField
                  control={form.control}
                  name="planned_duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={365}
                          placeholder="e.g., 7"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditMode
                          ? 'Duration will be auto-calculated once you add tasks'
                          : 'Optional - will be auto-calculated once you add tasks'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="buffer_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buffer Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={90}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Extra padding before next phase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Calculated End Date */}
            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-steel-gray">Calculated End Date</p>
                  <p className="mt-0.5 text-base font-semibold text-charcoal-blue">
                    {(() => {
                      // Parse as local date to avoid timezone issues
                      const [year, month, day] = calculatedEndDate.split('-').map(Number);
                      const endDateObj = new Date(year, month - 1, day);
                      return endDateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                    })()}
                  </p>
                </div>
                <p className="text-xs text-steel-gray">
                  {watchedDuration ?? 0} + {watchedBuffer} buffer = {(watchedDuration ?? 0) + watchedBuffer} days
                </p>
              </div>
            </div>

            {/* Status (for edit mode) */}
            {isEditMode && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="!z-[10001]">
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Contact Selection for Create Mode */}
            {!isEditMode && (
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-charcoal-blue mb-3">
                  Assign Contacts (Optional)
                </h3>
                <PendingContactsSection
                  availableContacts={availableContacts}
                  pendingContacts={pendingContacts}
                  onAdd={(contactId, role) => {
                    setPendingContacts([...pendingContacts, { contactId, role }]);
                  }}
                  onRemove={(contactId) => {
                    setPendingContacts(pendingContacts.filter(pc => pc.contactId !== contactId));
                  }}
                  loading={loadingContacts}
                />
              </div>
            )}

            {/* Assign Contacts Section - Edit Mode */}
            {isEditMode && (
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-charcoal-blue mb-3">
                  Assigned Contacts
                </h3>
                <AssignContactsSection
                  phaseId={phase?.id || null}
                  assignedContacts={phase?.phase_contacts || []}
                  onContactsChange={() => {
                    onSuccess?.();
                  }}
                  onPendingDeletesChange={(contactIds) => {
                    setPendingContactDeletes(contactIds);
                  }}
                />
              </div>
            )}
            </div>
            {/* End Scrollable Content Area */}

            {/* Fixed Footer with Action Buttons */}
            <DialogFooter className="border-t bg-white px-6 py-4 mt-0 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode
                  ? (phase?.is_task ? 'Update Task' : 'Update Phase')
                  : 'Create Phase'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Pending Contacts Section Component
 * For selecting contacts during phase creation
 */
interface PendingContactsSectionProps {
  availableContacts: Contact[];
  pendingContacts: Array<{ contactId: string; role: string }>;
  onAdd: (contactId: string, role: string) => void;
  onRemove: (contactId: string) => void;
  loading: boolean;
}

function PendingContactsSection({
  availableContacts,
  pendingContacts,
  onAdd,
  onRemove,
  loading,
}: PendingContactsSectionProps) {
  const [selectedContactId, setSelectedContactId] = useState('');
  const [role, setRole] = useState('');

  // Filter out already selected contacts
  const availableOptions = availableContacts.filter(
    (contact) => !pendingContacts.some((pc) => pc.contactId === contact.id)
  );

  const handleAdd = () => {
    if (!selectedContactId) return;
    onAdd(selectedContactId, role);
    setSelectedContactId('');
    setRole('');
  };

  return (
    <div className="space-y-3">
      {/* Selection Form */}
      <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
        <div className="space-y-3">
          <Select
            value={selectedContactId}
            onValueChange={setSelectedContactId}
            disabled={loading || availableOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? 'Loading...' : 'Select contact'} />
            </SelectTrigger>
            <SelectContent className="!z-[10001]">
              {availableOptions.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.company_name} ({contact.trade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Role (optional, e.g., Lead Contractor)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedContactId || loading}
          className="self-start"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {availableOptions.length === 0 && !loading && (
        <p className="text-sm text-steel-gray">
          {pendingContacts.length > 0
            ? 'All contacts have been added'
            : 'No contacts available. Create contacts first.'}
        </p>
      )}

      {/* Selected Contacts List */}
      {pendingContacts.length > 0 && (
        <div className="border-t pt-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-charcoal-blue">
              Selected Contacts ({pendingContacts.length})
            </p>
          </div>
          <div className="space-y-2">
            {pendingContacts.map((pc) => {
              const contact = availableContacts.find((c) => c.id === pc.contactId);
              if (!contact) return null;

              return (
                <div
                  key={pc.contactId}
                  className="flex items-center justify-between rounded-md border bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal-blue">
                      {contact.company_name} ({contact.trade})
                    </p>
                    <p className="text-xs text-steel-gray">
                      {contact.contact_person}
                      {pc.role && ` • ${pc.role}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(pc.contactId)}
                    className="ml-2 text-error-red hover:text-error-red hover:bg-error-red/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
