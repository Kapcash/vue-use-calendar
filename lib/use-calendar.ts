import { CalendarOptions, CalendarComposables, NormalizedCalendarOptions, FirstDayOfWeek } from './types';
import { useWeekdays } from "./composables/use-weekdays";
import { monthlyCalendar } from "./composables/use-monthly-calendar";
import { weeklyCalendar } from "./composables/use-weekly-calendar";
import { generateCalendarFactory, ICalendarDate } from "./models/CalendarDate";
import { unref } from 'vue';

export function useCalendar<C extends ICalendarDate = ICalendarDate> (rawOptions: CalendarOptions<C>): CalendarComposables<C> {
  const options = normalizeGlobalParameters(rawOptions);

  const useMonthlyCalendar = monthlyCalendar(options);
  const useWeeklyCalendar = weeklyCalendar(options);

  return {
    useMonthlyCalendar,
    useWeeklyCalendar,
    useWeekdays: useWeekdays(options),
    factory: options.factory,
  };
}

export function normalizeGlobalParameters<C extends ICalendarDate> (opts: CalendarOptions<C>): NormalizedCalendarOptions<C> {
  const minDate: Date | undefined = opts.minDate ? new Date(opts.minDate) : undefined;
  const maxDate: Date | undefined = opts.maxDate ? new Date(opts.maxDate) : undefined;
  const startOn: Date = opts.startOn ? new Date(opts.startOn) : (minDate || new Date());
  // const disabled: Date[] = unref(unref(opts.disabled))?.map(dis => new Date(dis)) || [];
  const disabledUnref = unref(unref(opts.disabled));
  const disabled: Date[] | ((date: Date) => boolean) = Array.isArray(disabledUnref) 
    ? disabledUnref.map(dis => new Date(dis)) 
    : disabledUnref || [];
  const preSelection: Date[] = Array.isArray(opts.preSelection) 
    ? opts.preSelection.map(pre => new Date(pre)) 
    : [];
  const factory = generateCalendarFactory(opts.factory);
  const firstDayOfWeek: FirstDayOfWeek = opts.firstDayOfWeek || 0;

  return { ...opts, startOn, firstDayOfWeek, minDate, maxDate, disabled, preSelection, factory };
}