import { computed, reactive, ref, ShallowReactive, watchEffect } from "vue";
import { startOfMonth, endOfMonth } from "date-fns";
import { MonthlyCalendarComposable, MontlyOptions, Month, NormalizedCalendarOptions } from './types';
import { disableExtendedDates } from "./utils/utils";
import { ICalendarDate } from "./CalendarDate";
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

    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks) as ShallowReactive<Month<C>[]>;

    const currentMonthAndYear = reactive({ month: globalOptions.from.getMonth(), year: globalOptions.from.getFullYear() });
    const currentMonthIndex = ref(0);

    watchEffect(() => {
      const newCurrentMonth = daysByMonths.findIndex(month => month.month === currentMonthAndYear.month && month.year === currentMonthAndYear.year);
      if (newCurrentMonth < 0) {
        // generate month
      } else {
        currentMonthIndex.value = newCurrentMonth;
      }
    });

    const {
      currentWrapper,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled,
    } = useNavigation(
      daysByMonths,
      (offset, currentMonth) => {
        const newMonthYear = currentMonth.value.days[10].monthYearIndex + offset;
        return generateMonth(newMonthYear, {
          otherMonthsDays: !!fullWeeks,
          beforeMonthDays: daysByMonths[offset - 1]?.days || [],
          afterMonthDays: daysByMonths[offset + 1]?.days || [],
        }) as Month<C>;
      },
      infinite);

    const days = computed(() => daysByMonths.flatMap(month => month.days));
    const computeds = useComputeds(days);

    return {
      currentMonth: currentWrapper,
      currentMonthIndex,
      months: daysByMonths,
      days,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: computeds.selectedDates,
      listeners: useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates),
    };
  };
}
