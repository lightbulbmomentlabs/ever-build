'use client';

/**
 * Task Quick Add Button Component
 *
 * Modal dialog for quickly creating tasks under a phase.
 * Inherits defaults from parent phase (color, start date, contacts).
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ListPlus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  UserPlus,
  Trash2,
  Badge,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PHASE_COLORS, PhaseColor, DEFAULT_PHASE_COLOR } from '@/lib/constants/phase-colors';

// Form validation schema
const taskFormSchema = z.object({
  name: z.string().min(2, 'Task name must be at least 2 characters'),
  description: z.string().optional(),
  sequence_order: z.number().int().min(1),
  planned_start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  planned_duration_days: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  buffer_days: z.number().int().min(0).max(90),
  predecessor_phase_id: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'delayed', 'blocked']),
  color: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

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

type Task = {
  id: string;
  name: string;
  sequence_order: number;
  planned_end_date?: string;
  planned_start_date?: string;
  planned_duration_days?: number;
  buffer_days?: number;
};

interface TaskQuickAddButtonProps {
  phaseId: string;
  phaseName: string;
  phaseColor?: string | null;
  phaseStartDate: string;
  existingTasks: Task[]; // Sibling tasks for predecessor selection
  onSuccess?: () => void;
  trigger?: React.ReactNode; // Custom trigger element
}

export function TaskQuickAddButton({
  phaseId,
  phaseName,
  phaseColor,
  phaseStartDate,
  existingTasks,
  onSuccess,
  trigger,
}: TaskQuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parentPhaseContacts, setParentPhaseContacts] = useState<PhaseContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsFetched, setContactsFetched] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const { toast } = useToast();

  // Get next sequence order for new task
  const getNextSequenceOrder = () => {
    if (existingTasks.length === 0) return 1;
    return Math.max(...existingTasks.map((t) => t.sequence_order)) + 1;
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sequence_order: getNextSequenceOrder(),
      planned_start_date: phaseStartDate,
      planned_duration_days: 1,
      buffer_days: 0,
      predecessor_phase_id: '',
      status: 'not_started',
      color: phaseColor || DEFAULT_PHASE_COLOR,
    },
  });

  // Fetch parent phase contacts when form opens
  useEffect(() => {
    if (isOpen && !contactsFetched) {
      const fetchPhaseContacts = async () => {
        setLoadingContacts(true);
        try {
          const response = await fetch(`/api/phases/${phaseId}`);
          if (!response.ok) throw new Error('Failed to fetch phase details');
          const data = await response.json();
          const contacts = data.phase?.phase_contacts || [];
          setParentPhaseContacts(contacts);
          // Auto-select inherited contacts (filter out any with missing contact data)
          const inheritedIds = new Set<string>(
            contacts
              .filter((pc: PhaseContact) => pc.contact)
              .map((pc: PhaseContact) => pc.contact.id)
          );
          setSelectedContactIds(inheritedIds);
        } catch (error) {
          console.error('Error fetching phase contacts:', error);
        } finally {
          setLoadingContacts(false);
          setContactsFetched(true);
        }
      };
      fetchPhaseContacts();
    }
  }, [isOpen, phaseId, contactsFetched]);

  // Fetch available contacts for adding more
  useEffect(() => {
    if (isOpen && availableContacts.length === 0) {
      const fetchContacts = async () => {
        try {
          const response = await fetch('/api/contacts');
          if (!response.ok) throw new Error('Failed to fetch contacts');
          const data = await response.json();
          setAvailableContacts(data.contacts || []);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        }
      };
      fetchContacts();
    }
  }, [isOpen, availableContacts.length]);

  // Reset form when opening/closing
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: '',
        description: '',
        sequence_order: getNextSequenceOrder(),
        planned_start_date: phaseStartDate,
        planned_duration_days: 1,
        buffer_days: 0,
        predecessor_phase_id: '',
        status: 'not_started',
        color: phaseColor || DEFAULT_PHASE_COLOR,
      });
      setShowMoreOptions(false);
    } else {
      // Reset contact selections when closing
      setParentPhaseContacts([]);
      setSelectedContactIds(new Set());
      setContactsFetched(false);
    }
  }, [isOpen, form, phaseStartDate, phaseColor, existingTasks, phaseId, phaseName]);

  const onSubmit = async (values: TaskFormValues) => {
    setLoading(true);

    try {
      // Create task
      const payload = {
        ...values,
        description: values.description || null,
        predecessor_phase_id: values.predecessor_phase_id || null,
        color: values.color || DEFAULT_PHASE_COLOR,
      };

      const response = await fetch(`/api/phases/${phaseId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      const taskId = data.task?.id;

      // Assign contacts if any are selected (and different from inherited)
      if (taskId && selectedContactIds.size > 0) {
        const inheritedContactIds = new Set(
          parentPhaseContacts.map((pc) => pc.contact.id)
        );

        // Only assign contacts that are explicitly added (not just inherited)
        const contactsToAssign = Array.from(selectedContactIds).filter(
          (id) => !inheritedContactIds.has(id) || selectedContactIds.has(id)
        );

        if (contactsToAssign.length > 0) {
          try {
            await Promise.all(
              contactsToAssign.map((contactId) =>
                fetch(`/api/phases/${taskId}/contacts`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contact_id: contactId,
                    role: null,
                    notification_advance_days: 7,
                  }),
                })
              )
            );
          } catch (contactError) {
            console.error('Error assigning contacts:', contactError);
            // Continue even if contact assignment fails
          }
        }
      }

      toast({
        title: 'Task Created',
        description: `${values.name} has been added to ${phaseName}.`,
      });

      setIsOpen(false);
      form.reset();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Watch for calculated end date
  const watchedStartDate = form.watch('planned_start_date');
  const watchedDuration = form.watch('planned_duration_days');
  const watchedBuffer = form.watch('buffer_days');
  const watchedDependency = form.watch('predecessor_phase_id');

  const calculateEndDate = (startDate: string, duration: number, buffer: number) => {
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const totalDays = duration + buffer;
    const end = new Date(start.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  };

  const calculatedEndDate = calculateEndDate(
    watchedStartDate || phaseStartDate,
    watchedDuration || 1,
    watchedBuffer || 0
  );

  // Available predecessor tasks (siblings only)
  const availablePredecessors = useMemo(() => {
    return [...existingTasks].sort((a, b) => a.sequence_order - b.sequence_order);
  }, [existingTasks]);

  // Auto-update start date when dependency changes
  useEffect(() => {
    if (!watchedDependency || watchedDependency === 'none') return;

    const selectedPredecessor = availablePredecessors.find((t) => t.id === watchedDependency);
    if (!selectedPredecessor) return;

    // Calculate the predecessor's end date
    const predecessorEndDate = selectedPredecessor.planned_end_date;
    if (!predecessorEndDate) return;

    // Set start date to the day after the predecessor's end date
    const [year, month, day] = predecessorEndDate.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const nextDay = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    const nextDayISO = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;

    // Update form start date
    form.setValue('planned_start_date', nextDayISO);
  }, [watchedDependency, availablePredecessors, form]);

  // Toggle contact selection
  const toggleContact = (contactId: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(contactId)) {
      newSet.delete(contactId);
    } else {
      newSet.add(contactId);
    }
    setSelectedContactIds(newSet);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2">
            <ListPlus className="h-4 w-4" />
            Task
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-w-[700px] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Task to {phaseName}</DialogTitle>
          <DialogDescription>
            Create a new task with inherited settings from the parent phase.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-6 pb-4 space-y-4 flex-1">
          {/* Essential Fields */}
          <div className="space-y-4">
            {/* Task Name with Color */}
            <div className="flex gap-3 items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Task Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Pour foundation, Frame walls"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Picker */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => {
                  const selectedColor = PHASE_COLORS[field.value as PhaseColor] || PHASE_COLORS[DEFAULT_PHASE_COLOR];
                  return (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              style={{
                                backgroundColor: selectedColor.hex,
                                width: '2.5em',
                                height: '2.5em'
                              }}
                              className="rounded-md transition-all hover:scale-105 ring-1 ring-gray-300 flex-shrink-0"
                              title={selectedColor.name}
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
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Predecessor Task - Positioned right after Name for better UX */}
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
                        <SelectValue placeholder="Select a task..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="!z-[99999]">
                      <SelectItem value="none">No dependency</SelectItem>
                      {availablePredecessors.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No other tasks in this phase yet
                        </div>
                      )}
                      {availablePredecessors.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.sequence_order}. {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This task cannot start until the selected task is completed. Start date will auto-update.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date and Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="planned_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planned_duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Phase Duration Impact Info */}
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
              <div className="flex gap-2 items-start">
                <div className="text-blue-600 flex-shrink-0 mt-0.5">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-900">Phase Duration Auto-Update</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Adding this task will automatically update the "{phaseName}" phase duration to include this task's timeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* More Options Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="gap-2"
          >
            {showMoreOptions ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            More Options
          </Button>

          {/* More Options Section */}
          {showMoreOptions && (
            <div className="space-y-4 pt-2 border-t">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this task..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buffer Days */}
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
                      Extra padding after this task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calculated End Date */}
              <div className="rounded-md bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-steel-gray">Calculated End Date</p>
                    <p className="mt-0.5 text-base font-semibold text-charcoal-blue">
                      {(() => {
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
                    {watchedDuration} + {watchedBuffer} buffer = {watchedDuration + watchedBuffer} days
                  </p>
                </div>
              </div>

              {/* Contact Management */}
              <div className="rounded-lg border bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-charcoal-blue mb-3">
                  Assigned Contacts
                </h4>

                {loadingContacts ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-steel-gray" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Selected Contacts Summary - Show at top for immediate visibility */}
                    {selectedContactIds.size > 0 && (
                      <div className="space-y-2 rounded-lg bg-primary/10 border-2 border-primary/30 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-primary">
                            Selected ({selectedContactIds.size})
                          </p>
                          <p className="text-xs text-steel-gray">
                            Will be assigned to this task
                          </p>
                        </div>
                        <div className="space-y-2">
                          {[...selectedContactIds].map((contactId) => {
                            // Find contact in either parent or available contacts
                            const parentContact = parentPhaseContacts.find(pc => pc.contact?.id === contactId);
                            const availableContact = availableContacts.find(c => c.id === contactId);
                            const contact = parentContact?.contact || availableContact;

                            if (!contact) return null;

                            return (
                              <div
                                key={contactId}
                                className="flex items-center justify-between rounded-md border border-primary bg-white p-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-charcoal-blue truncate">
                                    {contact.company_name}
                                  </p>
                                  <p className="text-xs text-steel-gray truncate">
                                    {contact.trade}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleContact(contactId)}
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

                    {/* Divider if contacts are selected */}
                    {selectedContactIds.size > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-steel-gray uppercase mb-2">
                          Available Contacts
                        </p>
                      </div>
                    )}

                    {/* Inherited Contacts */}
                    {parentPhaseContacts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-steel-gray uppercase">
                          From {phaseName}
                        </p>
                        {parentPhaseContacts.filter(pc => pc.contact).map((pc) => (
                          <div
                            key={pc.id}
                            className="flex items-center justify-between rounded-md border bg-white p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal-blue truncate">
                                {pc.contact.company_name}
                              </p>
                              <p className="text-xs text-steel-gray truncate">
                                {pc.contact.trade}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={selectedContactIds.has(pc.contact.id) ? 'default' : 'outline'}
                              onClick={() => toggleContact(pc.contact.id)}
                              className="ml-2"
                            >
                              {selectedContactIds.has(pc.contact.id) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                'Add'
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Additional Contacts */}
                    {availableContacts.filter(
                      (c) => !parentPhaseContacts.some((pc) => pc.contact?.id === c.id)
                    ).length > 0 && (
                      <div className="space-y-2 pt-3 border-t">
                        <p className="text-xs font-medium text-steel-gray uppercase">
                          Other Contacts
                        </p>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {availableContacts
                            .filter((c) => !parentPhaseContacts.some((pc) => pc.contact?.id === c.id))
                            .map((contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center justify-between rounded-md border bg-white p-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-charcoal-blue truncate">
                                    {contact.company_name}
                                  </p>
                                  <p className="text-xs text-steel-gray truncate">
                                    {contact.trade}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={selectedContactIds.has(contact.id) ? 'default' : 'outline'}
                                  onClick={() => toggleContact(contact.id)}
                                  className="ml-2"
                                >
                                  {selectedContactIds.has(contact.id) ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    'Add'
                                  )}
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {parentPhaseContacts.length === 0 && availableContacts.length === 0 && (
                      <p className="text-sm text-steel-gray">
                        No contacts available
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
            </div>
            {/* End Scrollable Content Area */}

            {/* Fixed Footer with Action Buttons */}
            <DialogFooter className="border-t bg-white px-6 py-4 mt-0 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
