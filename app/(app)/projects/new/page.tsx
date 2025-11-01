import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProjectFormWrapper } from '@/components/projects/project-form';

/**
 * New Project Page
 *
 * Form for creating a new project
 */
export default async function NewProjectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-blue">Create New Project</h1>
        <p className="mt-2 text-steel-gray">Add a new construction project</p>
      </div>

      <ProjectFormWrapper mode="create" />
    </div>
  );
}
