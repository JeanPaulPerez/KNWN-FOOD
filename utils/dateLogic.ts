
import { Weekday } from '../types';

export const CUTOFF_HOUR = 22; // 10:00 PM ET
const TIMEZONE = 'America/New_York';

export type DateStatus = 'PAST' | 'TODAY_CLOSED' | 'WEEKEND' | 'ACTIVE' | 'PREVIEW';

/**
 * Returns a Date object representing the current time in America/New_York.
 */
export function getEtNow(): Date {
  const nyString = new Date().toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(nyString);
}

/**
 * Strips time information to compare dates by day/month/year only.
 */
export function toDateKey(date: Date): string {
  const nyString = date.toLocaleString('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
  const [month, day, year] = nyString.split('/');
  return `${year}-${month}-${day}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Finds the next business day (Mon-Fri) relative to the provided date.
 */
export function findNextServiceDay(fromDate: Date, includeStart: boolean = false): Date {
  const next = new Date(fromDate);
  if (!includeStart) next.setDate(next.getDate() + 1);
  
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/**
 * Business Rule:
 * - Always show the NEXT business day's menu (never today).
 * - After 10 PM ET, tomorrow's menu closes — skip one more business day.
 *
 * Examples (ET):
 *   Monday  9 PM  → Tuesday
 *   Monday 10 PM  → Wednesday
 *   Friday 10 PM  → Tuesday  (skips Mon)
 */
export function calculateActiveOrderDay(): Date {
  const now = getEtNow();
  // Base: next business day from now (always at least tomorrow)
  let base = findNextServiceDay(now);
  // After 10 PM the next-day window closes — advance one more business day
  if (now.getHours() >= CUTOFF_HOUR) {
    base = findNextServiceDay(base);
  }
  return base;
}

/**
 * Maps a specific date to one of the visual/logic states.
 */
export function getDateStatus(target: Date): DateStatus {
  const now = getEtNow();
  const todayKey = toDateKey(now);
  const targetKey = toDateKey(target);
  const activeKey = toDateKey(calculateActiveOrderDay());

  if (targetKey === activeKey) return 'ACTIVE';
  if (targetKey < todayKey)   return 'PAST';      // strictly before today (ET) → always past
  if (targetKey === todayKey) return 'TODAY_CLOSED'; // today but not the active day
  if (isWeekend(target))      return 'WEEKEND';
  
  return 'PREVIEW';
}

/**
 * Helper for Home/Checkout pages to get display strings.
 */
export function getActiveOrderInfo() {
  const activeDate = calculateActiveOrderDay();
  return {
    date: activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    day: activeDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Weekday,
    raw: activeDate
  };
}

export function generateDatesForCalendar(): Date[] {
  const dates: Date[] = [];
  const start = getEtNow();
  // Show only 30 days to reduce clutter
  const end = new Date(start);
  end.setDate(start.getDate() + 30);
  
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
