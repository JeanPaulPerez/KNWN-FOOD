
import { Weekday } from '../types';

export const CUTOFF_HOUR = 10; // 10:00 AM ET
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
 * 1. If today is a weekday and before 10 AM ET -> Today is the ACTIVE order day.
 * 2. If today is a weekend or after 10 AM ET -> The next available weekday is the ACTIVE order day.
 */
export function calculateActiveOrderDay(): Date {
  const now = getEtNow();
  const isCurrentlyWeekday = !isWeekend(now);
  
  if (isCurrentlyWeekday && now.getHours() < CUTOFF_HOUR) {
    const today = new Date(now);
    return today;
  }
  
  return findNextServiceDay(now);
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
  if (targetKey === todayKey && targetKey !== activeKey) return 'TODAY_CLOSED';
  
  const t = new Date(target); t.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);
  
  if (t < n) return 'PAST';
  if (isWeekend(target)) return 'WEEKEND';
  
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
