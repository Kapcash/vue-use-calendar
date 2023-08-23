import { shallowReactive } from "vue";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { copyCalendarDate, ICalendarDate, monthFromMonthYear, yearFromMonthYear } from "../models/CalendarDate";
import { Month, NormalizedCalendarOptions } from "../types";
import { generators } from './utils';

interface GenerateMonthOptions {
  otherMonthsDays: boolean;
  fixedWeeks: boolean;
  beforeMonthDays: ICalendarDate[];
  afterMonthDays: ICalendarDate[];
}

export function monthGenerators<C extends ICalendarDate> (globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays } = generators(globalOptions);

  function monthFactory (monthDays: Array<C>): Month<C> {
    return {
      days: monthDays,
      month: monthDays[10].date.getMonth(),
      year: monthDays[10].date.getFullYear(),
      index: monthDays[10].monthYearIndex,
    };
  }

  /**
   * @param days Sorted array of CalendarDate
   * @returns Array of months including the month, year and array of CalendarDate for that month
   */
  function wrapByMonth (days: Array<C>, otherMonthsDays = false, fixedWeeks = false): Month[] {
    const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))];
    const wrap: Month[] = shallowReactive([]);

    allMonthYearsIndex.forEach((monthYear) => {
      const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear);
      const nextMonthFirstDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1));
      // Next month first day not found -> is the last month
      const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
      const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);

      if (otherMonthsDays) {
        const beforeMonth = wrap[wrap.length - 1]?.days || [];
        generateOtherMonthDays(monthDays, beforeMonth, [], fixedWeeks);
      }

      wrap.push(monthFactory(monthDays));
    });

    return wrap;
  }

  function generateMonth (monthYear: number, options: Partial<GenerateMonthOptions>): Month<C> {
    const {
      fixedWeeks = false,
      otherMonthsDays = false,
      beforeMonthDays = [],
      afterMonthDays = [],
    } = options;

    const monthRefDay = new Date(yearFromMonthYear(monthYear), monthFromMonthYear(monthYear));
    const monthDays: C[] = generateConsecutiveDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay));

    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, beforeMonthDays, afterMonthDays, fixedWeeks);
    }

    return monthFactory(monthDays);
  }

  function generateOtherMonthDays (monthDays: ICalendarDate[], monthBefore:ICalendarDate[], monthAfter:ICalendarDate[], fixedWeeks = false) {
    if (monthDays.length <= 0) { return; }

    completeWeekBefore(monthDays, monthBefore);
    completeWeekAfter(monthDays, monthAfter, fixedWeeks);
  }

  function completeWeekBefore (daysToComplete: ICalendarDate[], previousDays: ICalendarDate[]) {
    let beforeDays: ICalendarDate[] = [];
    if (previousDays.length > 0) {
      const currentIndex = daysToComplete[0].monthYearIndex;
      const howManyDaysDuplicated = previousDays.slice(-14).filter(day => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(0, howManyDaysDuplicated);
        const spliceDays = howManyDaysDuplicated > 7 ? 14 : 7;
        const lastDays = previousDays.slice(-spliceDays);
        const lastDaysCopy = lastDays.map(copyCalendarDate);
        lastDays.forEach(day => { day._copied = day.otherMonth; });
        lastDaysCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
        beforeDays = lastDaysCopy;
      }
    } else {
      const beforeTo = daysToComplete[0].date;
      const beforeFrom = startOfWeek(beforeTo, { weekStartsOn: globalOptions.firstDayOfWeek });
      beforeDays = generateConsecutiveDays(beforeFrom, beforeTo).slice(0, -1);
      beforeDays.forEach(day => { day.otherMonth = true; });
    }

    daysToComplete.unshift(...beforeDays);
  }

  function completeWeekAfter (daysToComplete: ICalendarDate[], followingDays: ICalendarDate[], fixedWeeks = false) {
    let afterDays: ICalendarDate[] = [];
    if (followingDays.length > 0) {
      const fullWeekCount = Math.floor(daysToComplete.length / 7) + (fixedWeeks ? 0 : 1);
      const needDays = 7 * (6 - fullWeekCount);
      const nextDays = followingDays.slice(0, needDays);
      const nextDaysCopy = nextDays.map(copyCalendarDate);
      nextDays.forEach(day => { day._copied = day.otherMonth; });
      nextDaysCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
      afterDays = nextDaysCopy;

      const currentIndex = daysToComplete[daysToComplete.length - 1].monthYearIndex;
      const howManyDaysDuplicated = followingDays.slice(0, 14).filter(day => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(-howManyDaysDuplicated, howManyDaysDuplicated);
      }
    } else {
      const allWeekCount = Math.ceil(daysToComplete.length / 7);
      const afterFrom = daysToComplete[daysToComplete.length - 1];
      const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: globalOptions.firstDayOfWeek });
      if (daysToComplete.length < 36 && fixedWeeks) {
        afterTo.setDate(afterTo.getDate() + 7 * (6 - allWeekCount));
      }
      afterDays = generateConsecutiveDays(afterFrom!.date, afterTo).slice(1);
      afterDays.forEach(day => { day.otherMonth = true; });
    }

    daysToComplete.push(...afterDays);
  }

  return {
    generateConsecutiveDays,
    generateMonth,
    wrapByMonth,
  };
}

export function isAfter(monthA: Month, monthB: Month) {
  return monthA.year > monthB.year || (monthA.year === monthB.year && monthA.month > monthB.month);
}

export function isBefore(monthA: Month, monthB: Month) {
  return monthA.year < monthB.year || (monthA.year === monthB.year && monthA.month < monthB.month);
}