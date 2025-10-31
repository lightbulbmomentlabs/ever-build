'use client';

/**
 * Assign Contacts Section Component
 *
 * Allows users to assign contacts to a phase with optional roles
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Contact = {
  id: string;
  company_name: string;
  contact_person: string;
  trade: string;
  phone_primary: string;
};

type PhaseContact = {
  id: string;
  role: string | null;
  contact: Contact;
};

interface AssignContactsSectionProps {
  phaseId: string | null; // null for new phases
  assignedContacts: PhaseContact[];
  onContactsChange?: () => void; // Callback to refresh phase data after save
  onPendingDeletesChange?: (contactIds: string[]) => void; // Callback for pending deletes
}

export function AssignContactsSection({
  phaseId,
  assignedContacts,
  onContactsChange,
  onPendingDeletesChange,
}: AssignContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingContacts, setIsFetchingContacts] = useState(true);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]); // Track contacts marked for deletion
  const { toast } = useToast();

  // Reset pending deletes when assigned contacts change (e.g., after form submission)
  useEffect(() => {
    setPendingDeletes([]);
  }, [assignedContacts]);

  // Fetch available contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingContacts(false);
      }
    };

    fetchContacts();
  }, [toast]);

  // Filter contacts to show (exclude pending deletes)
  const displayedContacts = assignedContacts.filter(
    (ac) => !pendingDeletes.includes(ac.contact.id)
  );

  // Filter out already assigned contacts, but include those pending deletion
  // This allows re-adding contacts that were just marked for deletion
  const availableContacts = contacts.filter(
    (contact) => {
      const isAssigned = assignedContacts.some((ac) => ac.contact.id === contact.id);
      const isPendingDelete = pendingDeletes.includes(contact.id);
      // Available if: not assigned OR pending deletion (can be re-added)
      return !isAssigned || isPendingDelete;
    }
  );

  const handleAssignContact = async () => {
    if (!selectedContactId || !phaseId) return;

    // Check if this contact is pending deletion - if so, just un-delete it
    if (pendingDeletes.includes(selectedContactId)) {
      const newPendingDeletes = pendingDeletes.filter((id) => id !== selectedContactId);
      setPendingDeletes(newPendingDeletes);
      onPendingDeletesChange?.(newPendingDeletes);

      // Reset form
      setSelectedContactId('');
      setRole('');

      toast({
        title: '✓ Contact Restored',
        description: 'Contact has been restored to this phase',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/phases/${phaseId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: selectedContactId,
          role: role || null,
          notification_advance_days: 7, // Default as per plan
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign contact');
      }

      toast({
        title: '✓ Contact Assigned',
        description: 'Contact has been added to this phase',
      });

      // Reset form
      setSelectedContactId('');
      setRole('');

      // Trigger refresh
      onContactsChange?.();
    } catch (error) {
      console.error('Error assigning contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign contact. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContact = (contactId: string) => {
    // Add to pending deletes (will be processed on form submit)
    const newPendingDeletes = [...pendingDeletes, contactId];
    setPendingDeletes(newPendingDeletes);

    // Notify parent component of pending deletes
    onPendingDeletesChange?.(newPendingDeletes);
  };

  if (!phaseId) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4 text-center text-sm text-steel-gray">
        Save the phase first to assign contacts
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assignment Form */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Assign Contact</Label>
        <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
          <div className="space-y-3">
            <Select
              value={selectedContactId}
              onValueChange={setSelectedContactId}
              disabled={isLoading || isFetchingContacts || availableContacts.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={isFetchingContacts ? 'Loading...' : 'Select contact'} />
              </SelectTrigger>
              <SelectContent className="!z-[10001]">
                {availableContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.company_name} ({contact.trade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Role (optional, e.g., Lead Contractor)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            type="button"
            onClick={handleAssignContact}
            disabled={!selectedContactId || isLoading}
            className="self-start"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {availableContacts.length === 0 && !isFetchingContacts && (
          <p className="text-sm text-steel-gray">
            {displayedContacts.length > 0
              ? 'All contacts have been assigned'
              : 'No contacts available. Create contacts first.'}
          </p>
        )}

        {/* Assigned Contacts List - Now directly below the form */}
        {displayedContacts.length > 0 && (
          <>
            <div className="border-t pt-3 mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-charcoal-blue">
                  Assigned Contacts ({displayedContacts.length})
                </Label>
              </div>
              <div className="space-y-2">
                {displayedContacts.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-blue">
                        {assignment.contact.company_name} ({assignment.contact.trade})
                      </p>
                      <p className="text-xs text-steel-gray">
                        {assignment.contact.contact_person}
                        {assignment.role && ` • ${assignment.role}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContact(assignment.contact.id)}
                      disabled={isLoading}
                      className="ml-2 text-error-red hover:text-error-red hover:bg-error-red/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
