import { format, parseISO, differenceInDays } from 'date-fns';

/**
 * Date utility functions
 * Following Single Responsibility: Only date-related utilities
 */

/**
 * Format timestamp to readable date string
 */
export function formatDate(timestamp: number, formatStr = 'MMM dd, yyyy'): string {
  return format(timestamp, formatStr);
}

/**
 * Format timestamp to time string
 */
export function formatTime(timestamp: number, formatStr = 'HH:mm'): string {
  return format(timestamp, formatStr);
}

/**
 * Get ISO date string for today
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2);
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

/**
 * Get day of week name
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE');
}
