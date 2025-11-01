import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getContacts } from '@/lib/services/contact.service';
import { ContactsTable } from '@/components/contacts/contacts-table';
import { ContactsEmptyState } from '@/components/contacts/contacts-empty-state';
import { Button } from '@/components/ui/button';

/**
 * Contacts List Page
 *
 * Shows all contacts/subcontractors for the organization.
 */
export default async function ContactsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user and their contacts
  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect('/sign-in');
  }

  const contacts = await getContacts(user.organization_id);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-blue">Contacts</h1>
          <p className="mt-2 text-steel-gray">
            Manage your subcontractors and vendors
          </p>
        </div>
        <Link href="/contacts/new">
          <Button>Add Contact</Button>
        </Link>
      </div>

      {contacts.length === 0 ? (
        <ContactsEmptyState />
      ) : (
        <ContactsTable contacts={contacts} />
      )}
    </div>
  );
}
