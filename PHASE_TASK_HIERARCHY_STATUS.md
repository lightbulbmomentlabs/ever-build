# Phase → Task Hierarchy Implementation Status

## ✅ Completed Work

### 1. Database Migration (COMPLETED)
**File**: `supabase/migrations/20251027000001_add_phase_hierarchy.sql`

Added columns to `phases` table:
- `parent_phase_id` (UUID, nullable) - References parent phase
- `is_task` (BOOLEAN) - Distinguishes tasks from phases
- Indexes for performance
- Constraints to ensure data integrity

**Action Required**: Apply this migration to your Supabase database via:
- SQL Editor in Supabase Dashboard, OR
- Run `npx supabase db push` (after configuring `supabase link`)

### 2. Backend Phase Service (COMPLETED)
**File**: `lib/services/phase.service.ts`

Added hierarchy methods:
- `getPhasesWithTasks()` - Get all phases with tasks in hierarchical structure
- `getTopLevelPhases()` - Get only parent phases
- `calculatePhaseProgress()` - Roll up task completion (0-100%)
- `calculatePhaseDatesFromTasks()` - Auto-compute phase envelope from task dates
- `getTasksByPhase()` - Get tasks for a specific phase
- New type: `PhaseWithTasks` - Phase with tasks array and computed_progress

### 3. Timeline Zoom & Pan Controls (COMPLETED - Previous Session)
**File**: `components/projects/phase-timeline.tsx`

Fully working zoom and pan controls in Gantt view:
- Zoom slider (50% to 400%)
- Click-drag panning on empty space
- Adaptive header granularity based on zoom
- "Fit to screen" button

---

## 🚧 Remaining Work

### Phase 1: API Endpoints (NEXT STEP)

#### Files to Update:

**A. `app/api/projects/[id]/phases/route.ts`**
- Update GET to use `getPhasesWithTasks()` instead of `getPhasesByProject()`
- This will return hierarchical data with tasks nested under phases

**B. `app/api/phases/route.ts` (if exists) or create**
- POST endpoint: Accept `parent_phase_id` and `is_task` parameters
- Validate: tasks must have parent_phase_id
- Validate: phases must NOT have parent_phase_id

**C. `app/api/phases/[id]/route.ts`**
- PATCH endpoint: Allow updating `parent_phase_id` and `is_task`
- Add validation for hierarchy rules

**D. Create `app/api/phases/[phaseId]/tasks/route.ts`** (NEW)
- POST: Quick task creation endpoint
- Pre-fills parent_phase_id
- Returns created task

**E. Create `app/api/phases/[phaseId]/progress/route.ts`** (NEW)
- GET: Return computed progress for a phase
- Useful for real-time progress updates

### Phase 2: Frontend Type Updates

#### File: `components/projects/phase-timeline.tsx`

Update the Phase type definition (around line 54):

```typescript
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

  // NEW FIELDS
  parent_phase_id?: string | null;
  is_task: boolean;
  tasks?: Phase[];  // Child tasks
  computed_progress?: number;  // 0-100
};
```

### Phase 3: Card View Hierarchy

#### File: `components/projects/phase-timeline.tsx`

**Card View Changes** (around lines 894-939):

1. **Add Expand/Collapse State**:
```typescript
const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
```

2. **Filter for Top-Level Phases Only**:
```typescript
const topLevelPhases = sortedPhases.filter(p => !p.is_task);
```

3. **Add Expand Icon to Phase Cards**:
- ChevronDown / ChevronRight icon next to phase name
- Only show if phase has tasks
- Toggle expandedPhases set on click

4. **Render Tasks Under Expanded Phases**:
```typescript
{phase.tasks && expandedPhases.has(phase.id) && (
  <div className="ml-8 mt-4 space-y-3">
    {phase.tasks.map(task => (
      <TaskCard key={task.id} task={task} />
    ))}
  </div>
)}
```

