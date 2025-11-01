'use client';

/**
 * Destructive Confirmation Dialog
 *
 * A reusable modal for confirming destructive actions (delete, remove, etc.)
 * Requires user to type a confirmation word to proceed.
 *
 * Features:
 * - Customizable title, description, and confirmation word
 * - Input validation that only allows valid confirmation letters
 * - Visual feedback when confirmation word is correctly typed
 * - Accessible keyboard navigation (ESC to close)
 * - Click outside to close
 */

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DestructiveConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when user confirms the action */
  onConfirm: () => void | Promise<void>;
  /** Title of the dialog */
  title: string;
  /** Description/warning text */
  description: string;
  /** Name of the item being deleted (optional, will be bolded in description) */
  itemName?: string;
  /** Word that must be typed to confirm (default: "DELETE") */
  confirmationWord?: string;
  /** Label for the confirmation button (default: "Delete") */
  confirmButtonLabel?: string;
  /** Whether the confirmation action is loading */
  isLoading?: boolean;
}

export function DestructiveConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  confirmationWord = 'DELETE',
  confirmButtonLabel = 'Delete',
  isLoading = false,
}: DestructiveConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setIsConfirmed(false);
    }
  }, [open]);

  // Check if input matches confirmation word
  useEffect(() => {
    setIsConfirmed(inputValue.toUpperCase() === confirmationWord.toUpperCase());
  }, [inputValue, confirmationWord]);

  // Filter input to only allow letters that exist in the confirmation word
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    const allowedChars = new Set(confirmationWord.toUpperCase().split(''));

    // Filter to only allow characters that exist in the confirmation word
    const filteredValue = value
      .split('')
      .filter((char) => allowedChars.has(char))
      .join('');

    setInputValue(filteredValue);
  };

  const handleConfirm = async () => {
    if (!isConfirmed || isLoading) return;

    await onConfirm();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isConfirmed && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-red/10">
              <AlertTriangle className="h-5 w-5 text-error-red" />
            </div>
            <DialogTitle className="text-error-red text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base text-charcoal-blue pt-2">
            {itemName ? (
              <>
                {description.split(itemName)[0]}
                <span className="font-semibold text-charcoal-blue">"{itemName}"</span>
                {description.split(itemName)[1]}
              </>
            ) : (
              description
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-error-red/5 border border-error-red/20 p-4">
            <p className="text-sm text-steel-gray">
              This action <span className="font-semibold text-error-red">cannot be undone</span>.
              This will permanently delete this item and all associated data.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation-input" className="text-sm font-medium">
              Type <span className="font-mono font-bold text-error-red">{confirmationWord}</span> to
              confirm:
            </Label>
            <Input
              id="confirmation-input"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={confirmationWord}
              className={`font-mono ${
                isConfirmed
                  ? 'border-success-green bg-success-green/5 focus-visible:ring-success-green'
                  : 'border-input'
              }`}
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />
            {inputValue && !isConfirmed && (
              <p className="text-xs text-steel-gray">
                Type "{confirmationWord}" to enable the {confirmButtonLabel.toLowerCase()} button
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className="bg-error-red hover:bg-error-red/90"
          >
            {isLoading ? 'Processing...' : confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
