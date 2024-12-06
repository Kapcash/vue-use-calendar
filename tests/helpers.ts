import { differenceInDays } from 'date-fns';
import { CalendarDate } from '../lib/models/CalendarDate';

export function areConsecutiveDays (calendarDates: Array<CalendarDate>): boolean {
  return calendarDates.every((day, index, all) => {
    if (!all[index - 1]) { return true; }
    return differenceInDays(day, all[index - 1]) === 1;
  });
}
