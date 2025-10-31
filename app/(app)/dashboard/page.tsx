import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ensureUserExists } from '@/lib/services/sync-user.service';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectStats, getProjectsWithPhases } from '@/lib/services/project.service';
import { getContacts } from '@/lib/services/contact.service';
import { CircularProgress } from '@/components/ui/circular-progress';
import { calculateCompletionPercentage, calculateProjectDuration } from '@/lib/utils/project-metrics';

/**
 * Dashboard Page
 *
 * Main dashboard view after authentication.
 * Shows overview of projects, upcoming phases, and recent activity.
 */
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Ensure user exists in Supabase (creates on first visit)
    console.log('[Dashboard] Ensuring user exists for userId:', userId);
    await ensureUserExists();

    console.log('[Dashboard] Fetching user from Supabase');
    const user = await getUserByClerkId(userId);
    if (!user) {
      console.error('[Dashboard] User not found in Supabase after ensureUserExists');
      throw new Error('User not found in database after sync');
    }

    console.log('[Dashboard] Fetching dashboard data for org:', user.organization_id);
    // Fetch dashboard data
    const [projectStats, recentProjects, contacts] = await Promise.all([
      getProjectStats(user.organization_id),
      getProjectsWithPhases(user.organization_id),
      getContacts(user.organization_id, { is_active: true }),
    ]);

    console.log('[Dashboard] Successfully loaded dashboard data');

    // Get only the 5 most recent projects
    const displayProjects = recentProjects.slice(0, 5);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">Dashboard</h1>
        <p className="mt-2 text-sm md:text-base text-steel-gray">
          Welcome to EverBuild. Here's an overview of your projects.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <h3 className="text-xs md:text-sm font-medium text-steel-gray">Active Projects</h3>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
            {projectStats.active}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <h3 className="text-xs md:text-sm font-medium text-steel-gray">Sold</h3>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
            {projectStats.sold}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Projects</h3>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
            {projectStats.total}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 md:p-6 shadow-sm">
          <h3 className="text-xs md:text-sm font-medium text-steel-gray">Total Contacts</h3>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-charcoal-blue">
            {contacts.length}
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mt-6 md:mt-8 rounded-lg border bg-white p-4 md:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-charcoal-blue">Recent Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-blueprint-teal hover:underline"
          >
            View All
          </Link>
        </div>

        {displayProjects.length === 0 ? (
          <p className="text-sm md:text-base text-steel-gray">
            No projects yet.{' '}
            <Link href="/projects/new" className="text-blueprint-teal hover:underline">
              Create your first project
            </Link>{' '}
            to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {displayProjects.map((project) => {
              const completionPercentage = calculateCompletionPercentage(project.phases || []);
              const duration = calculateProjectDuration(project.phases || []);

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="block rounded-md border p-4 transition-colors hover:bg-concrete-white min-h-[44px]"
                >
                  {/* Mobile Layout */}
                  <div className="flex flex-col gap-3 md:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-charcoal-blue truncate">{project.name}</h3>
                        <p className="mt-1 text-sm text-steel-gray">
                          {project.city}, {project.state}
                        </p>
                      </div>
                      <CircularProgress
                        percentage={completionPercentage}
                        size={36}
                        strokeWidth={3}
                        showPercentage={true}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-steel-gray">Duration: </span>
                        <span className="font-medium text-charcoal-blue">{duration.totalDays} days</span>
                      </div>
                      <div>
                        <span className="text-steel-gray">Target: </span>
                        <span className="font-medium text-charcoal-blue">
                          {new Date(project.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-charcoal-blue">{project.name}</h3>
                      <p className="mt-1 text-sm text-steel-gray">
                        {project.city}, {project.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <CircularProgress
                          percentage={completionPercentage}
                          size={48}
                          strokeWidth={4}
                          showPercentage={true}
                        />
                        <span className="mt-1 text-xs text-steel-gray">Complete</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-steel-gray">Duration</p>
                        <p className="text-sm font-medium text-charcoal-blue">
                          {duration.totalDays} days
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-steel-gray">Target Date</p>
                        <p className="text-sm font-medium text-charcoal-blue">
                          {new Date(project.target_completion_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
