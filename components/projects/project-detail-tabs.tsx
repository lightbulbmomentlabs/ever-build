'use client';

/**
 * Project Detail Tabs Component
 * Client component to avoid hydration mismatch with Radix UI Tabs
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PhaseTimeline } from '@/components/projects/phase-timeline';
import { GanttTimeline } from '@/components/timeline/GanttTimeline';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';

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
  color?: string | null;
  metadata?: any;
  parent_phase_id?: string | null;
  is_task: boolean;
  tasks?: Phase[];
  computed_progress?: number;
  phase_contacts?: any[];
};

interface ProjectDetailTabsProps {
  projectId: string;
  phases: Phase[];
  documents: any[]; // Using any[] to match database schema flexibly
}

export function ProjectDetailTabs({ projectId, phases, documents }: ProjectDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('list');

  // Flatten phases with nested tasks into a single array for GanttTimeline
  // This transforms [{...phase, tasks: [...]}, ...] into [phase, task1, task2, ...]
  const flattenedPhases = phases.flatMap(phase => {
    const { tasks, ...phaseWithoutTasks } = phase;
    return [phaseWithoutTasks, ...(tasks || [])];
  });

  console.log('ProjectDetailTabs: Original phases:', phases.length);
  console.log('ProjectDetailTabs: Flattened phases:', flattenedPhases.length);
  console.log('ProjectDetailTabs: Sample phase with tasks:', phases.find(p => p.tasks && p.tasks.length > 0));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
      <TabsList className="inline-flex">
        <TabsTrigger value="list" className="min-h-[44px] text-base">List</TabsTrigger>
        <TabsTrigger value="timeline" className="min-h-[44px] text-base">Timeline</TabsTrigger>
        <TabsTrigger value="documents" className="min-h-[44px] text-base">Documents</TabsTrigger>
      </TabsList>

      {/* List View Tab - Original Card View */}
      <TabsContent value="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-bold text-charcoal-blue">Phase List</h2>
        </div>
        <PhaseTimeline projectId={projectId} phases={phases} />
      </TabsContent>

      {/* Timeline Tab */}
      <TabsContent value="timeline" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-bold text-charcoal-blue">Project Timeline</h2>
        </div>

        <GanttTimeline
          projectId={projectId}
          phases={flattenedPhases as any} // Flattened array of phases and tasks
        />
      </TabsContent>

      {/* Documents Tab */}
      <TabsContent value="documents" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg md:text-2xl font-bold text-charcoal-blue">Project Documents</h2>
          <DocumentUpload projectId={projectId} />
        </div>
        <DocumentList projectId={projectId} documents={documents} />
      </TabsContent>
    </Tabs>
  );
}