5. **Create TaskCard Component** (lighter styling):
- Same structure as phase card but lighter background
- Thinner colored border (2px vs 4px)
- No expand icon (tasks can't have sub-tasks)

6. **Add "Add Task" Button on Phase Cards**:
- Small "+ Add Task" button in top-right of phase card
- Opens TaskQuickAddModal (see Phase 5)

### Phase 4: Gantt View Hierarchy

#### File: `components/projects/phase-timeline.tsx`

**Gantt View Changes** (around lines 1010-1300):

1. **Collapsed Phase Bar** (default):
```typescript
if (!expandedPhases.has(phase.id)) {
  return (
    <PhaseBar
      phase={phase}
      showSummary={true}  // Show "X days • Y tasks • Z%"
      showProgressBar={true}
    />
  );
}
```

2. **Expanded Phase with Tasks**:
```typescript
return (
  <>
    <PhaseHeaderRow phase={phase} />
    {phase.tasks?.map(task => (
      <TaskBar key={task.id} task={task} indent={true} />
    ))}
  </>
);
```

3. **Progress Indicator** (collapsed view):
- Add progress bar fill inside phase bar
- Fill percentage = computed_progress
- Darker shade of phase color for filled portion

4. **Toolbar Addition**:
- "Expand All" / "Collapse All" buttons next to zoom controls

### Phase 5: Task Creation UI

#### A. Update `components/phases/phase-form-modal.tsx`

Add "Create as Task" toggle:
```typescript
<div className="flex items-center gap-2">
  <Switch
    checked={createAsTask}
    onCheckedChange={setCreateAsTask}
  />
  <Label>Create as Task (within a phase)</Label>
</div>

{createAsTask && (
  <Select value={parentPhaseId} onValueChange={setParentPhaseId}>
    <SelectTrigger>
      <SelectValue placeholder="Select parent phase" />
    </SelectTrigger>
    <SelectContent>
      {phases.filter(p => !p.is_task).map(phase => (
        <SelectItem key={phase.id} value={phase.id}>
          {phase.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

#### B. Create `components/phases/task-quick-add-button.tsx` (NEW)

Simplified task creation:
- Opens compact modal
- Required: name, duration
- Optional: start date, contact assignment
- Pre-fills parent_phase_id

```typescript
<Button
  size="sm"
  variant="ghost"
  onClick={() => setShowTaskModal(true)}
>
  <Plus className="h-4 w-4 mr-1" />
  Add Task
</Button>
```

### Phase 6: Dependency Updates

#### File: `components/phases/phase-form-modal.tsx`

Update dependency selector:
```typescript
<Select value={predecessorPhaseId} onValueChange={setPredecessorPhaseId}>
  <SelectTrigger>
    <SelectValue placeholder="Select dependency" />
  </SelectTrigger>
  <SelectContent>
    {/* Group: Phases */}
    <SelectGroup>
      <SelectLabel>Phases</SelectLabel>
      {phases.filter(p => !p.is_task && p.id !== phase?.id).map(p => (
        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
      ))}
    </SelectGroup>

    {/* Group: Tasks in same phase (if creating/editing a task) */}
    {isTask && currentPhase && (
      <SelectGroup>
        <SelectLabel>Tasks in {currentPhase.name}</SelectLabel>
        {currentPhase.tasks?.filter(t => t.id !== phase?.id).map(task => (
          <SelectItem key={task.id} value={task.id} className="pl-6">
            {task.name}
          </SelectItem>
        ))}
      </SelectGroup>
    )}
  </SelectContent>
</Select>
```

### Phase 7: State Persistence

#### Create `hooks/use-phase-expand-state.ts` (NEW)

```typescript
export function usePhaseExpandState(projectId: string) {
  const key = `project_${projectId}_phase_expand_state`;

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem(key);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Default: all expanded on first visit
  useEffect(() => {
    if (expandedPhases.size === 0 && phases.length > 0) {
      const allPhaseIds = phases.filter(p => !p.is_task).map(p => p.id);
      setExpandedPhases(new Set(allPhaseIds));
    }
  }, [phases]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...expandedPhases]));
  }, [expandedPhases, key]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allPhaseIds = phases.filter(p => !p.is_task).map(p => p.id);
    setExpandedPhases(new Set(allPhaseIds));
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  return { expandedPhases, togglePhase, expandAll, collapseAll };
}
```

### Phase 8: Drag & Drop Constraints

#### File: `components/projects/phase-timeline.tsx`

Update `handleDragEnd` (around line 487):

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const activeItem = sortedPhases.find(p => p.id === active.id);
  const overItem = sortedPhases.find(p => p.id === over.id);

  // Prevent dragging task outside its parent phase
  if (activeItem?.is_task && overItem?.is_task) {
    if (activeItem.parent_phase_id !== overItem.parent_phase_id) {
      toast({
        title: 'Invalid Move',
        description: 'Tasks can only be reordered within their parent phase.',
        variant: 'destructive',
      });
      return;
    }
  }

  // Prevent dragging phase into task position
  if (!activeItem?.is_task && overItem?.is_task) {
    toast({
      title: 'Invalid Move',
      description: 'Phases cannot be placed within tasks.',
      variant: 'destructive',
    });
    return;
  }

  // Continue with reordering logic...
};
```

