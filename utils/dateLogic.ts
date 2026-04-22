
import { Weekday } from '../types';

export const CUTOFF_HOUR = 22; // 10:00 PM ET
const TIMEZONE = 'America/New_York';

export type DateStatus = 'PAST' | 'TODAY_CLOSED' | 'WEEKEND' | 'ACTIVE' | 'PREVIEW';

/**
 * Reliably extracts ET date+time components via Intl API and constructs a Date
 * whose LOCAL getters (.getHours, .getDate, .getDay, etc.) all return ET values.
 * This avoids the broken `new Date(localeString)` pattern.
 */
export function getEtNow(): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? '0');

  const hour = get('hour') % 24; // guard against Intl returning 24 for midnight

  return new Date(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second'),
    0,
  );
}

/**
 * Strips time — returns YYYY-MM-DD using LOCAL date getters.
 * Works correctly because all dates in this module are constructed with
 * ET date values mapped into local getters via getEtNow() + arithmetic.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Finds the next business day (Mon-Fri) relative to the provided date.
 */
export function findNextServiceDay(fromDate: Date, includeStart = false): Date {
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
 * - After 10 PM ET, tomorrow's window closes — skip one more business day.
 *
 * Examples (ET):
 *   Tuesday  9 PM  → Wednesday
 *   Tuesday 10 PM  → Thursday
 *   Friday  10 PM  → Tuesday  (skips weekend + Monday)
 */
export function calculateActiveOrderDay(): Date {
  const now = getEtNow();
  let base = findNextServiceDay(now);
  // now.getHours() returns the ET hour because getEtNow() maps ET values to local getters
  if (now.getHours() >= CUTOFF_HOUR) {
    base = findNextServiceDay(base);
  }
  return base;
}

/**
 * Maps a specific date to one of the visual/logic states.
 *
 * KEY FIX: any date strictly before the active order day is PAST/CLOSED,
 * not PREVIEW. Previously, dates between "today" and the active day (e.g.
 * "tomorrow" after the 10 PM cutoff) incorrectly got PREVIEW status.
 */
export function getDateStatus(target: Date): DateStatus {
  const now       = getEtNow();
  const todayKey  = toDateKey(now);
  const targetKey = toDateKey(target);
  const activeKey = toDateKey(calculateActiveOrderDay());

  if (targetKey === activeKey) return 'ACTIVE';

  // Everything before the active order day is closed
  if (targetKey < activeKey) {
    return targetKey === todayKey ? 'TODAY_CLOSED' : 'PAST';
  }

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
    day:  activeDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Weekday,
    raw:  activeDate,
  };
}

export function generateDatesForCalendar(): Date[] {
  const dates: Date[] = [];
  const start = getEtNow();
  const end = new Date(start);
  end.setDate(start.getDate() + 30);

  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
