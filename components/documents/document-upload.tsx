'use client';

/**
 * Document Upload Component
 *
 * Handles file upload with drag-and-drop support
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, X, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  categoryLabels,
  visibilityLabels,
  formatFileSize,
  MAX_FILE_SIZE,
  allowedFileTypes,
  DocumentCategory,
  DocumentVisibility,
} from '@/lib/validations/document';

interface DocumentUploadProps {
  projectId: string;
  phaseId?: string | null;
  onUploadComplete?: () => void;
}

export function DocumentUpload({
  projectId,
  phaseId,
  onUploadComplete,
}: DocumentUploadProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as DocumentCategory | '',
    visibility: 'internal' as DocumentVisibility,
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must not exceed ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported`);
      return;
    }

    setSelectedFile(file);

    // Auto-populate title if empty
    if (!formData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setFormData((prev) => ({ ...prev, title: fileName }));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a document category');
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('visibility', formData.visibility);
      if (phaseId) {
        uploadFormData.append('phase_id', phaseId);
      }

      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      toast.success('Document uploaded successfully');
      setIsOpen(false);
      resetForm();
      router.refresh();
      onUploadComplete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      visibility: 'internal',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-everbuild-orange hover:bg-everbuild-orange/90">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Project Document</DialogTitle>
          <DialogDescription>
            Upload permits, plans, photos, and other project documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <Label>File</Label>
            <div
              className={`mt-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? 'border-everbuild-orange bg-everbuild-orange/5'
                  : 'border-steel-gray/30 bg-concrete-white'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-blueprint-teal" />
                    <div className="text-left">
                      <p className="font-medium text-charcoal-blue">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-steel-gray">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-steel-gray" />
                  <p className="mt-2 text-sm text-charcoal-blue">
                    Drag and drop your file here, or
                  </p>
                  <label htmlFor="file-upload">
                    <span className="mt-2 inline-block cursor-pointer text-sm text-blueprint-teal hover:underline">
                      browse files
                    </span>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileInputChange}
                      accept={allowedFileTypes.join(',')}
                    />
                  </label>
                  <p className="mt-2 text-xs text-steel-gray">
                    PDF, JPG, PNG, CSV, Excel, Word, CAD files up to 25MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Metadata */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Building Permit, Floor Plan"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description or notes about this document"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value as DocumentCategory }))
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, visibility: value as DocumentVisibility }))
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(visibilityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-everbuild-orange hover:bg-everbuild-orange/90"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
