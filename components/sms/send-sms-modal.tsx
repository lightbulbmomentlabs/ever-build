'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { calculateSMSSegments, SMS_TEMPLATES } from '@/lib/utils/sms.utils';

interface SendSMSModalProps {
  contactId: string;
  contactName: string;
  contactPhone: string;
  projectId?: string;
  phaseId?: string;
  phaseName?: string;
  projectAddress?: string;
  trigger?: React.ReactNode;
}

export function SendSMSModal({
  contactId,
  contactName,
  contactPhone,
  projectId,
  phaseId,
  phaseName,
  projectAddress,
  trigger,
}: SendSMSModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('custom');
  const [loading, setLoading] = useState(false);

  const { length, segments } = calculateSMSSegments(message);

  // Handle template selection
  const handleTemplateChange = (value: string) => {
    setTemplate(value);

    switch (value) {
      case 'confirmation':
        if (phaseName && projectAddress) {
          setMessage(
            SMS_TEMPLATES.PHASE_CONFIRMATION(
              contactName,
              phaseName,
              projectAddress,
              'TBD' // User can edit the date
            )
          );
        }
        break;
      case 'delay':
        if (phaseName && projectAddress) {
          setMessage(
            SMS_TEMPLATES.PHASE_DELAY(phaseName, projectAddress, 'TBD')
          );
        }
        break;
      case 'ready':
        if (phaseName && projectAddress) {
          setMessage(
            SMS_TEMPLATES.READY_TO_START(contactName, phaseName, projectAddress)
          );
        }
        break;
      case 'custom':
        setMessage('');
        break;
    }
  };

  // Handle sending SMS
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId,
          toPhone: contactPhone,
          messageBody: message,
          projectId,
          phaseId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send SMS');
      }

      toast.success(`Message sent to ${contactName}`);
      setMessage('');
      setTemplate('custom');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast.error(error.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Text
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Text Message</DialogTitle>
          <DialogDescription>
            Send an SMS to {contactName} at {contactPhone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Message</SelectItem>
                {phaseName && projectAddress && (
                  <>
                    <SelectItem value="confirmation">
                      Phase Confirmation
                    </SelectItem>
                    <SelectItem value="delay">Phase Delay Notice</SelectItem>
                    <SelectItem value="ready">Ready to Start</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm text-steel-gray">
              <span>
                {length} characters • {segments} SMS{' '}
                {segments !== 1 ? 'segments' : 'segment'}
              </span>
              {segments > 1 && (
                <span className="text-warning-amber">
                  Will be sent as {segments} messages
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="bg-everbuild-orange hover:bg-everbuild-orange/90"
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
