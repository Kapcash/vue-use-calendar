import { ShallowReactive, shallowReactive } from "@vue/runtime-core";
import { isAfter, isBefore, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getWeek } from "date-fns";
import { ICalendarDate, calendarFactory, monthFromMonthYear, yearFromMonthYear, copyCalendarDate } from "./CalendarDate";
import { FirstDayOfWeek, Month, Week } from "./types";

export function generateDays (fromDate: Date, toDate: Date, disabledDates: Array<Date> = [], preSelection: Array<Date> = []): Array<ICalendarDate> {
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  const dates: Array<ICalendarDate> = [calendarFactory(fromDate)];
  let dayIndex = fromDate.getDate() + 1;

  if (isAfter(fromDate, toDate)) {
    // Decide what TODO: error, reverse dates, one day only?
  }

  while (isBefore(dates[dates.length - 1]?.date || 0, toDate)) {
    const date = calendarFactory(fromDate.getFullYear(), fromDate.getMonth(), dayIndex++);
    date.disabled.value = !!disabledDates.find(disabled => isSameDay(date.date, disabled) );
    date.isSelected.value = !!preSelection.find(selected => isSameDay(date.date, selected) );
    dates.push(date);
  }

  return dates;
}

export function getBetweenDays (days: ICalendarDate[], first: ICalendarDate, second: ICalendarDate) {
  const firstSelectedDayIndex = days.findIndex((day) => day._copied === first._copied && isSameDay(day.date, first.date));
  const secondSelectedDayIndex = days.findIndex((day) => day._copied === second._copied && isSameDay(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return days.slice(lowestDate + 1, greatestDate);
  // return firstSelectedDayIndex <= currentSelectedDayIndex ? days.slice(firstSelectedDayIndex + 1, currentSelectedDayIndex) : days.slice(currentSelectedDayIndex + 1, firstSelectedDayIndex);
}

/**
 * 
 * @param days Sorted array of CalendarDate
 * @returns Array of months including the month, year and array of CalendarDate for that month
 */
export function wrapByMonth (days: Array<ICalendarDate>, otherMonthsDays = false, firstDayOfWeek: FirstDayOfWeek = 0): ShallowReactive<Month[]> {
  const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))];
  const wrap: ShallowReactive<Month[]> = shallowReactive([]);
  
  allMonthYearsIndex.forEach((monthYear) => {
    const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear);
    const nextMonthFirstDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1));
    // Next month first day not found -> is the last month
    const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
    const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
    
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, wrap[wrap.length - 1]?.days || [], [], firstDayOfWeek);
    }

    wrap.push({
      year: yearFromMonthYear(monthYear),
      month: monthFromMonthYear(monthYear),
      days: monthDays,
    });
  });
  return wrap;
}

function generateOtherMonthDays (monthDays: ICalendarDate[], monthBefore:ICalendarDate[], monthAfter:ICalendarDate[], firstDayOfWeek: FirstDayOfWeek = 0) {
  if (monthDays.length <= 0) { return; }

  completeWeekBefore(monthDays, monthBefore, firstDayOfWeek);
  completeWeekAfter(monthDays, monthAfter, firstDayOfWeek);
}

function completeWeekBefore (newBeforeDays: ICalendarDate[], beforeDates: ICalendarDate[], firstDayOfWeek: FirstDayOfWeek = 0) {
  let beforeDays = [];
  if (beforeDates.length > 0) {
    const lastWeek = beforeDates.slice(-7);
    const lastWeekCopy = lastWeek.map(copyCalendarDate);
    lastWeek.forEach(day => { day._copied = day.otherMonth; });
    lastWeekCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
    const howManyDaysDuplicated = 7 - newBeforeDays[0].date.getDay() + firstDayOfWeek;
    beforeDays = lastWeekCopy;
    newBeforeDays.splice(0, howManyDaysDuplicated);
  } else {
    const beforeTo = newBeforeDays[0].date;
    const beforeFrom = startOfWeek(beforeTo, { weekStartsOn: firstDayOfWeek });
    beforeDays = generateDays(beforeFrom, beforeTo).slice(0, -1);
    beforeDays.forEach(day => { day.otherMonth = true; });
  }

  newBeforeDays.unshift(...beforeDays);
}

