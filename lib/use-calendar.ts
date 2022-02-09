import { generateCalendarFactory, ICalendarDate } from "./CalendarDate";
import { CalendarOptions, CalendarComposables, NormalizedCalendarOptions } from './types';
import { useWeekdays } from "./use-weekdays";
import { monthlyCalendar } from "./use-monthly-calendar";
import { weeklyCalendar } from "./use-weekly-calendar";

export function useCalendar<C extends ICalendarDate = ICalendarDate> (rawOptions: CalendarOptions<C>): CalendarComposables<C> {
  const options = normalizeGlobalParameters(rawOptions);

  const useMonthlyCalendar = monthlyCalendar(options);
  const useWeeklyCalendar = weeklyCalendar(options);

  return {
    useMonthlyCalendar,
    useWeeklyCalendar,
    useWeekdays: useWeekdays(options),
  };
}

export function normalizeGlobalParameters<C extends ICalendarDate> (opts: CalendarOptions<C>): NormalizedCalendarOptions<C> {
  const from: Date = new Date(opts.from);
  const to: Date | undefined = opts.to ? new Date(opts.to) : undefined;
  const disabled: Date[] = opts.disabled.map(dis => new Date(dis));
  const preSelection: Date[] = (Array.isArray(opts.preSelection) ? opts.preSelection : [opts.preSelection]).filter(Boolean) as Array<Date>;
  const factory = generateCalendarFactory(opts.factory);

  return { ...opts, from, to, disabled, preSelection, factory };
}