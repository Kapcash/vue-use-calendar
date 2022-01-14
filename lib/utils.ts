import { ShallowReactive, shallowReactive } from "@vue/runtime-core";
import { isAfter, isBefore, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDate } from "./CalendarDate";
import { CalendarFactory, Constructor, FirstDayOfWeek, Month } from "./types";

export function generateDays<C extends CalendarDate = CalendarDate> (fromDate: Date, toDate: Date, CalendarClass: CalendarFactory<C>, disabledDates: Array<Date> = [], preSelection: Array<Date> = []): Array<C> {
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  const dates: Array<C> = [CalendarClass(fromDate)];
  let dayIndex = fromDate.getDate() + 1;

  if (isAfter(fromDate, toDate)) {
    // Decide what TODO: error, reverse dates, one day only?
  }

  while (isBefore(dates[dates.length - 1]?.date || 0, toDate)) {
    const date = CalendarClass(fromDate.getFullYear(), fromDate.getMonth(), dayIndex++);
    date.disabled.value = !!disabledDates.find(disabled => isSameDay(date.date, disabled) );
    date.isSelected.value = !!preSelection.find(selected => isSameDay(date.date, selected) );
    dates.push(date);
  }

  return dates;
}

export function getBetweenDays (days: CalendarDate[], first: CalendarDate, second: CalendarDate) {
  const firstSelectedDayIndex = days.findIndex((day) => isSameDay(day.date, first.date));
  const currentSelectedDayIndex = days.findIndex((day) => isSameDay(day.date, second.date));
  return firstSelectedDayIndex <= currentSelectedDayIndex ? days.slice(firstSelectedDayIndex + 1, currentSelectedDayIndex) : days.slice(currentSelectedDayIndex + 1, firstSelectedDayIndex);
}

/**
 * 
 * @param days Sorted array of CalendarDate
 * @returns Array of months including the month, year and array of CalendarDate for that month
 */
export function wrapByMonth<C extends CalendarDate = CalendarDate> (days: Array<CalendarDate>, otherMonthsDays = false, firstDayOfWeek: FirstDayOfWeek = 0, CalendarClass: CalendarFactory<C>): ShallowReactive<Month[]> {
  const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))];
  const wrap: ShallowReactive<Month[]> = shallowReactive([]);
  
  allMonthYearsIndex.forEach((monthYear) => {
    const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear);
    const nextMonthFirstDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1));
    // Next month first day not found -> is the last month
    const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
    const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
    
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, firstDayOfWeek, CalendarClass);
    }

    wrap.push({
      year: CalendarDate.yearFromMonthYear(monthYear),
      month: CalendarDate.monthFromMonthYear(monthYear),
      days: monthDays,
    });
  });
  return wrap;
}

function generateOtherMonthDays<C extends CalendarDate = CalendarDate> (monthDays: C[], firstDayOfWeek: FirstDayOfWeek = 0, CalendarClass: CalendarFactory<C>) {
  if (monthDays.length <= 0) { return; }

  const beforeFrom = startOfWeek(monthDays[0].date, { weekStartsOn: firstDayOfWeek });
  const beforeTo = monthDays[0];
  const beforeDays = generateDays(beforeFrom, beforeTo.date, CalendarClass, undefined, undefined);
  beforeDays.forEach(day => {
    day.disabled.value = true;
    day.otherMonth = true;
  });
  monthDays.unshift(...beforeDays.slice(0, -1));
  
  const afterFrom = monthDays[monthDays.length - 1];
  const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: firstDayOfWeek });
  const afterDays = generateDays(afterFrom!.date, afterTo, CalendarClass, undefined, undefined);
  afterDays.forEach(day => {
    day.disabled.value = true;
    day.otherMonth = true;
  });
  monthDays.push(...afterDays.slice(1));
}

export function generateMonth<C extends CalendarDate = CalendarDate> (monthYear: number, otherMonthsDays = false, firstDayOfWeek: FirstDayOfWeek = 0, CalendarClass: CalendarFactory<C>): Month {
  const newMonth: Month = {
    year: CalendarDate.yearFromMonthYear(monthYear),
    month: CalendarDate.monthFromMonthYear(monthYear),
    days: [],
  };
  const monthRefDay = new Date(newMonth.year, newMonth.month);
  const monthDays: CalendarDate[] = generateDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay), CalendarClass);

  if (otherMonthsDays) {
    generateOtherMonthDays(monthDays, firstDayOfWeek, CalendarClass);
  }

  newMonth.days = monthDays;
  return newMonth;
}

export function wrapByWeek (days: Array<CalendarDate>) {
  // TODO implement
  return [];
}
