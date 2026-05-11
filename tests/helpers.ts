import { differenceInDays } from 'date-fns';
import { CalendarDay } from '../lib/types';

export function areConsecutiveDays (calendarDays: Array<CalendarDay>): boolean {
  return calendarDays.every((day, index, all) => {
    if (!all[index - 1]) { return true; }
    return differenceInDays(day.date, all[index - 1].date) === 1;
  });
}
