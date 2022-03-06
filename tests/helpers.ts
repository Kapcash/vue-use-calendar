import { differenceInDays } from 'date-fns';
import { ICalendarDate } from '../lib/models/CalendarDate';

export function areConsecutiveDays (calendarDates: Array<ICalendarDate>): boolean {
  const days = calendarDates.map(calDate => calDate.date);
  return days.every((day, index, all) => {
    if (!all[index - 1]) { return true; }
    return differenceInDays(day, all[index - 1]) === 1;
  });
}
