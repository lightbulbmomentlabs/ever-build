'use client';

/**
 * Mobile Project Card Component
 *
 * Card layout for displaying projects on mobile devices
 * Replaces table rows with touch-friendly cards
 */

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { calculateCompletionPercentage } from '@/lib/utils/project-metrics';
import type { ProjectWithPhases } from '@/lib/services/project.service';

interface ProjectCardProps {
  project: ProjectWithPhases;
  onDelete: (projectSlug: string, projectId: string) => void;
  isDeleting: boolean;
}

const statusColors = {
  not_started: 'bg-steel-gray/10 text-steel-gray',
  active: 'bg-success-green/10 text-success-green',
  on_hold: 'bg-warning-amber/10 text-warning-amber',
  under_contract: 'bg-blueprint-teal/10 text-blueprint-teal',
  irsa: 'bg-purple-500/10 text-purple-600',
  sold: 'bg-success-green/10 text-success-green',
  warranty_period: 'bg-blue-500/10 text-blue-600',
  archived: 'bg-error-red/10 text-error-red',
};

const statusLabels = {
  not_started: 'Not Started',
  active: 'Active',
  on_hold: 'On Hold',
  under_contract: 'Under Contract',
  irsa: 'IRSA',
  sold: 'Sold',
  warranty_period: 'Warranty Period',
  archived: 'Archived',
};

export function ProjectCard({ project, onDelete, isDeleting }: ProjectCardProps) {
  const completionPercentage = calculateCompletionPercentage(project.phases || []);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          href={`/projects/${project.slug}`}
          className="flex-1 min-w-0"
        >
          <h3 className="font-semibold text-charcoal-blue truncate hover:text-blueprint-teal transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-steel-gray">
            {project.city}, {project.state}
          </p>
        </Link>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
            statusColors[project.status]
          }`}
        >
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Progress and Target Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CircularProgress
            percentage={completionPercentage}
            size={44}
            strokeWidth={4}
          />
          <div>
            <p className="text-xs text-steel-gray">Completion</p>
            <p className="text-sm font-semibold text-charcoal-blue">
              {completionPercentage}%
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-steel-gray">Target Date</p>
          <p className="text-sm font-medium text-charcoal-blue">
            {new Date(project.target_completion_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        <Link href={`/projects/${project.slug}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full min-h-[44px]">
            Edit
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(project.slug, project.id)}
          disabled={isDeleting}
          className="min-h-[44px] min-w-[44px] text-steel-gray hover:text-error-red hover:bg-error-red/10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
