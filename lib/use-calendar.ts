import { computed, ComputedRef, ref } from "vue";
import { lastDayOfMonth, startOfMonth, endOfMonth, nextSunday, addDays, format } from "date-fns";
import { CalendarDate } from "./CalendarDate";
import { CalendarOptions, WeekdaysComposable, MonthlyCalendarComposable, CalendarComposables, WeeklyCalendarComposable, MontlyOptions, WeekdayInputFormat } from './types';
import { generateDays, generateMonth, getBetweenDays, wrapByMonth } from "./utils";

function useWeekdays ({ firstDayOfWeek, locale }: CalendarOptions): (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable {
  return (weekdayFormat: WeekdayInputFormat = 'iiiii'): Array<string> => {
    const sunday = nextSunday(new Date());
    const weekdays = Array.from(Array(7).keys()).map(i => addDays(sunday, i));

    // Shift the array by `firstDayOfWeek` times to start on the desired day
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift()!);
    });

    return weekdays.map(day => format(day, weekdayFormat, { locale }));
  };
}

function useWeeklyCalendar ({ from, to, disabled, calendarClass }: CalendarOptions): () => WeeklyCalendarComposable {
  // TODO Implement
  return () => {
    const fromDate = new Date(from);
    const toDate = to ? new Date(to) : lastDayOfMonth(fromDate);
    // const currentWeek = ref(getWeek(fromDate))

    // const days = generateDays(fromDate, toDate, calendarClass, undefined, undefined);
    // const daysByMonths = wrapByWeek(days)

    return { currentWeek: null, weeks: [] };
  };
}

const DEFAULT_MONTLY_OPTS: MontlyOptions = {
  infinite: false,
  otherMonthDays: true,
};

export function useCalendar (globalOptions: CalendarOptions): CalendarComposables {
  const factory = globalOptions.factory || ((...args: any[]) => new CalendarDate(...args));
  const fromDate: Date = new Date(globalOptions.from);
  const toDate: Date = globalOptions.to ? new Date(globalOptions.to) : lastDayOfMonth(fromDate);
  const disabledDates: Date[] = globalOptions.disabled.map(dis => new Date(dis));
  const preSelectedDates: Date[] = (Array.isArray(globalOptions.preSelection) ? globalOptions.preSelection : [globalOptions.preSelection]).filter(Boolean) as Array<Date>;

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

  function useMonthlyCalendar(opts?: MontlyOptions): MonthlyCalendarComposable<C> {
    const { infinite, otherMonthDays } = Object.assign(DEFAULT_MONTLY_OPTS, opts);

    const monthlyDays = generateDays(startOfMonth(fromDate), endOfMonth(toDate), factory, disabledDates, preSelectedDates);
    const daysByMonths = wrapByMonth(monthlyDays, otherMonthDays, globalOptions.firstDayOfWeek, factory);
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
          const nextMonth = generateMonth(nextMonthYear, !!otherMonthDays, globalOptions.firstDayOfWeek, factory);
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
          const prevMonth = generateMonth(prevMonthYear, !!otherMonthDays, globalOptions.firstDayOfWeek, factory);
          daysByMonths.unshift(prevMonth);
          currentMonthIndex.value += 1;
        }
      }

      if (prevMonthEnabled.value) {
        currentMonthIndex.value -= 1;
      }
    }

    return { currentMonth, months: daysByMonths, days, nextMonth, prevMonth, prevMonthEnabled, nextMonthEnabled };
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