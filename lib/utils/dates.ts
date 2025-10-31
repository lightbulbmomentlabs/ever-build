/**
 * Date Utility Functions
 *
 * These functions handle date calculations and formatting
 * for project planning and scheduling.
 */

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate business days between two dates
 * Excludes weekends (Saturday and Sunday)
 */
export function getBusinessDays(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Add business days to a date
 * Skips weekends
 */
export function addBusinessDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  let remainingDays = days;

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Only count business days
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remainingDays--;
    }
  }

  return result;
}

/**
 * Calculate the difference in days between two dates
 */
export function getDaysDifference(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISODate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format date to display string (e.g., "Jan 15, 2025")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Get the start of today
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calculate planned end date based on start date and duration
 * Includes buffer days in calculation
 */
export function calculatePlannedEndDate(
  startDate: Date | string,
  durationDays: number,
  bufferDays: number = 0
): Date {
  return addBusinessDays(startDate, durationDays + bufferDays);
}
