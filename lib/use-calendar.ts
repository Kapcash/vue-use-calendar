import { CalendarOptions, CalendarComposables, NormalizedCalendarOptions, FirstDayOfWeek, SelectionMode } from './types';
import { useWeekdays } from "./composables/use-weekdays";
import { monthlyCalendar } from "./composables/use-monthly-calendar";
import { weeklyCalendar } from "./composables/use-weekly-calendar";
import { useMonthsList } from './composables/use-months-list';
import { useYearsList } from './composables/use-years-list';
import { startOfDay } from 'date-fns';
import { dayIdFromDate } from './utils/date';

export function useCalendar<T = unknown, M extends SelectionMode | undefined = undefined>(rawOptions: CalendarOptions<T, M>): CalendarComposables<T, M> {
  const options = normalizeGlobalParameters<T, M>(rawOptions);

  return {
    useMonthlyCalendar: monthlyCalendar<T, M>(options),
    useWeeklyCalendar: weeklyCalendar<T, M>(options),
    useWeekdays: useWeekdays(options),
    useMonthsList: useMonthsList(options),
    useYearsList: useYearsList(options),
  };
}

export function normalizeGlobalParameters<T, M extends SelectionMode | undefined = undefined>(opts: CalendarOptions<T, M>): NormalizedCalendarOptions<T, M> {
  const minDate: Date | undefined = opts.minDate ? startOfDay(new Date(opts.minDate)) : undefined;
  const maxDate: Date | undefined = opts.maxDate ? startOfDay(new Date(opts.maxDate)) : undefined;
  const startOn: Date = opts.startOn ? startOfDay(new Date(opts.startOn)) : (minDate || startOfDay(new Date()));
  const disabledIds: Set<string> = new Set(
    opts.disabled?.map(dis => dayIdFromDate(startOfDay(new Date(dis)))) ?? [],
  );
  const firstDayOfWeek: FirstDayOfWeek = opts.firstDayOfWeek || 0;
  const meta = opts.meta ?? ((() => undefined) as unknown as (date: Date) => T);
  const preSelection: Date[] = (Array.isArray(opts.preSelection) ? opts.preSelection : [opts.preSelection])
    .filter(d => d != null)
    .map(d => startOfDay(d));
  const mode = (opts.mode ?? undefined) as M;

  return { startOn, firstDayOfWeek, minDate, maxDate, disabledIds, preSelection, meta, locale: opts.locale, mode };
}