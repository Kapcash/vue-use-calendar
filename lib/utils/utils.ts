import { NormalizedCalendarOptions } from './../types';
import { isAfter, isBefore, isSameDay } from "date-fns";
import { ICalendarDate } from "../models/CalendarDate";

export function generators<C extends ICalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {

  function generateConsecutiveDays(from: Date, to: Date): Array<C> {
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates: Array<C> = [globalOptions.factory(from)];
    let dayIndex = from.getDate() + 1;

    if (isAfter(from, to)) {
      // Decide what TODO: error, reverse dates, one day only?
    }

    while (isBefore(dates[dates.length - 1]?.date || 0, to)) {
      const date = globalOptions.factory(from.getFullYear(), from.getMonth(), dayIndex++);
      date.disabled.value = globalOptions.disabled.some(disabled => isSameDay(date.date, disabled) );
      date.isSelected.value = globalOptions.preSelection.some(selected => isSameDay(date.date, selected) );
      dates.push(date);
    }

    return dates;
  }

  return {
    generateConsecutiveDays,
  };
}

export function getBetweenDays (pureDates: ICalendarDate[], first: ICalendarDate, second: ICalendarDate) {
  const firstSelectedDayIndex = pureDates.findIndex((day) => isSameDay(day.date, first.date));
  const secondSelectedDayIndex = pureDates.findIndex((day) => isSameDay(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return pureDates.slice(lowestDate + 1, greatestDate);
}

export function disableExtendedDates (dates: ICalendarDate[], from?: Date, to?: Date) {
  const beforeFromDates = from ? dates.slice(0, dates.findIndex(day => isSameDay(day.date, from))) : [];
  const afterToDates = to ? dates.slice(dates.findIndex(day => isSameDay(day.date, to))) : [];
  [...beforeFromDates, ...afterToDates].forEach(day => {
    day.disabled.value = true;
  });
}

export function chunk<T> (arr: Array<T>, size = 7) {
  return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
    return arr.slice(i * size, i * size + size);
  });
}
