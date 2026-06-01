import { shallowReactive } from "vue";
import { addDays, startOfDay, isAfter } from "date-fns";
import { CalendarDay, CalendarDayState, NormalizedCalendarOptions, StateProvider, SelectionMode } from "../types";
import { dayIdFromDate, checkIsToday, checkIsWeekend, isDateDisabled } from "../utils/date";

/**
 * Create a single CalendarDay object with reactive state.
 *
 * When a `stateProvider` is given, the state object is obtained from the
 * shared registry so that multiple CalendarDay instances with the same id
 * (e.g. a "real" day and its otherMonth padding copy) share the exact same
 * reactive state reference.
 */
export function createCalendarDay<T>(
  date: Date,
  options: NormalizedCalendarOptions<T>,
  overrides?: { otherMonth?: boolean; disabled?: boolean },
  stateProvider?: StateProvider,
): CalendarDay<T> {
  const d = startOfDay(date);
  const id = dayIdFromDate(d);
  const otherMonth = overrides?.otherMonth ?? false;
  const disabled = overrides?.disabled ?? isDateDisabled(d, options.disabledIds, options.minDate, options.maxDate);

  const state: CalendarDayState = stateProvider
    ? stateProvider(id, disabled)
    : shallowReactive({
      selected: false,
      hovered: false,
      between: false,
      disabled,
    });

  const meta = options.meta(d);

  const day: CalendarDay<T> = {
    date: d,
    id,
    state,
    otherMonth,
    meta,
    get isToday() { return checkIsToday(d); },
    get isWeekend() { return checkIsWeekend(d); },
    get dayOfWeek() { return d.getDay(); },
  };

  return day;
}

/**
 * Generate consecutive CalendarDay objects from `from` to `to` (inclusive).
 * Never mutates the input dates.
 * Throws if `from > to`.
 */
export function generateConsecutiveDays<T>(
  from: Date,
  to: Date,
  options: NormalizedCalendarOptions<T>,
  overrides?: { otherMonth?: boolean },
  stateProvider?: StateProvider,
): CalendarDay<T>[] {
  const start = startOfDay(from);
  const end = startOfDay(to);

  if (isAfter(start, end)) {
    throw new Error(
      `generateConsecutiveDays: 'from' (${start.toISOString()}) is after 'to' (${end.toISOString()})`,
    );
  }

  const days: CalendarDay<T>[] = [];
  let current = start;

  while (!isAfter(current, end)) {
    days.push(createCalendarDay(current, options, overrides, stateProvider));
    current = addDays(current, 1);
  }

  return days;
}
