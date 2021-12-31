import { computed, ref, ShallowRef, shallowRef } from "vue";
import { isSameDay, lastDayOfMonth } from "date-fns";
import { CalendarDate } from "./CalendarDate";
import { CalendarOptions, WeekdaysComposable, MonthlyCalendarComposable, CalendarComposables, WeeklyCalendarComposable } from './types';
import { generateDays, wrapByMonth } from "./utils";

function useWeekdays ({ firstDayOfWeek }: CalendarOptions): () => WeekdaysComposable {
  return (): Array<string> => {
    const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift()!);
    });
    return weekdays;
  };
}

function useWeeklyCalendar ({ from, to, disabled }: CalendarOptions): () => WeeklyCalendarComposable {
  // TODO Implement
  return () => {
    const fromDate = new Date(from);
    const toDate = to ? new Date(to) : lastDayOfMonth(fromDate);
    // const currentWeek = ref(getWeek(fromDate))

    const days = generateDays(fromDate, toDate);
    // const daysByMonths = wrapByWeek(days)

    return { currentWeek: null, weeks: [] };
  };
}

export function useCalendar (globalOptions: CalendarOptions): CalendarComposables {
  const fromDate = new Date(globalOptions.from);
  const toDate = globalOptions.to ? new Date(globalOptions.to) : lastDayOfMonth(fromDate);
  const disabledDates = globalOptions.disabled.map(dis => new Date(dis));
  const preSelectedDate = Array.isArray(globalOptions.preSelection) ? globalOptions.preSelection : [globalOptions.preSelection];

  const days = generateDays(fromDate, toDate, disabledDates, preSelectedDate.filter(Boolean) as Array<Date>);

  const selectedDates = computed(() => {
    return days.filter(day => day.isSelected.value);
  });

  function selectSingleDate(clickedDate: CalendarDate) {
    selectedDates.value.forEach(day => {
      day.isSelected.value = false;
    });
    clickedDate.isSelected.value = true;
  }

  function selectRangeDates(clickedDate: CalendarDate) {
    const selection = selectedDates.value;
    if (selection.length >= 2 && !selection.some(day => isSameDay(day.date, clickedDate.date))) {
      selection.forEach((day) => {
        day.isSelected.value = false;
      });
    }
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function selectMultipleDates(clickedDate: CalendarDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function useMonthlyCalendar(otherMonthsDays = true): MonthlyCalendarComposable {
    const currentMonth = ref(fromDate.getMonth());
    const currentYear = ref(fromDate.getFullYear());

    const daysByMonths = wrapByMonth(days, otherMonthsDays, globalOptions.firstDayOfWeek);

    return { currentMonth, months: daysByMonths, currentYear };
  }

  return {
    useMonthlyCalendar,
    useWeeklyCalendar: useWeeklyCalendar(globalOptions),
    useWeekdays: useWeekdays(globalOptions),
    selectedDates,
    listeners: {
      selectSingle: selectSingleDate,
      selectMultiple: selectMultipleDates,
      selectRange: selectRangeDates,
    },
  };
}