import { addDays, format, nextSunday } from 'date-fns';
import { WeekdaysComposable, WeekdayInputFormat, NormalizedCalendarOptions } from '../types';

export function useWeekdays ({ firstDayOfWeek, locale }: NormalizedCalendarOptions): (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable {
  return (weekdayFormat: WeekdayInputFormat = 'iiiii'): Array<string> => {
    const sunday = nextSunday(new Date());
    const weekdays = Array.from(Array(7).keys()).map(i => addDays(sunday, i));

    // Shift the array by `firstDayOfWeek` times to start on the desired day
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift()!);
    });

    return weekdays.map(day => format(day, weekdayFormat, { locale }));
  };
}
