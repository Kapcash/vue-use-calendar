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

/** Check if a date is disabled by the disabled list, minDate, or maxDate. */
export function isDateDisabled(
  date: Date,
  disabled: Date[],
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate && date < minDate && !isSameDay(date, minDate)) {
    return true;
  }
  if (maxDate && date > maxDate && !isSameDay(date, maxDate)) {
    return true;
  }
  return disabled.some(d => isSameDay(d, date));
}
