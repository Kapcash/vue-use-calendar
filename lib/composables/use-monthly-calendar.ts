import { computed, reactive, shallowReactive, ShallowReactive, unref, watch, watchEffect } from "vue";
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
      generate,
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

    const currentMonthYearIndex = computed(() => {
      return dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
    });

    const currentMonthAndYear = reactive({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });
    watch(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) { return; }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });

    watch(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      jumpTo(currentMonthYearIndex.value);
    });

    const preSelectedDates = reactive(globalOptions.preSelection.map(date => globalOptions.factory(date)));

    const days = computed(() => daysByMonths.flatMap(month => month.days).filter(Boolean));
    const months = computed(() => daysByMonths.toSorted((a, b) => a.index - b.index));
    const computeds = useComputeds(days, preSelectedDates as C[]);

    watchEffect(() => {
      disableExtendedDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });

    const { selection, ...listeners } = useSelectors(
      computeds.pureDates, 
      preSelectedDates as C[],
      computeds.selectedDates, 
      computeds.betweenDates, 
      computeds.hoveredDates,
    );

    watch(() => preSelectedDates, () => {
      preSelectedDates.forEach(d => {
        const index = dateToMonthYear(d.date.getFullYear(), d.date.getMonth());
        generate(index);
      });
    }, { immediate: true, deep: true });

    watch(() => globalOptions.preSelection, () => {
      preSelectedDates.splice(0, preSelectedDates.length, ...(globalOptions.preSelection.map(date => globalOptions.factory(date)) as any));
    });

    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      currentMonthYearIndex,
      months,
      days,
      jumpTo: jumpTo,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners,
    };
  };
}
