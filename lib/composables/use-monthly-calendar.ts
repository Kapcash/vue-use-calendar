import { computed, reactive, ShallowReactive, watch, watchEffect } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { MonthlyCalendarComposable, MontlyOptions, Month, NormalizedCalendarOptions } from '../types';
import { disableExtendedDates } from "../utils/utils";
import { dateToMonthYear, ICalendarDate } from "../models/CalendarDate";
import { useComputeds, useSelectors } from "./reactiveDates";
import { useNavigation } from "./use-navigation";
import { monthGenerators } from "../utils/utils.month";

export function monthlyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, generateMonth, wrapByMonth } = monthGenerators(globalOptions);

  return function useMonthlyCalendar(opts: MontlyOptions = {}): MonthlyCalendarComposable<C> {
    const { infinite = true, fullWeeks = true, fixedWeeks = false } = opts;

    const monthlyDays = generateConsecutiveDays(
      startOfMonth(globalOptions.startOn),
      endOfMonth(globalOptions.maxDate || globalOptions.startOn),
    );

    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks, fixedWeeks) as ShallowReactive<Array<Month<C>>>;

    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled,
    } = useNavigation(
      daysByMonths,
      (newIndex) => {
        const newMonth = generateMonth(newIndex, {
          otherMonthsDays: !!fullWeeks,
          fixedWeeks: !!fixedWeeks,
          beforeMonthDays: daysByMonths.find(month => month.index === newIndex - 1)?.days || [], // Could be avoided with a linked list
          afterMonthDays: daysByMonths.find(month => month.index === newIndex + 1)?.days || [], // Could be avoided with a linked list
        });
        // FIXME: Triggers "selection" reactivity manually
        selection.splice(0, selection.length, ...selection.reverse());
        return newMonth;
      },
      infinite);

    const currentMonthAndYear = reactive({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });
    watch(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) { return; }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });

    watch(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      const currentMonthYearIndex = dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
      jumpTo(currentMonthYearIndex);
    });

    const days = computed(() => daysByMonths.flatMap(month => month.days).filter(Boolean));
    const computeds = useComputeds(days);

    watchEffect(() => {
      disableExtendedDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });

    const { selection, ...listeners } = useSelectors(computeds.pureDates, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates);

    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      months: daysByMonths,
      days,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners,
    };
  };
}
