import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectsWithPhases } from '@/lib/services/project.service';
import { ProjectsTable } from '@/components/projects/projects-table';

/**
 * Projects List Page
 *
 * Shows all projects for the organization.
 */
export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  // Get all projects for the organization with phases
  const projects = await getProjectsWithPhases(user.organization_id);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal-blue">Projects</h1>
            <p className="mt-2 text-sm md:text-base text-steel-gray">
              Manage your construction projects
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center rounded-md bg-everbuild-orange px-6 py-3 md:px-4 md:py-2 text-base md:text-sm font-medium text-white hover:bg-everbuild-orange/90 transition-colors min-h-[48px] md:min-h-0"
          >
            New Project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
          <p className="text-steel-gray">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  );
}
