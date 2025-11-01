'use client';

/**
 * Category Selector Component
 *
 * Allows users to select and assign multiple categories/sub-types to contacts
 * using cascading dropdowns
 */

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Category = {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  sub_types: SubType[];
};

type SubType = {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
};

type CategoryAssignment = {
  id: string;
  category: {
    id: string;
    name: string;
  };
  sub_type: {
    id: string;
    name: string;
  } | null;
  created_at: string;
};

interface CategorySelectorProps {
  contactId?: string; // Optional - only provided in edit mode
  mode: 'create' | 'edit';
  onAssignmentsChange?: (assignments: CategoryAssignment[]) => void;
}

export function CategorySelector({
  contactId,
  mode,
  onAssignmentsChange,
}: CategorySelectorProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<CategoryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch assignments when in edit mode
  useEffect(() => {
    if (mode === 'edit' && contactId) {
      fetchAssignments();
    } else {
      setLoading(false);
    }
  }, [mode, contactId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/contacts/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const fetchAssignments = async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/${contactId}/categories`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data);
      onAssignmentsChange?.(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load category assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCategoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    // In create mode, just add to local state
    if (mode === 'create') {
      const category = categories.find((c) => c.id === selectedCategoryId);
      const subType = selectedSubTypeId
        ? category?.sub_types.find((s) => s.id === selectedSubTypeId)
        : null;

      if (!category) return;

      // Check for duplicates
      const isDuplicate = assignments.some(
        (a) =>
          a.category.id === selectedCategoryId &&
          a.sub_type?.id === selectedSubTypeId
      );

      if (isDuplicate) {
        toast({
          title: 'Duplicate Category',
          description: 'This category is already assigned',
          variant: 'destructive',
        });
        return;
      }

      const newAssignment: CategoryAssignment = {
        id: `temp-${Date.now()}`,
        category: {
          id: category.id,
          name: category.name,
        },
        sub_type: subType ? {
          id: subType.id,
          name: subType.name,
        } : null,
        created_at: new Date().toISOString(),
      };

      const updatedAssignments = [...assignments, newAssignment];
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);

      // Reset form
      setSelectedCategoryId('');
      setSelectedSubTypeId('');
      return;
    }

    // In edit mode, save to API immediately
    if (!contactId) return;

    try {
      setAdding(true);
      const response = await fetch(`/api/contacts/${contactId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          sub_type_id: selectedSubTypeId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add category');
      }

      const newAssignment = await response.json();
      const updatedAssignments = [...assignments, newAssignment];
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);

      // Reset form
      setSelectedCategoryId('');
      setSelectedSubTypeId('');

      toast({
        title: 'Category Added',
        description: 'Category has been assigned to the contact',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCategory = async (assignmentId: string) => {
    // In create mode, just remove from local state
    if (mode === 'create') {
      const updatedAssignments = assignments.filter((a) => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);
      return;
    }

    // In edit mode, delete from API
    if (!contactId) return;

    try {
      const response = await fetch(
        `/api/contacts/${contactId}/categories?assignmentId=${assignmentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove category');
      }

      const updatedAssignments = assignments.filter((a) => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      onAssignmentsChange?.(updatedAssignments);

      toast({
        title: 'Category Removed',
        description: 'Category assignment has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Get filtered sub-types based on selected category
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const availableSubTypes = selectedCategory?.sub_types || [];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-charcoal-blue">
          Categories *
        </Label>
        <p className="text-sm text-steel-gray mt-1">
          Assign one or more categories to this contact. This helps organize and filter
          contacts.
        </p>
      </div>

      {/* Existing Assignments */}
      {assignments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="inline-flex items-center gap-2 bg-everbuild-orange/10 text-everbuild-orange px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <span>
                {assignment.category.name}
                {assignment.sub_type && ` → ${assignment.sub_type.name}`}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(assignment.id)}
                className="hover:bg-everbuild-orange/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {assignments.length === 0 && !loading && (
        <div className="text-sm text-steel-gray italic border border-dashed border-steel-gray/30 rounded-lg p-4 text-center">
          No categories assigned. Click "Add Category" below to get started.
        </div>
      )}

      {/* Add Category Form */}
      <div className="border border-steel-gray/20 rounded-lg p-4 bg-gray-50/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Category Dropdown */}
          <div className="space-y-2 flex-1">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => {
                setSelectedCategoryId(value);
                setSelectedSubTypeId(''); // Reset sub-type when category changes
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Type Dropdown (Cascading) */}
          <div className="space-y-2 flex-1">
            <Label htmlFor="subType">Sub-Type (Optional)</Label>
            <Select
              value={selectedSubTypeId}
              onValueChange={setSelectedSubTypeId}
              disabled={!selectedCategoryId}
            >
              <SelectTrigger id="subType">
                <SelectValue
                  placeholder={
                    selectedCategoryId
                      ? 'Select sub-type...'
                      : 'Select category first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSubTypes.map((subType) => (
                  <SelectItem key={subType.id} value={subType.id}>
                    {subType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button - inline with dropdowns */}
          <Button
            type="button"
            variant={selectedCategoryId ? "default" : "outline"}
            size="sm"
            onClick={handleAddCategory}
            disabled={!selectedCategoryId || adding}
            className={selectedCategoryId ? "bg-everbuild-orange hover:bg-everbuild-orange/90 text-white shadow-sm" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Get pending assignments for create mode
 * This helper is used to extract the category IDs when creating a contact
 */
export function getPendingCategoryAssignments(assignments: CategoryAssignment[]) {
  return assignments.map((a) => ({
    category_id: a.category.id,
    sub_type_id: a.sub_type?.id || null,
  }));
}
