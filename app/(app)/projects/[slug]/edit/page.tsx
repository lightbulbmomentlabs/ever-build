import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectBySlug } from '@/lib/services/project.service';
import { ProjectForm } from '@/components/projects/project-form';

/**
 * Edit Project Page
 *
 * Form for editing an existing project
 */
export default async function EditProjectPage({
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

  // Get the project
  const { slug } = await params;
  const project = await getProjectBySlug(slug, user.organization_id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-blue">Edit Project</h1>
        <p className="mt-2 text-steel-gray">Update project information</p>
      </div>

      <ProjectForm mode="edit" project={project} />
    </div>
  );
}