function completeWeekAfter (newAfterDays: ICalendarDate[], afterDates: ICalendarDate[], firstDayOfWeek: FirstDayOfWeek = 0) {
  let afterDays = [];
  if (afterDates.length > 0) {
    const nextWeek = afterDates.slice(0, 7);
    const nextWeekCopy = nextWeek.map(copyCalendarDate);
    nextWeek.forEach(day => { day._copied = day.otherMonth; });
    nextWeekCopy.forEach(day => { day.otherMonth = !day.otherMonth; day._copied = day.otherMonth; });
    const howManyDaysDuplicated = (newAfterDays[newAfterDays.length - 1].date.getDay() + firstDayOfWeek - 1) % 7;
    afterDays = nextWeekCopy;
    newAfterDays.splice(-howManyDaysDuplicated, howManyDaysDuplicated);
  } else {
    const afterFrom = newAfterDays[newAfterDays.length - 1];
    const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: firstDayOfWeek });
    afterDays = generateDays(afterFrom!.date, afterTo).slice(1);
    afterDays.forEach(day => { day.otherMonth = true; });
  }

  newAfterDays.push(...afterDays);
}

interface GenerateMonthOptions {
  otherMonthsDays: boolean;
  firstDayOfWeek: FirstDayOfWeek;
  beforeMonthDays: ICalendarDate[];
  afterMonthDays: ICalendarDate[];
}

const DEFAULT_GEN_MONTH_OPTIONS: GenerateMonthOptions = {
  otherMonthsDays: false,
  firstDayOfWeek: 0,
  beforeMonthDays: [],
  afterMonthDays: [],
};

export function generateMonth (monthYear: number, options: Partial<GenerateMonthOptions>): Month {
  const opts: GenerateMonthOptions = { ...DEFAULT_GEN_MONTH_OPTIONS, ...options };
  const newMonth: Month = {
    year: yearFromMonthYear(monthYear),
    month: monthFromMonthYear(monthYear),
    days: [],
  };
  const monthRefDay = new Date(newMonth.year, newMonth.month);
  const monthDays: ICalendarDate[] = generateDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay));

  if (opts.otherMonthsDays) { // TODO Link previous / next otherMonth days
    generateOtherMonthDays(monthDays, opts.beforeMonthDays, opts.afterMonthDays, opts.firstDayOfWeek);
  }

  newMonth.days = monthDays;
  return newMonth;
}

export function wrapByWeek (days: Array<ICalendarDate>, firstDayOfWeek: FirstDayOfWeek = 0) {
  const getNbWeek = (day: ICalendarDate) => getWeek(day.date, { weekStartsOn: firstDayOfWeek });

  function chunk<T> (arr: Array<T>, size = 7) {
    return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
      return arr.slice(i * size, i * size + size);
    });
  }

  const firstStartOfWeek = days.findIndex(day => day.date.getDay() === firstDayOfWeek);
  const weeks = [days.slice(0, firstStartOfWeek), ...chunk(days.slice(firstStartOfWeek))].filter(chunk => chunk.length > 0);

  const weeksObj: Week[] = weeks.map(days => ({
    weekNumber: getNbWeek(days[0]),
    month: days[0].date.getMonth(),
    year: days[0].date.getFullYear(),
    days,
  }));
  return weeksObj;
}

export function disableExtendedDates (dates: ICalendarDate[], from: Date, to?: Date) {
  const beforeFromDates = dates.slice(0, dates.findIndex(day => isSameDay(day.date, from)));
  const afterToDates = to ? dates.slice(dates.findIndex(day => isSameDay(day.date, to))) : [];
  beforeFromDates.concat(afterToDates).forEach(day => {
    day.disabled.value = true;
  });
}
