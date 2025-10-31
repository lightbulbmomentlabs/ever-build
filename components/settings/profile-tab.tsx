'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { organizationProfileSchema } from '@/lib/validations/organization';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImageCropModal } from '@/components/shared/image-crop-modal';
import { formatFileSize, calculateReduction } from '@/lib/utils/image-processing';
import Image from 'next/image';

/**
 * Profile Tab Component
 *
 * Organization profile settings with auto-save functionality
 */

interface ProfileTabProps {
  organizationId: string;
  initialData: {
    name: string;
    company_name: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    phone: string | null;
    website: string | null;
    url_slug: string | null;
    logo_url: string | null;
  };
}

export function ProfileTab({ organizationId, initialData }: ProfileTabProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      name: initialData.name || '',
      company_name: initialData.company_name || '',
      address_line1: initialData.address_line1 || '',
      address_line2: initialData.address_line2 || '',
      city: initialData.city || '',
      state: initialData.state || '',
      zip_code: initialData.zip_code || '',
      country: initialData.country || 'US',
      phone: initialData.phone || '',
      website: initialData.website || '',
      url_slug: initialData.url_slug || '',
    },
  });

  // Auto-save debounced function
  const saveProfile = useCallback(
    async (data: any) => {
      try {
        setSaving(true);
        const response = await fetch(`/api/organizations/${organizationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save');
        }

        setLastSaved(new Date());
      } catch (error: any) {
        toast({
          title: 'Error saving',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [organizationId, toast]
  );

  // Watch form changes and auto-save after 1 second of inactivity
  useEffect(() => {
    // Skip the first render to avoid saving on mount
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    let timer: NodeJS.Timeout;

    const subscription = form.watch((value) => {
      // Clear previous timer
      clearTimeout(timer);

      // Set new timer to save after 1 second of inactivity
      timer = setTimeout(() => {
        // Transform empty strings to null for optional fields
        const transformedValue = {
          ...value,
          company_name: value.company_name || null,
          address_line1: value.address_line1 || null,
          address_line2: value.address_line2 || null,
          city: value.city || null,
          state: value.state || null,
          zip_code: value.zip_code || null,
          phone: value.phone || null,
          website: value.website || null,
          url_slug: value.url_slug || null,
        };

        const validationResult = organizationProfileSchema.safeParse(transformedValue);
        if (validationResult.success) {
          console.log('Auto-saving:', validationResult.data);
          saveProfile(validationResult.data);
        } else {
          console.log('Validation failed:', validationResult.error);
        }
      }, 1000);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form.watch, saveProfile, isInitialMount]);

  // Handle file selection - open crop modal
  const handleLogoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear the input value so the same file can be selected again
    event.target.value = '';

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Logo must be JPEG, PNG, or WebP',
        variant: 'destructive',
      });
      return;
    }

    // Create object URL for the crop modal
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageSrc(imageUrl);
    setCropModalOpen(true);
  };

  // Handle logo upload after cropping
  const handleCropComplete = async (
    file: File,
    stats: { originalSize: number; optimizedSize: number }
  ) => {
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/organizations/${organizationId}/logo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload logo');
      }

      const { logo_url } = await response.json();
      setLogoUrl(logo_url);

      const reduction = calculateReduction(stats.originalSize, stats.optimizedSize);

      toast({
        title: 'Logo uploaded successfully',
        description: `Optimized from ${formatFileSize(stats.originalSize)} to ${formatFileSize(stats.optimizedSize)} (${reduction}% reduction)`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
      // Clean up object URL
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
    }
  };

  // Logo delete handler
  const handleLogoDelete = async () => {
    try {
      setUploadingLogo(true);
      const response = await fetch(`/api/organizations/${organizationId}/logo`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete logo');
      }

      setLogoUrl(null);

      toast({
        title: 'Logo deleted',
        description: 'Your logo has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal-blue">Organization Profile</h2>
        <p className="text-sm text-steel-gray">
          Manage your company information and public profile
        </p>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        {/* Save Indicator - Prominent */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-gray-50">
          <p className="text-sm font-medium text-charcoal-blue">Profile Information</p>
          <div className="flex items-center gap-2">
            {saving ? (
              <div className="flex items-center gap-2 text-sm font-medium text-sky-blue">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving changes...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2 text-sm font-medium text-[#10B981]">
                <CheckCircle2 className="h-4 w-4" />
                <span>All changes saved</span>
              </div>
            ) : (
              <span className="text-sm text-steel-gray">Auto-save enabled</span>
            )}
          </div>
        </div>

        <div className="p-6">
        {/* Logo Upload Section */}
        <div className="mb-8 border-b pb-6">
          <label className="block text-sm font-medium text-charcoal-blue mb-4">
            Organization Logo
          </label>
          <div className="flex items-center gap-6">
            {logoUrl ? (
              <div className="relative h-24 w-24 rounded-lg border bg-gray-50 overflow-hidden">
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-gray-50">
                <Building2 className="h-8 w-8 text-steel-gray" />
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm text-steel-gray mb-3">
                Upload your company logo. Recommended size: 400x400px. Max file size: 5MB.
              </p>
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoSelect}
                    disabled={uploadingLogo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    asChild
                  >
                    <span>
                      {uploadingLogo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </span>
                  </Button>
                </label>

                {logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogoDelete}
                    disabled={uploadingLogo}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Form {...form}>
          <form className="space-y-4">
            {/* Organization Name & Company Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your Organization" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Your Company LLC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* URL Slug */}
            <FormField
              control={form.control}
              name="url_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Profile URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-steel-gray whitespace-nowrap">everbuild.app/b/</span>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="your-company"
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Lines */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Suite 100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-[1fr_auto_auto]">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Whitefish" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="w-20">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="MT" maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel>Zip</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="59937" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone & Website */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="tel"
                        placeholder="(555) 123-4567"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        type="url"
                        placeholder="https://yourcompany.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        </div>
      </div>

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
          title="Crop Organization Logo"
          description="Adjust the crop area to select the portion of your logo to use. The image will be optimized to 500x500px."
        />
      )}
    </div>
  );
}
