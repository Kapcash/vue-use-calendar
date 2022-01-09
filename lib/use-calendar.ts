import { computed, ComputedRef, ref, ShallowReactive, shallowReactive, shallowRef, ShallowRef } from "vue";
import { isSameDay, lastDayOfMonth, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDate } from "./CalendarDate";
import { CalendarOptions, WeekdaysComposable, MonthlyCalendarComposable, CalendarComposables, WeeklyCalendarComposable, MontlyOptions } from './types';
import { generateDays, generateMonth, getBetweenDays, wrapByMonth } from "./utils";

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

const DEFAULT_MONTLY_OPTS: MontlyOptions = {
  infinite: false,
  otherMonthDays: true,
};

export function useCalendar (globalOptions: CalendarOptions): CalendarComposables {
  const fromDate: Date = new Date(globalOptions.from);
  const toDate: Date = globalOptions.to ? new Date(globalOptions.to) : lastDayOfMonth(fromDate);
  const disabledDates: Date[] = globalOptions.disabled.map(dis => new Date(dis));
  const preSelectedDate: Date[] = (Array.isArray(globalOptions.preSelection) ? globalOptions.preSelection : [globalOptions.preSelection]).filter(Boolean) as Array<Date>;

  let days: ComputedRef<CalendarDate[]> = computed(() => []);

  const selectedDates = computed(() => {
    return days.value.filter(day => day.isSelected.value);
  });

  const hoveredDates = computed(() => {
    return days.value.filter(day => day.isHovered.value);
  });

  const betweenDates = computed(() => {
    return days.value.filter(day => day.isBetween.value);
  });

  function selectSingleDate(clickedDate: CalendarDate) {
    selectedDates.value.forEach(day => {
      day.isSelected.value = false;
    });
    clickedDate.isSelected.value = true;
  }

  function selectRangeDates(clickedDate: CalendarDate) {
    betweenDates.value.forEach(day => {
      day.isBetween.value = false;
    });
    
    if (selectedDates.value.length >= 2 && !clickedDate.isSelected.value) {
      selectedDates.value.forEach((day) => {
        day.isSelected.value = false;
      });
    }
    
    if (selectedDates.value.length === 1) {
      getBetweenDays(days.value, selectedDates.value[0], clickedDate).forEach(day => {
        day.isBetween.value = true;
      });
    }
    
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function selectMultipleDates(clickedDate: CalendarDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function hoverMultiple(hoveredDate: CalendarDate) {
    if (
      selectedDates.value.length !== 1
      || hoveredDate.otherMonth
    ) { return; }

    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    
    const betweenDates = getBetweenDays(days.value, selectedDates.value[0], hoveredDate);
    betweenDates.forEach(day => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }

  function resetHover() {
    hoveredDates.value.forEach(day => {
      day.isHovered.value = false;
    });
  }

  function useMonthlyCalendar(opts?: MontlyOptions): MonthlyCalendarComposable {
    const { infinite, otherMonthDays } = Object.assign(DEFAULT_MONTLY_OPTS, opts);

    const monthlyDays = generateDays(startOfMonth(fromDate), endOfMonth(toDate), disabledDates, preSelectedDate);
    const daysByMonths = wrapByMonth(monthlyDays, otherMonthDays, globalOptions.firstDayOfWeek);
    days = computed(() => {
      return daysByMonths.flatMap(month => month.days);
    });

    const currentMonthIndex = ref(0);

    const currentMonth = computed(() => daysByMonths[currentMonthIndex.value]);
    const prevMonthEnabled = computed(() => infinite || currentMonthIndex.value > 0);
    const nextMonthEnabled = computed(() => infinite || currentMonthIndex.value < (daysByMonths.length - 1));

    function nextMonth () {
      if (infinite) {
        const nextMonth = daysByMonths[currentMonthIndex.value + 1];
        if (!nextMonth) {
          const nextMonthYear = currentMonth.value.days[10].monthYearIndex + 1;
          const nextMonth = generateMonth(nextMonthYear, !!otherMonthDays, globalOptions.firstDayOfWeek);
          daysByMonths.push(nextMonth);
        }
      }
      if (nextMonthEnabled.value) {
        currentMonthIndex.value += 1;
      }
    }

    function prevMonth () {
      if (infinite) {
        const prevMonth = daysByMonths[currentMonthIndex.value - 1];
        if (!prevMonth) {
          const prevMonthYear = currentMonth.value.days[10].monthYearIndex - 1;
          const prevMonth = generateMonth(prevMonthYear, !!otherMonthDays, globalOptions.firstDayOfWeek);
          daysByMonths.unshift(prevMonth);
          currentMonthIndex.value += 1;
        }
      }

      if (prevMonthEnabled.value) {
        currentMonthIndex.value -= 1;
      }
    }

    return { currentMonth, months: daysByMonths, nextMonth, prevMonth, prevMonthEnabled, nextMonthEnabled };
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
      hoverMultiple,
      resetHover,
    },
  };
}