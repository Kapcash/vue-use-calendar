import { CalendarOptions, CalendarComposables, NormalizedCalendarOptions, FirstDayOfWeek } from './types';
import { useWeekdays } from "./composables/use-weekdays";
import { monthlyCalendar } from "./composables/use-monthly-calendar";
import { weeklyCalendar } from "./composables/use-weekly-calendar";
import { useMonthsList } from './composables/use-months-list';
import { useYearsList } from './composables/use-years-list';
import { startOfDay } from 'date-fns';
import { toValue } from 'vue';
import { dayIdFromDate } from './utils/date';

export function useCalendar<T = unknown>(rawOptions?: CalendarOptions<T>): CalendarComposables<T> {
  const options = normalizeGlobalParameters<T>(rawOptions);

  return {
    useMonthlyCalendar: monthlyCalendar<T>(options),
    useWeeklyCalendar: weeklyCalendar<T>(options),
    useWeekdays: useWeekdays(options),
    useMonthsList: useMonthsList(options),
    useYearsList: useYearsList(options),
  };
}

/** Normalize user input options:
 * - add default values
 * - normalize the multiple types into one type
 * - skip non valid options
 * - each property is a getter so refs / getters passed as option values stay reactive
 */
export function normalizeGlobalParameters<T>(opts: CalendarOptions<T> = {}): NormalizedCalendarOptions<T> {
  return {
    get startOn(): Date {
      const minDate = toValue(opts.minDate) ? startOfDay(new Date(toValue(opts.minDate)!)) : undefined;
      const startOnVal = toValue(opts.startOn);
      return startOnVal ? startOfDay(new Date(startOnVal)) : (minDate || startOfDay(new Date()));
    },
    get minDate(): Date | undefined {
      const v = toValue(opts.minDate);
      return v ? startOfDay(new Date(v)) : undefined;
    },
    get maxDate(): Date | undefined {
      const v = toValue(opts.maxDate);
      return v ? startOfDay(new Date(v)) : undefined;
    },
    get disabledIds(): Set<string> {
      return new Set(
        toValue(opts.disabled)?.map(dis => dayIdFromDate(startOfDay(new Date(dis)))) ?? [],
      );
    },
    get firstDayOfWeek(): FirstDayOfWeek {
      return toValue(opts.firstDayOfWeek) || 0;
    },
    get locale() {
      return toValue(opts.locale);
    },
    get preSelection(): Date[] {
      const ps = toValue(opts.preSelection);
      return (Array.isArray(ps) ? ps : [ps])
        .filter(d => d != null)
        .map(d => startOfDay(d));
    },
    get meta(): (date: Date) => T {
      return opts.meta ?? ((() => undefined) as unknown as (date: Date) => T);
    },
  };
}