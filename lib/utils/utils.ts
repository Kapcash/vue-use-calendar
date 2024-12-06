import { NormalizedCalendarOptions } from './../types';
import { isAfter, isBefore, isSameDay } from "date-fns";
import { CalendarDate, MonthYear } from "../models/CalendarDate";

export function generators<C extends CalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {

  function generateConsecutiveDays(from: Date, to: Date): Array<C> {
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates: Array<C> = [globalOptions.factory(from)];
    let dayIndex = from.getDate() + 1;

    if (isAfter(from, to)) {
      // Decide what TODO: error, reverse dates, one day only?
    }

    while (isBefore(dates[dates.length - 1] || 0, to)) {
      const date: C = globalOptions.factory(from.getFullYear(), from.getMonth(), dayIndex++);
      date.disabled.value = globalOptions.disabled.some(disabled => isSameDay(date, disabled) );
      dates.push(date);
    }

    return dates;
  }

  return {
    generateConsecutiveDays,
  };
}

/**
 * Gets the dates between two dates. The order of the dates does not matter.
 * @returns A list of dates between the first and second date.
 */
export function getBetweenDays (dates: CalendarDate[], first: CalendarDate, second: CalendarDate) {
  const firstDayIndex = dates.findIndex((day) => isSameDay(day, first));
  const secondDayIndex = dates.findIndex((day) => isSameDay(day, second));
  const [lowestDateIndex, greatestDateIndex] = [firstDayIndex, secondDayIndex].sort((a, b) => a - b);
  return dates.slice(lowestDateIndex + 1, greatestDateIndex);
}

/** Disable the dates out of the given range. If no range provided, will disable all dates. */
export function disableOutOfRangeDates (dates: CalendarDate[], from?: Date, to?: Date) {
  const beforeFromDates = from ? dates.slice(0, dates.findIndex(day => isSameDay(day, from))) : [];
  const afterToDates = to ? dates.slice(dates.findIndex(day => isSameDay(day, to))) : [];
  [...beforeFromDates, ...afterToDates].forEach(day => {
    day.disabled.value = true;
  });
}

export function chunk<T> (arr: Array<T>, size = 7) {
  return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
    return arr.slice(i * size, i * size + size);
  });
}

/** Get the "MonthYear" index of a given date. */
export function dateToMonthYear(dateOrYear: Date | number, month?: number): MonthYear {
  let _year: number = dateOrYear as number;
  let _month: number = month || 0;
  if (typeof dateOrYear !== 'number') {
    _year = dateOrYear.getFullYear();
    _month = dateOrYear.getMonth();
  }
  return _year * 12 + _month;
}

export function yearFromMonthYear(monthYear: MonthYear) {
  return Math.floor(monthYear / 12);
}

export function monthFromMonthYear(monthYear: MonthYear) {
  return monthYear % 12;
}