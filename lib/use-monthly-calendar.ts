import { computed, reactive, ref, ShallowReactive, watch, watchEffect } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { MonthlyCalendarComposable, MontlyOptions, Month, NormalizedCalendarOptions } from './types';
import { disableExtendedDates } from "./utils/utils";
import { dateToMonthYear, ICalendarDate } from "./CalendarDate";
import { useComputeds, useSelectors } from "./reactiveDates";
import { useNavigation } from "./use-navigation";
import { monthGenerators } from "./utils/utils.month";

export function monthlyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, generateMonth, wrapByMonth } = monthGenerators(globalOptions);

  return function useMonthlyCalendar(opts: MontlyOptions = {}): MonthlyCalendarComposable<C> {
    const { infinite = true, fullWeeks = true } = opts;

    const monthlyDays = generateConsecutiveDays(
      startOfMonth(globalOptions.from || new Date()),
      endOfMonth(globalOptions.to || globalOptions.from || new Date()),
    );

    disableExtendedDates(monthlyDays, globalOptions.from, globalOptions.to);

    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks) as ShallowReactive<Array<Month<C>>>;

    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled,
    } = useNavigation(
      daysByMonths,
      (newIndex, currentMonth) => {
        const newMonthYear = newIndex;
        return generateMonth(newMonthYear, {
          otherMonthsDays: !!fullWeeks,
          beforeMonthDays: daysByMonths.find(month => month.index === newIndex - 1)?.days || [],
          afterMonthDays: daysByMonths.find(month => month.index === newIndex + 1)?.days || [],
        });
      },
      infinite);

    // FIXME Not updated yet
    const currentMonthAndYear = reactive({ month: globalOptions.from.getMonth(), year: globalOptions.from.getFullYear() });

    watch(currentMonthAndYear, () => {
      const currentMonthYearIndex = dateToMonthYear(new Date(currentMonthAndYear.year, currentMonthAndYear.month));
      jumpTo(currentMonthYearIndex);
    });

    const days = computed(() => daysByMonths.flatMap(month => month.days));
    const computeds = useComputeds(days);

    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      months: daysByMonths,
      days,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: computeds.selectedDates,
      listeners: useSelectors(computeds.pureDates, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates),
    };
  };
}
