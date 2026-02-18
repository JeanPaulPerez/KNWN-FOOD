
import { MenuItem, MenuCategory, DayMenu, Weekday } from '../types';
import { MENUS } from './menus';

export function getMenuForDate(date: Date): DayMenu | null {
  const day = date.getDay();
  if (day === 0 || day === 6) return null; // Weekend closed

  const weekdays: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const weekday = weekdays[day - 1];

  return MENUS[weekday] || null;
}
