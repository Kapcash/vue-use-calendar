import { generate } from "@vue/compiler-core";
import { endOfWeek, isAfter, isBefore, isSameDay, lastDayOfMonth, nextSunday, previousMonday, startOfMonth, startOfWeek } from "date-fns";
import { Ref, ref } from "vue";
import { CalendarDate } from "./CalendarDate";

type DateInput = Date | string
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface CalendarOptions {
  from: DateInput;
  to?: DateInput;
  disabled: Array<DateInput>;
  firstDayOfWeek: FirstDayOfWeek;
}

type Month = {
  month: number;
  year: number;
  days: CalendarDate[];
}
type Week = Array<CalendarDate>

interface MonthlyCalendarComposable {
  currentMonth: Ref<number>;
  currentYear: Ref<number>;
  months: Array<Month>;
}

interface WeeklyCalendarComposable {
  weeks: Array<Week>;
}

export function useWeekdays (firstDayOfWeek: FirstDayOfWeek): Array<string> {
  const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
  Array.from(Array(firstDayOfWeek)).forEach(() => {
    weekdays.push(weekdays.shift()!)
  })
  return weekdays
}

export function useMonthlyCalendar ({ from, to, disabled, firstDayOfWeek }: CalendarOptions): MonthlyCalendarComposable {
  const fromDate = new Date(from)
  const toDate = to ? new Date(to) : lastDayOfMonth(fromDate)
  const disabledDates = disabled.map(dis => new Date(dis))
  const otherMonthsDays = true
  const currentMonth = ref(fromDate.getMonth())
  const currentYear = ref(fromDate.getFullYear())

  const days = generateDays(fromDate, toDate, disabledDates)
  const daysByMonths = wrapByMonth(days, otherMonthsDays, firstDayOfWeek)

  return { currentMonth, currentYear, months: daysByMonths }
}

// export function useWeeklyCalendar ({ from, to, disabled }: CalendarOptions): WeeklyCalendarComposable {
//   const fromDate = new Date(from)
//   const toDate = new Date(to)
//   const firstDayOfWeek = 0
//   const currentMonth = ref(getWeek(fromDate))

//   const days = generateDays(fromDate, toDate)
//   const daysByMonths = wrapByWeek(days)

//   return { currentWeek, weeks: daysByMonths }
// }

// export function useCalendar ({ from, to, disabled }: CalendarOptions): CalendarComposable {
//   const fromDate = new Date(from)
//   const toDate = new Date(to)
//   const firstDayOfWeek = 0

//   if (isAfter(fromDate, toDate)) {
//     // Decide what TODO: error, reverse dates, one day only?
//   }

//   const firstMonth = fromDate.getMonth()
//   const lastMonth = toDate.getMonth()
  
//   const calendarDays = []
//   let monthIndex = firstMonth;
//   let currentYear = fromDate.getFullYear();
//   let currentMonth = fromDate.getMonth();

//   while (monthIndex < lastMonth) {
//     const nextMonthDate = new Date(currentYear, currentMonth);
//     const year = nextMonthDate.getFullYear();
//     const month = nextMonthDate.getMonth();

//     const currentMonthDates = getCurrentMonthDates(nextMonthDate, firstDayOfWeek);
//     const prevMonthDates = getPrevMonthDates(currentMonthDates[0], firstDayOfWeek);
//     const nextMonthDates = getNextMonthDates(currentMonthDates[currentMonthDates.length - 1], firstDayOfWeek);

//     calendarDays.push({
//       dates: [...prevMonthDates, ...currentMonthDates, ...nextMonthDates],
//       month,
//       year
//     });

//     currentYear = year;
//     currentMonth = month + 1;
//     monthIndex++;
//   }

//   return calendarDays;
// }

function generateDays (fromDate: Date, toDate: Date, disabledDates: Array<Date> = []): Array<CalendarDate> {
  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(0, 0, 0, 0)
  const dates: Array<CalendarDate> = [new CalendarDate(fromDate)];
  let dayIndex = fromDate.getDate() + 1

  if (isAfter(fromDate, toDate)) {
    // Decide what TODO: error, reverse dates, one day only?
  }

  while (isBefore(dates[dates.length - 1]?.date, toDate)) {
    const date = new CalendarDate(fromDate.getFullYear(), fromDate.getMonth(), dayIndex++)
    date.disabled.value = !!disabledDates.find(disabled => isSameDay(date.date, disabled) )
    dates.push(date);
  }

  return dates
}

/**
 * 
 * @param days Sorted array of CalendarDate
 * @returns Array of months including the month, year and array of CalendarDate for that month
 */
function wrapByMonth (days: Array<CalendarDate>, otherMonthsDays: boolean = false, firstDayOfWeek: FirstDayOfWeek = 0) {
  const allMonthYearsIndex = [...new Set(days.map(day => day.monthYearIndex))]
  const wrap: Month[] = []

  allMonthYearsIndex.forEach((monthYear) => {
    // TODO Implement "otherMonthsDays"
    const monthFirstDayIndex = days.findIndex(day => day.monthYearIndex === monthYear)
    const monthLastDayIndex = days.findIndex(day => day.monthYearIndex === (monthYear + 1)) - 1
    const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex)

    if (otherMonthsDays) {
      const beforeFrom = startOfWeek(monthDays[0]?.date, { weekStartsOn: firstDayOfWeek })
      const beforeTo = monthDays[0]
      const beforeDays = generateDays(beforeFrom, beforeTo!.date)
      beforeDays.forEach(day => {
        day.disabled.value = true
        day.otherMonth = true
      })
      monthDays.unshift(...beforeDays.slice(0, beforeDays.length - 1))
      
      const afterFrom = monthDays[monthDays.length - 1]
      const afterTo = endOfWeek(afterFrom!.date, { weekStartsOn: firstDayOfWeek })
      const afterDays = generateDays(afterFrom!.date, afterTo)
      afterDays.forEach(day => {
        day.disabled.value = true
        day.otherMonth = true
      })
      monthDays.push(...afterDays.slice(1))
    }

    wrap.push({
      year: CalendarDate.yearFromMonthYear(monthYear),
      month: CalendarDate.monthFromMonthYear(monthYear),
      days: monthDays,
    })
  })
  return wrap
}

function wrapByWeek (days: Array<CalendarDate>) {
  return []
}
