import { CalendarOptions, CalendarComposables, NormalizedCalendarOptions, FirstDayOfWeek } from './types';
import { useWeekdays } from "./composables/use-weekdays";
import { monthlyCalendar } from "./composables/use-monthly-calendar";
import { weeklyCalendar } from "./composables/use-weekly-calendar";
import { useMonthsList } from './composables/use-months-list';
import { useYearsList } from './composables/use-years-list';
import { startOfDay } from 'date-fns';

export function useCalendar<T = unknown>(rawOptions: CalendarOptions<T>): CalendarComposables<T> {
  const options = normalizeGlobalParameters(rawOptions);

  return {
    useMonthlyCalendar: monthlyCalendar(options),
    useWeeklyCalendar: weeklyCalendar(options),
    useWeekdays: useWeekdays(options),
    useMonthsList: useMonthsList(options),
    useYearsList: useYearsList(options),
  };
}

export function normalizeGlobalParameters<T>(opts: CalendarOptions<T>): NormalizedCalendarOptions<T> {
  const minDate: Date | undefined = opts.minDate ? startOfDay(new Date(opts.minDate)) : undefined;
  const maxDate: Date | undefined = opts.maxDate ? startOfDay(new Date(opts.maxDate)) : undefined;
  const startOn: Date = opts.startOn ? startOfDay(new Date(opts.startOn)) : (minDate || startOfDay(new Date()));
  const disabled: Date[] = opts.disabled?.map(dis => startOfDay(new Date(dis))) || [];
  const firstDayOfWeek: FirstDayOfWeek = opts.firstDayOfWeek || 0;
  const meta = opts.meta ?? ((() => undefined) as unknown as (date: Date) => T);
  const preSelection: Date[] = (Array.isArray(opts.preSelection) ? opts.preSelection : [opts.preSelection])
    .filter(d => d != null)
    .map(d => startOfDay(d));

  return { startOn, firstDayOfWeek, minDate, maxDate, disabled, preSelection, meta, locale: opts.locale };
}