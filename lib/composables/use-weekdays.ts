import { addDays, format } from 'date-fns';
import { StringList, WeekdayInputFormat, NormalizedCalendarOptions } from '../types';

// A fixed Sunday reference date — stable regardless of when the composable is called.
const FIXED_SUNDAY = new Date(2000, 0, 2);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWeekdays ({ firstDayOfWeek, locale }: NormalizedCalendarOptions<any, any>): (weekdayFormat?: WeekdayInputFormat) => StringList {
  return (weekdayFormat: WeekdayInputFormat = 'iiiii'): StringList => {
    const weekdays = Array.from(Array(7).keys()).map(i => addDays(FIXED_SUNDAY, i));

    // Shift the array by `firstDayOfWeek` times to start on the desired day
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift()!);
    });

    return weekdays.map(day => format(day, weekdayFormat, { locale }));
  };
}
