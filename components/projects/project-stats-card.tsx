'use client';

/**
 * Project Stats Card Component
 *
 * Displays key project metrics: duration, completion, baseline comparison, and schedule status
 */

import { Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';
import { cn } from '@/lib/utils';
import type { ProjectDuration, ScheduleStatus } from '@/lib/utils/project-metrics';

interface ProjectStatsCardProps {
  duration: ProjectDuration;
  completionPercentage: number;
  scheduleStatus: ScheduleStatus;
  baselineDays: number | null;
}

export function ProjectStatsCard({
  duration,
  completionPercentage,
  scheduleStatus,
  baselineDays,
}: ProjectStatsCardProps) {
  // Format date range
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 'Not set';

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', formatOptions);
    const endStr = end.toLocaleDateString('en-US', formatOptions);

    return `${startStr} - ${endStr}`;
  };

  // Status color mapping
  const statusConfig = {
    on_track: {
      icon: CheckCircle2,
      bgColor: 'bg-success-green/10',
      textColor: 'text-success-green',
      iconColor: 'text-success-green',
    },
    needs_attention: {
      icon: AlertTriangle,
      bgColor: 'bg-warning-amber/10',
      textColor: 'text-warning-amber',
      iconColor: 'text-warning-amber',
    },
    behind: {
      icon: AlertTriangle,
      bgColor: 'bg-error-red/10',
      textColor: 'text-error-red',
      iconColor: 'text-error-red',
    },
  };

  const statusStyle = statusConfig[scheduleStatus.status];
  const StatusIcon = statusStyle.icon;

  // Calculate baseline comparison
  const hasBaseline = baselineDays !== null && baselineDays > 0;
  const daysDifference = hasBaseline ? duration.totalDays - baselineDays : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Project Duration */}
      <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blueprint-teal/10">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blueprint-teal" />
          </div>
          <p className="text-xs md:text-sm font-medium text-steel-gray">Project Duration</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl font-bold text-charcoal-blue">
            {duration.totalDays}
            <span className="text-base md:text-lg font-normal text-steel-gray ml-1">days</span>
          </p>
          <p className="text-xs text-steel-gray">{formatDateRange(duration.startDate, duration.endDate)}</p>
        </div>
      </div>

      {/* Card 2: Completion Progress */}
      <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs md:text-sm font-medium text-steel-gray">Completion</p>
        </div>
        <div className="flex items-center justify-center">
          <CircularProgress percentage={completionPercentage} size={80} strokeWidth={6} className="md:hidden" />
          <CircularProgress percentage={completionPercentage} size={100} strokeWidth={8} className="hidden md:flex" />
        </div>
      </div>

      {/* Card 3: Baseline Comparison */}
      <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blueprint-teal/10">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blueprint-teal" />
          </div>
          <p className="text-xs md:text-sm font-medium text-steel-gray">Baseline</p>
        </div>
        {hasBaseline ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs md:text-sm text-steel-gray">Originally</span>
              <span className="text-base md:text-lg font-semibold text-charcoal-blue">{baselineDays} days</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs md:text-sm text-steel-gray">Current</span>
              <span className="text-base md:text-lg font-semibold text-charcoal-blue">{duration.totalDays} days</span>
            </div>
            {daysDifference !== null && daysDifference !== 0 && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                  daysDifference > 0 ? 'bg-error-red/10 text-error-red' : 'bg-success-green/10 text-success-green'
                )}
              >
                {daysDifference > 0 ? '+' : ''}
                {daysDifference} days
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-steel-gray">No baseline set</p>
            <p className="text-xs text-steel-gray/60">Set a baseline to track schedule adherence</p>
          </div>
        )}
      </div>

      {/* Card 4: Schedule Status */}
      <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', statusStyle.bgColor)}>
            <StatusIcon className={cn('h-4 w-4 md:h-5 md:w-5', statusStyle.iconColor)} />
          </div>
          <p className="text-xs md:text-sm font-medium text-steel-gray">Status</p>
        </div>
        <div className="space-y-2">
          <p className={cn('text-base md:text-lg font-semibold', statusStyle.textColor)}>
            {scheduleStatus.status === 'on_track' && 'On Track'}
            {scheduleStatus.status === 'needs_attention' && 'Attention Needed'}
            {scheduleStatus.status === 'behind' && 'Behind Schedule'}
          </p>
          <p className="text-xs md:text-sm text-steel-gray">{scheduleStatus.message}</p>
        </div>
      </div>
    </div>
  );
}
