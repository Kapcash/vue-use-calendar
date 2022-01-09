import { ShallowReactive, shallowReactive, ShallowRef, shallowRef } from "@vue/runtime-core";
import { isAfter, isBefore, isSameDay, startOfWeek, endOfWeek, isFirstDayOfMonth, startOfMonth, isLastDayOfMonth, endOfMonth, daysToWeeks } from "date-fns";
import { CalendarDate } from "./CalendarDate";
import { FirstDayOfWeek, Month } from "./types";

export function generateDays (fromDate: Date, toDate: Date, disabledDates: Array<Date> = [], preSelection: Array<Date> = []): Array<CalendarDate> {
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  const dates: Array<CalendarDate> = [new CalendarDate(fromDate)];
  let dayIndex = fromDate.getDate() + 1;

  if (isAfter(fromDate, toDate)) {
    // Decide what TODO: error, reverse dates, one day only?
  }

  while (isBefore(dates[dates.length - 1]?.date, toDate)) {
    const date = new CalendarDate(fromDate.getFullYear(), fromDate.getMonth(), dayIndex++);
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
export function wrapByMonth (days: Array<CalendarDate>, otherMonthsDays = false, firstDayOfWeek: FirstDayOfWeek = 0): ShallowReactive<Month[]> {
  const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))];
  const wrap: ShallowReactive<Month[]> = shallowReactive([]);
  
  allMonthYearsIndex.forEach((monthYear) => {
    const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear);
    const nextMonthFirstDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1));
    // Next month first day not found -> is the last month
    const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
    const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
    
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, firstDayOfWeek);
    }

    wrap.push({
      year: CalendarDate.yearFromMonthYear(monthYear),
      month: CalendarDate.monthFromMonthYear(monthYear),
      days: monthDays,
    });
  });
  return wrap;
}

function generateOtherMonthDays (monthDays: CalendarDate[], firstDayOfWeek: FirstDayOfWeek = 0) {
  const beforeFrom = startOfWeek(monthDays[0]?.date, { weekStartsOn: firstDayOfWeek });
  const beforeTo = monthDays[0];
  const beforeDays = generateDays(beforeFrom, beforeTo.date);
  beforeDays.forEach(day => {
    day.disabled.value = true;
    day.otherMonth = true;
  });
  monthDays.unshift(...beforeDays.slice(0, -1));
  
  const afterFrom = monthDays[monthDays.length - 1];
  const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: firstDayOfWeek });
  const afterDays = generateDays(afterFrom!.date, afterTo);
  afterDays.forEach(day => {
    day.disabled.value = true;
    day.otherMonth = true;
  });
  monthDays.push(...afterDays.slice(1));
}

export function generateMonth (monthYear: number, otherMonthsDays = false, firstDayOfWeek: FirstDayOfWeek = 0): Month {
  const newMonth: Month = {
    year: CalendarDate.yearFromMonthYear(monthYear),
    month: CalendarDate.monthFromMonthYear(monthYear),
    days: [],
  };
  const monthRefDay = new Date(newMonth.year, newMonth.month);
  const monthDays: CalendarDate[] = generateDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay));

  if (otherMonthsDays) {
    generateOtherMonthDays(monthDays, firstDayOfWeek);
  }

  newMonth.days = monthDays;
  return newMonth;
}

export function wrapByWeek (days: Array<CalendarDate>) {
  // TODO implement
  return [];
}
