import { ShallowReactive, shallowReactive } from "vue";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { copyCalendarDate, ICalendarDate, monthFromMonthYear, yearFromMonthYear } from "../CalendarDate";
import { Month, NormalizedCalendarOptions } from "../types";
import { generators } from './utils';

interface GenerateMonthOptions {
  otherMonthsDays: boolean;
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
  function wrapByMonth (days: Array<C>, otherMonthsDays = false): ShallowReactive<Month[]> {
    const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))];
    const wrap: ShallowReactive<Month[]> = shallowReactive([]);
    
    allMonthYearsIndex.forEach((monthYear) => {
      const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear);
      const nextMonthFirstDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1));
      // Next month first day not found -> is the last month
      const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
      const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
      
      if (otherMonthsDays) {
        const beforeMonth = wrap[wrap.length - 1]?.days || [];
        generateOtherMonthDays(monthDays, beforeMonth, []);
      }

      wrap.push(monthFactory(monthDays));
    });
    return wrap;
  }

  function generateMonth (monthYear: number, options: Partial<GenerateMonthOptions>): Month<C> {
    const {
      otherMonthsDays = false,
      beforeMonthDays = [],
      afterMonthDays = [],
    } = options;

    const monthRefDay = new Date(yearFromMonthYear(monthYear), monthFromMonthYear(monthYear));
    const monthDays: C[] = generateConsecutiveDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay));
    
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, beforeMonthDays, afterMonthDays);
    }

    return monthFactory(monthDays);
  }

  function generateOtherMonthDays (monthDays: ICalendarDate[], monthBefore:ICalendarDate[], monthAfter:ICalendarDate[]) {
    if (monthDays.length <= 0) { return; }
  
    completeWeekBefore(monthDays, monthBefore);
    completeWeekAfter(monthDays, monthAfter);
  }
  
  function completeWeekBefore (newBeforeDays: ICalendarDate[], beforeDates: ICalendarDate[]) {
    let beforeDays: ICalendarDate[] = [];
    if (beforeDates.length > 0) {
      const lastWeek = beforeDates.slice(-7);
      const lastWeekCopy = lastWeek.map(copyCalendarDate);
      lastWeek.forEach(day => { day._copied = day.otherMonth; });
      lastWeekCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
      const howManyDaysDuplicated = 7 - newBeforeDays[0].date.getDay() + globalOptions.firstDayOfWeek;
      beforeDays = lastWeekCopy;
      newBeforeDays.splice(0, howManyDaysDuplicated);
    } else {
      const beforeTo = newBeforeDays[0].date;
      const beforeFrom = startOfWeek(beforeTo, { weekStartsOn: globalOptions.firstDayOfWeek });
      beforeDays = generateConsecutiveDays(beforeFrom, beforeTo).slice(0, -1);
      beforeDays.forEach(day => { day.otherMonth = true; });
    }
  
    newBeforeDays.unshift(...beforeDays);
  }
  
  function completeWeekAfter (newAfterDays: ICalendarDate[], afterDates: ICalendarDate[]) {
    let afterDays: ICalendarDate[] = [];
    if (afterDates.length > 0) {
      const nextWeek = afterDates.slice(0, 7);
      const nextWeekCopy = nextWeek.map(copyCalendarDate);
      nextWeek.forEach(day => { day._copied = day.otherMonth; });
      nextWeekCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
      const howManyDaysDuplicated = (newAfterDays[newAfterDays.length - 1].date.getDay() + globalOptions.firstDayOfWeek - 1) % 7;
      afterDays = nextWeekCopy;
      newAfterDays.splice(-howManyDaysDuplicated, howManyDaysDuplicated);
    } else {
      const afterFrom = newAfterDays[newAfterDays.length - 1];
      const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: globalOptions.firstDayOfWeek });
      afterDays = generateConsecutiveDays(afterFrom!.date, afterTo).slice(1);
      afterDays.forEach(day => { day.otherMonth = true; });
    }
  
    newAfterDays.push(...afterDays);
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