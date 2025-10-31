import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectBySlug } from '@/lib/services/project.service';
import { getDocumentsByProject } from '@/lib/services/document.service';
import { Button } from '@/components/ui/button';
import { ProjectDetailTabs } from '@/components/projects/project-detail-tabs';
import { ProjectStatsCard } from '@/components/projects/project-stats-card';
import {
  calculateProjectDuration,
  calculateCompletionPercentage,
  getScheduleStatus,
} from '@/lib/utils/project-metrics';

/**
 * Project Detail Page
 *
 * Shows project information and phase timeline
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  const { slug } = await params;
  const project = await getProjectBySlug(slug, user.organization_id);
  const documents = await getDocumentsByProject(project.id, user.organization_id);

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

  // Calculate project metrics
  const duration = calculateProjectDuration(project.phases || []);
  const completionPercentage = calculateCompletionPercentage(project.phases || []);
  const scheduleStatus = getScheduleStatus(
    {
      baseline_start_date: project.baseline_start_date,
      baseline_duration_days: project.baseline_duration_days,
      baseline_set_date: project.baseline_set_date,
    },
    project.phases || [],
    duration
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Project Header */}
      <div>
        <div className="mb-4">
          <Link
            href="/projects"
            className="text-sm text-blueprint-teal hover:underline inline-flex items-center gap-1"
          >
            ← Back to Projects
          </Link>
        </div>

        {/* Mobile Header Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-blue">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-steel-gray">
              {project.address}, {project.city}, {project.state} {project.zip_code}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusColors[project.status]
              }`}
            >
              {statusLabels[project.status]}
            </span>
            <Link href={`/projects/${project.slug}/edit`} className="flex-1">
              <Button variant="outline" className="w-full min-h-[44px]">Edit Project</Button>
            </Link>
          </div>
        </div>

        {/* Desktop Header Layout */}
        <div className="hidden md:flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-blue">
              {project.name}
            </h1>
            <p className="mt-2 text-steel-gray">
              {project.address}, {project.city}, {project.state} {project.zip_code}
            </p>
          </div>

          <div className="flex gap-3">
            <Link href={`/projects/${project.slug}/edit`}>
              <Button variant="outline">Edit Project</Button>
            </Link>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                statusColors[project.status]
              }`}
            >
              {statusLabels[project.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Project Stats - Key Metrics */}
      <ProjectStatsCard
        duration={duration}
        completionPercentage={completionPercentage}
        scheduleStatus={scheduleStatus}
        baselineDays={project.baseline_duration_days}
      />

      {/* Project Info */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 md:p-5">
          <p className="text-xs md:text-sm text-steel-gray">Target Completion</p>
          <p className="mt-1 text-base md:text-lg font-semibold text-charcoal-blue">
            {new Date(project.target_completion_date).toLocaleDateString()}
          </p>
        </div>

        {project.lot_number && (
          <div className="rounded-lg border bg-white p-4 md:p-5">
            <p className="text-xs md:text-sm text-steel-gray">Lot Number</p>
            <p className="mt-1 text-base md:text-lg font-semibold text-charcoal-blue">
              {project.lot_number}
            </p>
          </div>
        )}

        {project.model_type && (
          <div className="rounded-lg border bg-white p-4 md:p-5">
            <p className="text-xs md:text-sm text-steel-gray">Model Type</p>
            <p className="mt-1 text-base md:text-lg font-semibold text-charcoal-blue">
              {project.model_type}
            </p>
          </div>
        )}

        {project.square_footage && (
          <div className="rounded-lg border bg-white p-4 md:p-5">
            <p className="text-xs md:text-sm text-steel-gray">Square Footage</p>
            <p className="mt-1 text-base md:text-lg font-semibold text-charcoal-blue">
              {project.square_footage.toLocaleString()} sq ft
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="rounded-lg border bg-white p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-charcoal-blue">Notes</h2>
          <p className="mt-2 text-sm md:text-base text-steel-gray whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {/* Tabs: Timeline & Documents */}
      <ProjectDetailTabs
        projectId={project.id}
        phases={project.phases}
        documents={documents}
      />
    </div>
  );
}
