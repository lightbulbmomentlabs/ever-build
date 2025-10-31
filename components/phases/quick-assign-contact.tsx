'use client';

/**
 * Quick Assign Contact Component
 *
 * Simplified contact assignment for phase cards - quick action without role field
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Contact = {
  id: string;
  company_name: string;
  trade: string;
};

interface QuickAssignContactProps {
  phaseId: string;
  phaseName: string;
  assignedContactIds: string[]; // IDs of already assigned contacts
  onSuccess?: () => void;
  trigger?: React.ReactNode; // Custom trigger element
}

export function QuickAssignContact({
  phaseId,
  phaseName,
  assignedContactIds,
  onSuccess,
  trigger,
}: QuickAssignContactProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingContacts, setIsFetchingContacts] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch available contacts when popover opens
  useEffect(() => {
    if (!open) return;

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
  }, [open, toast]);

  // Filter out already assigned contacts
  const availableContacts = contacts.filter(
    (contact) => !assignedContactIds.includes(contact.id)
  );

  const handleAssignContact = async () => {
    if (!selectedContactId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/phases/${phaseId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: selectedContactId,
          role: null,
          notification_advance_days: 7, // Default
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign contact');
      }

      const selectedContact = contacts.find((c) => c.id === selectedContactId);
      toast({
        title: '✓ Contact Assigned',
        description: `${selectedContact?.company_name} added to ${phaseName}`,
      });

      // Reset and close
      setSelectedContactId('');
      setOpen(false);

      // Trigger refresh
      onSuccess?.();
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-charcoal-blue">Quick Assign Contact</h4>
            <p className="text-xs text-steel-gray mt-1">{phaseName}</p>
          </div>

          <Select
            value={selectedContactId}
            onValueChange={setSelectedContactId}
            disabled={isLoading || isFetchingContacts || availableContacts.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={isFetchingContacts ? 'Loading...' : 'Select contact'} />
            </SelectTrigger>
            <SelectContent className="!z-[99999]">
              {availableContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.company_name} ({contact.trade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {availableContacts.length === 0 && !isFetchingContacts && (
            <p className="text-xs text-steel-gray">
              {assignedContactIds.length > 0
                ? 'All contacts have been assigned'
                : 'No contacts available'}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAssignContact}
              disabled={!selectedContactId || isLoading}
              className="flex-1"
            >
              Assign
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
