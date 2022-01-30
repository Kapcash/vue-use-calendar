import { computed, ComputedRef, ref, ShallowReactive } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { MonthlyCalendarComposable, MontlyOptions, Month, NormalizedCalendarOptions } from './types';
import { generateDays, generateMonth, wrapByMonth } from "./utils";
import { ICalendarDate } from "./CalendarDate";
import { useComputeds, useSelectors } from "./computeds";

const DEFAULT_MONTLY_OPTS: MontlyOptions = {
  infinite: false,
  otherMonthDays: true,
};

export function monthlyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  return function useMonthlyCalendar(opts?: MontlyOptions): MonthlyCalendarComposable<C> {
    const { infinite, otherMonthDays } = Object.assign(DEFAULT_MONTLY_OPTS, opts);

    let monthlyDays = generateDays(
      startOfMonth(globalOptions.from),
      endOfMonth(globalOptions.to!),
      globalOptions.disabled,
      globalOptions.preSelection,
    );

    if (globalOptions.factory) {
      monthlyDays = monthlyDays.map(globalOptions.factory);
    }

    const daysByMonths = wrapByMonth(monthlyDays, otherMonthDays, globalOptions.firstDayOfWeek) as ShallowReactive<Month<C>[]>;
    const days = computed(() => daysByMonths.flatMap(month => month.days)) as ComputedRef<C[]>;

    const currentMonthIndex = ref(0);

    const currentMonth = computed(() => daysByMonths[currentMonthIndex.value]);
    const prevMonthEnabled = computed(() => infinite || currentMonthIndex.value > 0);
    const nextMonthEnabled = computed(() => infinite || currentMonthIndex.value < (daysByMonths.length - 1));
    
    function genMonth (monthIndex: number) {
      const newMonth = daysByMonths[monthIndex];
      const isNext = monthIndex > currentMonthIndex.value;
      if (!newMonth) {
        const newMonthYear = currentMonth.value.days[10].monthYearIndex + (isNext ? 1 : -1);
        const newMonth = generateMonth(newMonthYear, !!otherMonthDays, globalOptions.firstDayOfWeek) as Month<C>;
        isNext ? daysByMonths.push(newMonth) : daysByMonths.unshift(newMonth);
      }
    }

    function nextMonth () {
      const newMontIndex = currentMonthIndex.value + 1;
      if (infinite) {
        genMonth(newMontIndex);
      }
      if (nextMonthEnabled.value) {
        currentMonthIndex.value = newMontIndex;
      }
    }

    function prevMonth () {
      const newMontIndex = currentMonthIndex.value - 1;
      if (infinite) {
        genMonth(newMontIndex);
      }
      if (prevMonthEnabled.value) {
        currentMonthIndex.value = Math.max(0, newMontIndex);
      }
    }

    const computeds = useComputeds(days);

    return {
      currentMonth,
      currentMonthIndex,
      months: daysByMonths,
      days,
      nextMonth,
      prevMonth,
      prevMonthEnabled,
      nextMonthEnabled,
      selectedDates: computeds.selectedDates,
      listeners: useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates),
    };
  };
}
