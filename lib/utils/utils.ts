import { NormalizedCalendarOptions } from './../types';
import { isAfter, isBefore, isSameDay } from "date-fns";
import { ICalendarDate } from "../CalendarDate";

export function generators<C extends ICalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {

  function generateConsecutiveDays(from: Date, to: Date): Array<ICalendarDate> {
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates: Array<ICalendarDate> = [globalOptions.factory(from)];
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
    generateConsecutiveDays: generateConsecutiveDays,
  };
}

export function getBetweenDays (days: ICalendarDate[], first: ICalendarDate, second: ICalendarDate) {
  const firstSelectedDayIndex = days.findIndex((day) => day._copied === first._copied && isSameDay(day.date, first.date));
  const secondSelectedDayIndex = days.findIndex((day) => day._copied === second._copied && isSameDay(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return days.slice(lowestDate + 1, greatestDate);
  // return firstSelectedDayIndex <= currentSelectedDayIndex ? days.slice(firstSelectedDayIndex + 1, currentSelectedDayIndex) : days.slice(currentSelectedDayIndex + 1, firstSelectedDayIndex);
}

export function disableExtendedDates (dates: ICalendarDate[], from: Date, to?: Date) {
  const beforeFromDates = dates.slice(0, dates.findIndex(day => isSameDay(day.date, from)));
  const afterToDates = to ? dates.slice(dates.findIndex(day => isSameDay(day.date, to))) : [];
  beforeFromDates.concat(afterToDates).forEach(day => {
    day.disabled.value = true;
  });
}
