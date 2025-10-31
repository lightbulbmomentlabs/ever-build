'use client';

/**
 * Document List Component
 *
 * Displays project documents with filtering and actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileIcon,
  Download,
  MoreVertical,
  Trash2,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  categoryLabels,
  visibilityLabels,
  formatFileSize,
  DocumentCategory,
  DocumentVisibility,
} from '@/lib/validations/document';
import { Database } from '@/lib/db/supabase-client';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentListProps {
  projectId: string;
  documents: Document[];
}

export function DocumentList({ projectId, documents }: DocumentListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<DocumentVisibility | 'all'>('all');

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      toast.success('Document deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}?download=true`
      );

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = searchQuery
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return '📊';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('dwg') || fileType.includes('cad')) {
      return '📐';
    }
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-gray" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as DocumentCategory | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={visibilityFilter}
            onValueChange={(value) =>
              setVisibilityFilter(value as DocumentVisibility | 'all')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              {Object.entries(visibilityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-steel-gray/30 bg-concrete-white p-12 text-center">
          <FileIcon className="mx-auto h-12 w-12 text-steel-gray" />
          <h3 className="mt-4 text-lg font-medium text-charcoal-blue">
            {searchQuery || categoryFilter !== 'all' || visibilityFilter !== 'all'
              ? 'No documents found'
              : 'No documents yet'}
          </h3>
          <p className="mt-2 text-sm text-steel-gray">
            {searchQuery || categoryFilter !== 'all' || visibilityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first project document to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="group rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {getFileIcon(document.file_type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-charcoal-blue truncate" title={document.title}>
                      {document.title}
                    </h3>
                    <p className="text-sm text-steel-gray truncate" title={document.file_name}>
                      {document.file_name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blueprint-teal/10 px-2 py-0.5 text-xs font-medium text-blueprint-teal">
                        {categoryLabels[document.category as DocumentCategory]}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-steel-gray/10 px-2 py-0.5 text-xs font-medium text-steel-gray">
                        {visibilityLabels[document.visibility as DocumentVisibility]}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-steel-gray">
                      {formatFileSize(document.file_size)} •{' '}
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDownload(document.id, document.file_name)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(document.id, document.title)}
                      className="text-error-red focus:text-error-red"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {document.description && (
                <p className="mt-3 text-sm text-steel-gray line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
