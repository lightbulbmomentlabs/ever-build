'use client';

/**
 * Contact Form Component
 *
 * Form for creating and editing contacts
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactAvatar } from '@/components/contacts/contact-avatar';
import { ImageCropModal } from '@/components/shared/image-crop-modal';
import { CategorySelector, getPendingCategoryAssignments } from '@/components/contacts/category-selector';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, calculateReduction } from '@/lib/utils/image-processing';

type Contact = {
  id?: string;
  company_name: string;
  contact_person: string;
  phone_primary: string;
  phone_secondary?: string | null;
  email?: string | null;
  lead_time_days: number;
  notes?: string | null;
  image_url?: string | null;
};

interface ContactFormProps {
  contact?: Contact;
  mode: 'create' | 'edit';
}

export function ContactForm({ contact, mode }: ContactFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(contact?.image_url);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImageStats, setPendingImageStats] = useState<{ originalSize: number; optimizedSize: number } | null>(null);
  const [categoryAssignments, setCategoryAssignments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    company_name: contact?.company_name || '',
    contact_person: contact?.contact_person || '',
    phone_primary: contact?.phone_primary || '',
    phone_secondary: contact?.phone_secondary || '',
    email: contact?.email || '',
    lead_time_days: contact?.lead_time_days || 0,
    notes: contact?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/contacts' : `/api/contacts/${contact?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone_secondary: formData.phone_secondary || null,
          email: formData.email || null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save contact');
      }

      // If we're creating, handle pending image and category assignments
      if (mode === 'create') {
        const data = await response.json();
        const newContact = data.contact;

        // Upload pending image if any
        if (pendingImageFile) {
          await uploadPendingImage(newContact.id);
        }

        // Save category assignments if any
        if (categoryAssignments.length > 0) {
          await saveCategoryAssignments(newContact.id);
        }

        toast({
          title: 'Contact created',
          description: 'Contact has been created successfully',
        });
      } else {
        toast({
          title: 'Contact updated',
          description: 'Contact has been updated successfully',
        });
      }

      router.push('/contacts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection - open crop modal
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear the input value so the same file can be selected again
    event.target.value = '';

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Image must be JPEG, PNG, or WebP',
        variant: 'destructive',
      });
      return;
    }

    // Create object URL for the crop modal
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageSrc(imageUrl);
    setCropModalOpen(true);
  };

  // Handle image upload after cropping
  const handleCropComplete = async (
    file: File,
    stats: { originalSize: number; optimizedSize: number }
  ) => {
    // In create mode, store the file for later upload
    if (mode === 'create') {
      setPendingImageFile(file);
      setPendingImageStats(stats);
      setImageUrl(URL.createObjectURL(file)); // Show preview

      const reduction = calculateReduction(stats.originalSize, stats.optimizedSize);
      toast({
        title: 'Image ready',
        description: `Image will be uploaded when contact is created. Optimized from ${formatFileSize(stats.originalSize)} to ${formatFileSize(stats.optimizedSize)} (${reduction}% reduction)`,
      });

      // Clean up object URL
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
      return;
    }

    // In edit mode, upload immediately
    if (!contact?.id) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/contacts/${contact.id}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { image_url } = await response.json();
      setImageUrl(image_url);

      const reduction = calculateReduction(stats.originalSize, stats.optimizedSize);

      toast({
        title: 'Image uploaded successfully',
        description: `Optimized from ${formatFileSize(stats.originalSize)} to ${formatFileSize(stats.optimizedSize)} (${reduction}% reduction)`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      // Clean up object URL
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
    }
  };

  // Upload pending image to newly created contact
  const uploadPendingImage = async (contactId: string) => {
    if (!pendingImageFile || !pendingImageStats) return;

    const formData = new FormData();
    formData.append('file', pendingImageFile);

    const response = await fetch(`/api/contacts/${contactId}/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const reduction = calculateReduction(pendingImageStats.originalSize, pendingImageStats.optimizedSize);

    toast({
      title: 'Image uploaded successfully',
      description: `Optimized from ${formatFileSize(pendingImageStats.originalSize)} to ${formatFileSize(pendingImageStats.optimizedSize)} (${reduction}% reduction)`,
    });
  };

  // Save category assignments to newly created contact
  const saveCategoryAssignments = async (contactId: string) => {
    if (categoryAssignments.length === 0) return;

    try {
      const pendingAssignments = getPendingCategoryAssignments(categoryAssignments);

      // Save each assignment
      const promises = pendingAssignments.map((assignment) =>
        fetch(`/api/contacts/${contactId}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignment),
        })
      );

      await Promise.all(promises);

      toast({
        title: 'Categories saved',
        description: `${categoryAssignments.length} category assignment(s) saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Category save failed',
        description: `Contact created but category assignments failed: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Image delete handler
  const handleImageDelete = async () => {
    // In create mode, just clear the pending image
    if (mode === 'create') {
      setPendingImageFile(null);
      setPendingImageStats(null);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(null);

      toast({
        title: 'Image removed',
        description: 'Image has been removed from the contact',
      });
      return;
    }

    // In edit mode, delete from server
    if (!contact?.id) return;

    try {
      setUploadingImage(true);
      const response = await fetch(`/api/contacts/${contact.id}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      setImageUrl(null);

      toast({
        title: 'Image deleted',
        description: 'Contact image has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add New Contact' : 'Edit Contact'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Add a new subcontractor or vendor to your contacts.'
            : 'Update contact information.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Image Upload Section - Show in both create and edit mode */}
        <div className="mb-6 border-b pb-6">
          <label className="block text-sm font-medium text-charcoal-blue mb-4">
            Contact Image
          </label>
          <div className="flex items-center gap-6">
            <ContactAvatar
              name={formData.contact_person}
              imageUrl={imageUrl}
              size="md"
            />

            <div className="flex-1">
              <p className="text-sm text-steel-gray mb-3">
                {mode === 'create'
                  ? 'Upload a photo or logo for this contact. The image will be saved when you create the contact. Max file size: 5MB.'
                  : 'Upload a photo or logo for this contact. Max file size: 5MB.'}
              </p>
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    asChild
                  >
                    <span>
                      {uploadingImage ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </span>
                  </Button>
                </label>

                {imageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImageDelete}
                    disabled={uploadingImage}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-error-red/10 p-3 text-sm text-error-red">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                required
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_primary">Primary Phone *</Label>
              <Input
                id="phone_primary"
                type="tel"
                required
                placeholder="+1 (555) 123-4567"
                value={formData.phone_primary}
                onChange={(e) =>
                  setFormData({ ...formData, phone_primary: e.target.value })
                }
              />
              <p className="text-xs text-steel-gray">
                Must be able to receive text messages. US/Canada only. Format: +1 (XXX) XXX-XXXX
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_secondary">Secondary Phone</Label>
              <Input
                id="phone_secondary"
                type="tel"
                placeholder="+1 (555) 987-6543"
                value={formData.phone_secondary}
                onChange={(e) =>
                  setFormData({ ...formData, phone_secondary: e.target.value })
                }
              />
              <p className="text-xs text-steel-gray">
                US/Canada numbers only. Format: +1 (XXX) XXX-XXXX or (XXX) XXX-XXXX
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_time_days">Lead Time (days) *</Label>
              <Input
                id="lead_time_days"
                type="number"
                min="0"
                required
                value={formData.lead_time_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lead_time_days: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional notes about this contact..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Category Selector */}
          <CategorySelector
            contactId={contact?.id}
            mode={mode}
            onAssignmentsChange={setCategoryAssignments}
          />

          {/* Add bottom padding for sticky footer */}
          <div className="pb-24" />
        </form>
      </CardContent>

      {/* Image Crop Modal */}
      {selectedImageSrc && (
        <ImageCropModal
          open={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
          }}
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          title="Crop Contact Image"
          description="Adjust the crop area to select the portion of your image to use. The image will be optimized to 500x500px."
        />
      )}
    </Card>
  );
}

/**
 * ContactFormWrapper Component
 *
 * Wrapper component that includes the form and sticky footer
 */
interface ContactFormWrapperProps {
  contact?: Contact;
  mode: 'create' | 'edit';
}

export function ContactFormWrapper({ contact, mode }: ContactFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = () => {
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <>
      <ContactForm contact={contact} mode={mode} />

      {/* Sticky Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-end gap-3 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/contacts')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Create Contact' : 'Update Contact'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
