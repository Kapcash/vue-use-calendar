import { addDays, format } from 'date-fns';
import { computed, ComputedRef, MaybeRefOrGetter, toValue } from 'vue';
import { WeekdayInputFormat, NormalizedCalendarOptions } from '../types';

// A fixed Sunday reference date — stable regardless of when the composable is called.
const FIXED_SUNDAY = new Date(2000, 0, 2);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWeekdays (opts: NormalizedCalendarOptions<any, any>): (weekdayFormat?: MaybeRefOrGetter<WeekdayInputFormat>) => ComputedRef<string[]> {
  return (weekdayFormat: MaybeRefOrGetter<WeekdayInputFormat> = 'iiiii'): ComputedRef<string[]> => {
    const weekdays = computed<Date[]>(() => {
      const weekdaysOrdered = Array.from(Array(7).keys()).map(i => addDays(FIXED_SUNDAY, i));
  
      // Shift the array by `firstDayOfWeek` times to start on the desired day
      Array.from(Array(opts.firstDayOfWeek)).forEach(() => {
        weekdaysOrdered.push(weekdaysOrdered.shift()!);
      });
      return weekdaysOrdered;
    });

    return computed<string[]>(() => {
      return weekdays.value.map(day => format(day, toValue(weekdayFormat), { locale: opts.locale }));
    });
  };
}
