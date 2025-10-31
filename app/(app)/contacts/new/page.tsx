import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ContactForm } from '@/components/contacts/contact-form';

/**
 * New Contact Page
 *
 * Form for creating a new contact
 */
export default async function NewContactPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-blue">Add New Contact</h1>
        <p className="mt-2 text-steel-gray">
          Add a new subcontractor or vendor to your contacts
        </p>
      </div>

      <ContactForm mode="create" />
    </div>
  );
}