### Phase 9: Default Phase Templates

#### Create `lib/constants/default-phases.ts` (NEW)

```typescript
export const DEFAULT_PHASE_TEMPLATES = [
  { name: 'Foundation', typical_duration_days: 14, sequence_order: 1 },
  { name: 'Framing', typical_duration_days: 21, sequence_order: 2 },
  { name: 'Rough-Ins (Plumbing, Electrical, HVAC)', typical_duration_days: 10, sequence_order: 3 },
  { name: 'Insulation', typical_duration_days: 3, sequence_order: 4 },
  { name: 'Drywall', typical_duration_days: 7, sequence_order: 5 },
  { name: 'Interior Trim & Finishes', typical_duration_days: 14, sequence_order: 6 },
  { name: 'Final Inspection & Cleanup', typical_duration_days: 3, sequence_order: 7 },
];
```

#### Update `components/phases/phase-form-modal.tsx`

Add "Import Template" button that creates phases from template when clicked.

---

## Testing Checklist

Before marking complete, verify:

- [ ] Database migration applied successfully
- [ ] Can create a phase (existing functionality still works)
- [ ] Can create a task (new functionality)
  - [ ] Task appears nested under parent phase in card view
  - [ ] Task appears indented under parent phase in Gantt view
- [ ] Progress indicator shows correctly
  - [ ] 0% when no tasks completed
  - [ ] 100% when all tasks completed
  - [ ] Correct percentage for partial completion
- [ ] Expand/collapse works in both card and Gantt views
- [ ] State persists when navigating away and back
- [ ] Drag & drop constraints work
  - [ ] Can reorder phases
  - [ ] Can reorder tasks within same phase
  - [ ] Cannot drag task to different phase
- [ ] Dependencies work
  - [ ] Task can depend on another task in same phase
  - [ ] Task can depend on a phase
  - [ ] Phase can depend on another phase
- [ ] Default template import works
- [ ] Timeline zoom still works with hierarchy
- [ ] Timeline pan still works with hierarchy

---

## Quick Start: Next Steps

1. **Apply Database Migration**:
   - Open Supabase Dashboard → SQL Editor
   - Copy/paste content from `supabase/migrations/20251027000001_add_phase_hierarchy.sql`
   - Execute

2. **Update API Endpoints** (Phase 1 above)
   - Start with `app/api/projects/[id]/phases/route.ts`
   - Use `getPhasesWithTasks()` from phase service

3. **Update Frontend Types** (Phase 2 above)
   - Add new fields to Phase type in `phase-timeline.tsx`

4. **Implement Card View Hierarchy** (Phase 3 above)
   - Add expand/collapse state
   - Render tasks under phases
   - Add "Add Task" button

Then continue through phases 4-9 as outlined above.

---

## Estimated Time Remaining

- Phase 1 (API Endpoints): 2-3 hours
- Phase 2 (Type Updates): 30 minutes
- Phase 3 (Card View): 3-4 hours
- Phase 4 (Gantt View): 4-5 hours
- Phase 5 (Task Creation UI): 2-3 hours
- Phase 6 (Dependencies): 1-2 hours
- Phase 7 (State Persistence): 1 hour
- Phase 8 (Drag & Drop): 1-2 hours
- Phase 9 (Templates): 1-2 hours

**Total**: ~16-23 hours of implementation work

---

## Notes

- All existing phase functionality continues to work (backward compatible)
- Phases without tasks behave exactly as before
- The migration adds columns but doesn't modify existing data
- TypeScript will help catch any missing type updates
- Test frequently as you implement each phase

---

Generated: 2025-10-27
