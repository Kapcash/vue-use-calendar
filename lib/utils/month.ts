import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { CalendarDay, Month, NormalizedCalendarOptions, MonthId, StateProvider, SelectionMode } from "../types";
import { generateConsecutiveDays } from "../core/calendar-day";

// ── Month ID arithmetic ──────────────────────────────────────────────────────

/** Compute MonthId from year and month (0-indexed). */
export function monthIdFromYearMonth(year: number, month: number): MonthId {
  return year * 12 + month;
}

/** Compute MonthId from a Date. */
export function monthIdFromDate(date: Date): MonthId {
  return monthIdFromYearMonth(date.getFullYear(), date.getMonth());
}

/** Extract year from MonthId. */
export function yearFromMonthId(monthId: MonthId): number {
  return Math.floor(monthId / 12);
}

/** Extract month (0-11) from MonthId. */
export function monthFromMonthId(monthId: MonthId): number {
  return monthId % 12;
}

/**
 * Generate a Month object for a given MonthId.
 */
export function generateMonth<T>(
  monthId: MonthId,
  options: NormalizedCalendarOptions<T>,
  fullWeeks: boolean,
  stateProvider?: StateProvider,
): Month<T> {
  const year = yearFromMonthId(monthId);
  const month = monthFromMonthId(monthId);
  const refDate = new Date(year, month, 1);

  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(refDate);

  const monthDays = generateConsecutiveDays(monthStart, monthEnd, options, undefined, stateProvider);

  if (fullWeeks) {
    padFullWeeks(monthDays, monthStart, monthEnd, options, stateProvider);
  }

  return {
    id: monthId,
    month,
    year,
    days: monthDays,
  };
}

/**
 * Pad a month's days array so it starts and ends on full weeks.
 * Padding days are marked with `otherMonth: true`.
 */
function padFullWeeks<T>(
  days: CalendarDay<T>[],
  monthStart: Date,
  monthEnd: Date,
  options: NormalizedCalendarOptions<T>,
  stateProvider?: StateProvider,
): void {
  const weekStart = startOfWeek(monthStart, { weekStartsOn: options.firstDayOfWeek });

  // Pad before
  if (weekStart < monthStart) {
    const beforeDays = generateConsecutiveDays(weekStart, addDays(monthStart, -1), options, { otherMonth: true }, stateProvider);
    days.unshift(...beforeDays);
  }

  // Pad after
  const weekEnd = endOfWeek(monthEnd, { weekStartsOn: options.firstDayOfWeek });
  if (weekEnd > monthEnd) {
    const afterDays = generateConsecutiveDays(addDays(monthEnd, 1), weekEnd, options, { otherMonth: true }, stateProvider);
    days.push(...afterDays);
  }
}
