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
      const raw = opts.disabled;
      // If disabled is a predicate function, disabledIds is empty (disabledFn handles it)
      if (typeof raw === 'function' && raw.length > 0) { return new Set(); }
      const val = toValue(raw as Exclude<typeof raw, (date: Date) => boolean>);
      return new Set(
        val?.map(dis => dayIdFromDate(startOfDay(new Date(dis)))) ?? [],
      );
    },
    get disabledFn(): ((date: Date) => boolean) | undefined {
      const raw = opts.disabled;
      // A disabled predicate has length > 0 (takes a date argument).
      // MaybeRefOrGetter getters have length 0.
      if (typeof raw === 'function' && raw.length > 0) { return raw as (date: Date) => boolean; }
      return undefined;
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