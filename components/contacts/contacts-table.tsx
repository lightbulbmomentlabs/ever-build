'use client';

/**
 * Contacts View Component
 *
 * Displays contacts in either table or card view with toggle
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutList, LayoutGrid, Trash2, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DestructiveConfirmationDialog } from '@/components/ui/destructive-confirmation-dialog';
import { formatPhoneDisplay } from '@/lib/utils/phone';
import { SendSMSModal } from '@/components/sms/send-sms-modal';
import { ContactAvatar } from '@/components/contacts/contact-avatar';
import { ContactCard } from '@/components/contacts/contact-card';

type Contact = {
  id: string;
  company_name: string;
  contact_person: string;
  trade: string;
  phone_primary: string;
  phone_secondary: string | null;
  email: string | null;
  lead_time_days: number;
  is_active: boolean;
  image_url: string | null;
};

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts: initialContacts }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<{ id: string; name: string } | null>(null);

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('contacts-view-preference');
    if (savedView === 'list' || savedView === 'card') {
      setViewMode(savedView);
    }
  }, []);

  // Save view preference to localStorage when it changes
  const handleViewChange = (mode: 'list' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('contacts-view-preference', mode);
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.trade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (contactId: string, contactName: string) => {
    setContactToDelete({ id: contactId, name: contactName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Remove from local state
      setContacts(contacts.filter((c) => c.id !== contactToDelete.id));
      setContactToDelete(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {/* View Toggle */}
        <div className="flex gap-1 rounded-lg border bg-white p-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('list')}
            className="h-8"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('card')}
            className="h-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-steel-gray">
                    No contacts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <ContactAvatar
                        name={contact.contact_person}
                        imageUrl={contact.image_url}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{contact.company_name}</TableCell>
                    <TableCell>{contact.contact_person}</TableCell>
                    <TableCell>{contact.trade}</TableCell>
                    <TableCell>{formatPhoneDisplay(contact.phone_primary)}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.lead_time_days} days</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <SendSMSModal
                          contactId={contact.id}
                          contactName={contact.contact_person}
                          contactPhone={contact.phone_primary}
                        />
                        <Link href={`/contacts/${contact.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-error-red hover:bg-error-red/10 hover:text-error-red"
                          onClick={() => handleDeleteClick(contact.id, contact.contact_person)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <>
          {filteredContacts.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
              <p className="text-steel-gray">No contacts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onDelete={(id) => handleDeleteClick(id, contact.contact_person)}
                  isDeleting={isLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DestructiveConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        description={`Are you sure you want to delete ${contactToDelete?.name}? This will permanently remove the contact and all associated data.`}
        itemName={contactToDelete?.name}
        confirmationWord="DELETE"
        confirmButtonLabel="Delete Contact"
        isLoading={isLoading}
      />
    </div>
  );
}
