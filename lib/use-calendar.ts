import { lastDayOfMonth } from "date-fns";
import { reactive, Ref, ref, ShallowRef, shallowRef } from "vue";
import { CalendarDate } from "./CalendarDate";
import { CalendarOptions, WeekdaysComposable, MonthlyCalendarComposable, CalendarComposables, WeeklyCalendarComposable } from './types'
import { generateDays, wrapByMonth } from "./utils";

function useWeekdays ({ firstDayOfWeek }: CalendarOptions): () => WeekdaysComposable {
  return (): Array<string> => {
    const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift()!)
    })
    return weekdays
  }
}

function useMonthlyCalendar ({ from, to, disabled, firstDayOfWeek }: CalendarOptions): () => MonthlyCalendarComposable {
  return (): MonthlyCalendarComposable => {
    const fromDate = new Date(from)
    const toDate = to ? new Date(to) : lastDayOfMonth(fromDate)
    const disabledDates = disabled.map(dis => new Date(dis))
    const otherMonthsDays = true
    const currentMonth = ref(fromDate.getMonth())
    const currentYear = ref(fromDate.getFullYear())

    const days = generateDays(fromDate, toDate, disabledDates)
    const daysByMonths = wrapByMonth(days, otherMonthsDays, firstDayOfWeek)

    return { currentMonth, months: daysByMonths, currentYear }
  }
}

export function useWeeklyCalendar ({ from, to, disabled }: CalendarOptions): () => WeeklyCalendarComposable {
  // TODO Implement
  return () => {
    const fromDate = new Date(from)
    const toDate = to ? new Date(to) : lastDayOfMonth(fromDate)
    // const currentWeek = ref(getWeek(fromDate))

    const days = generateDays(fromDate, toDate)
    // const daysByMonths = wrapByWeek(days)

    return { currentWeek: null, weeks: [] }
  }
}

export function useCalendar (globalOptions: CalendarOptions): CalendarComposables {
  let selectedDate: ShallowRef<CalendarDate | null> = shallowRef(null)
  
  function selectSingleDate(date: CalendarDate) {
    if (selectedDate.value) {
      selectedDate.value.isSelected.value = false
    }
    date.isSelected.value = true
    selectedDate.value = date
  }

  return {
    useMonthlyCalendar: useMonthlyCalendar(globalOptions),
    useWeeklyCalendar: useWeeklyCalendar(globalOptions),
    useWeekdays: useWeekdays(globalOptions),
    selectedDate,
    listeners: {
      select: selectSingleDate,
    }
  }
}