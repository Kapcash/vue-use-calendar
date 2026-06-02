import { format, isToday as dateFnsIsToday, isSameDay } from "date-fns";

/** Generate a stable day ID string from a Date: "YYYY-MM-DD" */
export function dayIdFromDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Check if a date is today. */
export function checkIsToday(date: Date): boolean {
  return dateFnsIsToday(date);
}

/** Check if day is Saturday (6) or Sunday (0). */
export function checkIsWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Check if a date is disabled by the disabled set, disabledFn, minDate, or maxDate.
 *  `disabledIds` is a Set of "YYYY-MM-DD" strings for O(1) lookup. */
export function isDateDisabled(
  date: Date,
  disabledIds: Set<string>,
  minDate?: Date,
  maxDate?: Date,
  disabledFn?: (date: Date) => boolean,
): boolean {
  if (minDate && date < minDate && !isSameDay(date, minDate)) {
    return true;
  }
  if (maxDate && date > maxDate && !isSameDay(date, maxDate)) {
    return true;
  }
  if (disabledFn && disabledFn(date)) {
    return true;
  }
  return disabledIds.has(dayIdFromDate(date));
}
