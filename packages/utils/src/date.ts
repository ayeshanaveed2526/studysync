/**
 * Format a date string to a localized human-readable format.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) return 'just now';
  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `in ${diffMinutes}m` : `${Math.abs(diffMinutes)}m ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  }
  if (Math.abs(diffDays) < 30) {
    return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
  }
  return formatDate(d);
}

/**
 * Check if a date is overdue (past the current time).
 */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Get urgency level based on how close a deadline is.
 * Returns 'red' for overdue or <24h, 'yellow' for <72h, 'green' otherwise.
 */
export function getUrgencyLevel(date: string | Date): 'red' | 'yellow' | 'green' {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const hoursUntil = (d.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 0 || hoursUntil <= 24) return 'red';
  if (hoursUntil <= 72) return 'yellow';
  return 'green';
}
