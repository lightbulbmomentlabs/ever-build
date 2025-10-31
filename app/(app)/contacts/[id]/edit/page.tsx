import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getContactById } from '@/lib/services/contact.service';
import { ContactForm } from '@/components/contacts/contact-form';

/**
 * Edit Contact Page
 *
 * Form for editing an existing contact
 */
export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  // Get the contact
  const { id } = await params;
  const contact = await getContactById(id, user.organization_id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-blue">Edit Contact</h1>
        <p className="mt-2 text-steel-gray">Update contact information</p>
      </div>

      <ContactForm mode="edit" contact={contact} />
    </div>
  );
}
