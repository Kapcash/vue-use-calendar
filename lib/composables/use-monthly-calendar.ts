import { computed, ComputedRef, reactive, watch, watchEffect } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { Month, MonthlyCalendarComposable, MontlyOptions, NormalizedCalendarOptions } from '../types';
import { dateToMonthYear, disableOutOfRangeDates } from "../utils/utils";
import { CalendarDate } from "../models/CalendarDate";
import { useDaysComputeds, useSelectors } from "./reactiveDates";
import { useNavigation } from "./use-navigation";
import { monthGenerators } from "../utils/utils.month";

export function monthlyCalendar<C extends CalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, generateMonth, wrapByMonth } = monthGenerators(globalOptions);

  return function useMonthlyCalendar(opts: MontlyOptions = {}): MonthlyCalendarComposable<C> {
    const { infinite = true, fullWeeks = true } = opts;

    // Generate all Dates from startOn to maxDate
    const monthlyDays: C[] = generateConsecutiveDays(
      startOfMonth(globalOptions.startOn),
      endOfMonth(globalOptions.maxDate || globalOptions.startOn),
    );

    // Wrap the Dates by month
    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks);

    const days = computed(() => daysByMonths.flatMap(month => month.days));
    const computeds = useDaysComputeds(days);

    const { selection, ...listeners } = useSelectors(computeds.pureDates, computeds.betweenDates, computeds.hoveredDates, globalOptions.preSelection);

    function createNewMonthWrapper (newIndex: number, _currentMonth: ComputedRef<Month<C>>) {
      const newMonth = generateMonth(newIndex, {
        otherMonthsDays: !!fullWeeks,
        beforeMonthDays: daysByMonths.find(month => month.index === newIndex - 1)?.days || [], // Could be avoided with a linked list
        afterMonthDays: daysByMonths.find(month => month.index === newIndex + 1)?.days || [], // Could be avoided with a linked list
      });
      // FIXME: Triggers "selection" reactivity manually
      // selection.value.splice(0, selection.length, ...selection.reverse());
      return newMonth;
    }

    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled,
    } = useNavigation(daysByMonths, createNewMonthWrapper, infinite);

    /** Reactive state of the currently displayed month */
    const currentMonthAndYear = reactive({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });

    // If the current wrapper changes, update the current month and year
    watch(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) { return; }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });

    // If this property changes, jump to the new month
    watch(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      const newMonthYearIndex = dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
      jumpTo(newMonthYearIndex);
    });

    watchEffect(() => {
      disableOutOfRangeDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });

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
