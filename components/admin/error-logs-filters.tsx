'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ErrorLogsFiltersProps {
  currentSeverity?: string;
  currentResolved?: boolean;
}

export function ErrorLogsFilters({ currentSeverity, currentResolved }: ErrorLogsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSeverityChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('severity');
    } else {
      params.set('severity', value);
    }
    router.push(`/admin/errors?${params.toString()}`);
  };

  const handleResolvedChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('resolved');
    } else {
      params.set('resolved', value);
    }
    router.push(`/admin/errors?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm mb-6">
      <h2 className="text-base md:text-lg font-semibold text-charcoal-blue mb-4">Filters</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Severity Filter */}
        <div>
          <label className="text-sm font-medium text-steel-gray mb-2 block">
            Severity
          </label>
          <Select
            value={currentSeverity || 'all'}
            onValueChange={handleSeverityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resolved Status Filter */}
        <div>
          <label className="text-sm font-medium text-steel-gray mb-2 block">
            Status
          </label>
          <Select
            value={
              currentResolved === true
                ? 'true'
                : currentResolved === false
                ? 'false'
                : 'all'
            }
            onValueChange={handleResolvedChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="false">Unresolved</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
