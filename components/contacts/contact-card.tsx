'use client';

/**
 * Contact Card Component
 *
 * Card view for displaying contact information in a grid layout
 */

import Link from 'next/link';
import { ContactAvatar } from '@/components/contacts/contact-avatar';
import { SendSMSModal } from '@/components/sms/send-sms-modal';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

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

interface ContactCardProps {
  contact: Contact;
  onDelete: (contactId: string) => void;
  isDeleting: boolean;
}

export function ContactCard({ contact, onDelete, isDeleting }: ContactCardProps) {
  return (
    <div className="group relative flex gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Left: Contact Image */}
      <div className="flex-shrink-0">
        <ContactAvatar
          name={contact.contact_person}
          imageUrl={contact.image_url}
          size="md"
        />
      </div>

      {/* Right: Contact Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {/* Company Name */}
          <h3 className="text-lg font-semibold text-charcoal-blue">
            {contact.company_name}
          </h3>

          {/* Contact Person */}
          <p className="mt-1 text-sm text-steel-gray">
            {contact.contact_person}
          </p>

          {/* Trade Badge */}
          <div className="mt-1 mb-4">
            <span className="inline-flex items-center rounded-full bg-sky-blue/10 pr-2.5 py-0.5 text-xs font-medium text-sky-blue">
              {contact.trade}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
            onClick={() => onDelete(contact.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
